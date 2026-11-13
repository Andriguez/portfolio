import os
import re
import threading
import time

import httpx
import markdown
from fastapi import APIRouter

router = APIRouter(prefix="/api/changelog", tags=["changelog"])

REPO = os.environ.get("GITHUB_REPO", "").strip()
TOKEN = os.environ.get("GITHUB_TOKEN", "").strip()
FILE_PATH = "CHANGELOG.md"


OK_TTL = 24 * 3600
FAIL_TTL = 600
MAX_CHARS = 200_000

EMPTY_HTML = "<p>nothing here yet. history starts at v1.0</p>"
ERROR_HTML = "<p>couldn't reach the archive.."
RELEASE_HEADING = re.compile(r"^## \[\d+\.\d+\.\d+\]", re.MULTILINE)
LATEST = re.compile(r"^## \[(\d+\.\d+\.\d+)\]", re.MULTILINE)

def _payload(status: str, body: str, description: str = "check what i've been doing here.", updated_at: str | None = None) -> dict:
    return {
        "status": status, "description": description, 
        "updated_at": updated_at, 
        "content": {"title": FILE_PATH, "body": body}}


_lock = threading.Lock()
_cache = {"at": 0.0, "ttl": 0, "payload": _payload("error", ERROR_HTML)}

def _headers(accept: str) -> dict:
    headers = {"Accept": accept, "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "portfolio-changelog"}
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    return headers


def _fetch() -> dict:
    with httpx.Client(base_url="https://api.github.com", timeout=8) as client:
        file = client.get(f"/repos/{REPO}/contents/{FILE_PATH}", headers=_headers("application/vnd.github.raw"))
        if file.status_code == 404:
            return _payload("empty", EMPTY_HTML)
        file.raise_for_status()
        text = file.text[:MAX_CHARS]

        updated_at = None
        commits = client.get(
            f"/repos/{REPO}/commits",
            params={"path": FILE_PATH, "per_page": 1},
            headers=_headers("application/vnd.github+json"),
        )
        if commits.status_code == 200 and commits.json():
            updated_at = commits.json()[0]["commit"]["committer"]["date"]

    latest = LATEST.search(text)
    if not latest:
        return _payload("empty", EMPTY_HTML, updated_at=updated_at)

    description = f"latest: v{latest.group(1)}"
    return _payload("ready", markdown.markdown(text), description, updated_at)


@router.get("")
def get_changelog():
    if not REPO:
        return _payload("empty", EMPTY_HTML)

    now = time.time()
    with _lock:
        if now - _cache["at"] < _cache["ttl"]:
            return _cache["payload"]
        try:
            _cache.update(at=now, ttl=OK_TTL, payload=_fetch())
        except (httpx.HTTPError, ValueError, KeyError, IndexError):
            _cache.update(at=now, ttl=FAIL_TTL)
        return _cache["payload"]