# Changelog

All notable changes are listed here. The format follows Keep a Changelog and the project follows Semantic Versioning.

## [Unreleased]

## [0.3.0] - 2026-11-13

### Added

- The 21 original HATS themes (from the HomeRiz/hats repository) appear in the Gallery as one entry. They can be previewed like any other theme, and an administrator can add one to the Home Assistant themes folder with the Add to my themes button.
- The Designer has a Menu transparency slider that makes the top bar and the sidebar see-through.
- Themes saved from the Designer appear in the Gallery under the owner Local-Only-Theme, with no stars and no license. They can be previewed and applied like any installed theme.

### Changed

- The Designer remembers the name of a theme it saved: picking one of your own themes as the base fills the name, so saving updates it. Picking any other theme asks for a new name, so an installed theme is never overwritten.
- The preview starts on the first real dashboard of the instance. The Map dashboard is listed last, and the empty generated Overview is left out of the list once another dashboard has content.

### Fixed

- Moving the Card tint slider on a theme that was not made in the Designer no longer turns the cards white or flips the text color. Only the card transparency changes and the theme's own card color and text colors are kept.
- The script that waits for Home Assistant to start no longer fails when the page is already gone, which could make a test run fail at random.

## [0.2.0] - 2026-11-12

### Added

- Support for the Home Assistant Marketplace: the catalog, the installed state and installing or removing a theme from the panel work through the Marketplace on Home Assistant 2026.11 and newer, and through HACS on older versions.
- A Home Assistant card at the start of the Gallery to preview, try and apply the built-in theme.
- A hint under every theme picker that only installed themes are listed.

### Changed

- The panel moved from `/hats-lite` to `/themes`, and every tab and every theme or mod has its own address (`/themes/gallery`, `/themes/preview`, `/themes/designer`, `/themes/people`, `/themes/mods`, with `?owner=&repository=&category=` for an item). The old `/hats-lite` address redirects. If another integration already uses `/themes`, the panel stays at `/hats-lite`.
- Removing the theme that is applied is allowed and switches the current user to the Home Assistant theme.
- Placeholder theme entries (names with DO NOT USE or DO NOT MODIFY) are hidden from the pick lists and from Home Assistant's theme list while the integration is loaded.
- The built-in theme is shown as Home Assistant in the pickers, the lists and the schedule.
- Theme and catalog downloads check every redirect, and card-mod styles can no longer load external addresses.

### Fixed

- The Mods tab shows cards installed by the Marketplace as installed.
- Gallery thumbnails no longer render black after a refresh of the thumbnail atlas: the index is always revalidated and an image that does not match it is not used.
- Live gallery thumbnails no longer show the background of the theme in use.
- The Preview tab keeps the Home Assistant theme when Home Assistant updates its state, and the first open of the tab lands on it.

## [0.1.0] - 2026-11-10

### Added

- Pre-rendered theme thumbnails: a build time sprite atlas lets the gallery draw previews without loading every theme, with the live thumbnail as the fallback. Wallpapers are included only for permissively licensed themes.
- Sidebar panel with Browse, Preview and Designer tabs.
- Theme catalog from HACS or the public HACS theme list, with search and a cached list when the catalog is unreachable.
- Preview of a theme on the user's own dashboard with a split divider, device widths, compact density and a dark and light switch.
- Safe try with a server side watchdog, a confirmation that does not depend on the tried theme, and automatic revert after a closed tab, a lost connection or a restart.
- Quick designer with background upload and saving a theme file, for administrators.
- One theme per preview: a repository with many themes in one file is previewed one theme at a time, with a picker for the theme in the file.
- SECURITY.md with the reporting process and scope.
- Real renders for every theme: a weekly workflow publishes full renders as release assets of this repository, and the integration downloads them lazily, checks their SHA-256, caches them on disk and serves them to the panel. Until the renders are published the panel keeps the approximate preview.
- Phone layout: a 44 px divider hit target, safe area padding, bars that stay above the on screen keyboard, segmented tabs, an options sheet for the preview controls and a one column designer with a sticky save bar.

### Changed

- Workflow actions from `actions/*` are pinned to commit SHAs, as the rest already were.
- The README and SECURITY.md state what the repository hosts and which routes are served without authentication.
- Uninstall strips only the trailing `.yaml` from a theme file name.
- The theme fetch only serves repositories that are in the theme catalog, reports permanent and temporary failures with distinct codes, and caches both bounded.
- Theme files are loaded with a guarded YAML loader that limits aliases, merge keys and nesting, and values are normalized and checked individually (urls, escapes, trailing semicolons).
- Background uploads are checked by file structure and size, the folder keeps the 20 most recent files that no saved theme uses, and saving refuses reserved and already used theme names.
- The preview read only hass allows synchronous read helpers, limits subscriptions to read commands and releases them when the preview closes; events a card dispatches inside the preview no longer reach the Home Assistant frontend.
- The designer computes text contrast on the composited glass card, the tint slider uses its whole range, and low contrast main and accent colors show a hint.
- The designer shows how many wallpaper entries were removed from a starting theme.
- Text colors on the accent are checked against every backdrop, translucent cards are measured over the surface they sit on, and colors the browser cannot parse fall back to a readable black or white.
- The until time in the people form resolves skipped and repeated hours around clock changes the same way on both sides of UTC.
- Reading a domain in a full render (states.sensor) now counts against the render budget for every entity scanned.
- The gallery has no separate Dark and Light switch any more: the Dark and Light filters set the preview mode, and the filter row keeps its last chip fully visible on narrow screens.
- The preview no longer comes up empty when it is opened first with no theme and a theme is then chosen from the gallery.
- Mods open in an accessible dialog with focus trapping and Escape to close. It previews a built in example card on a mock Home Assistant with no access to the real one, with running your own card config under Advanced. The Pinned filter is removed.
- The holiday editor is a list with add, edit and remove for one item at a time. Events (a birthday or a family occasion) can be added next to holidays, with an optional one time year. Adding a preset no longer renames the selected holiday, and helper themes marked do not use or modify are hidden from the theme pickers.
- Assigning from a calendar day pre-selects that day's theme and mode instead of the default theme.
- The thumbnail workflow renders in a read only job and opens the pull request from a separate job, with pinned actions, a host allowlist for wallpapers and a sanity floor on the catalog size.

### Fixed

- Opening the preview options sheet on a phone no longer pops up the dashboard picker.
- Gauge, sensor and entity cards rendered nothing in the preview.
- A wallpaper that failed to load made the compared pane transparent.
- A permanent theme error kept the thumbnail on its skeleton until the retry ended.
- The Installed chip now follows the themes Home Assistant has loaded.
- The options sheet closes when a phone is turned to a wide layout, and the preview action bar sticks only at phone width.
- The calendar no longer keeps a selected day after a month or person change, shows only the loading state until the first month arrives, and accepts 24:00 only as an end time.
- A theme render requested twice at the same moment is downloaded only once.

### Security

- 2026-10-26: Updated npm development dependencies and GitHub Actions to the latest releases.
