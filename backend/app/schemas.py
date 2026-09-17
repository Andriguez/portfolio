from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VfsNodeBase(BaseModel):
    type: str
    name: str
    slug: str
    description: Optional[str] = None
    title: Optional[str] = None
    body: Optional[str] = None
    image: Optional[str] = None

class VfsNodeCreate(VfsNodeBase):
    parent_id: Optional[int] = None

class VfsNodeUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    title: Optional[str] = None
    body: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[int] = None

class VfsNodeOut(VfsNodeBase):
    id: int
    parent_id: Optional[int]
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    password: str
