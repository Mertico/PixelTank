// CSS pixels remain the unit of camera, input and HUD coordinates.
export function backingSize(width: number, height: number, dpr: number) {
  const ratio = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
    dpr: ratio,
  };
}
