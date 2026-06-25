"""Local prototype auth for the ScaleX demo API."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Any

from fastapi import HTTPException, Request, Response

from ..config import Settings, get_settings


SESSION_COOKIE_NAME = "scalex_session"
SESSION_TTL_SECONDS = 8 * 60 * 60


def auth_status(request: Request, settings: Settings | None = None) -> dict[str, Any]:
    settings = settings or get_settings()
    if not settings.scalex_auth_enabled:
        return {
            "auth_enabled": False,
            "authenticated": True,
            "username": "local-prototype",
            "prototype_auth": "disabled",
        }

    username = verify_session_cookie(request, settings)
    return {
        "auth_enabled": True,
        "authenticated": username is not None,
        "username": username,
        "prototype_auth": "local-cookie",
    }


def login(
    *,
    response: Response,
    username: str,
    password: str,
    settings: Settings | None = None,
) -> dict[str, Any]:
    settings = settings or get_settings()
    if not settings.scalex_auth_enabled:
        return {
            "auth_enabled": False,
            "authenticated": True,
            "username": "local-prototype",
            "prototype_auth": "disabled",
        }

    _require_auth_config(settings)
    username_ok = secrets.compare_digest(username, settings.scalex_demo_username)
    password_ok = secrets.compare_digest(password, settings.scalex_demo_password)
    if not username_ok or not password_ok:
        raise HTTPException(status_code=401, detail="Invalid local prototype credentials.")

    token = sign_session_token(username=username, settings=settings)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_TTL_SECONDS,
        path="/",
        httponly=True,
        secure=False,
        samesite="lax",
    )
    return {
        "auth_enabled": True,
        "authenticated": True,
        "username": username,
        "prototype_auth": "local-cookie",
    }


def logout(response: Response, settings: Settings | None = None) -> dict[str, Any]:
    settings = settings or get_settings()
    if not settings.scalex_auth_enabled:
        return {
            "auth_enabled": False,
            "authenticated": True,
            "username": "local-prototype",
            "prototype_auth": "disabled",
        }

    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=False,
        samesite="lax",
    )
    return {
        "auth_enabled": True,
        "authenticated": False,
        "username": None,
        "prototype_auth": "local-cookie",
    }


def require_local_session(request: Request) -> None:
    settings = get_settings()
    if not settings.scalex_auth_enabled:
        return

    _require_auth_config(settings)
    if verify_session_cookie(request, settings) is None:
        raise HTTPException(status_code=401, detail="Login required for the local ScaleX console.")


def sign_session_token(*, username: str, settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    _require_auth_config(settings)
    payload = {
        "username": username,
        "issued_at": int(time.time()),
        "expires_at": int(time.time()) + SESSION_TTL_SECONDS,
    }
    payload_bytes = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_text = base64.urlsafe_b64encode(payload_bytes).decode("ascii").rstrip("=")
    signature = _signature(payload_text, settings.scalex_session_secret)
    return f"{payload_text}.{signature}"


def verify_session_cookie(request: Request, settings: Settings | None = None) -> str | None:
    settings = settings or get_settings()
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        return None
    return verify_session_token(token, settings)


def verify_session_token(token: str, settings: Settings | None = None) -> str | None:
    settings = settings or get_settings()
    if not settings.scalex_session_secret:
        return None
    try:
        payload_text, signature = token.split(".", 1)
    except ValueError:
        return None

    expected_signature = _signature(payload_text, settings.scalex_session_secret)
    if not secrets.compare_digest(signature, expected_signature):
        return None

    try:
        padded_payload = payload_text + "=" * (-len(payload_text) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded_payload.encode("ascii")))
    except (ValueError, json.JSONDecodeError):
        return None

    if not isinstance(payload, dict):
        return None
    if int(payload.get("expires_at", 0)) < int(time.time()):
        return None
    username = payload.get("username")
    return username if isinstance(username, str) and username else None


def _signature(payload_text: str, secret: str) -> str:
    digest = hmac.new(
        secret.encode("utf-8"),
        payload_text.encode("ascii"),
        hashlib.sha256,
    ).digest()
    return base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")


def _require_auth_config(settings: Settings) -> None:
    if (
        not settings.scalex_demo_username
        or not settings.scalex_demo_password
        or not settings.scalex_session_secret
    ):
        raise HTTPException(
            status_code=503,
            detail=(
                "Local prototype auth is enabled but SCALEX_DEMO_USERNAME, "
                "SCALEX_DEMO_PASSWORD, and SCALEX_SESSION_SECRET are not configured."
            ),
        )
