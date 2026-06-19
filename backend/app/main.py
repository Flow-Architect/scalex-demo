from contextlib import closing

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .demo_runner import run_demo
from .db import database_path, get_connection, initialize_database, reset_database
from . import repository
from .schemas import DemoActionResponse, DemoStateResponse, HealthResponse, SpendCheckRequest
from .services.ledger_service import usd_to_cents
from .services.payment_service import mark_job_paid
from .services.policy_service import apply_spend_request
from .services.seed_service import seed_demo_database
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
    allow_credentials=False,
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


@app.post("/api/demo/reset", response_model=DemoActionResponse)
def reset_demo() -> dict:
    try:
        reset_database()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "reset", "state": _current_state()}


@app.post("/api/demo/seed", response_model=DemoActionResponse)
def seed_demo() -> dict:
    initialize_database()
    with closing(get_connection()) as connection:
        seed_demo_database(connection)
    return {"status": "seeded", "state": _current_state()}


@app.post("/api/demo/run", response_model=DemoActionResponse)
def run_demo_endpoint() -> dict:
    try:
        return run_demo()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/demo/mark-paid", response_model=DemoActionResponse)
def mark_demo_paid() -> dict:
    initialize_database()
    with closing(get_connection()) as connection:
        job = repository.get_demo_job(connection)
        if job is None:
            raise HTTPException(status_code=400, detail="Seed a demo job before marking payment.")
        mark_job_paid(connection, job)
    return {"status": "paid", "state": _current_state()}


@app.post("/api/demo/spend-check", response_model=DemoActionResponse)
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


@app.get("/api/demo/state", response_model=DemoStateResponse)
def demo_state() -> dict:
    initialize_database()
    return _current_state()


def _current_state() -> dict:
    with closing(get_connection()) as connection:
        state = build_demo_state(connection)
    state["database"]["path"] = str(database_path())
    state["database"]["exists"] = database_path().exists()
    return state


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
