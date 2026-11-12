# HATS Lite

HATS Lite is a Home Assistant integration that adds one panel to the sidebar for browsing, previewing and applying themes. It shows a theme on your own dashboard next to the one you use now, and it lets you try a theme with an automatic way back.

## What it does

- **Browse** the theme catalog. If the Marketplace (Home Assistant 2026.11 and newer) or HACS is available the list comes from it, otherwise from the public HACS theme catalog. Every card shows the repository, description, stars and whether the theme is installed.
- **Preview** a theme on your real dashboard. Pick a dashboard and a view, drag the divider to compare the current theme with the candidate, switch between desktop, tablet and phone widths, between normal and compact density, and between dark and light.
- **Apply** a theme that is already installed, or **try** it for 30 seconds.
- **Design** a simple theme with main and accent color, corner radius, glass blur, card tint and a background image, then save it as a theme file. Uploading a background and saving a theme need an administrator account.

## The safe try

Trying a theme applies it, and 30 seconds later a large confirmation appears with Keep and Revert buttons and a visible countdown. If you do nothing for 5 more seconds the previous theme comes back. The confirmation does not use the theme being tried, so it stays readable even when the theme is broken.

The server keeps the trial and reverts it by itself. If you close the tab or lose the connection, the previous theme is restored the next time Home Assistant opens in that browser.

## Requirements

- Home Assistant 2025.7.0 or newer.
- The Marketplace (Home Assistant 2026.11 and newer) or HACS is optional. Without one of them the panel can preview any theme in the public catalog, but a theme can only be applied after it is installed in your `themes` folder. With one of them, administrators can install and remove catalog themes from the panel. The Marketplace asks you to accept its warning once before the panel can install anything.
- `frontend: themes:` configured in Home Assistant, as for any theme.

## Installation

Home Assistant 2026.11 and newer, with the Marketplace:

1. Go to Settings, Marketplace and select Add from link.
2. Enter `HomeRiz/hats-lite`, choose the type Integration if asked, and select Add.
3. Select HATS Lite in the list, install it and restart Home Assistant.
4. Go to Settings, Devices and services, add the integration HATS Lite.
5. Open Themes in the sidebar.

Older Home Assistant versions, with HACS:

1. In HACS, open the menu and choose Custom repositories.
2. Add this repository with the type Integration.
3. Download HATS Lite and restart Home Assistant.
4. Go to Settings, Devices and services, add the integration HATS Lite.
5. Open Themes in the sidebar.

## Addresses

The panel opens at `/themes`. Each tab has its own address, so you can bookmark it or share it with another administrator: `/themes/gallery`, `/themes/preview`, `/themes/designer`, `/themes/people` and `/themes/mods`. A repository can be linked directly, like an item in the Marketplace: `/themes/preview?owner=<owner>&repository=<repository>&category=theme` opens the preview of a theme repository and `/themes/mods?owner=<owner>&repository=<repository>&category=plugin` opens a mod. The old address `/hats-lite` redirects to `/themes`.

## Limits

- The preview shows color, shape and glass settings. Effects that depend on card-mod or UIX rules are not rendered in the preview.
- Preview cards are read only. Buttons and actions on them do nothing.
- A card type that is not installed is shown as a labelled placeholder.
- The preview needs the Lovelace module of Home Assistant. It is loaded on demand, which relies on a Home Assistant internal that may change between versions.
- Only one trial at a time per user.
- Entries whose name says DO NOT USE or DO NOT MODIFY (anchor holders that some theme files, such as LCARS, define as top level keys) are hidden from the theme list of Home Assistant while HATS Lite is loaded. The theme files are not changed and the real themes keep all their values.

## Development

```
npm ci
npm test
npm run typecheck
npm run build
python -m pytest
```

The bundles in `custom_components/hats_lite/frontend/` are built from `frontend-src/` and committed. A rebuild must not change them.

The gallery thumbnails are pre-rendered into a sprite atlas under `custom_components/hats_lite/frontend/thumbs/`, so the gallery does not fetch every theme to draw it. Refresh it with:

```
python scripts/thumbs_collect.py OUT_DIR --limit 104 --concurrency 3
node scripts/thumbs-render.mjs OUT_DIR
```

What this repository hosts: the thumbnail atlas under `custom_components/hats_lite/frontend/thumbs/` and, once the full render workflow has been enabled and has run, full renders of catalog themes as assets of the `renders` release, which the integration downloads on demand after a SHA-256 check. Until then the panel shows the approximate preview. They are screenshots of how a theme looks, made by the workflows in `.github/workflows/`. With the default `--backgrounds licensed`, wallpaper variables are rendered only for themes whose repository license is permissive (MIT, Apache-2.0, BSD, ISC, Unlicense, CC0) and are dropped otherwise. The theme files themselves are never copied: they are fetched from the original repositories. If you maintain a theme and want its renders removed, open an issue and it will be removed.

## License

GPL-3.0. See the LICENSE file.
