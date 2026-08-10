from sqlalchemy import Column, Integer, String, Enum
from database import Base
import enum

class RoleEnum(str, enum.Enum):
    organizador = "organizador"
    cliente = "cliente"
    portaria = "portaria"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.cliente, nullable=False)