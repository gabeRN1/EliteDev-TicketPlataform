from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from security import get_current_user, gerar_qr_code
import schemas
import services
import models
import random
import hmac
import datetime

router = APIRouter(prefix="/eventos", tags=["Eventos"])

def check_cliente(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.cliente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas clientes podem reservar ingressos."
        )
    return current_user

def check_organizador(current_user: models.User = Depends(get_current_user)):
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
async def list_events(db: Session = Depends(get_db)):
    eventos = db.query(models.Event).all()

    if not eventos:
        resultados_externos = await services.fetch_external_events()
        
        if resultados_externos:
            novos_eventos = []
            
            organizador = db.query(models.User).filter(models.User.role == models.RoleEnum.organizador).first()
            org_id = organizador.id if organizador else 1

            for ext in resultados_externos:
                data_lancamento = ext.get("release_date")
                if data_lancamento:
                    try:
                        data_obj = datetime.datetime.strptime(data_lancamento, "%Y-%m-%d")
                    except ValueError:
                        data_obj = datetime.datetime.now()
                else:
                    data_obj = datetime.datetime.now()

                novo_evento = models.Event(
                    titulo=ext.get("title", "Sem título"),
                    descricao=ext.get("overview", "Sem descrição disponível."),
                    local="Cinema Virtual", 
                    data_evento=data_obj,
                    preco=random.uniform(20.0, 50.0),
                    capacidade_total=100,
                    ingressos_disponiveis=100,
                    imagem_url=f"https://image.tmdb.org/t/p/w500{ext.get('poster_path')}" if ext.get('poster_path') else None,
                    categoria="Filme",
                    external_id=str(ext.get("id")),
                    organizador_id=org_id 
                )
                db.add(novo_evento)
                novos_eventos.append(novo_evento)
            
            if novos_eventos:
                try:
                    db.commit()
                    for e in novos_eventos:
                        db.refresh(e)
                    eventos = novos_eventos
                except Exception as e:
                    db.rollback()
                    print(f"Erro ao salvar eventos externos no banco: {e}")

    return eventos

@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado."
        )
    return event

@router.get("/catalgo-externo")
async def listar_catalogo(query: str = None):
    resultados = await services.fetch_external_events(query)
    return {"data": resultados}

@router.post("/{event_id}/reservar", response_model=schemas.TicketResponse)
def reservar_ingresso(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_cliente)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).with_for_update().first()
    
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento não encontrado.")
        
    if event.ingressos_disponiveis <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ingressos esgotados.")
        
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

@router.post("/ingressos/{ticket_id}/checkout",response_model=schemas.TicketResponse)
def checkout_simulado(ticket_id: int, db: Session = Depends(get_db),current_user: models.User = Depends(check_cliente)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id, models.Ticket.cliente_id == current_user.id).with_for_update().first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    if ticket.status != models.TicketStatus.pendente:
        raise HTTPException(status_code=400, detail="Este ingresso não está disponivel")

    pagamento_aprovado = random.choices([True, False], weights=[0.8, 0.2])[0]

    if pagamento_aprovado:
        ticket.status = models.TicketStatus.aprovado
        ticket.qr_code =  gerar_qr_code(ticket.id, ticket.evento_id)
    else:
        ticket.status = models.TicketStatus.recusado
        evento = db.query(models.Event).filter(models.Event.id == ticket.evento_id).first()
        if evento:
            evento.ingressos_disponiveis += 1
    
    db.commit()
    db.refresh(ticket)
    return ticket

def check_portaria(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.portaria:
        raise HTTPException(status_code=403, detail="Acesso negado.")
    return current_user

@router.post("/portaria/validar")
def validar_ingresso(
    req: schemas.ValidarRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_portaria)    
):
    partes = req.qr_code.split("-")
    if len(partes) != 4 or partes[0] != "qr":
        raise HTTPException(status_code=400, detail="QR Code inválido")
    
    try:
        ticket_id = int(partes[1])
        evento_id_qr = int(partes[2])
    except ValueError:
        raise HTTPException(status_code=400, detail="QR code inválido")
    
    qr_esperado = gerar_qr_code(ticket_id, evento_id_qr)

    if not hmac.compare_digest(req.qr_code, qr_esperado):
        raise HTTPException(status_code=400, detail="QR Code forjado")
    
    if evento_id_qr != req.evento_id:
        raise HTTPException(status_code=400, detail="Evento errado.")
    
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).with_for_update().first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ingresso não encontrado")

    if ticket.status == models.TicketStatus.utilizado:
        raise HTTPException(status_code=400, detail="Ingresso já utilizado.")
    elif ticket.status != models.TicketStatus.aprovado:
        raise HTTPException(status_code=400, detail="Ingresso inválido.")

    ticket.status = models.TicketStatus.utilizado
    db.commit()
    db.refresh(ticket)

    return {
        "mensagem": "Entrada Liberada",
        "ticket_id": ticket.id,
        "status": ticket.status
    }

@router.get("/{event_id}/compartilhar")
def compartilhar_evento_cliente(
    event_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_cliente)
):
    evento = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
        
    link_publico = f"https://site.com/eventos/{evento.id}"
    texto_whatsapp = f"E aí! Eu vou no evento '{evento.titulo}' no dia {evento.data_evento}! Bora também? Compre o seu aqui: {link_publico}"

    return {"evento": evento.titulo, "link": link_publico, "mensagem_sugerida": texto_whatsapp}

@router.get("/meus-eventos", response_model=List[schemas.EventResponse])
def listar_meus_eventos(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_organizador)
):
    eventos = db.query(models.Event).filter(models.Event.organizador_id == current_user.id).all()
    return eventos

@router.get("/ingressos/meus-ingressos", response_model=List[schemas.TicketResponse])
def listar_meus_ingressos(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_cliente)
):
    ingressos = db.query(models.Ticket).filter(models.Ticket.cliente_id == current_user.id).all()
    return ingressos