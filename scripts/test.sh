#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -x "$ROOT_DIR/backend/.venv/bin/pytest" ]; then
  (cd "$ROOT_DIR/backend" && .venv/bin/pytest)
else
  echo "Backend test environment is missing. Run ./scripts/setup.sh first." >&2
  exit 1
fi
