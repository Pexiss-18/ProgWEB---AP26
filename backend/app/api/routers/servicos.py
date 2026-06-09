from fastapi import APIRouter, Depends, HTTPException, status

from app.adapters.repositories.agendamento_repo import SqlAlchemyAgendamentoRepository
from app.adapters.repositories.servico_repo import SqlAlchemyServicoRepository
from app.api.dependencies import (
    get_agendamento_repo,
    get_current_admin,
    get_servico_repo,
)
from app.api.schemas.servico import ServicoCreate, ServicoResponse, ServicoUpdate
from app.use_cases.servicos.criar_servico import CriarServico
from app.use_cases.servicos.editar_servico import EditarServico
from app.use_cases.servicos.listar_servicos import ListarServicos
from app.use_cases.servicos.remover_servico import RemoverServico, ServicoComAgendamentosFuturosError

router = APIRouter(tags=["serviços"])


@router.get("/api/servicos", response_model=list[ServicoResponse])
async def listar_servicos(repo: SqlAlchemyServicoRepository = Depends(get_servico_repo)):
    """Lista todos os serviços ativos (público)."""
    return await ListarServicos(repo).executar()


@router.post("/api/admin/servicos", response_model=ServicoResponse, status_code=201, dependencies=[Depends(get_current_admin)])
async def criar_servico(body: ServicoCreate, repo: SqlAlchemyServicoRepository = Depends(get_servico_repo)):
    """Cria um novo serviço (admin)."""
    return await CriarServico(repo).executar(nome=body.nome, preco=body.preco, slot_size=body.slot_size)


@router.put("/api/admin/servicos/{id}", response_model=ServicoResponse, dependencies=[Depends(get_current_admin)])
async def editar_servico(id: int, body: ServicoUpdate, repo: SqlAlchemyServicoRepository = Depends(get_servico_repo)):
    """Edita campos de um serviço existente (admin)."""
    try:
        return await EditarServico(repo).executar(id=id, **body.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/api/admin/servicos/{id}", status_code=204, dependencies=[Depends(get_current_admin)])
async def remover_servico(
    id: int,
    servico_repo: SqlAlchemyServicoRepository = Depends(get_servico_repo),
    agendamento_repo: SqlAlchemyAgendamentoRepository = Depends(get_agendamento_repo),
):
    """
    Remove (desativa) um serviço. Se possuir agendamentos futuros,
    retorna 409 com aviso de confirmação.
    """
    try:
        await RemoverServico(servico_repo, agendamento_repo).executar(id=id)
    except ServicoComAgendamentosFuturosError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
