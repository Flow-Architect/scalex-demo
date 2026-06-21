"""Stripe test-mode integration service for ScaleX.

Product mode uses real Stripe test-mode API calls. The test-double branch is
explicitly for automated tests, CI, offline development, or labeled diagnostics.
"""

from __future__ import annotations

import importlib
import json
import sqlite3
from typing import Any

from .. import repository
from ..config import Settings, get_settings
from .hermes_adapter import sanitize_text


STRIPE_TEST_MODE = "stripe_test"
TEST_DOUBLE_MODE = "test_double"
DIAGNOSTIC_LOCAL_MODE = "diagnostic_local"


class StripeIntegrationError(RuntimeError):
    """Raised when product-mode Stripe test integration cannot proceed."""


def create_stripe_customer(
    connection: sqlite3.Connection,
    job: dict[str, Any],
    *,
    settings: Settings | None = None,
    stripe_module: Any | None = None,
) -> dict[str, Any]:
    settings = settings or get_settings()
    if settings.stripe_test_double_mode:
        return _create_test_double_event(connection, job, _test_double_step(job, "customer", settings))

    stripe_api = _stripe_api(settings, stripe_module)
    idempotency_key = _idempotency_key(settings, job, "customer")
    try:
        customer = stripe_api.Customer.create(
            name=job["client_name"],
            email="billing+scalex-sample@example.com",
            metadata={
                "scalex_job_id": job["id"],
                "scalex_client": job["client_name"],
                "scalex_mode": "goal7_test_mode",
            },
            idempotency_key=idempotency_key,
        )
    except Exception as exc:
        raise _api_error("create Stripe test customer", exc) from exc
    _assert_test_object(customer, "customer")
    customer_id = _get(customer, "id")

    created_event = repository.create_stripe_event(
        connection,
        job_id=job["id"],
        stripe_object_type="customer",
        stripe_object_id=customer_id,
        status="customer_created",
        amount_cents=0,
        mode=STRIPE_TEST_MODE,
        provider_mode=STRIPE_TEST_MODE,
        livemode=False,
        raw_object_json=_raw_object(customer),
        currency=settings.stripe_currency,
        customer_id=customer_id,
        idempotency_key=idempotency_key,
        event_id=_job_scoped_event_id("str", job["id"], "stripe_test_customer"),
    )
    connection.commit()
    return created_event


def create_stripe_invoice(
    connection: sqlite3.Connection,
    job: dict[str, Any],
    customer_event: dict[str, Any],
    *,
    settings: Settings | None = None,
    stripe_module: Any | None = None,
) -> dict[str, Any]:
    settings = settings or get_settings()
    if settings.stripe_test_double_mode:
        invoice_item_event = _create_test_double_event(
            connection,
            job,
            _test_double_step(job, "invoice_item", settings, customer_event=customer_event),
        )
        return {
            "invoice_item_event": invoice_item_event,
            "invoice": {
                "id": _test_double_invoice_id(job),
                "customer": customer_event["customer_id"],
                "status": "draft",
                "paid": False,
                "livemode": False,
            },
            "invoice_id": _test_double_invoice_id(job),
            "customer_id": customer_event["customer_id"],
            "idempotency_key": _idempotency_key(settings, job, "invoice"),
        }

    stripe_api = _stripe_api(settings, stripe_module)
    customer_id = _require_customer_id(customer_event)
    invoice_item_key = _idempotency_key(settings, job, "invoice-item")
    try:
        invoice_item = stripe_api.InvoiceItem.create(
            customer=customer_id,
            amount=int(job["invoice_amount_cents"]),
            currency=settings.stripe_currency,
            description=f"ScaleX {job['client_name']} {job['job_name']}",
            metadata={
                "scalex_job_id": job["id"],
                "scalex_client": job["client_name"],
            },
            idempotency_key=invoice_item_key,
        )
    except Exception as exc:
        raise _api_error("create Stripe test invoice item", exc) from exc
    _assert_test_object(invoice_item, "invoice item")
    invoice_item_id = _get(invoice_item, "id")
    invoice_item_event = repository.create_stripe_event(
        connection,
        job_id=job["id"],
        stripe_object_type="invoice_item",
        stripe_object_id=invoice_item_id,
        status="invoice_item_created",
        amount_cents=int(job["invoice_amount_cents"]),
        mode=STRIPE_TEST_MODE,
        provider_mode=STRIPE_TEST_MODE,
        livemode=False,
        raw_object_json=_raw_object(invoice_item),
        currency=settings.stripe_currency,
        customer_id=customer_id,
        idempotency_key=invoice_item_key,
        event_id=_job_scoped_event_id("str", job["id"], "stripe_test_invoice_item"),
    )

    invoice_key = _idempotency_key(settings, job, "invoice")
    try:
        invoice = stripe_api.Invoice.create(
            customer=customer_id,
            collection_method="send_invoice",
            days_until_due=30,
            pending_invoice_items_behavior="include",
            metadata={
                "scalex_job_id": job["id"],
                "scalex_client": job["client_name"],
            },
            idempotency_key=invoice_key,
        )
    except Exception as exc:
        raise _api_error("create Stripe test invoice", exc) from exc
    _assert_test_object(invoice, "invoice")
    connection.commit()
    return {
        "invoice_item_event": invoice_item_event,
        "invoice": _raw_object(invoice),
        "invoice_id": _get(invoice, "id"),
        "customer_id": customer_id,
        "idempotency_key": invoice_key,
    }


