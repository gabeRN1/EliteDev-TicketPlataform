from datetime import datetime, timedelta, timezone
from database import get_db
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import models
import hmac
import hashlib
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def gerar_qr_code(ticket_id: int, evento_id: int) -> str:
    """Gera o QR Code assinando os IDs com a secret_key vinda das configurações (.env)."""
    secret = settings.secret_key.encode("utf-8")
    mensagem = f"ticket:{ticket_id}|evento:{evento_id}".encode("utf-8")
    
    hash_qr = hmac.new(secret, mensagem, hashlib.sha256).hexdigest()

    return f"qr-{ticket_id}-{evento_id}-{hash_qr}"

def get_password_hash(password: str) -> str:
    """Gera Hash"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha bate com hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """Gera o token JWT"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.acess_token_expires_minutes)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    """Decodifica o token JWT, valida o ID ou e-mail (sub) e busca o usuário no banco de dados."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais de acesso.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        sub = payload.get("sub")

        if sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    sub_str = str(sub)

    if sub_str.isdigit():
        user = db.query(models.User).filter(models.User.id == int(sub_str)).first()
    else:
        user = db.query(models.User).filter(models.User.email == sub_str).first()
         
    if user is None:
        raise credentials_exception
    
    return user