export class AssetLoader {
  private images = new Map<string, HTMLImageElement>();
  async load(progress: (fraction: number) => void): Promise<void> {
    const files: Record<string, string> = {
      background: "background.png",
      bullet: "bullet.svg",
      death: "death.png",
    };
    for (const kind of ["light", "medium", "heavy"])
      for (const part of ["chassis", "turret"])
        files[`${kind}-${part}`] = `tank/${kind}/${part}.svg`;
    let loaded = 0;
    await Promise.all(
      Object.entries(files).map(
        ([key, file]) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              this.images.set(key, img);
              progress(++loaded / Object.keys(files).length);
              resolve();
            };
            img.onerror = () =>
              reject(
                new Error(
                  `Не удалось загрузить images/${file}. Обновите страницу для повтора.`,
                ),
              );
            img.src = `/images/${file}`;
          }),
      ),
    );
  }
  bitmaps(dpr: number): [string, ImageBitmap][] {
    const result: [string, ImageBitmap][] = [];
    try {
      for (const [key, image] of this.images) {
        // Rasterize original SVGs at display density, including the maximum zoom.
        const [width, height] =
          key === "background"
            ? [256, 256]
            : key === "bullet"
              ? [25, 25]
              : key === "death"
                ? [26, 38]
                : [80, 80];
        const ratio = dpr * (key === "death" ? 1 : 1.4);
        const canvas = new OffscreenCanvas(
          Math.ceil(width * ratio),
          Math.ceil(height * ratio),
        );
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("OffscreenCanvas 2D недоступен");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        result.push([key, canvas.transferToImageBitmap()]);
      }
      return result;
    } catch (error) {
      for (const [, bitmap] of result) bitmap.close();
      throw error;
    }
  }
}
