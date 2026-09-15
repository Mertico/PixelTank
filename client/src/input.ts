import { clamp, neutralInput, type ControlInput } from "@pixeltank/shared";
export class InputController {
  private keys = new Set<string>();
  private pressed = false;
  private angle = 0;
  scale = 1;
  active = false;
  private events = new AbortController();
  constructor(private release: (input: ControlInput) => void) {
    const options = { signal: this.events.signal };
    window.addEventListener(
      "keydown",
      (e) => {
        if (
          this.active &&
          ["KeyW", "KeyS", "KeyA", "KeyD", "KeyQ"].includes(e.code)
        ) {
          e.preventDefault();
          this.keys.add(e.code);
        }
      },
      options,
    );
    window.addEventListener("keyup", (e) => this.keys.delete(e.code), options);
    window.addEventListener(
      "mousemove",
      (e) => {
        this.angle = Math.atan2(
          e.clientY - innerHeight / 2,
          e.clientX - innerWidth / 2,
        );
      },
      options,
    );
    window.addEventListener(
      "mousedown",
      (e) => {
        if (this.active && e.button === 0) this.pressed = true;
      },
      options,
    );
    window.addEventListener(
      "mouseup",
      () => {
        this.pressed = false;
      },
      options,
    );
    window.addEventListener(
      "wheel",
      (e) => {
        if (this.active) {
          e.preventDefault();
          this.scale = clamp(this.scale - Math.sign(e.deltaY) * 0.1, 0.5, 1.4);
        }
      },
      { ...options, passive: false },
    );
    window.addEventListener("blur", () => this.reset(), options);
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) this.reset();
      },
      options,
    );
  }
  get showStats(): boolean {
    return this.keys.has("KeyQ");
  }
  read(): ControlInput {
    return {
      move: this.keys.has("KeyW") ? 1 : this.keys.has("KeyS") ? -1 : 0,
      rotate: this.keys.has("KeyD") ? 1 : this.keys.has("KeyA") ? -1 : 0,
      angle: this.angle,
      fire: this.pressed,
    };
  }
  reset(): void {
    this.keys.clear();
    this.pressed = false;
    this.release({ ...neutralInput(), angle: this.angle });
  }
  dispose(): void {
    this.reset();
    this.events.abort();
  }
}
