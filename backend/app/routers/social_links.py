from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from .. import models
from ..auth import require_admin
from ..database import DbSession

router = APIRouter(prefix="/api/links", tags=["links"])


class SocialLinkIn(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    url: str = Field(max_length=500)

    @field_validator("url")
    @classmethod
    def web_urls_only(cls, v: str) -> str:
        v = v.strip()
        parsed = urlparse(v)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ValueError("url must start with http:// or https://")
        return v


def serialize(link: models.SocialLink):
    return {"id": link.id, "name": link.name, "url": link.url}


@router.get("")
def list_links(db: DbSession):
    return [
        serialize(l)
        for l in db.query(models.SocialLink).order_by(models.SocialLink.id).all()
    ]


@router.post("", dependencies=[Depends(require_admin)])
def create_link(payload: SocialLinkIn, db: DbSession):
    link = models.SocialLink(**payload.model_dump())
    db.add(link)
    db.commit()
    db.refresh(link)
    return serialize(link)


@router.put("/{link_id}", dependencies=[Depends(require_admin)])
def update_link(link_id: int, payload: SocialLinkIn, db: DbSession):
    link = db.get(models.SocialLink, link_id)
    if not link:
        raise HTTPException(status_code=404, detail="social link not found")
    link.name, link.url = payload.name, payload.url
    db.commit()
    return serialize(link)


@router.delete("/{link_id}", dependencies=[Depends(require_admin)])
def delete_link(link_id: int, db: DbSession):
    link = db.get(models.SocialLink, link_id)
    if not link:
        raise HTTPException(status_code=404, detail="link not found")
    db.delete(link)
    db.commit()
    return {"ok": True}
