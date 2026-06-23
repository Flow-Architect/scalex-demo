from contextlib import closing

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from .demo_runner import run_demo
from .db import database_path, get_connection, initialize_database, reset_database
from . import repository
from .schemas import (
    AuthLoginRequest,
    AuthStatusResponse,
    DemoActionResponse,
    DemoStateResponse,
    HealthResponse,
    OnboardingRequest,
    SpendCheckRequest,
)
from .services.auth_service import auth_status, login, logout, require_local_session
from .services.ledger_service import usd_to_cents
from .services.payment_service import mark_job_paid
from .services.policy_service import apply_spend_request
from .services.seed_service import load_seed_config, seed_demo_database
from .services.state_service import build_demo_state

app = FastAPI(
    title="ScaleX Demo API",
    description="Sandbox-only API for the ScaleX hackathon demo.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
@app.get("/api/health", response_model=HealthResponse)
def health() -> dict[str, str | bool]:
    path = database_path()
    return {
        "status": "ok",
        "mode": "local_sqlite",
        "database_path": str(path),
        "database_exists": path.exists(),
    }


@app.get("/api/auth/me", response_model=AuthStatusResponse)
def auth_me(request: Request) -> dict:
    return auth_status(request)


@app.post("/api/auth/login", response_model=AuthStatusResponse)
def auth_login(request: AuthLoginRequest, response: Response) -> dict:
    return login(response=response, username=request.username, password=request.password)


@app.post("/api/auth/logout", response_model=AuthStatusResponse)
def auth_logout(response: Response) -> dict:
    return logout(response)


@app.post(
    "/api/demo/reset",
    response_model=DemoActionResponse,
    dependencies=[Depends(require_local_session)],
)
def reset_demo() -> dict:
    try:
        reset_database()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "reset", "state": _current_state()}


@app.post(
    "/api/demo/seed",
    response_model=DemoActionResponse,
    dependencies=[Depends(require_local_session)],
)
def seed_demo() -> dict:
    initialize_database()
    with closing(get_connection()) as connection:
        seed_config = _harbor_seed_config()
        workflow = repository.create_workflow(
            connection,
            seed_config,
            workflow_id=repository.HARBOR_WORKFLOW_ID,
            activate=True,
        )
        repository.upsert_onboarding_config(connection, seed_config)
        seed_demo_database(connection, seed_config, workflow_id=workflow["id"])
    return {"status": "seeded", "state": _current_state()}


@app.post(
    "/api/demo/onboarding",
    response_model=DemoActionResponse,
    dependencies=[Depends(require_local_session)],
)
def onboard_demo_customer(request: OnboardingRequest) -> dict:
    return _save_workflow_from_request(request, status="onboarded")


@app.post(
    "/api/demo/workflows",
    response_model=DemoActionResponse,
    dependencies=[Depends(require_local_session)],
)
def create_demo_workflow(request: OnboardingRequest) -> dict:
    return _save_workflow_from_request(request, status="workflow_saved")


@app.post(
    "/api/demo/workflows/{workflow_id}/select",
    response_model=DemoActionResponse,
    dependencies=[Depends(require_local_session)],
)
def select_demo_workflow(workflow_id: str) -> dict:
    initialize_database()
    with closing(get_connection()) as connection:
        try:
            repository.select_workflow(connection, workflow_id)
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        connection.commit()
    return {"status": "workflow_selected", "state": _current_state()}


@app.post(
    "/api/demo/workflows/{workflow_id}/delete",
    response_model=DemoActionResponse,
    dependencies=[Depends(require_local_session)],
)
def delete_demo_workflow(workflow_id: str) -> dict:
    initialize_database()
    with closing(get_connection()) as connection:
        try:
            repository.delete_workflow(connection, workflow_id)
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        connection.commit()
    return {"status": "workflow_deleted", "state": _current_state()}


@app.post(
    "/api/demo/run",
    response_model=DemoActionResponse,
    dependencies=[Depends(require_local_session)],
)
def run_demo_endpoint() -> dict:
    try:
        return run_demo()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post(
    "/api/demo/mark-paid",
    response_model=DemoActionResponse,
    dependencies=[Depends(require_local_session)],
)
def mark_demo_paid() -> dict:
    initialize_database()
    with closing(get_connection()) as connection:
        job = repository.get_demo_job(connection)
        if job is None:
            raise HTTPException(status_code=400, detail="Seed a demo job before marking payment.")
        mark_job_paid(connection, job)
    return {"status": "paid", "state": _current_state()}


