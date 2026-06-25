from contextlib import closing

import pytest

from app.config import Settings
from app.db import get_connection, initialize_database
from app.repository import create_job, list_stripe_events
from app.services.seed_service import load_seed_config
from app.services.stripe_service import (
    StripeIntegrationError,
    confirm_stripe_payment_status,
    create_stripe_customer,
    create_stripe_invoice,
    prepare_stripe_payment_url,
    validate_product_stripe_settings,
)


class StripeObject(dict):
    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc

    def to_dict_recursive(self):
        return dict(self)


class FakeStripeModule:
    def __init__(self, *, livemode=False, paid=False, fail_action=None):
        self.api_key = ""
        self.calls = []
        self.livemode = livemode
        self.paid = paid
        self.fail_action = fail_action
        self.Customer = FakeCustomerResource(self)
        self.InvoiceItem = FakeInvoiceItemResource(self)
        self.Invoice = FakeInvoiceResource(self)


class FakeCustomerResource:
    def __init__(self, module):
        self.module = module

    def create(self, **kwargs):
        self.module.calls.append(("Customer.create", kwargs))
        if self.module.fail_action == "customer":
            raise RuntimeError(
                "bad " + "sk_" + "test_secret " + "sk_" + "live_secret"
            )
        return StripeObject(
            {
                "id": "cus_real_test_123",
                "object": "customer",
                "livemode": self.module.livemode,
                "name": kwargs["name"],
            }
        )


class FakeInvoiceItemResource:
    def __init__(self, module):
        self.module = module

    def create(self, **kwargs):
        self.module.calls.append(("InvoiceItem.create", kwargs))
        return StripeObject(
            {
                "id": "ii_real_test_123",
                "object": "invoiceitem",
                "livemode": self.module.livemode,
                "amount": kwargs["amount"],
                "currency": kwargs["currency"],
                "customer": kwargs["customer"],
            }
        )


class FakeInvoiceResource:
    def __init__(self, module):
        self.module = module

    def create(self, **kwargs):
        self.module.calls.append(("Invoice.create", kwargs))
        return StripeObject(
            {
                "id": "in_real_test_123",
                "object": "invoice",
                "livemode": self.module.livemode,
                "customer": kwargs["customer"],
                "status": "draft",
                "paid": False,
            }
        )

    def retrieve(self, invoice_id, **kwargs):
        self.module.calls.append(("Invoice.retrieve", {"invoice_id": invoice_id, **kwargs}))
        return FakeInvoiceObject(
            self.module,
            {
                "id": invoice_id,
                "object": "invoice",
                "livemode": self.module.livemode,
                "customer": "cus_real_test_123",
                "status": "draft",
                "paid": False,
            },
        )


class FakeInvoiceObject(StripeObject):
    def __init__(self, module, values):
        super().__init__(values)
        self.module = module

    def finalize_invoice(self, **kwargs):
        self.module.calls.append(("Invoice.finalize_invoice", {"invoice_id": self["id"], **kwargs}))
        return StripeObject(
            {
                "id": self["id"],
                "object": "invoice",
                "livemode": self.module.livemode,
                "customer": "cus_real_test_123",
                "status": "paid" if self.module.paid else "open",
                "paid": self.module.paid,
                "amount_due": 850000,
                "currency": "usd",
                "hosted_invoice_url": "https://invoice.stripe.test/in_real_test_123",
                "payment_intent": "pi_real_test_123" if self.module.paid else None,
            }
        )


def test_product_stripe_settings_reject_missing_key() -> None:
    with pytest.raises(StripeIntegrationError, match="STRIPE_SECRET_KEY is required"):
        validate_product_stripe_settings(_settings(stripe_secret_key=""))


def test_product_stripe_settings_reject_live_key() -> None:
    with pytest.raises(StripeIntegrationError, match="Live Stripe secret keys are rejected"):
        validate_product_stripe_settings(_settings(stripe_secret_key="sk_" + "live_123"))


def test_product_stripe_settings_reject_malformed_key() -> None:
    with pytest.raises(StripeIntegrationError, match="starting with sk_test"):
        validate_product_stripe_settings(_settings(stripe_secret_key="rk_test_123"))


def test_product_stripe_settings_reject_live_mode_and_future_live_money() -> None:
    with pytest.raises(StripeIntegrationError, match="STRIPE_LIVE_MODE must be false"):
        validate_product_stripe_settings(_settings(stripe_live_mode=True))

    with pytest.raises(StripeIntegrationError, match="Verified Live Mode is not implemented"):
        validate_product_stripe_settings(_settings(stripe_live_money_enabled=True))


