from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VfsNodeFields(BaseModel):
    type: str
    name: str
    slug: str
    description: str | None = None

class VfsNodeBase(VfsNodeFields):
    title: str | None = None
    body: str | None = None
    image: str | None = None

class VfsNodeCreate(VfsNodeBase):
    slug: str = Field(pattern=r"^[a-zA-Z0-9_-]+$")
    parent_id: int

class VfsNodeUpdate(BaseModel):
    name: str | None = None
    slug: str = Field(default=None, pattern=r"^[a-zA-Z0-9_-]+$")
    description: str | None = None
    title: str | None = None
    body: str | None = None
    image: str | None = None
    parent_id: int = Field(default=None)


class VfsNodeOut(VfsNodeBase):
    id: int
    parent_id: int | None
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)

class VfsNodeSummary(VfsNodeFields):
    id: int
    parent_id: int | None
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    password: str
