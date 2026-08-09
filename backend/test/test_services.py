import pytest
from services import fetch_external_events

@pytest.mark.asyncio
async def test_fetch_external_events_api():
    """Teste para verificar a conectvidade com a api externa"""

    resultados = await fetch_external_events()

    assert len(resultados) > 0,"Busca funcionou mas retornou uma lista vazia"

    primeiro_filme = resultados[0]
    assert "id" in primeiro_filme, "Faltou o campo 'id' no return da API"
    assert "title" in primeiro_filme, "Faltou o campo 'title' no return da API"


@pytest.mark.asyncio
async def test_fetch_external_events_api():
    """
    Teste com a api do tmb
    """
    resultados = await fetch_external_events()

    assert len(resultados) > 0,"Busca funcionou mas retornou uma lista vazia"

    primeiro_filme = resultados[0]
    assert "id" in primeiro_filme, "Faltou o campo 'id' no return da API"
    assert "title" in primeiro_filme, "Faltou o campo 'title' no return da API"

    termo_de_busca = "Vingadores"

    resultados = await fetch_external_events(query=termo_de_busca)

    assert isinstance(resultados, list)
    assert len(resultados) > 0

    titulos = [filme.get("title", "").lower() for filme in resultados]

    termo_lower = termo_de_busca.lower()
    buscou_correto = any(termo_lower in titulo for titulo in titulos)

    assert buscou_correto, f"A busca por{termo_de_busca} não retornou resultados correspondentes"
