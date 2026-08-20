from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import require_admin

router = APIRouter(prefix="/api/vfs", tags=["vfs"])

@router.get("", response_model=list[schemas.VfsNodeOut])
def list_nodes(db: Session = Depends(get_db)):
    return db.query(models.VfsNode).all()

@router.post("", response_model=schemas.VfsNodeOut, dependencies=[Depends(require_admin)])
def create_node(payload: schemas.VfsNodeCreate, db: Session = Depends(get_db)):
    node = models.VfsNode(**payload.model.dump())
    db.add(node)
    db.commit()
    db.refresh(node)
    return node

@router.patch("/{node_id}", response_model=schemas.VfsNodeOut, dependencies=[Depends(require_admin)])
def update_node(node_id: int, payload: schemas.VfsNodeUpdate, db: Session = Depends(get_db)):
    node = db.get(models.VfsNode, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="node not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(node, field, value)
    db.commit()
    db.refresh(node)
    return node

@router.delete("/{node_id", dependencies=[Depends(require_admin)])
def delete_node(node_id: int, db: Session = Depends(get_db)):
    node = db.get(models.VfsNode, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="node not found")
    if node.children:
        raise HTTPException(status_code=400, detail="node has children nodes")
    db.delete(node)
    db.commit()
    return {"ok", True}

