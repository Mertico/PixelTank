import { cp, mkdir, rename, rm } from "node:fs/promises";
import { resolve } from "node:path";
export async function build(dev = false): Promise<void> {
  const staging = resolve(".build-staging");
  await rm(staging, { recursive: true, force: true });
  await mkdir(staging, { recursive: true });
  const result = await Bun.build({
    entrypoints: [
      "client/src/main.ts",
      "client/src/worker.ts",
      "client/src/render-worker.ts",
    ],
    outdir: staging,
    target: "browser",
    format: "esm",
    minify: !dev,
    sourcemap: dev ? "linked" : "none",
    define: { PIXELTANK_DEV: JSON.stringify(dev) },
  });
  if (!result.success) throw new Error(result.logs.map(String).join("\n"));
  await cp("client/index.html", `${staging}/index.html`);
  await cp("client/css", `${staging}/css`, { recursive: true });
  await cp("client/images", `${staging}/images`, { recursive: true });
  await Bun.write(`${staging}/revision.txt`, String(Date.now()));
  await mkdir("dist", { recursive: true });
  // Publish entrypoints before the revision so clients only reload a completed build.
  for (const path of ["images", "css"])
    await cp(`${staging}/${path}`, `dist/${path}`, { recursive: true });
  for (const name of new Bun.Glob("*").scanSync({
    cwd: staging,
    onlyFiles: true,
  }))
    if (name !== "revision.txt")
      await rename(`${staging}/${name}`, `dist/${name}`);
  await rename(`${staging}/revision.txt`, "dist/revision.txt");
  await rm(staging, { recursive: true, force: true });
  console.log("Client built");
}
if (import.meta.main) await build(process.argv.includes("--dev"));
