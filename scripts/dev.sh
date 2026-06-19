#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8787}"
FRONTEND_PORT="${FRONTEND_PORT:-5174}"

if [ ! -x "$ROOT_DIR/backend/.venv/bin/uvicorn" ]; then
  echo "Backend dependencies are missing. Run ./scripts/setup.sh first." >&2
  exit 1
fi

if [ "${SCALEX_BACKEND_ONLY:-false}" = "true" ]; then
  cd "$ROOT_DIR/backend"
  exec .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port "$BACKEND_PORT"
fi

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "Frontend dependencies are missing. Run ./scripts/setup.sh first." >&2
  exit 1
fi

cleanup() {
  jobs -p | xargs -r kill 2>/dev/null || true
}
trap cleanup EXIT

echo "Starting ScaleX backend at http://127.0.0.1:$BACKEND_PORT"
echo "Starting ScaleX frontend at http://127.0.0.1:$FRONTEND_PORT"

(cd "$ROOT_DIR/backend" && .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port "$BACKEND_PORT") &
(cd "$ROOT_DIR/frontend" && npm run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT" --strictPort) &

wait -n
