import {
  TANKS,
  WORLD,
  type Bullet,
  type DeathEvent,
  type Player,
  type Tank,
  type TankDTO,
} from "@pixeltank/shared";
import type { BitmapAssets, Viewport } from "./render-protocol";
import { backingSize } from "./viewport";
export class Camera {
  x = 0;
  y = 0;
  scale = 1;
  constructor(
    public width = 1,
    public height = 1,
  ) {}
  visible(x: number, y: number, radius = 40): boolean {
    return (
      Math.abs(x - this.x) <= this.width / 2 / this.scale + radius &&
      Math.abs(y - this.y) <= this.height / 2 / this.scale + radius
    );
  }
  apply(ctx: OffscreenCanvasRenderingContext2D): void {
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.x, -this.y);
  }
}
export interface LogEntry extends DeathEvent {
  expires: number;
}
export class Renderer {
  readonly camera = new Camera();
  private ctx: OffscreenCanvasRenderingContext2D;
  private images = new Map<string, ImageBitmap>();
  private assets = {
    get: (key: string): ImageBitmap => {
      const image = this.images.get(key);
      if (!image) throw new Error(`Image missing: ${key}`);
      return image;
    },
  };
  private dpr = 1;
  constructor(
    private canvas: OffscreenCanvas,
    assets: BitmapAssets,
    viewport: Viewport,
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("OffscreenCanvas 2D недоступен");
    this.ctx = ctx;
    this.replaceAssets(assets);
    this.resize(viewport);
  }
  replaceAssets(assets: BitmapAssets): void {
    for (const image of this.images.values()) image.close();
    this.images = new Map(assets);
  }
  resize(viewport: Viewport): void {
    const size = backingSize(viewport.width, viewport.height, viewport.dpr);
    this.camera.width = viewport.width;
    this.camera.height = viewport.height;
    this.dpr = size.dpr;
    if (this.canvas.width !== size.width) this.canvas.width = size.width;
    if (this.canvas.height !== size.height) this.canvas.height = size.height;
  }
  dispose(): void {
    for (const image of this.images.values()) image.close();
    this.images.clear();
  }
  draw(
    tanks: Tank[],
    bullets: Bullet[],
    players: Player[],
    id: string,
    scale: number,
    stats: boolean,
    log: LogEntry[],
  ): void {
    const camera = this.camera;
    camera.scale = scale;
    const own = tanks.find((t) => t.state.playerId === id)?.state;
    if (own) {
      camera.x = own.x;
      camera.y = own.y;
    }
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const bg = ctx,
      game = ctx,
      ui = ctx;
    bg.save();
    camera.apply(bg);
    // Clip edge tiles to the authoritative map boundaries.
    bg.beginPath();
    bg.rect(
      WORLD.minX,
      WORLD.minY,
      WORLD.maxX - WORLD.minX,
      WORLD.maxY - WORLD.minY,
    );
    bg.clip();
    for (let x = WORLD.minX; x < WORLD.maxX; x += 256)
      for (let y = WORLD.minY; y < WORLD.maxY; y += 256)
        if (camera.visible(x + 128, y + 128, 181))
          bg.drawImage(this.assets.get("background"), x, y, 256, 256);
    bg.restore();
    game.save();
    camera.apply(game);
    for (const b of bullets)
      if (camera.visible(b.state.x, b.state.y)) {
        game.save();
        game.translate(b.state.x, b.state.y);
        game.rotate(b.state.angle);
        game.drawImage(this.assets.get("bullet"), -12.5, -12.5, 25, 25);
        game.restore();
      }
    const names = new Map(players.map((p) => [p.id, p.name]));
    for (const tank of tanks) {
      const t = tank.state;
      if (!camera.visible(t.x, t.y, 100)) continue;
      this.tank(game, t, names.get(t.playerId) ?? "NONAME");
    }
    game.restore();
    if (own) this.radar(ui, own, tanks);
    ui.font = "bold 20px monospace";
    ui.fillStyle = "#f66";
    ui.textBaseline = "top";
    log.forEach((event, index) => {
      const y = 12 + index * 36;
      ui.textAlign = "right";
      ui.fillText(event.killerName, this.camera.width - 300, y);
      ui.drawImage(
        this.assets.get("death"),
        this.camera.width - 280,
        y,
        26,
        38,
      );
      ui.textAlign = "left";
      ui.fillText(event.victimName, this.camera.width - 225, y);
    });
    if (stats) this.stats(ui, players);
  }