def prepare_stripe_payment_url(
    connection: sqlite3.Connection,
    job: dict[str, Any],
    invoice_result: dict[str, Any],
    *,
    settings: Settings | None = None,
    stripe_module: Any | None = None,
) -> dict[str, Any]:
    settings = settings or get_settings()
    if settings.stripe_test_double_mode:
        return _create_test_double_event(
            connection,
            job,
            _test_double_step(job, "invoice", settings, invoice_result=invoice_result),
        )

    stripe_api = _stripe_api(settings, stripe_module)
    invoice_id = _require_invoice_id(invoice_result)
    finalize_key = _idempotency_key(settings, job, "finalize-invoice")
    try:
        invoice = stripe_api.Invoice.retrieve(invoice_id)
        _assert_test_object(invoice, "invoice")
        finalized_invoice = invoice.finalize_invoice(idempotency_key=finalize_key)
    except Exception as exc:
        raise _api_error("finalize Stripe test invoice", exc) from exc
    _assert_test_object(finalized_invoice, "finalized invoice")
    invoice_status = str(_get(finalized_invoice, "status", "unknown"))
    paid = bool(_get(finalized_invoice, "paid", False))
    payment_intent = _object_id(_get(finalized_invoice, "payment_intent"))
    hosted_invoice_url = _get(finalized_invoice, "hosted_invoice_url")

    created_event = repository.create_stripe_event(
        connection,
        job_id=job["id"],
        stripe_object_type="invoice",
        stripe_object_id=_get(finalized_invoice, "id"),
        status=f"invoice_{invoice_status}",
        amount_cents=int(_get(finalized_invoice, "amount_due", job["invoice_amount_cents"]) or 0),
        mode=STRIPE_TEST_MODE,
        provider_mode=STRIPE_TEST_MODE,
        livemode=False,
        raw_object_json=_raw_object(finalized_invoice),
        currency=str(_get(finalized_invoice, "currency", settings.stripe_currency)),
        customer_id=_object_id(_get(finalized_invoice, "customer")),
        invoice_id=_get(finalized_invoice, "id"),
        hosted_invoice_url=hosted_invoice_url,
        payment_intent_id=payment_intent,
        idempotency_key=finalize_key,
        invoice_status=invoice_status,
        paid=paid,
        event_id=_job_scoped_event_id("str", job["id"], "stripe_test_invoice"),
    )
    connection.commit()
    return created_event


def confirm_stripe_payment_status(
    connection: sqlite3.Connection,
    job: dict[str, Any],
    invoice_event: dict[str, Any],
    *,
    settings: Settings | None = None,
) -> dict[str, Any]:
    settings = settings or get_settings()
    if settings.stripe_test_double_mode:
        return _create_test_double_event(
            connection,
            job,
            _test_double_step(job, "payment_status", settings, invoice_event=invoice_event),
        )

    paid = bool(invoice_event.get("paid"))
    invoice_status = str(invoice_event.get("invoice_status") or invoice_event.get("status") or "unknown")
    status = "stripe_paid" if paid else "local_test_confirmation_required"
    diagnostic_reason = None
    if not paid:
        diagnostic_reason = (
            "Stripe test invoice was finalized but is not paid. The compressed ScaleX run "
            "uses an explicitly labeled local test confirmation for revenue economics."
        )

    created_event = repository.create_stripe_event(
        connection,
        job_id=job["id"],
        stripe_object_type="payment_status",
        stripe_object_id=f"payment_status_{invoice_event['invoice_id']}",
        status=status,
        amount_cents=int(job["invoice_amount_cents"]),
        mode=STRIPE_TEST_MODE,
        provider_mode=STRIPE_TEST_MODE,
        livemode=False,
        raw_object_json={
            "invoice_id": invoice_event.get("invoice_id"),
            "invoice_status": invoice_status,
            "paid": paid,
            "hosted_invoice_url": invoice_event.get("hosted_invoice_url"),
        },
        currency=settings.stripe_currency,
        customer_id=invoice_event.get("customer_id"),
        invoice_id=invoice_event.get("invoice_id"),
        hosted_invoice_url=invoice_event.get("hosted_invoice_url"),
        payment_intent_id=invoice_event.get("payment_intent_id"),
        idempotency_key=_idempotency_key(settings, job, "payment-status"),
        diagnostic_reason=diagnostic_reason,
        invoice_status=invoice_status,
        paid=paid,
        event_id=_job_scoped_event_id("str", job["id"], "stripe_test_payment_status"),
    )
    connection.commit()
    return created_event


