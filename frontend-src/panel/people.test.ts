import { afterEach, describe, expect, it, vi } from "vitest";
import "./people";
import type { HatsLitePeople } from "./people";
import type { PanelHass } from "./contract";
import { stringsPeople as s } from "./strings.people";

type Call = { type: string; [key: string]: unknown };
type Handler = (msg: Call) => unknown;

const ME = { id: "u1", name: "Mia", is_admin: false, opt_out: false, active_override: null };
const BOB = { id: "u2", name: "Bob", is_admin: false, opt_out: false, active_override: null };
const ADA = { id: "u3", name: "Ada", is_admin: true, opt_out: false, active_override: null };

function setup(options: { admin?: boolean; people: unknown[]; handlers?: Record<string, Handler> }) {
  const calls: Call[] = [];
  const send = vi.fn(async (msg: Call) => {
    calls.push(msg);
    const handler = options.handlers?.[msg.type];
    if (handler) return handler(msg);
    if (msg.type === "hats_lite/people") return { people: options.people };
    if (msg.type === "hats_lite/holidays_list") return { holidays: [] };
    return {};
  });
  const hass = {
    connection: { sendMessagePromise: send, subscribeMessage: vi.fn(async () => () => undefined) },
    user: { id: "u1", name: "Mia", is_admin: options.admin === true },
    themes: { themes: { ocean: {}, dusk: {} } },
  } as unknown as PanelHass;
  return { hass, calls };
}

let el: HatsLitePeople;

async function mount(hass: PanelHass): Promise<HatsLitePeople> {
  el = document.createElement("hats-lite-people") as HatsLitePeople;
  el.hass = hass;
  document.body.append(el);
  await settle();
  return el;
}

async function settle(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await Promise.resolve();
    await el.updateComplete;
  }
}

function q<T extends Element>(selector: string, root: ParentNode = el.shadowRoot as ShadowRoot): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`missing ${selector}`);
  return node;
}

function buttons(label: string, root: ParentNode = el.shadowRoot as ShadowRoot): HTMLButtonElement[] {
  return [...root.querySelectorAll<HTMLButtonElement>("button")].filter((b) =>
    (b.getAttribute("aria-label") ?? b.textContent ?? "").trim().startsWith(label),
  );
}

afterEach(() => {
  el?.remove();
  delete (window as unknown as { hatsLite?: unknown }).hatsLite;
});

