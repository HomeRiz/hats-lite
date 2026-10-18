import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { stringsPreview as s } from "./strings.preview";
import { INSTALL_MSG } from "./previewInstall";

const notInstalled: PreviewCandidate = {
  name: "Ocean",
  vars: { "primary-color": "#00aaff" },
  installed: false,
  canApply: false,
  repoUrl: "https://github.com/owner/ocean",
};
const target = { fullName: "owner/ocean", hacsId: "42" };

type Handler = (msg: Record<string, unknown>) => Promise<unknown>;

function makeHass(admin: boolean, install: Handler) {
  const send = vi.fn(async (msg: Record<string, unknown>) => {
    if (msg.type === "lovelace/dashboards/list") return [];
    if (msg.type === INSTALL_MSG) return install(msg);
    return { views: [{ title: "V", cards: [{ type: "div" }] }] };
  });
  const hass = {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn() },
    callService: vi.fn(),
    states: {},
    user: { is_admin: admin },
    themes: { darkMode: true, theme: "Base", themes: {} },
  } as unknown as PanelHass;
  return { hass, send, installCalls: () => send.mock.calls.filter((c) => c[0].type === INSTALL_MSG) };
}

async function mount(hass: PanelHass, install: typeof target | null = target, candidate = notInstalled) {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = hass;
  el.candidate = candidate;
  el.install = install;
  document.body.append(el);
  await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".stage, .notice")).not.toBeNull());
  await vi.waitFor(() => expect(el.notice).not.toBe(s.loading));
  await el.updateComplete;
  return el;
}

const q = (el: HatsLitePreview, sel: string) => el.shadowRoot!.querySelector<HTMLElement>(sel);
const text = (el: HatsLitePreview) => el.shadowRoot!.textContent ?? "";

async function click(el: HatsLitePreview, sel: string) {
  q(el, sel)!.click();
  await el.updateComplete;
}

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: (cfg: { type: string }) => document.createElement(cfg.type),
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("not installed wording", () => {
  it("replaces Apply with a primary Install button in the same slot", async () => {
    const { hass } = makeHass(true, async () => ({}));
    const el = await mount(hass);
    expect(text(el)).not.toContain("Install first");
    expect(q(el, ".apply")).toBeNull();
    const slot = q(el, ".actions > button:first-child")!;
    expect(slot.classList.contains("install")).toBe(true);
    expect(slot.classList.contains("primary")).toBe(true);
    expect(slot.textContent!.trim()).toBe("Install");
  });

  it("keeps a disabled Apply for non administrators", async () => {
    const { hass } = makeHass(false, async () => ({}));
    const el = await mount(hass);
    expect(q(el, ".install")).toBeNull();
    expect((q(el, ".apply") as HTMLButtonElement).disabled).toBe(true);
    expect(q(el, ".apply")!.textContent!.trim()).toBe(s.apply);
  });

  it("shows nothing install related for an installed theme", async () => {
    const { hass } = makeHass(true, async () => ({}));
    const el = await mount(hass, target, { ...notInstalled, installed: true, canApply: true });
    expect(q(el, ".install")).toBeNull();
    expect(q(el, ".apply")).not.toBeNull();
  });

  it("offers no install for a name collision", async () => {
    const { hass } = makeHass(true, async () => ({}));
    const el = await mount(hass, target, { ...notInstalled, installed: true, nameCollision: true });
    expect(q(el, ".install")).toBeNull();
  });
});

