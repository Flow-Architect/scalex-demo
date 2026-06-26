#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NEMO_VENV_DIR="${SCALEX_NEMO_VENV_DIR:-$HOME/.venvs/scalex-nemo}"
PYTHON_BIN="${PYTHON:-python3}"

echo "Setting up optional ScaleX NeMo Guardrails runtime outside the repo."
echo "Target venv: $NEMO_VENV_DIR"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "Python is required. Set PYTHON=/path/to/python if python3 is unavailable." >&2
  exit 1
fi

"$PYTHON_BIN" -m venv "$NEMO_VENV_DIR"
"$NEMO_VENV_DIR/bin/python" -m pip install --upgrade pip
"$NEMO_VENV_DIR/bin/python" -m pip install -r "$ROOT_DIR/requirements-nemo.txt"

echo
echo "Optional NeMo runtime setup complete."
echo "No secrets were written and .env was not edited."
echo
echo "Add these local-only values to ignored .env when you want to select real NeMo mode:"
echo "SCALEX_GUARDRAIL_MODE=nemo_guardrails"
echo "SCALEX_NEMO_PYTHON=$NEMO_VENV_DIR/bin/python"
echo "SCALEX_NEMO_CONFIG_PATH=./guardrails/scalex"
echo
echo "Verify with:"
echo "./scripts/check-nemo.sh"
