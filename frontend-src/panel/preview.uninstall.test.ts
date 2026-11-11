import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { INSTALL_MSG, INSTALL_TIMEOUT_MS, UNINSTALL_MSG } from "./previewInstall";
import { stringsPreview as s } from "./strings.preview";
import { withStore } from "./store";

const installed: PreviewCandidate = {
  name: "Ocean",
  vars: { "primary-color": "#00aaff" },
  installed: true,
  canApply: true,
  repoUrl: "https://github.com/owner/ocean",
};
const ERRORS: Record<string, string> = s.uninstallErrors;
const target = { fullName: "owner/ocean", hacsId: "42" };

type Handler = (msg: Record<string, unknown>) => Promise<unknown>;

function makeHass(admin: boolean, handler: Handler, selected = "Base") {
  const send = vi.fn(async (msg: Record<string, unknown>) => {
    if (msg.type === "lovelace/dashboards/list") return [];
    if (msg.type === UNINSTALL_MSG || msg.type === INSTALL_MSG) return handler(msg);
    return { views: [{ title: "V", cards: [{ type: "div" }] }] };
  });
  const hass = {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn() },
    states: {},
    user: { is_admin: admin },
    themes: { darkMode: true, theme: selected, themes: {} },
  } as unknown as PanelHass;
  return { hass, calls: () => send.mock.calls.map((c) => c[0]).filter((m) => m.type === UNINSTALL_MSG) };
}

async function mount(hass: PanelHass, uninstall: typeof target | null = target, candidate = installed) {
  const el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = hass;
  el.candidate = candidate;
  el.uninstall = uninstall;
  document.body.append(el);
  await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".stage")).not.toBeNull());
  await el.updateComplete;
  return el;
}

const q = (el: HatsLitePreview, sel: string) => el.shadowRoot!.querySelector<HTMLElement>(sel);

async function click(el: HatsLitePreview, sel: string) {
  q(el, sel)!.click();
  await el.updateComplete;
}

async function confirmRemoval(el: HatsLitePreview) {
  await click(el, ".uninstall");
  await click(el, ".install-confirm");
}

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: (cfg: { type: string }) => document.createElement(cfg.type),
  });
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
  delete (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers;
});

describe("uninstall visibility", () => {
  it("shows Uninstall beside Apply and Try for an administrator", async () => {
    const { hass } = makeHass(true, async () => ({}));
    const el = await mount(hass);
    const labels = Array.from(el.shadowRoot!.querySelectorAll(".actions > button")).map((b) => b.textContent!.trim());
    expect(labels).toEqual([s.apply, s.tryButton, s.uninstallButton]);
    expect(q(el, ".uninstall")!.classList.contains("danger")).toBe(true);
  });

  it("is hidden for non administrators", async () => {
    const { hass } = makeHass(false, async () => ({}));
    const el = await mount(hass);
    expect(q(el, ".uninstall")).toBeNull();
  });

  it("is hidden without a store target or for a theme that is not installed", async () => {
    const { hass } = makeHass(true, async () => ({}));
    expect(q(await mount(hass, null), ".uninstall")).toBeNull();
    document.body.innerHTML = "";
    const el = await mount(hass, target, { ...installed, installed: false, canApply: false });
    expect(q(el, ".uninstall")).toBeNull();
  });

  it("is hidden on a name collision", async () => {
    const { hass } = makeHass(true, async () => ({}));
    const el = await mount(hass, target, { ...installed, nameCollision: true });
    expect(q(el, ".uninstall")).toBeNull();
  });
});

describe("theme in use", () => {
  it("hides Apply and Try and disables Uninstall with a hint when it is the selected theme", async () => {
    const { hass, calls } = makeHass(true, async () => ({}), "ocean");
    const el = await mount(hass);
    const button = q(el, ".uninstall")!;
    expect(q(el, ".apply")).toBeNull();
    expect(q(el, ".try")).toBeNull();
    expect(q(el, ".in-use-chip")).toBeNull();
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(q(el, "#uninstall-hint")!.textContent).toBe("Change the theme before uninstalling it.");
    expect(button.getAttribute("aria-describedby")).toBe("uninstall-hint");
    button.click();
    await el.updateComplete;
    expect(q(el, "[role='alertdialog']")).toBeNull();
    expect(calls()).toHaveLength(0);
  });

  it("prefers the selected theme over the global one", async () => {
    const { hass } = makeHass(true, async () => ({}), "Base");
    (hass as unknown as { selectedTheme: unknown }).selectedTheme = { theme: "Ocean" };
    const el = await mount(hass);
    expect(q(el, ".uninstall")!.getAttribute("aria-disabled")).toBe("true");
    expect(q(el, ".apply")).toBeNull();
  });

  it("shows an In use chip instead of the buttons for non administrators", async () => {
    const { hass } = makeHass(false, async () => ({}), "Ocean");
    const el = await mount(hass);
    expect(q(el, ".apply")).toBeNull();
    expect(q(el, ".try")).toBeNull();
    expect(q(el, ".uninstall")).toBeNull();
    expect(q(el, ".in-use-chip")!.textContent!.trim()).toBe(s.inUseChip);
  });

  it("shows an In use chip when there is no store target", async () => {
    const { hass } = makeHass(true, async () => ({}), "Ocean");
    const el = await mount(hass, null);
    expect(q(el, ".apply")).toBeNull();
    expect(q(el, ".in-use-chip")!.textContent!.trim()).toBe(s.inUseChip);
  });

  it("keeps Apply and Try for a theme that is not in use", async () => {
    const { hass } = makeHass(true, async () => ({}), "Base");
    const el = await mount(hass);
    expect(q(el, ".apply")).not.toBeNull();
    expect(q(el, ".try")).not.toBeNull();
    expect(q(el, ".in-use-chip")).toBeNull();
  });
});

