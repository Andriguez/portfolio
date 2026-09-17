import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, Request
from typing_extensions import deprecated

JWT_SECRET = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"
ADMIN_PASSWORD_HASH = os.environ["ADMIN_PASSWORD_HASH"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(password: str) -> bool:
    return pwd_context.verify(password, ADMIN_PASSWORD_HASH)

def create_access_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=2)
    return jwt.encode({"sub": "admin", "exp": expire}, JWT_SECRET, algorithm=ALGORITHM)

def require_admin(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="not authenticated")

    try:
        jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="invalid or expired session")
