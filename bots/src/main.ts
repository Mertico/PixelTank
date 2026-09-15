import { BotRunner } from "./bot";
const count = Number(process.env.BOT_COUNT ?? 2);
if (!Number.isInteger(count) || count < 0)
  throw new Error("BOT_COUNT must be a non-negative integer");
if (count > 0) {
  const runner = new BotRunner(
    process.env.SERVER_URL ?? "ws://localhost:9080/ws",
    count,
  );
  runner.start();
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.on(signal, () => {
      runner.stop();
      process.exit(0);
    });
}
