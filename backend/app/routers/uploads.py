import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from ..auth import require_admin

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

UPLOAD_DIR = "/app/uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/jfif"}
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".jfif"}
MAX_SIZE = 5 * 1024 * 1024 # 5MB

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="unsupported image type")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail=f"file too large (max {MAX_SIZE}")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="unsupported file extension")

    safe_name = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(UPLOAD_DIR, safe_name), "wb") as f:
        f.write(contents)

    return {"url": f"/uploads/{safe_name}"}