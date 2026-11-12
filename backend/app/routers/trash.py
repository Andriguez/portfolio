import os
import re
import threading
import time

import httpx
from fastapi import APIRouter

router = APIRouter(prefix="/api/trash", tags=["trash"])

REPO = os.environ.get("GITHUB_REPO", "").strip()
TOKEN = os.environ.get("GITHUB_TOKEN", "").strip()

OK_TTL = 24 * 3600
FAIL_TTL = 600
MAX_COMMITS = 40
MAX_ITEMS = 12
DEADLINE_SECONDS = 20
MAX_PREVIEW_LINES = 50
MAX_LINE_WIDTH = 140

SKIP_NAME = re.compile(
    r"(^|/)(\.env[^/]*|id_rsa[^/]*|package-lock\.json"
    r"|[^/]*\.(pem|key|p12|pfx|sqlite3?|db|sql|dump|lock)"
    r"|[^/]*(secret|credential|password|token)[^/]*)$",
    re.IGNORECASE,
)

SKIP_DIR = re.compile(r"(^|/)(node_modules|__pycache__|dist|build|\.venv)/", re.IGNORECASE)
SECRETISH = re.compile(r"(secret|token|passw|api[_-]?key|private[_-]?key|BEGIN [A-Z ]*KEY)", re.IGNORECASE)

RESTORE_ERRORS = [
    "refusing to restore: it was deleted for a reason.",
    "merge conflict with the present.",
    "restoring would undo a lesson.",
    "detached HEAD. detached from reality, too.",
    "pre-commit hook rejected it. you know why.",
    "the codebase has moved on. so should you.",
]

_lock = threading.Lock()
_cache = {"at": 0.0, "ttl": 0, "payload": {"source": "fallback", "items": []}}

def _preview(patch: str) -> list[str]:
    lines: list[str] = []
    for raw in patch.splitlines():
        if not raw.startswith("-") or raw.startswith("---"):
            continue
        text = raw[1:MAX_LINE_WIDTH + 1]
        lines.append("- [redacted]" if SECRETISH.search(text) else f"- {text}")
        if len(lines) >= MAX_PREVIEW_LINES:
            break
    return lines

def _build_items() -> list[dict]:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "portfolio-trash",
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"

    items: list[dict] = []
    deadline = time.monotonic() + DEADLINE_SECONDS

    with httpx.Client(base_url="https://api.github.com", headers=headers, timeout=8) as client:
        listing = client.get(f"/repos/{REPO}/commits", params={"per_page": MAX_COMMITS})
        listing.raise_for_status()

        for commit in listing.json():
            if len(items) >= MAX_ITEMS or time.monotonic() > deadline:
                break
            detail = client.get(f"/repos/{REPO}/commits/{commit['sha']}")
            if detail.status_code in (403, 429):
                raise RuntimeError("rate limited")      # fall back instead of showing a partial list
            if detail.status_code != 200:
                continue

            message = (commit["commit"]["message"].splitlines() or [""])[0][:90]
            date = commit["commit"]["author"]["date"]
            sha = commit["sha"]

            for f in detail.json().get("files", []):
                path = f.get("filename", "")
                patch = f.get("patch")
                if f.get("status") != "removed" or not patch:       # binaries have no patch
                    continue
                if SKIP_NAME.search(path) or SKIP_DIR.search(path):
                    continue
                total = f.get("deletions", 0)
                items.append({
                    "name": path.rsplit("/", 1)[-1],
                    "path": path,
                    "size": f"{total} lines",
                    "totalLines": total,
                    "hash": sha[:7],
                    "commit": message,
                    "date": date,
                    "preview": _preview(patch),
                    "restoreError": RESTORE_ERRORS[int(sha[:6], 16) % len(RESTORE_ERRORS)],
                })
                if len(items) >= MAX_ITEMS:
                    break
    return items


@router.get("")
def get_trash():
    if not REPO:
        return {"source": "fallback", "items": []}

    now = time.time()
    with _lock:
        if now - _cache["at"] < _cache["ttl"]:
            return _cache["payload"]
        try:
            items = _build_items()
            payload = {"source": "github", "items": items} if items else {"source": "fallback", "items": []}
            _cache.update(at=now, ttl=OK_TTL, payload=payload)
        except Exception:
            _cache.update(at=now, ttl=FAIL_TTL)
        return _cache["payload"]
