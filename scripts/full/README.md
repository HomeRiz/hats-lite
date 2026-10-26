# Full thumbnails

`scripts/full` renders every catalog theme in the HATS mock Home Assistant frontend. The `Thumbnails full` workflow (`.github/workflows/thumbs-full.yml`) runs it weekly and on manual dispatch.

## What the workflow does

- Reads the HATS commit from the dispatch input or from `scripts/full/hats_pin.txt`. Anything other than one full 40 character lowercase SHA stops the run.
- Checks out the private HATS repository at that commit with the `HATS_DEPLOY_KEY` deploy key, without keeping credentials in the checkout.
- Fetches the mock frontend and the card mods with the HATS fetch scripts, builds the mock bootstrap, renders each theme in Chrome and uploads the result as the `thumbs-full` artifact, kept for 7 days.

## What it does not do

- It does not commit, push, open pull requests, publish releases or change any repository. The only output is the artifact.
- It has read only repository permissions everywhere.
- The `gate` job never reads the secret. It only reads the `THUMBS_FULL_ENABLED` repository variable.

## Owner checklist

These are repository settings. The workflow cannot apply them, the owner has to.

1. In Settings, Environments, create the `thumbs-full` environment before anything else. GitHub creates a missing environment on first use without any protection.
2. Under Deployment branches and tags, choose Selected branches and tags and allow only `main`.
3. Add the HATS deploy key as the environment secret `HATS_DEPLOY_KEY` in `thumbs-full`. Delete any repository level secret with the same name.
4. In the HATS repository, Settings, Deploy keys, make sure the key is read only (Allow write access unchecked).
5. Set the repository variable `THUMBS_FULL_ENABLED` to `true` to turn the workflow on. Any other value, or no variable, skips the run.

## Action pins

Every action in the workflow is pinned to a full commit SHA. The step names carry the matching version. The tests check that this table, the step names and the workflow agree.

| Action | Version | Commit |
| --- | --- | --- |
| actions/checkout | v7.0.1 | 3d3c42e5aac5ba805825da76410c181273ba90b1 |
| actions/setup-python | v7.1.0 | 6d4fd22b20465ccc0f7354476588e8df7c9ca0e0 |
| actions/setup-node | v7.1.0 | 949feb2413d6458794dcd2491c4babbbce0c15c1 |
| actions/cache | v5.1.0 | caa296126883cff596d87d8935842f9db880ef25 |
| actions/upload-artifact | v7.0.2 | cf430e030ddbb5b0abf93d22962f4752f3646cd9 |

To update a pin, resolve the tag with `gh api repos/actions/<name>/git/ref/tags/<tag>`. When the object type is `tag`, follow it with `gh api repos/actions/<name>/git/tags/<sha>` until the type is `commit`. Update the workflow, the step name and this table together.

## Vendor cache and checksums

The `hats/vendor` cache key is the HATS pin plus a hash of `scripts/fetch-mock-frontend.sh` and `scripts/fetch-mock-mods.sh`. The fetch scripts must verify the SHA-256 of every download. What the scripts at the current pin do:

- `fetch-mock-mods.sh` pins a SHA-256 for each of the six card mods, verifies each download before installing it, and verifies files that are already present (from the cache) again. On a mismatch it downloads again and fails if the new copy does not match.
- `fetch-mock-frontend.sh` pins the SHA-256 of the `home-assistant-frontend` wheel and checks it after download. When `vendor/mock-frontend/hass_frontend` already exists, which is the cache hit case, it skips without checking anything again. A restored cache is trusted as is, so the cache key must change whenever the expected wheel changes. It does, because the hash is in the script and the script is part of the key.

## Render sandbox

- `jinja_worker.py` renders card-mod templates in an immutable sandboxed Jinja environment with a 64 KiB template cap, a 20000 node cap, a 256 KiB output cap, a bounded `range`, size checks on `*`, `**` and `+`, a 2 second limit per template, and without `lipsum`, `cycler`, `joiner`, `namespace`, `urlize` and `pprint`. The 2 second timer cannot interrupt one large C level allocation, so `jinja_limits.py` and `jinja_sizes.py` check sizes before anything is built: every call to a `str` or `bytes` method and every string building filter refuses integer arguments above 10000, format specs (`str.format`, `format_map`, `%` and the `format` filter, star widths included) refuse 5 or more consecutive digits, and `~`, `replace`, `join`, the `ljust` family, `expandtabs`, `translate`, `indent`, `wordwrap`, `%` and `*` compute their result length from the operands first and refuse anything over 256 KiB. `split`, `rsplit` and `splitlines` are charged the text length plus 64 bytes per produced item. State copies made by `states()`, `states.domain.name` and `state_attr` are made at most once per entity per render and charged their JSON size against a separate 16 MiB copy budget, so repeated reads are free. Every render also has a hard cap of 2 MiB characters produced in total. Expression output is counted as it is produced, and the text that `set`, `macro`, `call` and `filter` bodies collect, constant template text included, is counted before it is joined. Dict views (`keys()`, `values()`, `items()`) are measured element by element, the same as lists. Generators and `map`, `filter` and `zip` objects keep a small fixed cost: their text is a short fixed size repr, and iterating them to measure would use them up. It disables sockets, sets CPU, file size and process limits, and on Linux an address space limit.
- `jinja.mjs` starts the worker with a minimal environment (no proxy variables, tokens or secrets). On Linux it wraps the worker in `unshare -rn` or `unshare -n` when either works, which removes network access. The network namespace is the real boundary, because disabling Python sockets does not stop code that reaches `_socket`. When neither probe works it prints a warning, and when `HATS_REQUIRE_NETNS=1` is set it refuses to start the worker. The workflow sets `HATS_REQUIRE_NETNS=1` for the render step and first runs `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0` (skipped when the sysctl does not exist), because recent Ubuntu runners restrict unprivileged user namespaces. If a network namespace is still unavailable, the run fails closed instead of rendering with network access.
- `jinja.mjs` also kills the worker when its resident memory goes over 512 MB (it polls `ps -o rss=` every 250 ms, on macOS and Linux) or when one call takes longer than 3 seconds. That template fails and the next call starts a fresh worker with the same states, so memory is bounded even where `RLIMIT_AS` is not available. If `ps` fails 3 times in a row the watchdog fails closed: it kills the worker and retries once with a fresh one, and if `ps` fails again it refuses that template and every later one.
- Chrome resolves only `127.0.0.1` and the image hosts the guard allows, bypasses service workers, and gets WebSocket and WebRTC constructors replaced before page scripts run. `--no-sandbox` is used only when `CI` is set. The `blocked_requests` list keeps the first 200 unique URLs, and file names are capped at 80 characters with a hash suffix.
