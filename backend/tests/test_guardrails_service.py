from contextlib import closing
import sys

from app.config import get_settings
from app.db import get_connection, initialize_database
from app.demo_runner import run_demo
from app.repository import list_guardrail_evaluations
from app.services.guardrails_service import check_nemo_availability, evaluate_guardrail_stage
from app.services.planning_service import deterministic_test_plan
from app.services.seed_service import load_seed_config
from app.services.state_service import build_demo_state


def test_local_policy_remains_default_guardrail_mode(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))
    monkeypatch.delenv("SCALEX_GUARDRAIL_MODE", raising=False)
    monkeypatch.delenv("GUARDRAIL_ENGINE", raising=False)

    settings = get_settings()
    initialize_database()
    with closing(get_connection()) as connection:
        state = build_demo_state(connection)

    assert settings.guardrail_mode == "local_policy"
    assert state["guardrails"]["mode"] == "local_policy"
    assert state["guardrails"]["used_real_nemo"] is False
    assert state["guardrails"]["fail_closed"] is False
    assert state["guardrails"]["local_policy_active"] is True


def test_nemo_guardrails_selected_but_unavailable_fails_closed(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))
    monkeypatch.setenv("SCALEX_GUARDRAIL_MODE", "nemo_guardrails")
    monkeypatch.setenv("SCALEX_NEMO_PYTHON", str(tmp_path / "missing-python"))

    response = run_demo()
    state = response["state"]

    assert response["status"] == "guardrail_failed"
    assert response["decision"]["guardrail_mode"] == "nemo_guardrails"
    assert response["decision"]["stage"] == "input"
    assert response["decision"]["fail_closed"] is True
    assert response["decision"]["used_real_nemo"] is False
    assert state["job"]["status"] == "guardrail_error"
    assert state["guardrails"]["mode"] == "nemo_guardrails"
    assert state["guardrails"]["adapter_status"] == "failed_closed"
    assert state["guardrails"]["used_real_nemo"] is False
    assert state["guardrails"]["fail_closed"] is True
    assert [evaluation["stage"] for evaluation in state["guardrail_evaluations"]] == ["input"]
    assert state["guardrail_evaluations"][0]["status"] == "fail_closed"
    assert state["stripe_events"] == []
    assert state["ledger"]["entries"] == []


def test_nemo_guardrails_availability_check_passes_with_configured_python(
    tmp_path,
    monkeypatch,
) -> None:
    package_dir = tmp_path / "nemoguardrails"
    package_dir.mkdir()
    (package_dir / "__init__.py").write_text(
        "\n".join(
            [
                "__version__ = '0.21.0-test'",
                "class LLMRails:",
                "    pass",
                "class RailsConfig:",
                "    @classmethod",
                "    def from_path(cls, path):",
                "        from pathlib import Path",
                "        if not Path(path).exists():",
                "            raise RuntimeError('missing config')",
                "        return cls()",
            ]
        ),
        encoding="utf-8",
    )
    fake_python = tmp_path / "python"
    fake_python.write_text(
        f"#!/usr/bin/env bash\nPYTHONPATH={tmp_path} exec {sys.executable} \"$@\"\n",
        encoding="utf-8",
    )
    fake_python.chmod(0o755)
    monkeypatch.setenv("SCALEX_GUARDRAIL_MODE", "nemo_guardrails")
    monkeypatch.setenv("SCALEX_NEMO_PYTHON", str(fake_python))
    monkeypatch.setenv("SCALEX_NEMO_CONFIG_PATH", "./guardrails/scalex")

    result = check_nemo_availability(get_settings())

    assert result["ok"] is True
    assert result["status"] == "available"
    assert result["used_real_nemo"] is True
    assert result["version"] == "0.21.0-test"
    assert result["config_loaded"] is True
    assert result["imports"] == {
        "nemoguardrails": True,
        "LLMRails": True,
        "RailsConfig": True,
    }


