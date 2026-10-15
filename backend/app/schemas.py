from datetime import datetime

from pydantic import BaseModel


class VfsNodeBase(BaseModel):
    type: str
    name: str
    slug: str
    description: str | None = None
    title: str | None = None
    body: str | None = None
    image: str | None = None

class VfsNodeCreate(VfsNodeBase):
    parent_id: int | None = None

class VfsNodeUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    title: str | None = None
    body: str | None = None
    image: str | None = None
    parent_id: int | None = None

class VfsNodeOut(VfsNodeBase):
    id: int
    parent_id: int | None
    updated_at: datetime | None
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    password: str
