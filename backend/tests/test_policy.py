from contextlib import closing

from app.db import get_connection, initialize_database
from app.repository import create_job, create_policy_check, list_policy_checks
from app.services.ledger_service import usd_to_cents
from app.services.policy_service import load_policy_config, policy_summary
from app.services.seed_service import load_seed_config


def test_policy_config_summary_uses_local_rules() -> None:
    summary = policy_summary(load_policy_config())

    assert summary["engine"] == "local policy engine"
    assert summary["stripe_live_mode"] is False
    assert summary["max_job_spend_usd"] == 300
    assert summary["margin_floor_percent"] == 50
    assert "Local Ads API" in summary["approved_vendors"]
    assert "Premium Automation Suite" in summary["blocked_vendors"]


def test_policy_check_persistence(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        create_policy_check(
            connection,
            job_id=job["id"],
            request_type="vendor_spend",
            vendor="Premium Automation Suite",
            requested_amount_cents=usd_to_cents(750),
            approved=False,
            reason="Vendor blocked and spend exceeds cap.",
            margin_after_spend_percent=37.5,
            required_action="blocked",
        )
        connection.commit()
        checks = list_policy_checks(connection, job["id"])

    assert len(checks) == 1
    assert checks[0]["vendor"] == "Premium Automation Suite"
    assert checks[0]["approved"] == 0
    assert checks[0]["requested_amount_cents"] == 75000
