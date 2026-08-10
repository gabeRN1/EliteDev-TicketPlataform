from pydantic import BaseModel, EmailStr, ConfigDict
from models import RoleEnum

class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    role: RoleEnum = RoleEnum.cliente

class UserResponse(BaseModel):
    id: int
    nome: str
    email: str
    role: RoleEnum

    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

class Token(BaseModel):
    access_token: str
    token_type: str