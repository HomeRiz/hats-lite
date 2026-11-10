# Security policy

## Supported versions

Only the latest release and the latest commit on the default branch receive security fixes.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report it privately through GitHub: open the Security tab of this repository and choose "Report a vulnerability". Include:

- what you found and which component it affects (integration, applier, panel, build scripts or workflows)
- the Home Assistant version and the HATS Lite version or commit
- exact steps or input that reproduce it, and what you observed
- whether it needs an administrator account, a normal user account, or no account

You can expect an acknowledgement within a few days and a status update once the issue is reproduced. Fixes are released before details are made public, and reporters are credited unless they prefer not to be.

## What is in scope

- Privilege escalation: a non administrator reaching administrator only actions (background upload, saving a theme, changing assignments), or one user changing another user's theme without being allowed to.
- The websocket commands and upload endpoint of the integration, including authorization, input validation and file handling.
- Theme fetching and sanitizing: server side request abuse, path traversal, resource exhaustion from hostile theme files, and CSS or script injection through theme values.
- The safe try flow: any way to make a trial skip its confirmation, hide the confirmation, or leave a broken theme applied.
- The preview: any way for a previewed dashboard card to change state, call services, or reach the real Home Assistant connection.
- The build scripts and workflows: secret exposure, unpinned or over privileged actions, and injection from catalog data into commands.

## What is out of scope

- A malicious custom card that is already installed on your dashboard. Custom cards run with the full privileges of the Home Assistant frontend, so the read only preview is a guard against accidental changes, not a sandbox against hostile code.
- Vulnerabilities in Home Assistant, HACS or a third party theme itself. Report those to their own projects.
- Findings that require an attacker who already controls the Home Assistant host, the configuration directory or an administrator account.
- Denial of service that only needs an administrator to configure something unreasonable.

## Design notes for reviewers

- The integration stores no secrets and makes no outbound requests with credentials. Theme files are fetched from public repositories listed in the HACS catalog and sanitized before they reach the browser.
- Theme variables are applied only to the preview containers, never to the document root, until the user applies or tries a theme.
- Uploaded backgrounds are checked by file structure, size limited and stored under `/config/www/hats_lite/`.
- Authorization is enforced on the server in every websocket handler and the upload view, using the authenticated user of the connection. Read only commands need an authenticated user; commands that change anything are limited to administrators or to the user's own settings.
- The image route `/hats_lite_real/<folder>/<file>` is served without authentication because an image element cannot send a token. It only serves paths listed in the pinned render index, downloads are limited in number and rate, failures are cached, and the disk cache is capped at 64 MB. A response confirms that HATS Lite is installed.
- Uploaded backgrounds live under `/config/www/hats_lite/` and Home Assistant serves `/local/` without authentication. File names are random (128 bits), so they cannot be guessed, but anyone who learns a URL can read that image.
