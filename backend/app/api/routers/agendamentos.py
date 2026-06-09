from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.adapters.gateways.twilio_gateway import TwilioWhatsAppGateway
from app.adapters.repositories.agendamento_repo import SqlAlchemyAgendamentoRepository
from app.adapters.repositories.servico_repo import SqlAlchemyServicoRepository
from app.api.dependencies import (
    get_agendamento_repo,
    get_current_admin,
    get_servico_repo,
    get_whatsapp_gateway,
)
from app.api.schemas.agendamento import (
    AgendamentoAdminCreate,
    AgendamentoCreate,
    AgendamentoResponse,
    SlotDisponivel,
    SlotsDisponiveis,
    StatusUpdate,
)
from app.use_cases.agendamentos.criar_agendamento import CriarAgendamento, SlotIndisponivelError
from app.use_cases.agendamentos.listar_slots_disponiveis import ListarSlotsDisponiveis

router = APIRouter(tags=["agendamentos"])


@router.get("/api/agendamentos/disponiveis", response_model=SlotsDisponiveis)
async def listar_slots_disponiveis(
    data: date = Query(..., description="Data no formato YYYY-MM-DD"),
    servico_id: int = Query(...),
    agendamento_repo: SqlAlchemyAgendamentoRepository = Depends(get_agendamento_repo),
    servico_repo: SqlAlchemyServicoRepository = Depends(get_servico_repo),
):
    """Retorna os slots disponíveis para um serviço em uma data (público)."""
    servico = await servico_repo.buscar_por_id(servico_id)
    if servico is None:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    slots = await ListarSlotsDisponiveis(agendamento_repo).executar(
        data=data, slot_size_solicitado=servico.slot_size
    )
    return SlotsDisponiveis(slots=slots)


@router.post("/api/agendamentos", response_model=AgendamentoResponse, status_code=201)
async def criar_agendamento(
    body: AgendamentoCreate,
    agendamento_repo: SqlAlchemyAgendamentoRepository = Depends(get_agendamento_repo),
    servico_repo: SqlAlchemyServicoRepository = Depends(get_servico_repo),
    whatsapp_gw: TwilioWhatsAppGateway = Depends(get_whatsapp_gateway),
):
    """Cria um agendamento (público, modo visitante). Envia WhatsApp via Twilio."""
    uc = CriarAgendamento(agendamento_repo, servico_repo, whatsapp_gw)
    try:
        agendamento = await uc.executar(
            servico_id=body.servico_id,
            data_hora_inicio=body.data_hora_inicio,
            nome_cliente=body.nome_cliente,
            telefone_cliente=body.telefone_cliente,
        )
    except SlotIndisponivelError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return agendamento


@router.get("/api/admin/agendamentos", response_model=list[AgendamentoResponse], dependencies=[Depends(get_current_admin)])
async def listar_agendamentos_admin(
    data: date = Query(default_factory=date.today, description="Data YYYY-MM-DD"),
    agendamento_repo: SqlAlchemyAgendamentoRepository = Depends(get_agendamento_repo),
):
    """Lista todos os agendamentos de um dia (admin — usado pelo dashboard)."""
    return await agendamento_repo.buscar_por_data(data)


@router.patch("/api/admin/agendamentos/{id}/status", response_model=AgendamentoResponse, dependencies=[Depends(get_current_admin)])
async def atualizar_status(
    id: int,
    body: StatusUpdate,
    agendamento_repo: SqlAlchemyAgendamentoRepository = Depends(get_agendamento_repo),
):
    """Atualiza o status de um agendamento (admin)."""
    try:
        return await agendamento_repo.atualizar_status(id=id, status=body.status)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/api/admin/agendamentos", response_model=AgendamentoResponse, status_code=201, dependencies=[Depends(get_current_admin)])
async def criar_agendamento_admin(
    body: AgendamentoAdminCreate,
    agendamento_repo: SqlAlchemyAgendamentoRepository = Depends(get_agendamento_repo),
    servico_repo: SqlAlchemyServicoRepository = Depends(get_servico_repo),
    whatsapp_gw: TwilioWhatsAppGateway = Depends(get_whatsapp_gateway),
):
    """
    Cria agendamento de walk-in direto pelo admin.
    O status começa como CONFIRMADO (não aciona WhatsApp).
    """
    uc = CriarAgendamento(agendamento_repo, servico_repo, whatsapp_gw)
    try:
        agendamento = await uc.executar(
            servico_id=body.servico_id,
            data_hora_inicio=body.data_hora_inicio,
            nome_cliente=body.nome_cliente,
            telefone_cliente=body.telefone_cliente,
        )
    except SlotIndisponivelError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    # Atualiza para CONFIRMADO pois é walk-in do admin
    return await agendamento_repo.atualizar_status(id=agendamento.id, status="CONFIRMADO")
