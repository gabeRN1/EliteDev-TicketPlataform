from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from security import get_current_user
import schemas
import services
import models

router = APIRouter(prefix="/eventos", tags=["Eventos"])
def check_cliente(current_user: models.User = Depends(get_current_user)):
    """Verifica se o usuário é cliente"""
    if current_user.role != models.RoleEnum.cliente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas clientes podem reservar ingressos."
        )
    return current_user
def check_organizador(current_user: models.User = Depends(get_current_user)):
    """Verifica usuário é organizador"""
    
    if current_user.role != models.RoleEnum.organizador:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas organizadores podem criar eventos."
        )
    
    return current_user

@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_organizador)
):
    new_event = models.Event(
        titulo=event_in.titulo,
        descricao=event_in.descricao,
        local=event_in.local,
        data_evento=event_in.data_evento,
        preco=event_in.preco,
        capacidade_total=event_in.capacidade_total,
        ingressos_disponiveis=event_in.ingressos_disponiveis, 
        imagem_url=event_in.imagem_url,                       
        categoria=event_in.categoria,                         
        external_id=event_in.external_id,                     
        organizador_id=current_user.id
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/", response_model=List[schemas.EventResponse])
def list_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()

@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Busca detalhes de um evento específico"""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado."
        )
    return event

@router.get("/catalgo-externo")
async def listar_catalogo(query: str = None):
    """
    Rota do organizador buscar os eventos
    """

    resultados = await services.fetch_external_events(query)
    return {"data": resultados}

@router.post("/{event_id}/reservar", response_model=schemas.TicketResponse)
def reservar_ingresso(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_cliente)
):
    """
    Reserva um ingresso com trava de concorrência para evitar dupla venda.
    """
    event = db.query(models.Event).filter(models.Event.id == event_id).with_for_update().first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado."
        )
        
    if event.ingressos_disponiveis <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ingressos esgotados."
        )
        
    event.ingressos_disponiveis -= 1
    
    novo_ticket = models.Ticket(
        evento_id=event.id,
        cliente_id=current_user.id,
        status=models.TicketStatus.pendente
    )
    
    db.add(novo_ticket)
    db.commit() 
    db.refresh(novo_ticket)
    
    return novo_ticket