def test_nemo_compatible_is_labeled_fallback_and_not_real_nemo(monkeypatch) -> None:
    seed_config = load_seed_config()
    monkeypatch.setenv("SCALEX_GUARDRAIL_MODE", "nemo_compatible")

    result = evaluate_guardrail_stage(
        stage="input",
        payload={"job": _job_for_seed(seed_config), "seed_config": seed_config},
        settings=get_settings(),
    )

    assert result["mode"] == "nemo_compatible"
    assert result["adapter"] == "nemo_compatible"
    assert "not real NeMo" in result["label"]
    assert result["status"] == "allow"
    assert result["used_real_nemo"] is False
    assert result["fail_closed"] is False


def test_input_rail_allows_normal_synthetic_northstar_operation() -> None:
    seed_config = load_seed_config()

    result = evaluate_guardrail_stage(
        stage="input",
        payload={"job": _job_for_seed(seed_config), "seed_config": seed_config},
        settings=get_settings(),
    )

    assert result["status"] == "allow"
    assert result["decision"] == "allow"
    assert result["details"]["metrics"]["approved_vendor_count"] == 3
    assert result["details"]["metrics"]["blocked_vendor_count"] == 1


def test_input_rail_blocks_phi_real_client_and_live_money_intent() -> None:
    seed_config = load_seed_config()
    unsafe_job = _job_for_seed(
        {
            **seed_config,
            "jobGoal": (
                "Use real client data, include patient data and PHI, email owner@example.com, "
                "and create a live money charge."
            ),
        }
    )

    result = evaluate_guardrail_stage(
        stage="input",
        payload={"job": unsafe_job, "seed_config": {**seed_config, "jobGoal": unsafe_job["job_goal"]}},
        settings=get_settings(),
    )

    assert result["status"] == "block"
    assert result["fail_closed"] is False
    assert "unsafe boundary terms" in result["error"]


def test_planning_rail_blocks_policy_bypass_live_money_and_real_email() -> None:
    seed_config = load_seed_config()
    job = _job_for_seed(seed_config)
    unsafe_plan = deterministic_test_plan(job, seed_config)
    unsafe_plan["executive_summary"] = (
        "Approve all spend, bypass policy, send real client email to owner@example.com, "
        "and run a live payment."
    )
    unsafe_plan["proposed_tool_sequence"] = ["policy.check_spend", "ledger.record_spend"]

    result = evaluate_guardrail_stage(
        stage="planning",
        payload={
            "planning_result": {
                "status": "completed",
                "source": "deterministic_test",
                "result_json": unsafe_plan,
            }
        },
        settings=get_settings(),
    )

    assert result["status"] == "block"
    assert "proposed tool sequence" in result["error"]
    assert "unsafe boundary terms" in result["error"]


def test_execution_rail_allows_stripe_test_double_finance_preflight() -> None:
    seed_config = load_seed_config()
    job = _job_for_seed(seed_config)

    result = evaluate_guardrail_stage(
        stage="execution",
        payload={
            "phase": "pre_finance_action",
            "action_requests": [
                {
                    "tool_name": "stripe.create_invoice",
                    "job_id": job["id"],
                    "amount_cents": job["invoice_amount_cents"],
                    "mode": "test_double",
                    "livemode": False,
                }
            ],
            "policy_checks": [],
            "ledger_entries": [],
            "stripe_summary": {"stripe_mode": "test_double", "livemode": False},
        },
        settings=get_settings(),
    )

    assert result["status"] == "allow"
    assert result["details"]["metrics"]["phase"] == "pre_finance_action"
    assert result["details"]["metrics"]["action_tools"] == ["stripe.create_invoice"]


def test_execution_rail_blocks_live_money_and_connector_requests() -> None:
    result = evaluate_guardrail_stage(
        stage="execution",
        payload={
            "phase": "pre_finance_action",
            "action_requests": [
                {
                    "tool_name": "connector.send_real_email",
                    "mode": "live",
                    "livemode": True,
                    "recipient": "owner@example.com",
                }
            ],
            "policy_checks": [],
            "ledger_entries": [],
            "stripe_summary": {"stripe_mode": "live", "livemode": True},
        },
        settings=get_settings(),
    )

    assert result["status"] == "block"
    assert "unauthorized tool" in result["error"]
    assert "livemode=true" in result["error"]


