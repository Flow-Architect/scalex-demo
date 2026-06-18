"""API schema placeholders for future ScaleX endpoints."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    mode: str