def record_stripe_lifecycle_note(
    connection: sqlite3.Connection,
    job: dict[str, Any],
    payment_status_event: dict[str, Any],
    *,
    settings: Settings | None = None,
) -> dict[str, Any]:
    settings = settings or get_settings()
    if settings.stripe_test_double_mode:
        title = "Stripe test-double lifecycle recorded"
        detail = (
            "Created Stripe test-double records for automated tests/diagnostics. "
            "No Stripe SDK call was performed."
        )
        status = "test_double"
        event_id = _job_scoped_event_id("evt", job["id"], "test_double_stripe_lifecycle")
        event_type = "stripe_test_double"
    else:
        paid = bool(payment_status_event.get("paid"))
        title = "Stripe test-mode invoice lifecycle recorded"
        detail = (
            "Created real Stripe test-mode customer and finalized invoice records with livemode=false. "
            f"Invoice status is {payment_status_event.get('invoice_status')}; paid={str(paid).lower()}."
        )
        if not paid:
            detail += (
                " Revenue is confirmed separately as a local compressed-run test confirmation, "
                "not as a Stripe-paid invoice."
            )
        status = "stripe_test"
        event_id = _job_scoped_event_id("evt", job["id"], "stripe_test_lifecycle")
        event_type = "stripe_test"

    event = repository.create_event(
        connection,
        job_id=job["id"],
        type=event_type,
        title=title,
        detail=detail,
        status=status,
        event_id=event_id,
    )
    connection.commit()
    return event


def payment_ledger_metadata(payment_status_event: dict[str, Any], job: dict[str, Any]) -> dict[str, str]:
    if bool(payment_status_event.get("paid")):
        return {
            "ledger_source": "stripe_test_invoice_paid",
            "ledger_label": f"{job['client_name']} Stripe test invoice paid",
            "event_title": "Stripe test invoice paid",
            "event_detail": (
                f"Recorded revenue for {job['client_name']} from a Stripe test-mode invoice "
                "that Stripe reported as paid. "
                "No live-money payment was processed."
            ),
            "event_status": "paid",
        }

    return {
        "ledger_source": "local_test_confirmation_after_stripe_invoice",
        "ledger_label": f"{job['client_name']} local test confirmation",
        "event_title": "Local test revenue confirmation recorded",
        "event_detail": (
            f"Recorded revenue for the compressed ScaleX run for {job['client_name']} after "
            "creating a real Stripe test-mode invoice. Stripe reported the invoice as not paid, "
            "so this is explicitly a local test confirmation and not a Stripe-paid invoice."
        ),
        "event_status": "local_test_confirmed",
    }


def validate_product_stripe_settings(settings: Settings) -> None:
    if settings.stripe_live_money_enabled:
        raise StripeIntegrationError("Verified Live Mode is not implemented in Goal 7.")
    if settings.stripe_live_mode:
        raise StripeIntegrationError("STRIPE_LIVE_MODE must be false for Goal 7.")
    if settings.stripe_mode != "test":
        raise StripeIntegrationError("STRIPE_MODE must be test for Goal 7.")
    if not settings.stripe_test_mode:
        raise StripeIntegrationError("STRIPE_TEST_MODE must be true for Goal 7.")
    secret_key = settings.stripe_secret_key.strip()
    if not secret_key:
        raise StripeIntegrationError(
            "STRIPE_SECRET_KEY is required for product-mode Stripe test integration."
        )
    if secret_key.startswith("sk_" + "live_"):
        raise StripeIntegrationError("Live Stripe secret keys are rejected for Goal 7.")
    if not secret_key.startswith("sk_test_"):
        raise StripeIntegrationError("Goal 7 requires a Stripe test secret key starting with sk_test_.")


