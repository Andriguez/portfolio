import os
from fastapi import APIRouter, HTTPException, Response, Request
from ..schemas import LoginRequest
from ..auth import verify_password, create_access_token, require_admin
from ..limiter import limiter

router = APIRouter(prefix="/api", tags=["auth"])
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() == "true"

## must check for the limiter:
# if you ever put this behind a reverse proxy or CDN, it'll see the proxy's IP instead of the real visitor's unless you configure trusted-proxy headers.
@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, response: Response):
    if not verify_password(payload.password):
        raise HTTPException(status_code=401, detail="incorrect password")
    token = create_access_token()
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=60 * 60 * 2
    )
    return {"ok": True}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"ok": True}

@router.get("/me")
def isItAuth(request: Request, response: Response):
    if require_admin(request):
        return {"ok": True}