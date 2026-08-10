from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
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
    eventos = relationship("Event", back_populates="organizador")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descricao = Column(String, nullable=False)
    local = Column(String, nullable=False)
    data_evento = Column(DateTime, nullable=False)
    preco = Column(Float, nullable=False)
    capacidade_total = Column(Integer, nullable=False)
    ingressos_disponiveis = Column(Integer, nullable=False)
    imagem_url = Column(String, nullable=False)
    external_id = Column(String, nullable=True, index=True)
    categoria = Column(String, nullable=False)
    organizador_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organizador = relationship("User", back_populates="eventos")