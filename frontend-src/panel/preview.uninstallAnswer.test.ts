import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PanelHass, PreviewCandidate } from "./contract";
import "./preview";
import type { HatsLitePreview } from "./preview";
import { UNINSTALL_MSG } from "./previewInstall";

const installed: PreviewCandidate = {
  name: "Ocean",
  vars: { "primary-color": "#00aaff" },
  installed: true,
  canApply: true,
  repoUrl: "https://github.com/owner/ocean",
};
const target = { fullName: "owner/ocean", hacsId: "42" };

function makeHass(answer: unknown): PanelHass {
  const send = vi.fn(async (msg: { type: string }) => {
    if (msg.type === "lovelace/dashboards/list") return [];
    if (msg.type === UNINSTALL_MSG) return answer;
    return { views: [{ title: "V", cards: [{ type: "div" }] }] };
  });
  return {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn() },
    states: {},
    user: { is_admin: true },
    themes: { darkMode: true, theme: "Base", themes: {} },
  } as unknown as PanelHass;
}

let el: HatsLitePreview;

async function removeTheme(answer: unknown): Promise<CustomEvent> {
  el = document.createElement("hats-lite-preview") as HatsLitePreview;
  el.hass = makeHass(answer);
  el.candidate = installed;
  el.uninstall = target;
  document.body.append(el);
  await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".stage")).not.toBeNull());
  const done = vi.fn();
  el.addEventListener("hats-lite-theme-installed", done);
  el.shadowRoot!.querySelector<HTMLElement>(".uninstall")!.click();
  await vi.waitFor(() => expect(el.shadowRoot!.querySelector(".install-confirm")).not.toBeNull());
  el.shadowRoot!.querySelector<HTMLElement>(".install-confirm")!.click();
  await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1));
  return done.mock.calls[0][0] as CustomEvent;
}

beforeEach(() => {
  localStorage.clear();
  (window as unknown as { loadCardHelpers?: unknown }).loadCardHelpers = async () => ({
    createCardElement: (cfg: { type: string }) => document.createElement(cfg.type),
  });
});

afterEach(() => el?.remove());

describe("uninstall answer", () => {
  it("passes reset_selected true up with the removal flag", async () => {
    const event = await removeTheme({ uninstalled: true, reset_selected: true });
    expect(event.detail).toEqual({ fullName: "owner/ocean", partial: false, removed: true, resetSelected: true });
  });

  it("passes reset_selected false up as false", async () => {
    const event = await removeTheme({ uninstalled: true, reset_selected: false });
    expect(event.detail.resetSelected).toBe(false);
  });

  it("leaves resetSelected unset when the answer has no flag", async () => {
    const event = await removeTheme({ uninstalled: true });
    expect(event.detail.removed).toBe(true);
    expect(event.detail.resetSelected).toBeUndefined();
  });

  it("ignores a non boolean flag", async () => {
    const event = await removeTheme({ uninstalled: true, reset_selected: "yes" });
    expect(event.detail.resetSelected).toBeUndefined();
  });
});
