import time

import jwt
import pyotp
from conftest import TEST_PASSWORD


def login(client, password):
    return client.post("/api/login", json={"password": password})

def login_with_code(client, code):
    login(client, TEST_PASSWORD)
    return client.post("/api/login/totp", json={"code": code})

def test_me_requires_login(client):
    response = client.get("/api/me")
    assert response.status_code == 401

def test_wrong_password(client):
    response = login(client, "wrong_password")
    assert response.status_code == 401
    assert response.json() == {"detail": "incorrect password"}

def test_correct_login_no_2fa(client):
    response = login(client, TEST_PASSWORD)
    assert response.status_code == 200
    assert response.json() == {"ok": True}
    token = response.cookies.get("access_token")
    payload = jwt.decode(token, options={"verify_signature": False})
    assert payload["sub"] == "admin"
    assert payload["exp"] > time.time()
    assert set(payload) == {"sub", "exp"}

def test_correct_login_2fa(client, totp_admin):
    totp_response = totp_admin

    login_response = login(client, TEST_PASSWORD)
    assert login_response.status_code == 200

    code = pyotp.TOTP(totp_response["secret"]).at(time.time() + 30)
    code_response = client.post("/api/login/totp", json={"code": code})
    assert code_response.status_code == 200
    assert "access_token" in client.cookies
    assert client.get("/api/me").status_code == 200

def test_login_rate_limit(client):
    for _ in range (5):
        response = login(client, "wrong_password")
        assert response.status_code == 401

    rate_limited_response = login(client, "rate_limited_password")
    assert rate_limited_response.status_code == 429

def test_pending_token_refused(client, totp_admin):
    login_response = login(client, TEST_PASSWORD)
    assert login_response.status_code == 200

    assert "pending_2fa" in client.cookies
    assert "access_token" not in client.cookies

    verify_response = client.get("/api/me")
    assert verify_response.status_code == 401

    pending_token = client.cookies.get("pending_2fa")
    client.cookies.clear()
    client.cookies.set("access_token", pending_token)
    assert client.get("/api/me").status_code == 401
    
def test_2fa_code_replay_refused(client, totp_admin):
    code = pyotp.TOTP(totp_admin["secret"]).at(time.time() + 30)
    assert login_with_code(client, code).status_code == 200

    client.cookies.clear()
    code_replay = login_with_code(client, code)
    assert code_replay.status_code == 401
    assert "access_token" not in client.cookies

def test_recovery_code_works_once(client, totp_admin):
    recovery_code = totp_admin["recovery_codes"][0]
    login_recovery_code = login_with_code(client, recovery_code)
    assert login_recovery_code.status_code == 200
    assert "access_token" in client.cookies

    client.cookies.clear()
    login_recovery_code_replay = login_with_code(client, recovery_code)
    assert login_recovery_code_replay.status_code == 401
    assert "access_token" not in client.cookies

    next_recovery_code = totp_admin["recovery_codes"][1]
    login_new_recovery_code = login_with_code(client, next_recovery_code)
    assert login_new_recovery_code.status_code == 200
    assert "access_token" in client.cookies