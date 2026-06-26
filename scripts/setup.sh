#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Setting up ScaleX local sandbox dependencies."

if command -v python3 >/dev/null 2>&1; then
  python3 -m venv "$ROOT_DIR/backend/.venv"
  "$ROOT_DIR/backend/.venv/bin/python" -m pip install --upgrade pip
  "$ROOT_DIR/backend/.venv/bin/python" -m pip install -r "$ROOT_DIR/backend/requirements.txt"
else
  echo "python3 is required for backend setup." >&2
  exit 1
fi

if command -v npm >/dev/null 2>&1; then
  (cd "$ROOT_DIR/frontend" && npm install)
else
  echo "npm is required for frontend setup." >&2
  exit 1
fi

echo "Setup complete. ./scripts/dev.sh runs Judge Demo Mode without secrets."
echo "Optional: copy .env.example to .env for local overrides or Full Proof Mode."
