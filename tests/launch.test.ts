import { expect, test } from "bun:test";
function freePort(): number {
  const listener = Bun.listen({
    hostname: "127.0.0.1",
    port: 0,
    socket: { data() {} },
  });
  const port = listener.port;
  listener.stop(true);
  return port;
}
async function ready(url: string): Promise<void> {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`${url}/health`)).ok) return;
    } catch {}
    await Bun.sleep(50);
  }
  throw new Error("Launcher readiness timed out");
}
async function stop(child: Bun.Subprocess): Promise<void> {
  child.kill("SIGTERM");
  const timer = setTimeout(() => child.kill("SIGKILL"), 3000);
  await child.exited;
  clearTimeout(timer);
}
async function snapshot(url: string): Promise<{ players: { name: string }[] }> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`${url.replace("http:", "ws:")}/ws`);
    const timer = setTimeout(() => {
      socket.close();
      reject(new Error("No snapshot"));
    }, 3000);
    socket.onopen = () =>
      socket.send(
        JSON.stringify({ type: "join", name: "Launch probe", tank: "light" }),
      );
    socket.onmessage = (e) => {
      const m = JSON.parse(String(e.data));
      if (m.type === "snapshot") {
        clearTimeout(timer);
        socket.close();
        resolve(m.snapshot);
      }
    };
    socket.onerror = () => {
      clearTimeout(timer);
      socket.close();
      reject(new Error("WebSocket failed"));
    };
  });
}
for (const dev of [false, true])
  test(`${dev ? "dev" : "start"}: builds, serves assets, bot count, stable revision, and clean shutdown`, async () => {
    const port = freePort(),
      url = `http://127.0.0.1:${port}`;
    const child = Bun.spawn(
      [process.execPath, "scripts/run.ts", ...(dev ? ["--dev"] : [])],
      {
        env: { ...process.env, PORT: String(port), BOT_COUNT: dev ? "0" : "2" },
        stdout: "ignore",
        stderr: "pipe",
      },
    );
    try {
      await ready(url);
      for (const asset of [
        "/",
        "/main.js",
        "/worker.js",
        "/render-worker.js",
        "/images/tank/heavy/turret.svg",
      ])
        expect((await fetch(url + asset)).status).toBe(200);
      await Bun.sleep(300);
      const world = await snapshot(url);
      expect(
        world.players.filter((p) => p.name.startsWith("[Bot ")),
      ).toHaveLength(dev ? 0 : 2);
      const revision = await (await fetch(url + "/revision.txt")).text();
      await Bun.sleep(1200);
      expect(await (await fetch(url + "/revision.txt")).text()).toBe(revision);
    } finally {
      await stop(child);
    }
    expect(child.exitCode).toBe(0);
    // A surviving server child would still own this port.
    const listener = Bun.listen({
      hostname: "127.0.0.1",
      port,
      socket: { data() {} },
    });
    listener.stop(true);
  }, 15000);
test("occupied port fails promptly without stopping its owner", async () => {
  const port = freePort();
  const owner = Bun.serve({
    hostname: "127.0.0.1",
    port,
    fetch: () => new Response("owner"),
  });
  const child = Bun.spawn([process.execPath, "scripts/run.ts"], {
    env: { ...process.env, PORT: String(port) },
    stdout: "ignore",
    stderr: "pipe",
  });
  try {
    await child.exited;
    expect(child.exitCode).not.toBe(0);
    expect(await (await fetch(`http://127.0.0.1:${port}`)).text()).toBe(
      "owner",
    );
  } finally {
    await stop(child);
    owner.stop(true);
  }
}, 5000);
