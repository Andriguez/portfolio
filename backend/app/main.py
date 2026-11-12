import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from . import models
from .database import sessionLocal
from .limiter import limiter
from .routers import auth, content, cv, social_links, trash, uploads, vfs
from .routers.uploads import UPLOAD_DIR


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = sessionLocal()
    try:
        root_node = db.query(models.VfsNode).filter(models.VfsNode.parent_id.is_(None)).first()
        if not root_node:
            root_node = models.VfsNode(
                type="folder",
                name="root",
                slug="root",
            )
            db.add(root_node)
            db.commit()
    finally:
        db.close()

    yield

app = FastAPI(title="portfolio API", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(vfs.router)
app.include_router(auth.router)
app.include_router(uploads.router)
app.include_router(content.router)
app.include_router(cv.router)
app.include_router(social_links.router)
app.include_router(trash.router)
