import {
  GameConnection,
  type SocketLike,
  type WorkerCommand,
  type WorkerEvent,
} from "@pixeltank/shared";
let connection: GameConnection | undefined;
const emit = (message: WorkerEvent) => postMessage(message);
self.onmessage = (event: MessageEvent<WorkerCommand>) => {
  const m = event.data;
  if (m.type === "connect") {
    connection?.stop();
    connection = new GameConnection(
      () => new WebSocket(m.url) as unknown as SocketLike,
      {
        set: (fn, ms) => setTimeout(fn, ms),
        clear: (handle) => clearTimeout(handle as number),
      },
      { name: m.name, tank: m.tank },
      emit,
      (connected, message) => emit({ type: "status", connected, message }),
    );
    connection.start();
  } else if (m.type === "control")
    connection?.send({ type: "input", input: m.input });
  else connection?.stop();
};