  private tank(
    ctx: OffscreenCanvasRenderingContext2D,
    t: TankDTO,
    name: string,
  ): void {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.chassisAngle);
    ctx.drawImage(this.assets.get(`${t.kind}-chassis`), -40, -40, 80, 80);
    ctx.restore();
    ctx.save();
    ctx.translate(t.x, t.y + (t.kind === "medium" ? 2.5 : 0));
    ctx.rotate(t.turretAngle);
    ctx.drawImage(
      this.assets.get(`${t.kind}-turret`),
      { light: -21.5, medium: -33.5, heavy: -27 }[t.kind],
      -40,
      80,
      80,
    );
    ctx.restore();
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#f66";
    ctx.font = "bold 24px monospace";
    ctx.fillText(name, t.x, t.y - 56);
    ctx.fillStyle = "#000";
    ctx.fillRect(t.x - 50, t.y - 54, 100, 4);
    ctx.fillStyle = "#4fc18d";
    ctx.fillRect(
      t.x - 50,
      t.y - 54,
      100 * Math.max(0, t.hp / TANKS[t.kind].hp),
      4,
    );
    ctx.restore();
  }
  private radar(
    ctx: OffscreenCanvasRenderingContext2D,
    own: TankDTO,
    tanks: Tank[],
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(112, 112, 96, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(112, 112);
    ctx.arc(
      112,
      112,
      96,
      own.turretAngle - Math.PI / 6,
      own.turretAngle + Math.PI / 6,
    );
    ctx.closePath();
    ctx.fillStyle = "#4fc18d";
    ctx.fill();
    for (const { state: t } of tanks)
      if (
        t.playerId !== own.playerId &&
        Math.hypot(t.x - own.x, t.y - own.y) <= 2000
      ) {
        ctx.beginPath();
        ctx.arc(
          112 + ((t.x - own.x) / 2000) * 96,
          112 + ((t.y - own.y) / 2000) * 96,
          2,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "#f66";
        ctx.fill();
      }
    ctx.restore();
  }
  private stats(
    ctx: OffscreenCanvasRenderingContext2D,
    players: Player[],
  ): void {
    const w = this.camera.width,
      h = this.camera.height;
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(w * 0.2, h * 0.2, w * 0.6, h * 0.6);
    ctx.strokeRect(w * 0.2, h * 0.2, w * 0.6, h * 0.6);
    ctx.fillStyle = "#000";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("TOP 10 PLAYER", w * 0.5, h * 0.21);
    ctx.textAlign = "left";
    const row = (
      rank: string,
      name: string,
      kills: string,
      deaths: string,
      y: number,
    ) => {
      ctx.fillText(rank, w * 0.24, y);
      ctx.fillText(name, w * 0.28, y, w * 0.33);
      ctx.fillText(kills, w * 0.64, y);
      ctx.fillText(deaths, w * 0.72, y);
    };
    row("#", "Login", "Kill", "Death", h * 0.28);
    [...players]
      .sort((a, b) => b.stats.kills - a.stats.kills)
      .slice(0, 10)
      .forEach((p, i) =>
        row(
          String(i + 1),
          p.name,
          String(p.stats.kills),
          String(p.stats.deaths),
          h * (0.32 + 0.043 * i),
        ),
      );
    ctx.restore();
  }
}
