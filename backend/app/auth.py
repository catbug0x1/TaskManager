import os
import base64

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


def create_token(username: str) -> str:
    payload = f"{username}:{SECRET_KEY}"
    return base64.b64encode(payload.encode()).decode()


def verify_token(token: str) -> str | None:
    try:
        decoded = base64.b64decode(token.encode()).decode()
        username, secret = decoded.split(":", 1)
        if secret == SECRET_KEY and username == ADMIN_USERNAME:
            return username
    except Exception:
        return None
    return None
