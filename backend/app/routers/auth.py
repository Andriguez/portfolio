import hmac
import os
import secrets
import time

import pyotp
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .. import models
from ..auth import (
    PENDING_COOKIE,
    create_access_token,
    create_pending_token,
    pwd_context,
    require_admin,
    require_pending,
    verify_password,
)
from ..database import DbSession
from ..limiter import limiter
from ..schemas import LoginRequest
from ..security import decrypt, encrypt

router = APIRouter(prefix="/api", tags=["auth"])
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() == "true"


class TotpRequest(BaseModel):
    code: str = Field(min_length=6, max_length=20)


def start_session(response: Response):
    response.delete_cookie(PENDING_COOKIE, path="/api/login")
    response.set_cookie(
        "access_token",
        create_access_token(),
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=60 * 60 * 12,
    )


def get_security(db: Session) -> models.AdminSecurity:
    sec = db.get(models.AdminSecurity, 1)
    if not sec:
        sec = models.AdminSecurity(id=1)
        db.add(sec)
        db.flush()
    return sec


def use_recovery_code(db: Session, code: str) -> bool:
    for rc in (
        db.query(models.RecoveryCode).filter(models.RecoveryCode.used.is_(False)).all()
    ):
        if pwd_context.verify(code, rc.code_hash):
            rc.used = True
            return True
    return False


## must check for the limiter:
# putting this behind a reverse proxy or CDN, will make the server see the proxy's IP instead of the real visitor's unless trusted-proxy headers are configured.
@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, response: Response, db: DbSession):
    if not verify_password(payload.password):
        raise HTTPException(status_code=401, detail="incorrect password")

    sec = db.get(models.AdminSecurity, 1)
    if sec and sec.totp_enabled:
        response.set_cookie(
            PENDING_COOKIE,
            create_pending_token(),
            httponly=True,
            secure=COOKIE_SECURE,
            samesite="lax",
            max_age=300,
            path="/api/login",
        )
        return {"needs_totp": True}
    start_session(response)
    return {"ok": True}


@router.post("/login/totp")
@limiter.limit("5/minute")
def login_totp(
    request: Request, payload: TotpRequest, response: Response, db: DbSession
):
    require_pending(request)
    sec = db.get(models.AdminSecurity, 1)
    if not sec or not sec.totp_enabled:
        raise HTTPException(status_code=400, detail="2fa is not enabled")

    code = payload.code.replace("-", "").replace(" ", "").lower()
    ok = False
    if code.isdigit() and len(code) == 6:
        totp = pyotp.TOTP(decrypt(sec.totp_secret_enc))
        now_step = int(time.time() // 30)
        for step in (now_step - 1, now_step, now_step + 1):
            if step > sec.last_totp_step and hmac.compare_digest(
                totp.at(step * 30), code
            ):
                sec.last_totp_step = step
                ok = True
                break
    else:
        ok = use_recovery_code(db, code)

    if not ok:
        raise HTTPException(status_code=401, detail="wrong code.")
    db.commit()
    start_session(response)
    return {"ok": True}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"ok": True}


@router.get("/me")
def me(_: None = Depends(require_admin)):
    return {"ok": True}


@router.get("/2fa/status", dependencies=[Depends(require_admin)])
def status(db: DbSession):
    sec = db.get(models.AdminSecurity, 1)
    left = (
        db.query(models.RecoveryCode)
        .filter(models.RecoveryCode.used.is_(False))
        .count()
    )
    return {"enabled": bool(sec and sec.totp_enabled), "recovery_left": left}


@router.post("/2fa/setup", dependencies=[Depends(require_admin)])
def setup_2fa(db: DbSession):
    sec = get_security(db)
    if sec.totp_enabled:
        raise HTTPException(status_code=400, detail="2fa is already enabled")
    secret = pyotp.random_base32()
    sec.totp_secret_enc = encrypt(secret)
    db.commit()
    return {
        "uri": pyotp.TOTP(secret).provisioning_uri(
            name="admin", issuer_name="andi.sys"
        ),
        "secret": secret,
    }


@router.post("/2fa/enable", dependencies=[Depends(require_admin)])
@limiter.limit("5/minute")
def enable_2fa(request: Request, payload: TotpRequest, db: DbSession):
    sec = get_security(db)

    if sec.totp_enabled or not sec.totp_secret_enc:
        raise HTTPException(status_code=400, detail="start 2fa setup")
    if not pyotp.TOTP(decrypt(sec.totp_secret_enc)).verify(
        payload.code, valid_window=1
    ):
        raise HTTPException(status_code=400, detail="wrong code")

    sec.totp_enabled = True
    sec.last_totp_step = int(time.time() // 30)
    codes = [secrets.token_hex(5) for _ in range(10)]
    db.query(models.RecoveryCode).delete()

    for c in codes:
        db.add(models.RecoveryCode(code_hash=pwd_context.hash(c)))
    db.commit()
    return {"recovery_codes": [f"{c[:5]}-{c[5:]}" for c in codes]}
