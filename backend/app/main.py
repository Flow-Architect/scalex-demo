from fastapi import FastAPI

app = FastAPI(
    title="ScaleX Demo API",
    description="Sandbox-only API scaffold for the ScaleX hackathon demo.",
    version="0.1.0",
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "mode": "scaffold"}
