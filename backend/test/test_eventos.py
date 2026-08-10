import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def token_organizador(client):
    """Cria e autentica um usuário Organizador, retornando o token JWT."""
    client.post(
        "/auth/register",
        json={
            "nome": "Organizador Teste",
            "email": "org_test@elitedev.com",
            "senha": "senha_organizador",
            "role": "organizador"
        }
    )
    
    response = client.post(
        "/auth/login",
        json={"email": "org_test@elitedev.com", "senha": "senha_organizador"}
    )
    return response.json()["access_token"]


@pytest.fixture
def token_cliente(client):
    """Cria e autentica um usuário Cliente, retornando o token JWT."""
    client.post(
        "/auth/register",
        json={
            "nome": "Cliente Teste",
            "email": "cliente_test@elitedev.com",
            "senha": "senha_cliente",
            "role": "cliente"
        }
    )
    response = client.post(
        "/auth/login",
        json={"email": "cliente_test@elitedev.com", "senha": "senha_cliente"}
    )
    return response.json()["access_token"]



def get_evento_payload():
    return {
        "titulo": "Festival de Jazz Elite",           
        "descricao": "Show ao vivo para testes de homologação.",
        "local": "Teatro Central",
        "data_evento": (datetime.now() + timedelta(days=10)).isoformat(),
        "preco": 150.0,
        "capacidade_total": 200,                      
        "ingressos_disponiveis": 200,                 
        "imagem_url": "https://exemplo.com/poster.jpg",
        "external_id": "tmdb_12345",
        "categoria": "show"
    }


def test_criar_evento_como_organizador_sucesso(client, token_organizador):
    """Deve permitir a criação do evento quando o usuário for Organizador (201 Created)."""
    headers = {"Authorization": f"Bearer {token_organizador}"}
    response = client.post("/eventos/", json=get_evento_payload(), headers=headers)

    assert response.status_code == 201
    data = response.json()
    assert data["titulo"] == "Festival de Jazz Elite"
    assert data["ingressos_disponiveis"] == 200
    assert "id" in data


def test_criar_evento_como_cliente_negado(client, token_cliente):
    """Deve recusar a criação do evento se o usuário for Cliente (403 Forbidden)."""
    headers = {"Authorization": f"Bearer {token_cliente}"}
    response = client.post("/eventos/", json=get_evento_payload(), headers=headers)

    assert response.status_code == 403
    assert response.json()["detail"] == "Acesso negado. Apenas organizadores podem criar eventos."


def test_criar_evento_sem_token_negado(client):
    """Deve recusar a criação se nenhum token for enviado (401 Unauthorized)."""
    response = client.post("/eventos/", json=get_evento_payload())
    assert response.status_code == 401




def test_listar_eventos_publico(client, token_organizador):
    """Garante que a listagem de eventos seja pública (200 OK)."""
    
    headers = {"Authorization": f"Bearer {token_organizador}"}
    client.post("/eventos/", json=get_evento_payload(), headers=headers)

    
    response = client.get("/eventos/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1


def test_obter_evento_por_id_sucesso(client, token_organizador):
    """Deve buscar os detalhes de um evento existente pelo ID."""
    headers = {"Authorization": f"Bearer {token_organizador}"}
    res_criar = client.post("/eventos/", json=get_evento_payload(), headers=headers)
    evento_id = res_criar.json()["id"]

    response = client.get(f"/eventos/{evento_id}")
    assert response.status_code == 200
    assert response.json()["id"] == evento_id


def test_obter_evento_id_inexistente(client):
    """Deve retornar 404 Not Found ao buscar um ID que não existe."""
    response = client.get("/eventos/999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Evento não encontrado."