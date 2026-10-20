import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { PanelHass } from "./contract";
import { parseColor } from "./contrast";
import { computeInk, INK_PROPS, INK_SOURCES, type InkInput } from "./shellInk";

export type InkHost = ReactiveControllerHost &
  HTMLElement & { hass?: PanelHass; renderRoot: Node };

export function themeSignature(hass: PanelHass | undefined): string {
  const themes = hass?.themes;
  const name = hass?.selectedTheme?.theme ?? themes?.theme ?? "";
  return `${name}|${themes?.darkMode === false ? "light" : "dark"}`;
}

const SRGB_FORM = /^(rgba?\(|color\(\s*srgb[\s)])/i;

let canvasContext: CanvasRenderingContext2D | null | undefined;

function context(): CanvasRenderingContext2D | null {
  if (canvasContext !== undefined) return canvasContext;
  try {
    canvasContext = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  } catch {
    canvasContext = null;
  }
  return canvasContext;
}

export function resetInkCanvas(): void {
  canvasContext = undefined;
}

export const UNPARSEABLE = "unparseable";

function paint(ctx: CanvasRenderingContext2D, sentinel: string, value: string): number[] {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = sentinel;
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  return Array.from(ctx.getImageData(0, 0, 1, 1).data);
}

export function toSrgb(value: string): string {
  if (value === "transparent") return "";
  if (value === "" || SRGB_FORM.test(value)) return value;
  const ctx = context();
  if (!ctx) return value;
  try {
    const [r, g, b, a] = paint(ctx, "#000000", value);
    const other = paint(ctx, "#ffffff", value);
    if (other.some((v, i) => v !== [r, g, b, a][i])) return UNPARSEABLE;
    if (a === 0) return "";
    return `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 1000) / 1000})`;
  } catch {
    return value;
  }
}

export class InkController implements ReactiveController {
  private probe: HTMLElement | null = null;
  private observer: MutationObserver | null = null;
  private media: MediaQueryList | null = null;
  private frame = 0;
  private signature = "";
  private applied = "";

  constructor(private host: InkHost) {
    host.addController(this);
  }

  hostConnected(): void {
    this.observer = new MutationObserver(() => this.schedule());
    this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    this.media = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
    this.media?.addEventListener("change", this.onScheme);
    this.schedule();
  }

  hostDisconnected(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.media?.removeEventListener("change", this.onScheme);
    this.media = null;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.probe?.remove();
    this.probe = null;
    this.applied = "";
  }

  hostUpdated(): void {
    const signature = themeSignature(this.host.hass);
    if (signature === this.signature) return;
    this.signature = signature;
    this.schedule();
  }

  refresh(): void {
    this.schedule();
  }

  private onScheme = (): void => this.schedule();

  private schedule(): void {
    if (this.frame || !this.host.isConnected) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.run();
    });
  }

  private ensureProbe(): HTMLElement {
    if (this.probe?.isConnected) return this.probe;
    const probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.display = "none";
    for (let i = 0; i < Object.keys(INK_SOURCES).length; i += 1) probe.appendChild(document.createElement("i"));
    this.host.renderRoot.appendChild(probe);
    this.probe = probe;
    return probe;
  }

  private readAll(probe: HTMLElement): Record<string, string> {
    const entries = Object.entries(INK_SOURCES);
    const nodes = Array.from(probe.children) as HTMLElement[];
    entries.forEach(([, expression], i) => {
      nodes[i].style.backgroundColor = "";
      nodes[i].style.backgroundColor = expression;
    });
    return Object.fromEntries(
      entries.map(([key], i) => {
        const value = toSrgb(getComputedStyle(nodes[i]).backgroundColor.trim());
        const color = parseColor(value);
        return [key, color && color.a === 0 ? "" : value];
      }),
    );
  }

  private run(): void {
    if (!this.host.isConnected) return;
    const probe = this.ensureProbe();
    const input = { dark: this.host.hass?.themes?.darkMode !== false, ...this.readAll(probe) } as InkInput;
    const key = JSON.stringify(input);
    if (key === this.applied) return;
    this.applied = key;
    const result = computeInk(input);
    for (const name of INK_PROPS) {
      const value = result[name];
      if (value) this.host.style.setProperty(name, value);
      else this.host.style.removeProperty(name);
    }
  }
}