describe("hats-lite-people", () => {
  it("renders the list with names and the active override with its assigner", async () => {
    const override = { id: "o1", theme: "ocean", dark: null, source: "manual", assigned_by_name: "Ada", ends: null };
    const { hass } = setup({ people: [{ ...ME, active_override: override }, BOB] });
    await mount(hass);
    const rows = el.shadowRoot!.querySelectorAll(".person");
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain("Mia");
    expect(rows[0].textContent).toContain("Set by Ada");
    expect(rows[1].textContent).toContain("Bob");
  });

  it("hides assign for a normal user and shows it for an admin and an assigner", async () => {
    const normal = setup({ people: [ME] });
    await mount(normal.hass);
    expect(buttons(s.assign).length).toBe(0);
    expect(el.shadowRoot!.querySelector("#edit-holidays")).toBeNull();
    el.remove();

    const admin = setup({ admin: true, people: [ME, BOB, ADA] });
    await mount(admin.hass);
    expect(buttons(s.assign).length).toBe(3);
    el.remove();

    const assigner = setup({ people: [ME, BOB, ADA] });
    await mount(assigner.hass);
    expect(buttons(s.assign).length).toBe(2);
    expect(buttons(`${s.assign}: Ada`).length).toBe(0);
    expect(el.shadowRoot!.querySelector("#edit-assigners")).toBeNull();
  });

  it("explains an opted_out error in the dialog", async () => {
    const { hass } = setup({
      people: [ME, BOB],
      handlers: {
        "hats_lite/assign": () => Promise.reject({ code: "opted_out", message: "x" }),
      },
    });
    await mount(hass);
    buttons(`${s.assign}: Bob`)[0].click();
    await settle();
    const dialog = q<HTMLElement>("hats-lite-assign-dialog");
    q<HTMLFormElement>("form", dialog.shadowRoot!).requestSubmit();
    await settle();
    await (dialog as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(q(".error", dialog.shadowRoot!).textContent).toBe(s.optedOut("Bob"));
  });

  it("sends assign with the chosen mode and treats self as an apply", async () => {
    const settheme = vi.fn();
    const { hass, calls } = setup({
      admin: true,
      people: [ME, BOB],
      handlers: { "hats_lite/assign": () => ({ self: true }) },
    });
    await mount(hass);
    el.addEventListener("settheme", (e) => settheme((e as CustomEvent).detail));
    buttons(`${s.assign}: Mia`)[0].click();
    await settle();
    const dialog = q<HTMLElement>("hats-lite-assign-dialog");
    const select = q<HTMLSelectElement>("#theme", dialog.shadowRoot!);
    select.value = "ocean";
    select.dispatchEvent(new Event("change"));
    const radios = dialog.shadowRoot!.querySelectorAll<HTMLInputElement>('input[name="mode"]');
    radios[1].dispatchEvent(new Event("change"));
    await (dialog as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    q<HTMLFormElement>("form", dialog.shadowRoot!).requestSubmit();
    await settle();
    const sent = calls.find((c) => c.type === "hats_lite/assign");
    expect(sent).toEqual({ type: "hats_lite/assign", user_id: "u1", theme: "ocean", dark: true });
    expect(settheme).toHaveBeenCalledWith({ theme: "ocean", dark: true });
    expect(el.shadowRoot!.textContent).toContain(s.selfApplied);
  });

  it("opts out and refreshes the applier", async () => {
    const refresh = vi.fn(async () => true);
    (window as unknown as { hatsLite: unknown }).hatsLite = { refreshEffective: refresh };
    const { hass, calls } = setup({ people: [ME] });
    await mount(hass);
    q<HTMLButtonElement>('[role="switch"]').click();
    await settle();
    expect(calls.find((c) => c.type === "hats_lite/set_opt_out")).toEqual({
      type: "hats_lite/set_opt_out",
      opt_out: true,
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("offers an opt out shortcut next to an assigned theme on the own row", async () => {
    const override = { id: "o1", theme: "ocean", dark: null, source: "manual", assigned_by_name: "Ada", ends: null };
    const { hass, calls } = setup({ people: [{ ...ME, active_override: override }] });
    await mount(hass);
    q<HTMLButtonElement>("#opt-out-shortcut").click();
    await settle();
    expect(calls.some((c) => c.type === "hats_lite/set_opt_out" && c.opt_out === true)).toBe(true);
  });

  it("closes a dialog with Escape and restores focus", async () => {
    const { hass } = setup({ people: [ME, BOB], admin: true });
    await mount(hass);
    const opener = buttons(`${s.assign}: Bob`)[0];
    opener.focus();
    opener.click();
    await settle();
    const dialog = q<HTMLElement>("hats-lite-assign-dialog");
    const shell = q<HTMLElement>("hats-lite-dialog-shell", dialog.shadowRoot!);
    const surface = q<HTMLElement>(".dialog", shell.shadowRoot!);
    surface.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
    await settle();
    expect(el.shadowRoot!.querySelector("hats-lite-assign-dialog")).toBeNull();
  });

  it("clears a birthday", async () => {
    const { hass, calls } = setup({ people: [{ ...ME, birthday: { month: 5, day: 6, theme: "ocean" } }] });
    await mount(hass);
    buttons(`${s.birthday}: Mia`)[0].click();
    await settle();
    const dialog = q<HTMLElement>("hats-lite-birthday-dialog");
    q<HTMLInputElement>("#day", dialog.shadowRoot!);
    q<HTMLButtonElement>("#clear", dialog.shadowRoot!).click();
    await settle();
    expect(calls.find((c) => c.type === "hats_lite/set_birthday")).toEqual({
      type: "hats_lite/set_birthday",
      user_id: "u1",
      clear: true,
    });
  });

  it("rejects an impossible birthday in the form", async () => {
    const { hass, calls } = setup({ people: [ME] });
    await mount(hass);
    buttons(`${s.birthday}: Mia`)[0].click();
    await settle();
    const dialog = q<HTMLElement>("hats-lite-birthday-dialog");
    const month = q<HTMLSelectElement>("#month", dialog.shadowRoot!);
    month.value = "2";
    month.dispatchEvent(new Event("change"));
    const day = q<HTMLInputElement>("#day", dialog.shadowRoot!);
    day.value = "30";
    day.dispatchEvent(new Event("input"));
    q<HTMLFormElement>("form", dialog.shadowRoot!).requestSubmit();
    await settle();
    await (dialog as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(q(".error", dialog.shadowRoot!).textContent).toBe(s.problemDate);
    expect(calls.some((c) => c.type === "hats_lite/set_birthday")).toBe(false);
  });

  it("opens the assigners editor for an admin and saves the picked ids", async () => {
    const { hass, calls } = setup({ admin: true, people: [ME, BOB, ADA] });
    await mount(hass);
    q<HTMLButtonElement>("#edit-assigners").click();
    await settle();
    const dialog = q<HTMLElement>("hats-lite-assigners-dialog");
    const boxes = dialog.shadowRoot!.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    expect(boxes.length).toBe(2);
    boxes[1].checked = true;
    boxes[1].dispatchEvent(new Event("change"));
    q<HTMLFormElement>("form", dialog.shadowRoot!).requestSubmit();
    await settle();
    expect(calls.find((c) => c.type === "hats_lite/assigners_set")).toEqual({
      type: "hats_lite/assigners_set",
      user_ids: ["u2"],
    });
  });

  it("self apply sends a full restore detail and refreshes the applier", async () => {
    const refresh = vi.fn(async () => true);
    (window as unknown as { hatsLite: unknown }).hatsLite = { refreshEffective: refresh };
    const settheme = vi.fn();
    const { hass } = setup({ admin: true, people: [ME], handlers: { "hats_lite/assign": () => ({ self: true }) } });
    await mount(hass);
    el.addEventListener("settheme", (e) => settheme((e as CustomEvent).detail));
    buttons(`${s.assign}: Mia`)[0].click();
    await settle();
    const dialog = q<HTMLElement>("hats-lite-assign-dialog");
    q<HTMLFormElement>("form", dialog.shadowRoot!).requestSubmit();
    await settle();
    const detail = settheme.mock.calls[0][0] as Record<string, unknown>;
    expect(detail.theme).toBe("default");
    for (const key of ["dark", "primaryColor", "accentColor"]) {
      expect(key in detail).toBe(true);
      expect(detail[key]).toBeUndefined();
    }
    expect(refresh).toHaveBeenCalled();
  });

  it("blocks holiday editing until the holidays fetch succeeded and retries", async () => {
    let fail = true;
    const { hass } = setup({
      admin: true,
      people: [ME],
      handlers: {
        "hats_lite/holidays_list": () => (fail ? Promise.reject({ code: "rate_limited" }) : { holidays: [] }),
      },
    });
    await mount(hass);
    expect(q<HTMLButtonElement>("#edit-holidays").disabled).toBe(true);
    expect(q("#holidays-error").textContent).toContain(s.errors.rate_limited);
    fail = false;
    q<HTMLButtonElement>("#retry-holidays").click();
    await settle();
    expect(q<HTMLButtonElement>("#edit-holidays").disabled).toBe(false);
    expect(el.shadowRoot!.querySelector("#holidays-error")).toBeNull();
  });

  it("keeps the dialog open and Cancel inert while a request is pending", async () => {
    let release: (value: unknown) => void = () => undefined;
    const { hass } = setup({
      admin: true,
      people: [ME, BOB],
      handlers: { "hats_lite/assign": () => new Promise((resolve) => (release = resolve)) },
    });
    await mount(hass);
    buttons(`${s.assign}: Bob`)[0].click();
    await settle();
    const dialog = q<HTMLElement>("hats-lite-assign-dialog");
    q<HTMLFormElement>("form", dialog.shadowRoot!).requestSubmit();
    await settle();
    const cancel = buttons(s.cancel, dialog.shadowRoot!)[0];
    expect(cancel.disabled).toBe(true);
    cancel.click();
    const shell = q<HTMLElement>("hats-lite-dialog-shell", dialog.shadowRoot!);
    q<HTMLElement>(".dialog", shell.shadowRoot!).dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }),
    );
    await settle();
    expect(el.shadowRoot!.querySelector("hats-lite-assign-dialog")).not.toBeNull();
    release({});
    await settle();
    expect(el.shadowRoot!.querySelector("hats-lite-assign-dialog")).toBeNull();
    expect(el.shadowRoot!.textContent).toContain(s.assigned);
  });

  it("keeps the birthday dark flag and shows a missing theme option", async () => {
    const birthday = { month: 5, day: 6, theme: "gone", dark: true };
    const { hass, calls } = setup({ people: [{ ...ME, birthday }] });
    await mount(hass);
    buttons(`${s.birthday}: Mia`)[0].click();
    await settle();
    const dialog = q<HTMLElement>("hats-lite-birthday-dialog");
    const selected = q<HTMLOptionElement>("#theme option[selected]", dialog.shadowRoot!);
    expect(selected.textContent).toContain(s.missingTheme("gone"));
    q<HTMLFormElement>("form", dialog.shadowRoot!).requestSubmit();
    await settle();
    expect(calls.find((c) => c.type === "hats_lite/set_birthday")).toEqual({
      type: "hats_lite/set_birthday",
      user_id: "u1",
      month: 5,
      day: 6,
      theme: "gone",
      dark: true,
    });
  });

  it("decides Remove by assigned_by id and disables it after the first click", async () => {
    const mine = { id: "o1", theme: "ocean", assigned_by: "u1", assigned_by_name: "Mia", ends: null };
    const theirs = { id: "o2", theme: "ocean", assigned_by: "u9", assigned_by_name: "Mia", ends: null };
    let release: (value: unknown) => void = () => undefined;
    const { hass, calls } = setup({
      people: [ME, { ...BOB, active_override: mine }, { ...ADA, id: "u3", is_admin: false, active_override: theirs }],
      handlers: { "hats_lite/unassign": () => new Promise((resolve) => (release = resolve)) },
    });
    await mount(hass);
    expect(buttons(`${s.unassign}: Ada`).length).toBe(0);
    const remove = buttons(`${s.unassign}: Bob`)[0];
    remove.click();
    await settle();
    expect(remove.disabled).toBe(true);
    remove.click();
    await settle();
    expect(calls.filter((c) => c.type === "hats_lite/unassign").length).toBe(1);
    release({});
    await settle();
  });

  it("shows a load failure with the mapped message", async () => {
    const { hass } = setup({
      people: [],
      handlers: { "hats_lite/people": () => Promise.reject({ code: "unauthorized" }) },
    });
    await mount(hass);
    expect(q('[role="alert"]').textContent).toBe(s.errors.unauthorized);
  });
});
