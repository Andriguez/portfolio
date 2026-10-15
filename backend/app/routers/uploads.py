import asyncio
import os
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_

from .. import models
from ..auth import require_admin
from ..database import DbSession, UploadFileAn

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

UPLOAD_DIR = "/app/uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/jfif"}
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".jfif"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFileAn):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="unsupported image type")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail=f"file too large (max {MAX_SIZE}")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="unsupported file extension")

    safe_name = f"{uuid.uuid4().hex}{ext}"
    await asyncio.to_thread(Path(UPLOAD_DIR, safe_name).write_bytes, contents)

    return {"url": f"/uploads/{safe_name}"}


@router.get("", dependencies=[Depends(require_admin)])
def list_uploads(db: DbSession):
    files = []
    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)
        if not os.path.isfile(file_path):
            continue

        url = f"/uploads/{filename}"
        file_stat = os.stat(file_path)

        used_by = (
            db.query(models.VfsNode)
            .filter(
                or_(
                    models.VfsNode.image.contains(url),
                    models.VfsNode.body.contains(url),
                )
            )
            .all()
        )

        files.append(
            {
                "name": filename,
                "url": url,
                "size": file_stat.st_size,
                "created_at": datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
                "used_by": [n.name for n in used_by],
            }
        )

    files.sort(key=lambda x: x["created_at"], reverse=True)
    return files


@router.delete("/{filename}", dependencies=[Depends(require_admin)])
def delete_upload(filename: str):
    if os.path.basename(filename) != filename:
        raise HTTPException(status_code=400, detail="invalid filename")

    path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="file not found")

    os.remove(path)
    return {"ok": True}
