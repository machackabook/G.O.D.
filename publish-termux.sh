#!/usr/bin/env bash
# TDOC-GOD-5001: publish only to existing machackabook/G.O.D.; never force-push.
set -euo pipefail
SOURCE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO='machackabook/G.O.D.'
for program in gh git node mktemp cp; do
  command -v "$program" >/dev/null 2>&1 || { echo "[BLOCKED] Install missing $program" >&2; exit 2; }
done
gh auth status >/dev/null || { echo '[BLOCKED] Run gh auth login first' >&2; exit 2; }
USER_LOGIN="$(gh api user --jq .login)"
[[ "$USER_LOGIN" == 'machackabook' ]] || { echo "[BLOCKED] Active gh login: $USER_LOGIN (expected machackabook)" >&2; exit 2; }
(cd "$SOURCE" && node --test tests/*.test.mjs)
gh repo view "$REPO" --json nameWithOwner --jq .nameWithOwner | grep -Fx "$REPO" >/dev/null || { echo '[BLOCKED] Dedicated repository not accessible'; exit 2; }
TMP="$(mktemp -d)"
trap 'rm -rf -- "$TMP"' EXIT
gh repo clone "$REPO" "$TMP/work" -- --branch main
cd "$TMP/work"
[[ "$(git remote get-url origin)" == "https://github.com/$REPO.git" || "$(git remote get-url origin)" == "git@github.com:machackabook/G.O.D..git" ]] || { echo '[BLOCKED] Unexpected remote'; exit 2; }
while IFS= read -r path; do
  mkdir -p "$(dirname -- "$path")"
  cp -- "$SOURCE/$path" "$path"
done <<'FILES'
README.md
SECURITY.md
.gitignore
.nojekyll
.github/workflows/pages.yml
docs/ARCHITECTURE.md
extension/manifest.json
extension/options.html
extension/worker.js
site/.nojekyll
site/app.mjs
site/god-core.mjs
site/index.html
site/manifest.webmanifest
site/style.css
site/sw.js
tests/contract.test.mjs
publish-termux.sh
FILES
node --test tests/*.test.mjs
git add README.md SECURITY.md .gitignore .nojekyll .github docs extension site tests publish-termux.sh
if git diff --cached --quiet; then echo '[OK] Already current'; else
  git -c user.name="$USER_LOGIN" -c user.email="${USER_LOGIN}@users.noreply.github.com" commit -m 'feat(god): browser capability gate v5.0.1 with corrected Pages path'
  git push origin HEAD:main
fi
if gh api "repos/$REPO/pages" >/dev/null 2>&1; then
  echo '[OK] GitHub Pages configuration exists.'
elif gh api --method POST "repos/$REPO/pages" -f build_type=workflow >/dev/null 2>&1; then
  echo '[OK] Pages source configured for Actions.'
else
  echo '[ACTION] Settings > Pages > Build and deployment > Source: GitHub Actions'
fi
echo "[REPO] https://github.com/$REPO"
echo '[NOTE] Verify real Pages action and device operation before production promotion.'
