import asyncio
import os
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy import func, update
from sqlalchemy.orm import Session

from .. import models
from ..auth import require_admin
from ..database import DbSession, UploadFileAn
from ..limiter import limiter

CV_DIR = "/app/cv_files"
router = APIRouter(prefix="/api/cv", tags=["cv"])
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
TYPE_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,29}$")
os.makedirs(CV_DIR, exist_ok=True)


def clean_type(value: str) -> str:
    t = value.strip().lower()
    if not TYPE_RE.match(t):
        raise HTTPException(
            status_code=400,
            detail="type must be 2-30 characters: lowercase letters, numbers, dashes",
        )
    return t


def serialize(cv_file: models.CvFile, admin: bool = False):
    data = {
        "stored_filename": cv_file.stored_filename,
        "filename": cv_file.filename,
        "type": cv_file.type,
        "size": cv_file.size,
        "uploaded_at": cv_file.uploaded_at.isoformat(),
    }

    if admin:
        data["id"] = (cv_file.id)
        data["download_count"] = cv_file.download_count

    return data


def get_cv_file(db: Session, cv_type: str) -> models.CvFile:
    cv_file = (
        db.query(models.CvFile).filter(models.CvFile.type == cv_type.lower()).first()
    )
    if not cv_file:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv_file


@router.get("")
def list_cvs(db: DbSession):
    cv_files = db.query(models.CvFile).order_by(models.CvFile.uploaded_at.desc()).all()
    return [serialize(cv_file) for cv_file in cv_files]


@router.get("/{cv_type}/download")
@limiter.limit("30/minute")
def download_cv(request: Request, cv_type: str, db: DbSession):
    cv_file = get_cv_file(db, cv_type)

    file_path = os.path.join(CV_DIR, cv_file.stored_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    db.execute(
        update(models.CvFile)
        .where(models.CvFile.type == cv_type)
        .values(download_count=models.CvFile.download_count + 1)
    )

    db.commit()

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=cv_file.filename,
        content_disposition_type="attachment",
    )


@router.get("/{cv_type}/view")
def view_cv(cv_type: str, db: DbSession):
    cv = get_cv_file(db, cv_type)

    file_path = os.path.join(CV_DIR, cv.stored_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        os.path.join(CV_DIR, cv.stored_filename),
        media_type="application/pdf",
        filename=cv.filename,
        content_disposition_type="inline",
    )


@router.get("/admin", dependencies=[Depends(require_admin)])
def list_cvs_admin(db: DbSession):
    cvs = db.query(models.CvFile).order_by(models.CvFile.uploaded_at.desc()).all()
    return [serialize(c, admin=True) for c in cvs]


@router.post("", dependencies=[Depends(require_admin)])
async def upload_cv(
    db: DbSession, file: UploadFileAn, cv_type: str = Form(..., alias="type")
):
    cv_type = clean_type(cv_type)

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext != ".pdf" or file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="only PDF file are allowed")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="file too large (max 10MB)")
    if not contents.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="file is not real PDF")

    stored_name = f"{uuid.uuid4().hex}.pdf"
    await asyncio.to_thread(Path(CV_DIR, stored_name).write_bytes, contents)

    filename = os.path.basename(file.filename or "cv.pdf")
    existing = db.query(models.CvFile).filter(models.CvFile.type == cv_type).first()
    old_file = None

    if existing:
        old_file = existing.stored_filename
        existing.stored_filename, existing.filename, existing.size = (
            stored_name,
            filename,
            len(contents),
        )
        existing.uploaded_at = func.now()
        cv = existing
    else:
        cv = models.CvFile(
            type=cv_type,
            filename=filename,
            stored_filename=stored_name,
            size=len(contents),
        )
        db.add(cv)

    db.commit()
    db.refresh(cv)

    if old_file and os.path.isfile(os.path.join(CV_DIR, old_file)):
        os.remove(os.path.join(CV_DIR, old_file))
    return serialize(cv, admin=True)


@router.delete("/{cv_type}", dependencies=[Depends(require_admin)])
def delete_cv(cv_type: str, db: DbSession):
    cv = get_cv_file(db, cv_type)
    path = os.path.join(CV_DIR, cv.stored_filename)
    db.delete(cv)
    db.commit()
    if os.path.isfile(path):
        os.remove(path)
    return {"ok": True}
