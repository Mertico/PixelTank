/// <reference lib="webworker" />
import { expect, test } from "bun:test";
import { backingSize } from "../client/src/viewport";
import { Renderer } from "../client/src/renderer";

test("Retina and fractional DPI scale the backing buffer without rounding CSS size", () => {
  expect(backingSize(1280, 720, 2)).toEqual({
    width: 2560,
    height: 1440,
    dpr: 2,
  });
  expect(backingSize(801, 601, 1.25)).toEqual({
    width: 1001,
    height: 751,
    dpr: 1.25,
  });
  expect(backingSize(100, 100, NaN)).toEqual({
    width: 100,
    height: 100,
    dpr: 1,
  });
});
test("DPI changes keep camera coordinates stable and reset transforms every frame", () => {
  const calls: [string, unknown[]][] = [];
  const ctx = new Proxy(
    {},
    {
      get:
        (_target, method) =>
        (...args: unknown[]) => {
          calls.push([String(method), args]);
        },
      set: () => true,
    },
  );
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
  } as unknown as OffscreenCanvas;
  let closed = 0;
  const bitmap = { close: () => closed++ } as unknown as ImageBitmap;
  const renderer = new Renderer(canvas, [["background", bitmap]], {
    width: 800,
    height: 600,
    dpr: 1,
  });
  renderer.draw([], [], [], "", 1, false, []);
  expect(calls.find(([name]) => name === "translate")?.[1]).toEqual([400, 300]);
  calls.length = 0;
  renderer.resize({ width: 800, height: 600, dpr: 2 });
  renderer.draw([], [], [], "", 1, false, []);
  expect(canvas.width).toBe(1600);
  expect(canvas.height).toBe(1200);
  expect(calls.slice(0, 3)).toEqual([
    ["setTransform", [1, 0, 0, 1, 0, 0]],
    ["clearRect", [0, 0, 1600, 1200]],
    ["setTransform", [2, 0, 0, 2, 0, 0]],
  ]);
  expect(calls.find(([name]) => name === "translate")?.[1]).toEqual([400, 300]);
  expect(renderer.camera.visible(401, 0, 0)).toBe(false);
  renderer.resize({ width: 400, height: 300, dpr: 1.25 });
  expect(canvas.width).toBe(500);
  expect(canvas.height).toBe(375);
  renderer.replaceAssets([["background", bitmap]]);
  expect(closed).toBe(1);
  renderer.dispose();
  expect(closed).toBe(2);
});
