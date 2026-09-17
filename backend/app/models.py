from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from .database import Base
import enum

class NodeType(str, enum.Enum):
    folder = "folder"
    file = "file"

class VfsNode(Base):
    __tablename__ = "vfs_nodes"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("vfs_nodes.id"), nullable=True)
    type = Column(Enum(NodeType), nullable=False)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)

    title = Column(String(100), nullable=True)
    body = Column(Text, nullable=True)
    image = Column(String(255), nullable=True)

    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    children = relationship("VfsNode", backref=backref("parent", remote_side=[id]))