@app.post(
    "/api/demo/spend-check",
    response_model=DemoActionResponse,
    dependencies=[Depends(require_local_session)],
)
def demo_spend_check(request: SpendCheckRequest) -> dict:
    requested_amount_cents = _spend_request_amount_cents(request)

    initialize_database()
    with closing(get_connection()) as connection:
        job = repository.get_demo_job(connection)
        if job is None:
            raise HTTPException(status_code=400, detail="Seed a demo job before checking spend.")
        result = apply_spend_request(
            connection,
            job=job,
            vendor=request.vendor,
            requested_amount_cents=requested_amount_cents,
            human_approved=request.human_approved,
        )
    status = "spend_approved" if result["decision"]["approved"] else "spend_blocked"
    return {"status": status, "decision": result["decision"], "state": _current_state()}


@app.get(
    "/api/demo/state",
    response_model=DemoStateResponse,
    dependencies=[Depends(require_local_session)],
)
def demo_state(run_id: str | None = None) -> dict:
    initialize_database()
    return _current_state(run_id=run_id)


def _current_state(run_id: str | None = None) -> dict:
    with closing(get_connection()) as connection:
        state = build_demo_state(connection, run_id=run_id)
    state["database"]["path"] = str(database_path())
    state["database"]["exists"] = database_path().exists()
    return state


def _save_workflow_from_request(request: OnboardingRequest, *, status: str) -> dict:
    try:
        seed_config = _onboarding_seed_config(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    initialize_database()
    with closing(get_connection()) as connection:
        workflow_id = (
            repository.HARBOR_WORKFLOW_ID
            if seed_config["clientName"] == "Harbor Fleet Services"
            and seed_config["jobName"] == "30-day fleet brake inspection campaign"
            else None
        )
        repository.create_workflow(
            connection,
            seed_config,
            workflow_id=workflow_id,
            activate=True,
        )
        repository.upsert_onboarding_config(connection, seed_config)
        connection.commit()
    return {"status": status, "state": _current_state()}


def _harbor_seed_config() -> dict:
    return load_seed_config()


def _onboarding_seed_config(request: OnboardingRequest) -> dict:
    client_name = _clean_text(request.client_name, "customer/business name", max_length=120)
    business_type = _clean_text(request.business_type, "business type", max_length=120)
    job_name = _clean_text(request.job_name, "job/campaign name", max_length=160)
    job_goal = _clean_text(request.job_goal, "job goal", max_length=1200)
    if request.invoice_amount_usd <= 0:
        raise ValueError("Invoice amount must be greater than zero.")
    if request.spend_cap_usd <= 0:
        raise ValueError("Spend cap must be greater than zero.")
    if request.margin_floor_percent < 0 or request.margin_floor_percent > 95:
        raise ValueError("Margin floor must be between 0 and 95.")

    approved_vendors = _vendor_list(request.approved_vendors)
    blocked_vendors = _vendor_list(request.blocked_vendors)
    approved_spend_vendors = approved_vendors[:2] or ["Local Ads API", "Design Asset Pack"]
    blocked_spend_vendor = blocked_vendors[0] if blocked_vendors else "Premium Automation Suite"

    return {
        "clientName": client_name,
        "businessType": business_type,
        "jobName": job_name,
        "jobGoal": job_goal,
        "invoiceAmountUsd": request.invoice_amount_usd,
        "spendCapUsd": request.spend_cap_usd,
        "marginFloorPercent": request.margin_floor_percent,
        "approvedVendors": approved_vendors,
        "blockedVendors": blocked_vendors,
        "approvedSpendRequests": [
            {
                "vendor": approved_spend_vendors[0],
                "amountUsd": 89,
                "purpose": "Local sample approved vendor spend.",
            },
            {
                "vendor": approved_spend_vendors[1] if len(approved_spend_vendors) > 1 else "Design Asset Pack",
                "amountUsd": 98,
                "purpose": "Local sample approved creative spend.",
            },
        ],
        "blockedSpendRequests": [
            {
                "vendor": blocked_spend_vendor,
                "amountUsd": 750,
                "purpose": "Local sample unsafe spend request.",
            }
        ],
    }


def _clean_text(value: str, field_name: str, *, max_length: int) -> str:
    cleaned = " ".join(value.strip().split())
    if not cleaned:
        raise ValueError(f"{field_name} is required.")
    return cleaned[:max_length]


def _vendor_list(values: list[str]) -> list[str]:
    cleaned: list[str] = []
    for value in values:
        vendor = " ".join(value.strip().split())
        if vendor and vendor not in cleaned:
            cleaned.append(vendor[:120])
    return cleaned[:12]


def _spend_request_amount_cents(request: SpendCheckRequest) -> int:
    amount_cents = (
        request.amount_cents
        if request.amount_cents is not None
        else request.requested_amount_cents
    )
    if amount_cents is not None:
        if amount_cents <= 0:
            raise HTTPException(status_code=400, detail="Spend check amount_cents must be greater than zero.")
        return amount_cents

    amount_usd = request.amount_usd if request.amount_usd is not None else request.amount
    if amount_usd is None or amount_usd <= 0:
        raise HTTPException(status_code=400, detail="Spend check amount_cents must be greater than zero.")
    return usd_to_cents(amount_usd)