describe("uninstall flow", () => {
  it("confirms first, saying the store deletes the files, and Escape cancels", async () => {
    const { hass, calls } = makeHass(true, async () => ({}));
    const el = await mount(hass);
    await click(el, ".uninstall");
    const dialog = q(el, "[role='alertdialog']")!;
    expect(dialog.textContent).toContain(withStore(s.uninstallConfirmBody, "generic").replace("{repo}", "owner/ocean"));
    expect(q(el, ".install-confirm")!.classList.contains("danger")).toBe(true);
    await vi.waitFor(() => expect(el.shadowRoot!.activeElement).toBe(q(el, ".install-confirm")));
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
    await el.updateComplete;
    expect(q(el, "[role='alertdialog']")).toBeNull();
    expect(calls()).toHaveLength(0);
    await vi.waitFor(() => expect(el.shadowRoot!.activeElement).toBe(q(el, ".uninstall")));
  });

  it("traps Tab inside the dialog", async () => {
    const { hass } = makeHass(true, async () => ({}));
    const el = await mount(hass);
    await click(el, ".uninstall");
    const cancel = q(el, ".install-cancel")!;
    cancel.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, composed: true, cancelable: true });
    cancel.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(el.shadowRoot!.activeElement).toBe(q(el, ".install-confirm"));
  });

  it("sends the strict message with the selected theme once", async () => {
    let release: (v: unknown) => void = () => undefined;
    const { hass, calls } = makeHass(true, () => new Promise((r) => (release = r)));
    const el = await mount(hass);
    await click(el, ".uninstall");
    const confirm = q(el, ".install-confirm") as HTMLButtonElement;
    confirm.click();
    confirm.click();
    await el.updateComplete;
    expect(calls()).toEqual([{ type: UNINSTALL_MSG, full_name: "owner/ocean", hacs_id: "42", selected_theme: "Base" }]);
    expect(q(el, ".uninstall")!.textContent!.trim()).toBe(s.uninstallBusy);
    expect(q(el, ".uninstall")!.getAttribute("aria-disabled")).toBe("true");
    expect((q(el, ".apply") as HTMLButtonElement).disabled).toBe(true);
    expect((q(el, ".try") as HTMLButtonElement).disabled).toBe(true);
    release({ uninstalled: true });
    await vi.waitFor(() => expect(q(el, ".uninstall")!.textContent!.trim()).toBe(s.uninstallUpdating));
  });

  it("returns the slot to Install once the theme is gone", async () => {
    const { hass } = makeHass(true, async () => ({ uninstalled: true }));
    const el = await mount(hass);
    const done = vi.fn();
    el.addEventListener("hats-lite-theme-installed", done);
    await confirmRemoval(el);
    await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));
    expect(done.mock.calls[0][0].detail).toEqual({ fullName: "owner/ocean", partial: false });
    el.candidate = { ...installed, installed: false, canApply: false };
    el.install = target;
    el.uninstall = null;
    await el.updateComplete;
    await el.updateComplete;
    expect(q(el, ".install")!.textContent!.trim()).toBe(s.installButton);
    expect(q(el, ".install")!.getAttribute("aria-disabled")).toBe("false");
    expect(q(el, ".uninstall")).toBeNull();
  });

  it("times out with a hint when the theme never disappears", async () => {
    const { hass } = makeHass(true, async () => ({ uninstalled: true }));
    const el = await mount(hass);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const done = vi.fn();
    el.addEventListener("hats-lite-theme-installed", done);
    await confirmRemoval(el);
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(INSTALL_TIMEOUT_MS);
    await el.updateComplete;
    expect(done).toHaveBeenCalledTimes(2);
    expect(done.mock.calls[1][0].detail.partial).toBe(true);
    expect(q(el, ".error")!.textContent).toContain(withStore(s.uninstallTimeout, "generic"));
    expect(q(el, ".uninstall")!.getAttribute("aria-disabled")).toBe("true");
  });

  it("maps server codes to clear text and allows a retry", async () => {
    for (const code of ["theme_in_use", "not_installed", "names_unknown", "uninstall_failed", "install_in_progress", "rate_limited", "unauthorized", "operation_timeout", "hacs_unavailable", "invalid_repository"]) {
      const { hass } = makeHass(true, async () => {
        throw { code, message: "token ghp_SECRET" };
      });
      const el = await mount(hass);
      await confirmRemoval(el);
      await vi.waitFor(() => expect(q(el, ".error")).not.toBeNull());
      expect(q(el, ".error")!.textContent).toContain(withStore(ERRORS[code], "generic"));
      expect(el.shadowRoot!.textContent).not.toContain("SECRET");
      expect(q(el, ".uninstall")!.getAttribute("aria-disabled")).toBe("false");
      el.remove();
    }
  });

  it("treats a failed reload as a partial success", async () => {
    const { hass } = makeHass(true, async () => {
      throw { code: "reload_failed" };
    });
    const el = await mount(hass);
    const done = vi.fn();
    el.addEventListener("hats-lite-theme-installed", done);
    await confirmRemoval(el);
    await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));
    expect(done.mock.calls[0][0].detail.partial).toBe(true);
    await el.updateComplete;
    expect(q(el, ".error")!.textContent).toContain(withStore(s.uninstallErrors.reload_failed, "generic"));
    expect(q(el, ".error")!.textContent).not.toContain("downloaded");
    expect(q(el, ".uninstall")!.getAttribute("aria-disabled")).toBe("true");
    expect((q(el, ".apply") as HTMLButtonElement).disabled).toBe(true);
    expect((q(el, ".try") as HTMLButtonElement).disabled).toBe(true);
    el.candidate = { ...installed, installed: false, canApply: false };
    el.install = target;
    el.uninstall = null;
    await el.updateComplete;
    await el.updateComplete;
    expect(q(el, ".install")!.getAttribute("aria-disabled")).toBe("false");
  });

  it("locks Install for another theme while a removal runs", async () => {
    let release: (v: unknown) => void = () => undefined;
    const { hass } = makeHass(true, () => new Promise((r) => (release = r)));
    const el = await mount(hass);
    await confirmRemoval(el);
    el.candidate = { ...installed, name: "Slate", installed: false, canApply: false, repoUrl: "https://github.com/owner/slate" };
    el.install = { fullName: "owner/slate", hacsId: "43" };
    el.uninstall = null;
    await el.updateComplete;
    expect(q(el, ".install")!.getAttribute("aria-disabled")).toBe("true");
    release({ uninstalled: true });
    await vi.waitFor(() => expect(q(el, ".install")!.getAttribute("aria-disabled")).toBe("false"));
  });
});