def test_real_stripe_test_invoice_flow_persists_expanded_events_and_idempotency(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)
    fake_stripe = FakeStripeModule()
    settings = _settings()

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        customer = create_stripe_customer(connection, job, settings=settings, stripe_module=fake_stripe)
        invoice_result = create_stripe_invoice(
            connection,
            job,
            customer,
            settings=settings,
            stripe_module=fake_stripe,
        )
        invoice = prepare_stripe_payment_url(
            connection,
            job,
            invoice_result,
            settings=settings,
            stripe_module=fake_stripe,
        )
        payment_status = confirm_stripe_payment_status(connection, job, invoice, settings=settings)
        events = list_stripe_events(connection, job["id"])

    assert [event["stripe_object_type"] for event in events] == [
        "customer",
        "invoice_item",
        "invoice",
        "payment_status",
    ]
    assert all(event["mode"] == "stripe_test" for event in events)
    assert all(event["livemode"] == 0 for event in events)
    assert customer["customer_id"] == "cus_real_test_123"
    assert invoice["invoice_id"] == "in_real_test_123"
    assert invoice["hosted_invoice_url"] == "https://invoice.stripe.test/in_real_test_123"
    assert invoice["invoice_status"] == "open"
    assert invoice["paid"] == 0
    assert payment_status["paid"] == 0
    assert "local test confirmation" in payment_status["diagnostic_reason"]

    idempotency_keys = [
        call[1]["idempotency_key"]
        for call in fake_stripe.calls
        if "idempotency_key" in call[1]
    ]
    assert idempotency_keys == [
        "scalex-demo-job_northstar_client_implementation-customer-850000",
        "scalex-demo-job_northstar_client_implementation-invoice-item-850000",
        "scalex-demo-job_northstar_client_implementation-invoice-850000",
        "scalex-demo-job_northstar_client_implementation-finalize-invoice-850000",
    ]


def test_real_stripe_paid_invoice_can_mark_stripe_paid_status(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)
    fake_stripe = FakeStripeModule(paid=True)
    settings = _settings()

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        customer = create_stripe_customer(connection, job, settings=settings, stripe_module=fake_stripe)
        invoice_result = create_stripe_invoice(
            connection,
            job,
            customer,
            settings=settings,
            stripe_module=fake_stripe,
        )
        invoice = prepare_stripe_payment_url(
            connection,
            job,
            invoice_result,
            settings=settings,
            stripe_module=fake_stripe,
        )
        payment_status = confirm_stripe_payment_status(connection, job, invoice, settings=settings)

    assert invoice["invoice_status"] == "paid"
    assert invoice["paid"] == 1
    assert payment_status["status"] == "stripe_paid"
    assert payment_status["paid"] == 1
    assert payment_status["payment_intent_id"] == "pi_real_test_123"


def test_real_stripe_flow_rejects_livemode_objects(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)
    fake_stripe = FakeStripeModule(livemode=True)

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        with pytest.raises(StripeIntegrationError, match="live-mode customer"):
            create_stripe_customer(connection, job, settings=_settings(), stripe_module=fake_stripe)


def test_real_stripe_api_errors_are_sanitized(tmp_path) -> None:
    db_path = tmp_path / "scalex.db"
    initialize_database(db_path)
    fake_stripe = FakeStripeModule(fail_action="customer")

    with closing(get_connection(db_path)) as connection:
        job = create_job(connection, load_seed_config())
        with pytest.raises(StripeIntegrationError) as exc_info:
            create_stripe_customer(connection, job, settings=_settings(), stripe_module=fake_stripe)

    message = str(exc_info.value)
    assert "sk_" + "test_secret" not in message
    assert "sk_" + "live_secret" not in message
    assert "REDACTED" in message


def _settings(**overrides) -> Settings:
    values = {
        "app_env": "test",
        "scalex_execution_mode": "full_proof",
        "database_path": ":memory:",
        "stripe_live_mode": False,
        "policy_engine": "local",
        "hermes_mode": "isolated_cli",
        "hermes_cli_path": "/tmp/hermes",
        "hermes_home": "/tmp/hermes-home",
        "hermes_model": "gpt-5.5",
        "hermes_provider": "openai-codex",
        "hermes_timeout_seconds": 60,
        "hermes_require_real": True,
        "hermes_test_mode": True,
        "hermes_max_output_chars": 12000,
        "hermes_skill_name": "scalex-operator",
        "hermes_skill_source_path": "./hermes/skills/scalex-operator",
        "hermes_toolsets": "skills",
        "stripe_secret_key": "sk_" + "test_123",
        "stripe_test_mode": True,
        "stripe_test_double_mode": False,
    }
    values.update(overrides)
    return Settings(**values)
