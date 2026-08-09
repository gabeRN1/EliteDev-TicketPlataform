import httpx
from config import settings

async def fetch_external_events(query: str = None):
    """
    Busca Eventos/Filmes nas APIs Externas
    """

    async with httpx.AsyncClient() as client:
        if query:
            url = f"{settings.tmdb_base_url}/search/movie?api_key={settings.tmdb_key}&query={query}&language=pt-BR"
        else:
            url = f"{settings.tmdb_base_url}/movie/now_playing?api_key={settings.tmdb_key}&language=pt-BR"
        
        response = await client.get(url)

        if response.status_code == 200:
            return response.json().get("results",[])
        return []