"""Local policy configuration helpers for ScaleX."""

import json
from pathlib import Path
from typing import Any

from ..db import policy_path


def policy_engine_name() -> str:
    return "local policy engine"


def load_policy_config(path: str | Path | None = None) -> dict[str, Any]:
    resolved_path = Path(path) if path is not None else policy_path()
    return json.loads(resolved_path.read_text(encoding="utf-8"))


def policy_summary(policy_config: dict[str, Any] | None = None) -> dict[str, Any]:
    config = policy_config or load_policy_config()
    rules = config["rules"]
    return {
        "name": config["name"],
        "engine": policy_engine_name(),
        "stripe_live_mode": rules["stripe_live_mode"],
        "max_job_spend_usd": rules["max_job_spend_usd"],
        "margin_floor_percent": rules["margin_floor_percent"],
        "require_invoice_before_spend": rules["require_invoice_before_spend"],
        "require_payment_before_spend": rules["require_payment_before_spend"],
        "require_human_approval_above_usd": rules["require_human_approval_above_usd"],
        "approved_vendors": rules["approved_vendors"],
        "blocked_vendors": rules["blocked_vendors"],
    }