def _stripe_api(settings: Settings, stripe_module: Any | None) -> Any:
    validate_product_stripe_settings(settings)
    if stripe_module is not None:
        return stripe_module
    try:
        stripe_api = importlib.import_module("stripe")
    except ImportError as exc:
        raise StripeIntegrationError(
            "The Stripe SDK is not installed. Run setup after adding backend requirements."
        ) from exc
    stripe_api.api_key = settings.stripe_secret_key
    return stripe_api


def _create_test_double_event(
    connection: sqlite3.Connection,
    job: dict[str, Any],
    event: dict[str, Any],
) -> dict[str, Any]:
    created_event = repository.create_stripe_event(
        connection,
        job_id=job["id"],
        stripe_object_type=event["stripe_object_type"],
        stripe_object_id=event["stripe_object_id"],
        status=event["status"],
        amount_cents=event["amount_cents"],
        mode=TEST_DOUBLE_MODE,
        provider_mode=TEST_DOUBLE_MODE,
        livemode=False,
        raw_object_json=event["raw_object_json"],
        currency=event.get("currency"),
        customer_id=event.get("customer_id"),
        invoice_id=event.get("invoice_id"),
        payment_link_id=event.get("payment_link_id"),
        payment_link_url=event.get("payment_link_url"),
        hosted_invoice_url=event.get("hosted_invoice_url"),
        checkout_session_id=event.get("checkout_session_id"),
        payment_intent_id=event.get("payment_intent_id"),
        idempotency_key=event.get("idempotency_key"),
        diagnostic_reason=event.get("diagnostic_reason"),
        invoice_status=event.get("invoice_status"),
        paid=event.get("paid"),
        event_id=event["event_id"],
    )
    connection.commit()
    return created_event


def _test_double_step(
    job: dict[str, Any],
    stripe_object_type: str,
    settings: Settings,
    *,
    customer_event: dict[str, Any] | None = None,
    invoice_result: dict[str, Any] | None = None,
    invoice_event: dict[str, Any] | None = None,
) -> dict[str, Any]:
    amount_cents = int(job["invoice_amount_cents"])
    customer_id = (customer_event or {}).get("customer_id") or _test_double_customer_id(job)
    invoice_id = (invoice_event or {}).get("invoice_id") or _test_double_invoice_id(job)
    hosted_invoice_url = (
        (invoice_event or {}).get("hosted_invoice_url")
        or f"https://invoice.stripe.test/{invoice_id}"
    )
    common = {
        "currency": settings.stripe_currency,
        "diagnostic_reason": "STRIPE_TEST_DOUBLE_MODE=true for automated tests or diagnostics.",
    }
    events = {
        "customer": {
            **common,
            "event_id": _job_scoped_event_id("str", job["id"], "test_double_customer"),
            "stripe_object_type": "customer",
            "stripe_object_id": customer_id,
            "status": "test_double_customer_created",
            "amount_cents": 0,
            "customer_id": customer_id,
            "idempotency_key": _idempotency_key(settings, job, "customer"),
            "raw_object_json": {"id": customer_id, "object": "customer", "livemode": False},
        },
        "invoice_item": {
            **common,
            "event_id": _job_scoped_event_id("str", job["id"], "test_double_invoice_item"),
            "stripe_object_type": "invoice_item",
            "stripe_object_id": _test_double_invoice_item_id(job),
            "status": "test_double_invoice_item_created",
            "amount_cents": amount_cents,
            "customer_id": customer_id,
            "idempotency_key": _idempotency_key(settings, job, "invoice-item"),
            "raw_object_json": {
                "id": _test_double_invoice_item_id(job),
                "object": "invoiceitem",
                "livemode": False,
                "amount": amount_cents,
            },
        },
        "invoice": {
            **common,
            "event_id": _job_scoped_event_id("str", job["id"], "test_double_invoice"),
            "stripe_object_type": "invoice",
            "stripe_object_id": invoice_id,
            "status": "test_double_invoice_open",
            "amount_cents": amount_cents,
            "customer_id": customer_id,
            "invoice_id": invoice_id,
            "hosted_invoice_url": hosted_invoice_url,
            "idempotency_key": _idempotency_key(settings, job, "finalize-invoice"),
            "invoice_status": "open",
            "paid": False,
            "raw_object_json": {
                "id": invoice_id,
                "object": "invoice",
                "livemode": False,
                "status": "open",
                "paid": False,
                "hosted_invoice_url": hosted_invoice_url,
            },
        },
        "payment_status": {
            **common,
            "event_id": _job_scoped_event_id("str", job["id"], "test_double_payment_status"),
            "stripe_object_type": "payment_status",
            "stripe_object_id": f"payment_status_{invoice_id}",
            "status": "test_double_local_test_confirmation",
            "amount_cents": amount_cents,
            "customer_id": customer_id,
            "invoice_id": invoice_id,
            "hosted_invoice_url": hosted_invoice_url,
            "idempotency_key": _idempotency_key(settings, job, "payment-status"),
            "invoice_status": "open",
            "paid": False,
            "raw_object_json": {
                "invoice_id": invoice_id,
                "invoice_status": "open",
                "paid": False,
                "hosted_invoice_url": hosted_invoice_url,
            },
        },
    }
    if invoice_result is not None and stripe_object_type == "invoice":
        events["invoice"]["invoice_id"] = invoice_result.get("invoice_id", invoice_id)
        events["invoice"]["stripe_object_id"] = invoice_result.get("invoice_id", invoice_id)
        events["invoice"]["hosted_invoice_url"] = (
            f"https://invoice.stripe.test/{events['invoice']['invoice_id']}"
        )
        events["invoice"]["raw_object_json"]["hosted_invoice_url"] = events["invoice"]["hosted_invoice_url"]
    return events[stripe_object_type]


