#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_URL="${BACKEND_URL:-http://localhost:8787}"

if command -v curl >/dev/null 2>&1; then
  curl -fsS -X POST "$BACKEND_URL/api/demo/reset"
  echo
else
  "$ROOT_DIR/backend/.venv/bin/python" - <<PY
from urllib.request import Request, urlopen

request = Request("$BACKEND_URL/api/demo/reset", method="POST")
with urlopen(request) as response:
    print(response.read().decode())
PY
fi
