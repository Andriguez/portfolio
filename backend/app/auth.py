import os
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from fastapi import HTTPException, Request
from jwt import PyJWTError

JWT_SECRET = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"
ADMIN_PASSWORD_HASH = os.environ["ADMIN_PASSWORD_HASH"]
PENDING_COOKIE = "pending_2fa"

def hash_secret(secret: str) -> str:
    return bcrypt.hashpw(secret.encode(), bcrypt.gensalt()).decode()

def check_secret(secret: str, secret_hash: str) -> bool:
    data = secret.encode()
    if len(data) > 72:
        return False
    return bcrypt.checkpw(data, secret_hash.encode())

def verify_password(password: str) -> bool:
    return check_secret(password, ADMIN_PASSWORD_HASH)

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
