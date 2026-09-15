import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "./build";
process.chdir(resolve(import.meta.dir, ".."));
const dev = process.argv.includes("--dev");
const port = Number(process.env.PORT ?? 9080),
  count = Number(process.env.BOT_COUNT ?? 2);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT must be between 1 and 65535");
if (!Number.isInteger(count) || count < 0)
  throw new Error("BOT_COUNT must be a non-negative integer");
const hostname = process.env.HOST ?? "127.0.0.1";
const local = ["0.0.0.0", "::"].includes(hostname) ? "127.0.0.1" : hostname;
const url = `http://${local.includes(":") ? `[${local}]` : local}:${port}`;
const children = new Set<Bun.Subprocess>();
const expectedExits = new Set<Bun.Subprocess>();
let watcher: ReturnType<typeof setInterval> | undefined;
let stopping = false,
  server: Bun.Subprocess | undefined,
  bots: Bun.Subprocess | undefined;

async function stopChild(child: Bun.Subprocess | undefined): Promise<void> {
  if (!child) return;
  expectedExits.add(child);
  child.kill("SIGTERM");
  const force = setTimeout(() => child.kill("SIGKILL"), 2000);
  await child.exited;
  clearTimeout(force);
  children.delete(child);
}
async function shutdown(code: number): Promise<void> {
  if (stopping) return;
  stopping = true;
  if (watcher) clearInterval(watcher);
  await Promise.all([...children].map(stopChild));
  process.exit(code);
}
function spawn(path: string): Bun.Subprocess {
  const child = Bun.spawn([process.execPath, path], {
    stdout: "inherit",
    stderr: "inherit",
    env: {
      ...process.env,
      HOST: hostname,
      PORT: String(port),
      BOT_COUNT: String(count),
      SERVER_URL: `${url.replace("http:", "ws:")}/ws`,
    },
  });
  children.add(child);
  void child.exited.then((code) => {
    children.delete(child);
    const expected = expectedExits.delete(child);
    if (!stopping && !expected) {
      console.error(`${path} exited unexpectedly (${code})`);
      void shutdown(code || 1);
    }
  });
  return child;
}
async function startServices(): Promise<void> {
  server = spawn("server/src/main.ts");
  const deadline = Date.now() + 10000;
  while (!stopping) {
    try {
      const r = await fetch(`${url}/health`, {
        signal: AbortSignal.timeout(500),
      });
      if (r.ok) break;
    } catch {
      /* wait for startup */
    }
    if (Date.now() >= deadline)
      throw new Error("Server did not become ready in 10 seconds");
    await Bun.sleep(50);
  }
  if (!stopping && count > 0) bots = spawn("bots/src/main.ts");
}
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    void shutdown(0);
  });
try {
  // Fail before spawning anything if another service already owns the requested port.
  const probe = Bun.listen({ hostname, port, socket: { data() {} } });
  probe.stop(true);
  await build(dev);
  if (!stopping) await startServices();
  console.log(`Play: ${url} (${count} bots)`);
  if (dev) {
    let pendingClient = false,
      pendingServices = false,
      running = false;
    const flush = async () => {
      if (running || stopping) return;
      running = true;
      try {
        while ((pendingClient || pendingServices) && !stopping) {
          const client = pendingClient,
            services = pendingServices;
          pendingClient = pendingServices = false;
          if (client) await build(true);
          if (services) {
            await stopChild(bots);
            await stopChild(server);
            if (!stopping) await startServices();
          }
        }
      } catch (error) {
        console.error(error);
        await shutdown(1);
      } finally {
        running = false;
      }
    };
    // Compare contents: filesystem notifications on copied assets can also fire for
    // reads/metadata changes on macOS, which otherwise causes endless rebuilds.
    async function fingerprint(directory: string): Promise<string> {
      const hash = new Bun.CryptoHasher("sha256");
      async function visit(path: string): Promise<void> {
        const entries = await readdir(path, { withFileTypes: true });
        entries.sort((a, b) => a.name.localeCompare(b.name));
        for (const entry of entries) {
          if (entry.name === "node_modules" || entry.name.startsWith("."))
            continue;
          const child = `${path}/${entry.name}`;
          if (entry.isDirectory()) await visit(child);
          else if (entry.isFile()) {
            hash.update(child);
            hash.update(await Bun.file(child).arrayBuffer());
          }
        }
      }
      await visit(directory);
      return hash.digest("hex");
    }
    const directories = ["client", "shared", "server", "bots"];
    const previous = new Map(
      await Promise.all(
        directories.map(
          async (directory) =>
            [directory, await fingerprint(directory)] as const,
        ),
      ),
    );
    let checking = false;
    watcher = setInterval(async () => {
      if (checking || stopping) return;
      checking = true;
      try {
        for (const directory of directories) {
          const next = await fingerprint(directory);
          if (next === previous.get(directory)) continue;
          previous.set(directory, next);
          if (directory === "client" || directory === "shared")
            pendingClient = true;
          if (directory !== "client") pendingServices = true;
        }
        await flush();
      } catch (error) {
        console.error(error);
        await shutdown(1);
      } finally {
        checking = false;
      }
    }, 500);
  }
} catch (error) {
  console.error(error);
  await shutdown(1);
}
