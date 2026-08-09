from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import services

router = APIRouter( prefix="/eventos", tags=["Eventos"])

@router.get("/catalgo-externo")

async def listar_catalogo(query: str = None):
    """
    Rota do organizador buscar os eventos
    """

    resultados = await services.fetch_external_events(query)
    return {"data": resultados}

@router.get("/")
def listar_eventos_internos(db:Session = Depends(get_db)):
    """
    Rota de busca de eventos do db
    """

    return