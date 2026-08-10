from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password:str) -> str:
    """
    Gera Hash
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha bate com hash
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """
    Gera o token JWT
    """

    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.acess_token_expires_minutes)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt