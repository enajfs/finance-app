from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from jose.backends import RSAKey
import httpx
import json
from functools import lru_cache
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.config import settings

security = HTTPBearer()

@lru_cache(maxsize=1)
def get_jwks():
    response = httpx.get(settings.CLERK_JWKS_URL)
    return response.json()

def get_public_key(token: str):
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    jwks = get_jwks()
    for key in jwks["keys"]:
        if key["kid"] == kid:
            return RSAKey(key, algorithm="RS256")
    raise HTTPException(status_code=401, detail="Public key not found")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        public_key = get_public_key(token)
        payload = jwt.decode(token, public_key, algorithms=["RS256"])
        clerk_id: str = payload.get("sub")
        email: str = payload.get("email", "")
        if not clerk_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    # Upsert user on first login
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if not user:
        user = User(clerk_id=clerk_id, email=email)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user
