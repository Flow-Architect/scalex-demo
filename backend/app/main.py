from contextlib import closing

from fastapi import FastAPI, HTTPException

from .db import database_path, get_connection, initialize_database, reset_database
from .schemas import DemoActionResponse, DemoStateResponse, HealthResponse
from .services.seed_service import seed_demo_database
from .services.state_service import build_demo_state

app = FastAPI(
    title="ScaleX Demo API",
    description="Sandbox-only API for the ScaleX hackathon demo.",
    version="0.1.0",
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