describe("install for administrators", () => {
  it("asks for confirmation before calling HACS", async () => {
    const { hass, installCalls } = makeHass(true, async () => ({ installed: true }));
    const el = await mount(hass);
    await click(el, ".install");
    const dialog = q(el, "[role='alertdialog']")!;
    expect(dialog.textContent).toContain("owner/ocean");
    expect(dialog.textContent).toContain(s.installConfirmBody.replace("{repo}", "owner/ocean"));
    expect(installCalls()).toHaveLength(0);
  });

  it("cancel closes the dialog, calls nothing and returns focus", async () => {
    const { hass, installCalls } = makeHass(true, async () => ({}));
    const el = await mount(hass);
    await click(el, ".install");
    await click(el, ".install-cancel");
    await el.updateComplete;
    expect(q(el, "[role='alertdialog']")).toBeNull();
    expect(installCalls()).toHaveLength(0);
    expect(el.shadowRoot!.activeElement).toBe(q(el, ".install"));
  });

  it("Escape also cancels", async () => {
    const { hass } = makeHass(true, async () => ({}));
    const el = await mount(hass);
    await click(el, ".install");
    q(el, "[role='alertdialog']")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
    await el.updateComplete;
    expect(q(el, "[role='alertdialog']")).toBeNull();
  });

  it("sends the strict message once and ignores a double click", async () => {
    let release: (v: unknown) => void = () => undefined;
    const { hass, installCalls } = makeHass(true, () => new Promise((r) => (release = r)));
    const el = await mount(hass);
    const done = vi.fn();
    el.addEventListener("hats-lite-theme-installed", done);
    await click(el, ".install");
    const confirm = q(el, ".install-confirm") as HTMLButtonElement;
    confirm.click();
    confirm.click();
    await el.updateComplete;
    expect(installCalls()).toHaveLength(1);
    expect(installCalls()[0][0]).toEqual({ type: INSTALL_MSG, full_name: "owner/ocean", hacs_id: "42" });
    expect(q(el, ".install")!.getAttribute("aria-disabled")).toBe("true");
    expect(q(el, ".install")!.getAttribute("aria-busy")).toBe("true");
    release({ installed: true });
    await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));
    expect(done.mock.calls[0][0].detail).toEqual({ fullName: "owner/ocean", partial: false });
    await el.updateComplete;
    expect(text(el)).toContain(s.installWaiting);
    expect(q(el, ".install")!.textContent!.trim()).toBe(s.installLoading);
    expect(q(el, ".install")!.getAttribute("aria-disabled")).toBe("true");
  });

  it("explains a missing HACS and keeps the deep link", async () => {
    const { hass } = makeHass(true, async () => {
      throw { code: "hacs_unavailable", message: "token ghp_SECRET" };
    });
    const el = await mount(hass);
    await click(el, ".install");
    await click(el, ".install-confirm");
    await vi.waitFor(() => expect(q(el, ".error")).not.toBeNull());
    expect(q(el, ".error")!.textContent).toContain(s.installErrors.hacs_unavailable);
    expect(text(el)).not.toContain("SECRET");
    const link = q(el, "a.hacs-link") as HTMLAnchorElement;
    expect(link.href).toBe("https://my.home-assistant.io/redirect/hacs_repository/?owner=owner&repository=ocean&category=theme");
    expect(link.rel).toContain("noopener");
    expect(q(el, ".install")).not.toBeNull();
  });

  it("maps every known code and falls back for unknown failures", async () => {
    for (const code of ["install_failed", "rate_limited", "install_in_progress", "invalid_repository", "unauthorized"]) {
      const { hass } = makeHass(true, async () => {
        throw { code };
      });
      const el = await mount(hass);
      await click(el, ".install");
      await click(el, ".install-confirm");
      await vi.waitFor(() => expect(q(el, ".error")).not.toBeNull());
      expect(q(el, ".error")!.textContent).toContain(s.installErrors[code as keyof typeof s.installErrors]);
      el.remove();
    }
    const { hass } = makeHass(true, async () => {
      throw new Error("socket closed");
    });
    const el = await mount(hass);
    await click(el, ".install");
    await click(el, ".install-confirm");
    await vi.waitFor(() => expect(q(el, ".error")).not.toBeNull());
    expect(q(el, ".error")!.textContent).toContain(s.installErrors.unknown);
    expect(text(el)).not.toContain("socket closed");
  });

  it("reports a failed reload as partial success", async () => {
    const { hass } = makeHass(true, async () => {
      throw { code: "reload_failed" };
    });
    const el = await mount(hass);
    const done = vi.fn();
    el.addEventListener("hats-lite-theme-installed", done);
    await click(el, ".install");
    await click(el, ".install-confirm");
    await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));
    expect(done.mock.calls[0][0].detail).toEqual({ fullName: "owner/ocean", partial: true });
    await el.updateComplete;
    expect(q(el, ".error")!.textContent).toContain(s.installErrors.reload_failed);
  });

  it("can retry after a failure", async () => {
    let fail = true;
    const { hass, installCalls } = makeHass(true, async () => {
      if (fail) throw { code: "install_failed" };
      return { installed: true };
    });
    const el = await mount(hass);
    await click(el, ".install");
    await click(el, ".install-confirm");
    await vi.waitFor(() => expect(q(el, ".error")).not.toBeNull());
    fail = false;
    await click(el, ".install");
    expect(q(el, ".error")).toBeNull();
    await click(el, ".install-confirm");
    await vi.waitFor(() => expect(installCalls()).toHaveLength(2));
  });
});

describe("install fallbacks", () => {
  it("non administrators get a clear message and no button", async () => {
    const { hass, installCalls } = makeHass(false, async () => ({}));
    const el = await mount(hass);
    expect(q(el, ".install")).toBeNull();
    expect(text(el)).toContain(s.adminOnly);
    expect(q(el, "a.hacs-link")).not.toBeNull();
    expect(installCalls()).toHaveLength(0);
  });

  it("without a HACS id keeps the link and a plain message", async () => {
    const { hass } = makeHass(true, async () => ({}));
    const el = await mount(hass, null);
    expect(q(el, ".install")).toBeNull();
    expect(text(el)).toContain(s.installViaHacs);
    expect(q(el, "a.hacs-link")).not.toBeNull();
    expect(q(el, "a.link:not(.hacs-link)")!.getAttribute("href")).toBe("https://github.com/owner/ocean");
  });

  it("builds no HACS link from a non repository url", async () => {
    const { hass } = makeHass(false, async () => ({}));
    const el = await mount(hass, null, { ...notInstalled, repoUrl: "https://example.com/a/b/c" });
    expect(q(el, "a.hacs-link")).toBeNull();
  });
});
