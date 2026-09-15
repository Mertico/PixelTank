import { GameServer } from "./server";
const port = Number(process.env.PORT ?? 9080);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT must be between 1 and 65535");
const server = new GameServer({
  hostname: process.env.HOST ?? "127.0.0.1",
  port,
});
server.start();
console.log(`PixelTank server ready on port ${server.port}`);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    server.stop();
    process.exit(0);
  });
