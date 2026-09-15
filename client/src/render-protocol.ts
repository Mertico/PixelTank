import type { ControlInput, WorkerEvent } from "@pixeltank/shared";
export interface Viewport {
  width: number;
  height: number;
  dpr: number;
}
export type BitmapAssets = [string, ImageBitmap][];
export type RenderCommand =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      assets: BitmapAssets;
      viewport: Viewport;
    }
  | { type: "resize"; viewport: Viewport; assets?: BitmapAssets }
  | { type: "network"; event: WorkerEvent }
  | { type: "controls"; input: ControlInput; scale: number; showStats: boolean }
  | { type: "stop" };
export type RenderEvent =
  | { type: "ready" }
  | { type: "error"; message: string };
