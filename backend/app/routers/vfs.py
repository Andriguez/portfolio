from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import require_admin

router = APIRouter(prefix="/api/vfs", tags=["vfs"])

RESERVED_ROOT_SLUGS = {"cv", "admin", "api", "uploads"}

def check_reserved(db: Session, parent_id: int | None, slug: str):
    if slug.lower() not in RESERVED_ROOT_SLUGS:
        return
    
    parent = db.get(models.VfsNode, parent_id) if parent_id else None
    if parent_id is None or (parent is not None and parent.parent_id is None):
        raise HTTPException(status_code=400, detail=f'"{slug}" is reserved for site routing.')

@router.get("", response_model=list[schemas.VfsNodeOut])
def list_nodes(db: Session = Depends(get_db)):
    return db.query(models.VfsNode).all()

@router.post("", response_model=schemas.VfsNodeOut, dependencies=[Depends(require_admin)])
def create_node(payload: schemas.VfsNodeCreate, db: Session = Depends(get_db)):
    check_reserved(db, payload.parent_id, payload.slug)

    node = models.VfsNode(**payload.model_dump())
    db.add(node)
    db.commit()
    db.refresh(node)
    return node

@router.patch("/{node_id}", response_model=schemas.VfsNodeOut, dependencies=[Depends(require_admin)])
def update_node(node_id: int, payload: schemas.VfsNodeUpdate, db: Session = Depends(get_db)):
    node = db.get(models.VfsNode, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="node not found")

    if payload.slug is not None:
        check_reserved(db, node.parent_id, payload.slug)
    
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(node, field, value)
    db.commit()
    db.refresh(node)
    return node

@router.delete("/{node_id}", dependencies=[Depends(require_admin)])
def delete_node(node_id: int, db: Session = Depends(get_db)):
    node = db.get(models.VfsNode, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="node not found")
    if node.children:
        raise HTTPException(status_code=400, detail="node has children nodes")
    db.delete(node)
    db.commit()
    return {"ok": True}

