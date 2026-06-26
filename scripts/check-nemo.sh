#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NEMO_PYTHON="${SCALEX_NEMO_PYTHON:-$HOME/.venvs/scalex-nemo/bin/python}"
CONFIG_VALUE="${SCALEX_NEMO_CONFIG_PATH:-./guardrails/scalex}"

case "$CONFIG_VALUE" in
  /*) CONFIG_PATH="$CONFIG_VALUE" ;;
  *) CONFIG_PATH="$ROOT_DIR/$CONFIG_VALUE" ;;
esac

if [ ! -x "$NEMO_PYTHON" ]; then
  echo "NeMo Python is not executable: $NEMO_PYTHON" >&2
  echo "Run ./scripts/setup-nemo.sh or set SCALEX_NEMO_PYTHON to a compatible venv Python." >&2
  exit 1
fi

"$NEMO_PYTHON" - "$CONFIG_PATH" <<'PY'
from pathlib import Path
import json
import sys

config_path = Path(sys.argv[1])

try:
    import nemoguardrails
    from nemoguardrails import LLMRails, RailsConfig

    if not config_path.exists():
        raise RuntimeError(f"SCALEX_NEMO_CONFIG_PATH does not exist: {config_path}")

    RailsConfig.from_path(str(config_path))
    result = {
        "ok": True,
        "nemoguardrails_version": getattr(nemoguardrails, "__version__", "unknown"),
        "imports": {
            "LLMRails": LLMRails.__name__ == "LLMRails",
            "RailsConfig": RailsConfig.__name__ == "RailsConfig",
        },
        "config_path": str(config_path),
        "config_loaded": True,
    }
except Exception as exc:
    print(json.dumps({
        "ok": False,
        "error": f"{type(exc).__name__}: {exc}",
    }, sort_keys=True))
    raise SystemExit(1)

print(json.dumps(result, sort_keys=True))
PY

echo
echo "Real NeMo Guardrails runtime is available for ScaleX adapter probing."
echo "No secrets were read or written and .env was not edited."
echo
echo "Local-only env values to add manually when selecting real NeMo mode:"
echo "SCALEX_GUARDRAIL_MODE=nemo_guardrails"
echo "SCALEX_NEMO_PYTHON=$NEMO_PYTHON"
echo "SCALEX_NEMO_CONFIG_PATH=$CONFIG_VALUE"
