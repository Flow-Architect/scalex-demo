import sys
from pathlib import Path

import pytest


BACKEND_ROOT = Path(__file__).resolve().parents[1]

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


@pytest.fixture(autouse=True)
def default_hermes_test_mode(monkeypatch):
    monkeypatch.setenv("SCALEX_EXECUTION_MODE", "demo")
    monkeypatch.setenv("HERMES_TEST_MODE", "true")
    monkeypatch.setenv("STRIPE_TEST_MODE", "true")
    monkeypatch.setenv("STRIPE_LIVE_MODE", "false")
    monkeypatch.setenv("STRIPE_TEST_DOUBLE_MODE", "true")
    monkeypatch.setenv("SCALEX_GUARDRAIL_MODE", "local_policy")
    monkeypatch.delenv("STRIPE_SECRET_KEY", raising=False)
    monkeypatch.delenv("SCALEX_NEMO_PYTHON", raising=False)
