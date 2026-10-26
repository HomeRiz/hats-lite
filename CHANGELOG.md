# Changelog

All notable changes are listed here. The format follows Keep a Changelog and the project follows Semantic Versioning.

## [Unreleased]

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

- Gauge, sensor and entity cards rendered nothing in the preview.
- A wallpaper that failed to load made the compared pane transparent.
- A permanent theme error kept the thumbnail on its skeleton until the retry ended.
- The Installed chip now follows the themes Home Assistant has loaded.
- The options sheet closes when a phone is turned to a wide layout, and the preview action bar sticks only at phone width.
- The calendar no longer keeps a selected day after a month or person change, shows only the loading state until the first month arrives, and accepts 24:00 only as an end time.
