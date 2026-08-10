import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread":False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:   
        yield db
    finally:
        db.close()
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_register_user(): 
    """Testa a criação do User"""
    response = client.post(
        "/auth/register",
        json={
            "nome": "Usuário teste",
            "email": "teste@elitedev.com",
            "senha": "123_senha",
            "role": "cliente"
        }
    )
    assert response.status_code == 201, "Deveria retornar 201 Created"

    data = response.json()
    assert data["email"] == "teste@elitedev.com"
    assert data["nome"] == "Usuário teste"
    assert "senha" not in data, "A senha não deve ser retornado na resposta API"

def test_register_user_duplicate_user():
    """Testa se API bloqueia email duplicado"""
    response = client.post(
        "/auth/register",
        json={
            "nome": "Outronome",
            "email": "teste@elitedev.com",
            "senha": "1234_teste",
            "role": "cliente" 
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email já cadastrado"

def test_login_sucess():
    """Teste de login com creds corretas e recebimento do JWT"""
    response = client.post(
        "/auth/login",
        json={
            "email": "teste@elitedev.com",
            "senha": "123_senha"
        }
    )

    assert response.status_code == 200
    

    data = response.json()
  
    assert "access_token" in data
    assert data["token_type"] == "bearer"