def _test_double_customer_id(job: dict[str, Any]) -> str:
    return f"cus_test_double_{_safe_id(job['id'])}"


def _test_double_invoice_item_id(job: dict[str, Any]) -> str:
    return f"ii_test_double_{_safe_id(job['id'])}"


def _test_double_invoice_id(job: dict[str, Any]) -> str:
    if job["client_name"] == "Harbor Fleet Services" and int(job["invoice_amount_cents"]) == 120000:
        return "in_test_double_harbor_brake_1200"
    return f"in_test_double_{_safe_id(job['id'])}"


def _job_scoped_event_id(prefix: str, job_id: str, suffix: str) -> str:
    return f"{prefix}_{_safe_id(job_id)}_{suffix}"


def _safe_id(value: object) -> str:
    return "".join(char if char.isalnum() else "_" for char in str(value).lower())


def _assert_test_object(stripe_object: Any, label: str) -> None:
    if bool(_get(stripe_object, "livemode", False)):
        raise StripeIntegrationError(f"Stripe returned live-mode {label}; refusing to continue.")


def _idempotency_key(settings: Settings, job: dict[str, Any], step: str) -> str:
    prefix = settings.stripe_idempotency_prefix.strip() or "scalex-demo"
    return f"{prefix}-{job['id']}-{step}-{int(job['invoice_amount_cents'])}"


def _require_customer_id(customer_event: dict[str, Any]) -> str:
    customer_id = customer_event.get("customer_id") or customer_event.get("stripe_object_id")
    if not customer_id:
        raise StripeIntegrationError("Stripe customer ID was not available for invoice creation.")
    return str(customer_id)


def _require_invoice_id(invoice_result: dict[str, Any]) -> str:
    invoice_id = invoice_result.get("invoice_id")
    if not invoice_id and isinstance(invoice_result.get("invoice"), dict):
        invoice_id = invoice_result["invoice"].get("id")
    if not invoice_id:
        raise StripeIntegrationError("Stripe invoice ID was not available for finalization.")
    return str(invoice_id)


def _raw_object(stripe_object: Any) -> dict[str, Any]:
    if hasattr(stripe_object, "to_dict_recursive"):
        raw = stripe_object.to_dict_recursive()
    elif isinstance(stripe_object, dict):
        raw = dict(stripe_object)
    else:
        raw = {
            key: value
            for key, value in vars(stripe_object).items()
            if not key.startswith("_")
        }
    sanitized = sanitize_text(json.dumps(raw, default=str, sort_keys=True))
    return json.loads(sanitized)


def _get(stripe_object: Any, key: str, default: Any = None) -> Any:
    if isinstance(stripe_object, dict):
        return stripe_object.get(key, default)
    return getattr(stripe_object, key, default)


def _object_id(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        return value
    return str(_get(value, "id", value))


def _api_error(action: str, exc: Exception) -> StripeIntegrationError:
    return StripeIntegrationError(f"Could not {action}: {sanitize_text(str(exc))}")