def test_output_rail_blocks_paid_state_misrepresentation() -> None:
    report = {
        "id": "rep_test",
        "revenue_cents": 850000,
        "approved_spend_cents": 115000,
        "blocked_spend_cents": 320000,
        "gross_profit_cents": 735000,
        "margin_percent": 86.5,
        "recommendation": "Stripe invoice paid=true. Proceed.",
        "report_markdown": "Stripe invoice is paid and payment complete.",
    }
    totals = {
        "revenue_cents": 850000,
        "approved_spend_cents": 115000,
        "blocked_spend_cents": 320000,
        "gross_profit_cents": 735000,
        "actual_margin_percent": 86.5,
    }

    result = evaluate_guardrail_stage(
        stage="output",
        payload={
            "report": report,
            "totals": totals,
            "stripe_summary": {
                "paid": False,
                "invoice_id": "in_test_double_northstar_launch_8500",
                "hosted_invoice_url": "https://example.test/invoice",
            },
        },
        settings=get_settings(),
    )

    assert result["status"] == "block"
    assert "paid=false" in result["error"]


def test_guardrail_evaluations_are_persisted_for_judge_demo_run(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    response = run_demo()
    state = response["state"]

    assert response["status"] == "completed"
    assert state["guardrails"]["mode"] == "local_policy"
    assert state["guardrails"]["used_real_nemo"] is False
    assert state["guardrails"]["fail_closed"] is False
    stages = [evaluation["stage"] for evaluation in state["guardrail_evaluations"]]
    assert {"input", "planning", "execution", "output"}.issubset(set(stages))
    assert stages[0:2] == ["input", "planning"]
    execution_phases = [
        evaluation["details_json"]["metrics"].get("phase")
        for evaluation in state["guardrail_evaluations"]
        if evaluation["stage"] == "execution"
    ]
    assert "pre_finance_action" in execution_phases
    assert "pre_spend_ledger_action" in execution_phases
    assert "post_execution_consistency" in execution_phases
    assert all(evaluation["adapter"] == "local_policy" for evaluation in state["guardrail_evaluations"])
    assert all(evaluation["used_real_nemo"] is False for evaluation in state["guardrail_evaluations"])
    assert state["database"]["table_counts"]["guardrail_evaluations"] == len(state["guardrail_evaluations"])

    with closing(get_connection()) as connection:
        persisted = list_guardrail_evaluations(connection, state["job"]["id"])

    assert len(persisted) == len(state["guardrail_evaluations"])


def test_judge_demo_start_run_behavior_remains_unchanged(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "scalex.db"))

    response = run_demo()
    state = response["state"]

    assert response["status"] == "completed"
    assert state["job"]["client_name"] == "Northstar Dental Group"
    assert state["job"]["status"] == "complete"
    assert state["ledger"]["totals"]["revenue_cents"] == 850000
    assert state["ledger"]["totals"]["approved_spend_cents"] == 115000
    assert state["ledger"]["totals"]["blocked_spend_cents"] == 320000
    assert state["ledger"]["totals"]["gross_profit_cents"] == 735000
    assert state["ledger"]["totals"]["actual_margin_percent"] == 86.5
    assert len(state["orchestration_calls"]) == 19
    assert len(state["policy_checks"]) == 4
    assert {"input", "planning", "execution", "output"}.issubset(
        {evaluation["stage"] for evaluation in state["guardrail_evaluations"]}
    )
    assert state["execution"]["guardrail_mode"] == "local_policy"
    assert state["execution"]["used_real_nemo"] is False
    assert state["execution"]["guardrails_fail_closed"] is False


def _job_for_seed(seed_config: dict) -> dict:
    return {
        "id": "job_test",
        "client_name": seed_config["clientName"],
        "business_type": seed_config["businessType"],
        "job_name": seed_config["jobName"],
        "job_goal": seed_config["jobGoal"],
        "invoice_amount_cents": int(seed_config["invoiceAmountUsd"] * 100),
        "spend_cap_cents": int(seed_config["spendCapUsd"] * 100),
        "margin_floor_percent": seed_config["marginFloorPercent"],
    }
