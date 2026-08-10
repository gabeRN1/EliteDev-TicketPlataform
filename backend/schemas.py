from datetime import datetime
from typing import Optional, List
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

class EventBase(BaseModel):
    titulo:str
    descricao:str
    local:str
    data_evento: datetime
    preco:float
    capacidade_total: int
    ingressos_disponiveis: int
    imagem_url: Optional[str] = None
    external_id: Optional[str] = None
    categoria: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    organizador_id: int
    
    model_config = ConfigDict(from_attributes=True)