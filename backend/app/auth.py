import os
import jwt
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, Request
from jwt import PyJWTError
from passlib.context import CryptContext

JWT_SECRET = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"
ADMIN_PASSWORD_HASH = os.environ["ADMIN_PASSWORD_HASH"]
PENDING_COOKIE = "pending_2fa"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(password: str) -> bool:
    return pwd_context.verify(password, ADMIN_PASSWORD_HASH)


def create_access_token() -> str:
    expire = datetime.now(UTC) + timedelta(hours=2)
    return jwt.encode({"sub": "admin", "exp": expire}, JWT_SECRET, algorithm=ALGORITHM)


def require_admin(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="not authenticated")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except PyJWTError:
        raise HTTPException(status_code=401, detail="invalid or expired session")
    if payload.get("purpose"):
        raise HTTPException(status_code=401, detail="invalid session")


def create_pending_token() -> str:
    expire = datetime.now(UTC) + timedelta(minutes=5)
    return jwt.encode(
        {"sub": "admin", "purpose": "2fa", "exp": expire},
        JWT_SECRET,
        algorithm=ALGORITHM,
    )


def require_pending(request: Request):
    token = request.cookies.get(PENDING_COOKIE)

    try:
        payload = jwt.decode(token or "", JWT_SECRET, algorithms=[ALGORITHM])
    except PyJWTError:
        raise HTTPException(status_code=401, detail="login expired")
    if payload.get("purpose") != "2fa":
        raise HTTPException(status_code=401, detail="login expired")
