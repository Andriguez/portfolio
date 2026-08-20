from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from .limiter import limiter
from .database import Base, engine
from .routers import vfs, auth, uploads

Base.metadata.create_all(bind=engine)

app = FastAPI(title="portfolio API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    ## TO-DO change to real url
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

app.include_router(vfs.router)
app.include_router(auth.router)
app.include_router(uploads.router)