describe("operation specific wording", () => {
  it("says uninstall, not install, when a removal fails with an unknown error", async () => {
    const { hass } = makeHass(true, async () => {
      throw new Error("socket closed");
    });
    const el = await mount(hass);
    await confirmRemoval(el);
    await vi.waitFor(() => expect(q(el, ".error")).not.toBeNull());
    expect(q(el, ".error")!.textContent).toContain(withStore(s.uninstallErrors.unknown, "generic"));
    expect(q(el, ".error")!.textContent).not.toContain("The install did");
    expect(el.shadowRoot!.textContent).not.toContain("socket closed");
  });

  it("shares neutral busy and rate limit wording", () => {
    for (const key of ["install_in_progress", "rate_limited"] as const) {
      expect(s.uninstallErrors[key]).toBe(s.installErrors[key]);
      expect(s.uninstallErrors[key]).not.toMatch(/being installed|too many installs/i);
    }
  });

  it("keeps Apply, Try and Uninstall off after the wait times out while the theme is still listed", async () => {
    const { hass } = makeHass(true, async () => ({ uninstalled: true }));
    const el = await mount(hass);
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    await confirmRemoval(el);
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(INSTALL_TIMEOUT_MS);
    await el.updateComplete;
    expect(q(el, ".error")!.textContent).toContain(withStore(s.uninstallTimeout, "generic"));
    expect((q(el, ".apply") as HTMLButtonElement).disabled).toBe(true);
    expect((q(el, ".try") as HTMLButtonElement).disabled).toBe(true);
    expect(q(el, ".uninstall")!.getAttribute("aria-disabled")).toBe("true");
  });

  it("survives a catalog refresh and clears when another theme is shown", async () => {
    const { hass } = makeHass(true, async () => {
      throw { code: "reload_failed" };
    });
    const el = await mount(hass);
    await confirmRemoval(el);
    await vi.waitFor(() => expect(q(el, ".error")).not.toBeNull());
    el.uninstall = null;
    el.install = target;
    await el.updateComplete;
    expect((q(el, ".apply") as HTMLButtonElement).disabled).toBe(true);
    el.candidate = { ...installed, name: "Slate" };
    el.uninstall = { fullName: "owner/slate", hacsId: "43" };
    el.install = null;
    await el.updateComplete;
    await el.updateComplete;
    expect((q(el, ".apply") as HTMLButtonElement).disabled).toBe(false);
    expect(q(el, ".uninstall")!.getAttribute("aria-disabled")).toBe("false");
  });

  it("does not point aria-describedby at a missing element", async () => {
    const { hass } = makeHass(true, async () => ({}));
    const el = await mount(hass);
    expect(q(el, ".uninstall")!.hasAttribute("aria-describedby")).toBe(false);
  });
});
