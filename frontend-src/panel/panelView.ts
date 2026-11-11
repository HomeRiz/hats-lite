import { html, nothing } from "lit";
import type { HatsLitePanel } from "../panel";
import { visibleThemeNames } from "./themeVisibility";
import { MENU_ICON, panelDomId, renderFileThemes, renderInUse, renderNotice, renderTabNav, tabDomId } from "./panelParts";
import { installTarget, uninstallTarget } from "./candidate";
import { strings } from "./strings";

export function renderPanel(view: HatsLitePanel) {

    return html`
      <div class="page">
      <header class="header">
        <div class="heading">
          ${view.narrow
            ? html`<button class="menu" type="button" aria-label=${strings.shell.menu} @click=${view.onMenu}>${MENU_ICON}</button>`
            : nothing}
          <h1 class="title">${strings.shell.title}</h1>
        </div>
        ${renderInUse(view.hass)}
      </header>
      ${renderTabNav(view.tabs, view.tab, (id) => view.select(id, true), view.onTabKey)}
      ${view.resetNotice ? renderNotice(view.resetNotice) : nothing}
      <main
        class="content"
        @hats-lite-theme-selected=${view.onThemeSelected}
        @hats-lite-theme-saved=${view.onThemeSaved}
        @hats-lite-preview-theme=${view.onPreviewTheme}
        @hats-lite-mod-opened=${view.onModOpened}
        @hats-lite-mod-closed=${view.onModClosed}
      >
        <section
          class="panel"
          id=${panelDomId("browse")}
          role="tabpanel"
          aria-labelledby=${tabDomId("browse")}
          tabindex="-1"
          ?hidden=${view.tab !== "browse"}
        >
          <hats-lite-browse
            .hass=${view.hass}
            .installedThemes=${view.installedNames}
            .currentTheme=${view.hass?.selectedTheme?.theme ?? view.hass?.themes?.theme ?? "default"}
            .darkMode=${view.hass?.themes?.darkMode}
          ></hats-lite-browse>
        </section>
        <section
          class="panel"
          id=${panelDomId("preview")}
          role="tabpanel"
          aria-labelledby=${tabDomId("preview")}
          tabindex="-1"
          ?hidden=${view.tab !== "preview"}
        >
          ${view.rendered.has("preview")
            ? html`${renderFileThemes(visibleThemeNames(view.fileNames, view.chosenName), view.chosenName, view.fileStatus, view.onFileThemeChange)}
              <hats-lite-preview
                .hass=${view.hass}
                .candidate=${view.candidate}
                .mode=${view.previewMode}
                .nav=${view.navigator.model()}
                .install=${installTarget(view.entry, view.candidate)}
                .uninstall=${uninstallTarget(view.entry, view.candidate)}
                @hats-lite-mode-change=${view.onPreviewMode}
                @hats-lite-preview-nav=${view.onNav}
                @hats-lite-theme-installed=${view.onInstalled}
              ></hats-lite-preview>`
            : nothing}
        </section>
        <section
          class="panel"
          id=${panelDomId("designer")}
          role="tabpanel"
          aria-labelledby=${tabDomId("designer")}
          tabindex="-1"
          ?hidden=${view.tab !== "designer"}
        >
          ${view.rendered.has("designer")
            ? html`<hats-lite-designer .hass=${view.hass}></hats-lite-designer>`
            : nothing}
        </section>
        <section class="panel" id=${panelDomId("people")} role="tabpanel" aria-labelledby=${tabDomId("people")} tabindex="-1" ?hidden=${view.tab !== "people"}>
          ${view.rendered.has("people") && view.peopleOk ? html`<hats-lite-people .hass=${view.hass}></hats-lite-people>` : nothing}
        </section>
        <section class="panel" id=${panelDomId("mods")} role="tabpanel" aria-labelledby=${tabDomId("mods")} tabindex="-1" ?hidden=${view.tab !== "mods"}>
          ${view.rendered.has("mods") && view.modsOk
            ? html`<hats-lite-mods .hass=${view.hass} .active=${view.tab === "mods"} .deepLink=${view.modsLink}></hats-lite-mods>`
            : nothing}
        </section>
      </main>
      </div>
    `;
}
