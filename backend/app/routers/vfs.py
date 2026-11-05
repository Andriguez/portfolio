from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, defer

from .. import models, schemas
from ..auth import require_admin
from ..database import DbSession

router = APIRouter(prefix="/api/vfs", tags=["vfs"])

RESERVED_ROOT_SLUGS = {"my_cv", "admin", "api", "uploads", "cv", "trash"}


def check_reserved(db: Session, parent_id: int | None, slug: str):
    if slug.lower() not in RESERVED_ROOT_SLUGS:
        return

    parent = db.get(models.VfsNode, parent_id) if parent_id else None
    if parent_id is None or (parent is not None and parent.parent_id is None):
        raise HTTPException(
            status_code=400, detail=f'"{slug}" is reserved for site routing.'
        )

def check_valid_parent(db: Session, parent_id: int):
    parent = db.get(models.VfsNode, parent_id)
    if not parent:
        raise HTTPException(status_code=404, detail="parent node not found")
    if parent.type != "folder":
        raise HTTPException(
            status_code=400, detail="node can only be a child of a folder"
        )


@router.get("", response_model=list[schemas.VfsNodeSummary])
def list_nodes(db: DbSession):
    return db.query(models.VfsNode).options(defer(models.VfsNode.body)).all()

@router.get("/{node_id}", response_model=schemas.VfsNodeOut)
def get_node(node_id: int, db: DbSession):
    node = db.get(models.VfsNode, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="node not found")
    return node

@router.post(
    "", response_model=schemas.VfsNodeOut, dependencies=[Depends(require_admin)]
)
def create_node(payload: schemas.VfsNodeCreate, db: DbSession):
    if payload.parent_id is None:
        raise HTTPException(status_code=400, detail="root nodes cannot be created")

    check_valid_parent(db, payload.parent_id)
    check_reserved(db, payload.parent_id, payload.slug)
 
    node = models.VfsNode(**payload.model_dump())
    db.add(node)
    db.commit()
    db.refresh(node)
    return node


@router.patch(
    "/{node_id}",
    response_model=schemas.VfsNodeOut,
    dependencies=[Depends(require_admin)],
)
def update_node(node_id: int, payload: schemas.VfsNodeUpdate, db: DbSession):
    node = db.get(models.VfsNode, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="node not found")

    final_slug = payload.slug if payload.slug is not None else node.slug
    final_parent_id = (payload.parent_id if payload.parent_id is not None else node.parent_id)

    if node.parent_id is None:
        raise HTTPException(status_code=400, detail="root node cannot be updated")

    if final_parent_id is not None and final_parent_id != node.parent_id:
        check_valid_parent(db, final_parent_id)
        if final_parent_id == node.id:
            raise HTTPException(
                status_code=400, detail="node cannot be its own parent"
            )
        if node.children:
            raise HTTPException(
                status_code=400, detail="node with children cannot be moved"
            )

    check_reserved(db, final_parent_id, final_slug)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(node, field, value)
    db.commit()
    db.refresh(node)
    return node


@router.delete("/{node_id}", dependencies=[Depends(require_admin)])
def delete_node(node_id: int, db: DbSession):
    node = db.get(models.VfsNode, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="node not found")
    if node.children:
        raise HTTPException(status_code=400, detail="node has children nodes")
    if node.parent_id is None:
        raise HTTPException(status_code=400, detail="root nodes cannot be deleted")
    db.delete(node)
    db.commit()
    return {"ok": True}
