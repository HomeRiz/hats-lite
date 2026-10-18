import { html, svg, nothing, type TemplateResult } from "lit";
import type { DeviceFrame } from "./contract";
import { FIXED_ITEMS, ICON_PATHS, MAIN_ITEMS, type ShellIcon } from "./previewChromeData";
import { stringsPreview as s } from "./strings.preview";

export type MenuModel = { frame: DeviceFrame; menu: boolean };
export type MenuHandlers = { onMenu(menu: boolean): void };

function icon(name: ShellIcon): TemplateResult {
  return html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${svg`<path d=${ICON_PATHS[name]} fill="currentColor" fill-rule="evenodd"></path>`}</svg>`;
}

function item(name: ShellIcon, selected: boolean): TemplateResult {
  return html`<div class=${selected ? "item selected" : "item"}>${icon(name)}<span class="text">${s.shell[name]}</span></div>`;
}

function sidebar(): TemplateResult {
  return html`
    <div class="sidebar">
      <div class="side-menu"><span class="side-burger">${icon("menu")}</span><span class="side-title">${s.shell.title}</span></div>
      <div class="side-list">${MAIN_ITEMS.map((name, index) => item(name, index === 0))}</div>
      <div class="side-list fixed">
        ${FIXED_ITEMS.map((name) => item(name, false))}
        <div class="item user"><span class="avatar">${s.shell.profile.charAt(0)}</span><span class="text">${s.shell.profile}</span></div>
      </div>
    </div>`;
}

function header(title: string): TemplateResult {
  return html`
    <div class="appbar">
      <span class="hamburger">${icon("menu")}</span>
      <span class="title">${title}</span>
      <span class="tools">${icon("search")}${icon("more")}</span>
    </div>`;
}

export function renderShell(title: string): TemplateResult {
  return html`
    <div class="shell" aria-hidden="true" inert>
      ${sidebar()}
      <div class="main">${header(title)}<div class="cards" inert></div></div>
    </div>`;
}

export function renderMenuSwitch(m: MenuModel, h: MenuHandlers): TemplateResult {
  const phone = m.frame === "phone";
  const pick = (value: boolean) => () => {
    if (m.menu !== value) h.onMenu(value);
  };
  return html`
    <div class="field menu-switch">${s.menu}
      <div class="seg" role="group" aria-label=${s.menu}>
        <button type="button" class="menu-on" aria-pressed=${m.menu ? "true" : "false"} ?disabled=${phone} @click=${pick(true)}>${s.on}</button>
        <button type="button" class="menu-off" aria-pressed=${m.menu ? "false" : "true"} ?disabled=${phone} @click=${pick(false)}>${s.off}</button>
      </div>
    </div>`;
}

export function renderModNote(show: boolean): TemplateResult | typeof nothing {
  return show ? html`<p class="footnote mod-note" role="status">${s.modNote}</p>` : nothing;
}
