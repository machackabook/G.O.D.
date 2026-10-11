# G.O.D. — Governing Obedience Divisor

**v5.0.1 · Independent repository · Public browser adapter · Evidence-first.**

G.O.D. is a capability-verifying, consent-gated supervisory interface for browser-based GAIA/NEXUS applications. Public software only. No private Nexus Enclave code, credentials, network topology, or source documents belong here.

## What ships

- `site/`: standalone static GitHub Pages PWA, capability detector, explicit permission tests, local hash-chained event receipts, offline fallback.
- `site/god-core.mjs`: importable browser capability library for other user-owned pages.
- `extension/`: optional, user-installed Chrome Manifest V3 companion, tightly-scoped external messaging and exact sender-path authorization.
- `.github/workflows/pages.yml`: scoped Pages deployment; no secrets required.
- `tests/`: Node static contract tests.
- `publish-termux.sh`: publish **only after you personally authenticate gh**; no force push and no overwrite of unrelated repositories.

## Install / deploy

Install **GitHub CLI (`gh`)**, Git, and Node.js in Termux if missing, authenticate through `gh auth login`, then run `bash ./publish-termux.sh`.

Updates the existing `machackabook/G.O.D.` public repository using a fresh clone of `main`, executes tests before pushing, and never forces a push.

If Pages has not been enabled, use Repository → Settings → Pages → Source: **GitHub Actions** and rerun deployment from Actions. Pages will live at the project path `/G.O.D./` **only after GitHub reports successful deployment**.

### Chrome companion

1. On desktop Chromium/Chrome, visit `chrome://extensions` **manually** and enable Developer mode at your own discretion.
2. Load unpacked `extension/` after reviewing its code; copy the extension ID.
3. Enter the ID into the G.O.D. page and select **Verify companion**.
4. All public-page requests are read-only/metadata-only. The extension requires no host or tabs permissions.

Android Chrome does not support ordinary desktop Chrome extension installation. The Pages dashboard and standard Web APIs still work on Android where supported.

### Reuse in your other websites

Copy `site/god-core.mjs` into each site or import it from your own domain where CORS is allowed. Example:

```js
import { inspectCapabilities, gatedAction } from './god-core.mjs';
const report = await inspectCapabilities();
console.table(report);
// gatedAction only dispatches user-initiated, explicitly named browser APIs.
```

**GitHub Pages cannot execute PHP/Python servers, grant privileged Chrome permissions, inspect browser secrets, modify `chrome://flags`, or install extensions silently.** Extension code operates only after a user's local installation and browser permission checks. Hardware safety must never depend on these demos.

## Security / evidence contract

- Chrome internal URLs (`chrome://...`) are **not ordinary web resources**; flags are browser-owner controls, not site powers.
- Feature detected ≠ permission granted ≠ operation verified.
- Experimental interfaces are feature-tested and never switched on behind the user’s back.
- The in-browser local hash chain is **tamper-evident only under the current browser-storage threat model** and is **not remotely immutable or cryptographically signed**.
- Browser-origin identity is not a replacement for user authentication to a backend.
- Do not place API keys, private IPs, bearer tokens, `.sparsebundle` files or private ledgers on Pages. Anything published is publicly retrievable.
- Deployment: code review → Node tests → Pages Action → real-device verification before production promotion.

**Palette (classic preserved):** `#0A0A1F`, `#14143D`, `#00FFFF`, `#9333EA`, `#E0E7FF`, with `#FFCC00`, `#9932CC`, and `#00E5FF` as optional accents.
