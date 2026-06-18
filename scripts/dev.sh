#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8787}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

if [ ! -x "$ROOT_DIR/backend/.venv/bin/uvicorn" ]; then
  echo "Backend dependencies are missing. Run ./scripts/setup.sh first." >&2
  exit 1
fi

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "Frontend dependencies are missing. Run ./scripts/setup.sh first." >&2
  exit 1
fi

cleanup() {
  jobs -p | xargs -r kill
}
trap cleanup EXIT

(cd "$ROOT_DIR/backend" && .venv/bin/uvicorn app.main:app --reload --port "$BACKEND_PORT") &
(cd "$ROOT_DIR/frontend" && npm run dev -- --port "$FRONTEND_PORT") &

wait
