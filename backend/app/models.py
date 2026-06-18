"""Domain model placeholders for the ScaleX backend."""

from dataclasses import dataclass


@dataclass(frozen=True)
class DemoJob:
    id: str
    client_name: str
    job_name: str
    invoice_amount_cents: int
    spend_cap_cents: int
    margin_floor_percent: float
