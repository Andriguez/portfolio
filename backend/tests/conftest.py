import os
import tempfile

import bcrypt
import pyotp

TEST_PASSWORD = "test-password"
ENCODED_PASSWORD = TEST_PASSWORD.encode()

JWT_SECRET = os.environ.setdefault("JWT_SECRET", "test-secret-not-real-0123456789")
ADMIN_PASSWORD_HASH = os.environ.setdefault("ADMIN_PASSWORD_HASH", bcrypt.hashpw(ENCODED_PASSWORD, bcrypt.gensalt()).decode())
DATABASE_URL = os.environ.setdefault("DATABASE_URL", "mysql+pymysql://test:test@localhost/test")
CORS_ORIGINS=os.environ.setdefault("CORS_ORIGINS", "true")
TOTP_ENC_KEY = os.environ.setdefault("TOTP_ENC_KEY", "uUNk1ucHx_PVX_LrcCns3KgWAokSnjxWrH63bf6DtC4=") # gitleaks:allow
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true")
REPO = os.environ.setdefault("GITHUB_REPO", "Andriguez/portfolio")
TOKEN = os.environ.setdefault("GITHUB_TOKEN", "test-secret-not-real-0123456789")

TEST_FILES_DIR = tempfile.mkdtemp(prefix="portfolio-tests-")
os.environ.setdefault("CV_DIR", os.path.join(TEST_FILES_DIR, "cv_files"))
os.environ.setdefault("UPLOAD_DIR", os.path.join(TEST_FILES_DIR, "uploads"))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.limiter import limiter
from app.main import app


@pytest.fixture
def client():
    # SQLite database in memory for tests
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},  # TestClient uses more than one thread
        poolclass=StaticPool,                        # every session shares the same in-memory db
    )
    Base.metadata.create_all(engine)                 # create all tables from your models
    TestingSession = sessionmaker(bind=engine, autoflush=False)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    limiter.reset()

    yield TestClient(app, base_url="https://testserver")

    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)

@pytest.fixture
def totp_admin(client):
    client.post("/api/login", json={"password": TEST_PASSWORD})

    before_status_2fa_response = client.get("/api/2fa/status")
    print(before_status_2fa_response.json())

    setup = client.post("/api/2fa/setup")
    secret = setup.json()["secret"]

    code = pyotp.TOTP(secret).now()
    confirm = client.post("/api/2fa/enable", json={"code": code})
    recovery_codes = confirm.json()["recovery_codes"]

    after_status_2fa_response = client.get("/api/2fa/status")
    print(after_status_2fa_response.json())

    client.cookies.clear()

    return {"secret": secret, "recovery_codes": recovery_codes}