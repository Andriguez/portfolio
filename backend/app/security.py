import os
from cryptography.fernet import Fernet

_fernet = Fernet(os.environ["TOTP_ENC_KEY"].encode())

def encrypt(value: str) -> str:
    return _fernet.encrypt(value.encode()).decode()

def decrypt(value: str) -> str:
    return _fernet.decrypt(value.encode()).decode()
