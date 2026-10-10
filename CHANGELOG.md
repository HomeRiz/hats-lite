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
