from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..auth import require_admin
from ..database import DbSession
from ..models import StaticContent

router = APIRouter(prefix="/api/static_content", tags=["static_content"])
ALLOWED_KEYS = {"hello_message", "stack_info"}

class StaticContentUpdate(BaseModel):
    value: str = Field(..., min_length=1, max_length=5000)

@router.get("")
def get_static_content(db: DbSession):
    result = {key: "" for key in ALLOWED_KEYS}
    for row in db.query(StaticContent).all():
        if row.key in ALLOWED_KEYS:
            result[row.key] = row.value
    return result

@router.put("/{key}", dependencies=[Depends(require_admin)])
def update_static_content(key: str, content: StaticContentUpdate, db: DbSession):
    if key not in ALLOWED_KEYS:
        raise HTTPException(status_code=404, detail="unknown key")

    row = db.get(StaticContent, key)
    if row:
        row.value = content.value
    else:
        db.add(StaticContent(key=key, value=content.value))
    db.commit()
    return {"key": key, "value": content.value}