"""
SQLAlchemy implementation of IServicoRepository (Async).
"""
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities import Servico
from app.infrastructure.models import AgendamentoModel, ServicoModel
from app.use_cases.interfaces import IServicoRepository


def _to_entity(model: ServicoModel) -> Servico:
    return Servico(
        id=model.id,
        nome=model.nome,
        preco=model.preco,
        slot_size=model.slot_size,
        ativo=model.ativo,
    )


class SqlAlchemyServicoRepository(IServicoRepository):
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def listar_ativos(self) -> list[Servico]:
        stmt = select(ServicoModel).where(ServicoModel.ativo == True)
        result = await self._db.execute(stmt)
        rows = result.scalars().all()
        return [_to_entity(r) for r in rows]

    async def buscar_por_id(self, id: int) -> Servico | None:
        stmt = select(ServicoModel).where(ServicoModel.id == id)
        result = await self._db.execute(stmt)
        row = result.scalar_one_or_none()
        return _to_entity(row) if row else None

    async def criar(self, servico: Servico) -> Servico:
        model = ServicoModel(
            nome=servico.nome,
            preco=servico.preco,
            slot_size=servico.slot_size,
            ativo=servico.ativo,
        )
        self._db.add(model)
        await self._db.commit()
        await self._db.refresh(model)
        return _to_entity(model)

    async def atualizar(self, servico: Servico) -> Servico:
        stmt = select(ServicoModel).where(ServicoModel.id == servico.id)
        result = await self._db.execute(stmt)
        model = result.scalar_one_or_none()
        
        if model is None:
            raise ValueError("Serviço não encontrado")
            
        model.nome = servico.nome
        model.preco = servico.preco
        model.slot_size = servico.slot_size
        model.ativo = servico.ativo
        
        await self._db.commit()
        await self._db.refresh(model)
        return _to_entity(model)

    async def desativar(self, id: int) -> Servico:
        stmt = select(ServicoModel).where(ServicoModel.id == id)
        result = await self._db.execute(stmt)
        model = result.scalar_one_or_none()
        
        if model is None:
            raise ValueError("Serviço não encontrado")
            
        model.ativo = False
        await self._db.commit()
        await self._db.refresh(model)
        return _to_entity(model)

    async def possui_agendamentos_futuros(self, servico_id: int) -> bool:
        # Note: func.count is better but this works for now as we just need boolean check
        stmt = select(AgendamentoModel).where(
            AgendamentoModel.servico_id == servico_id,
            AgendamentoModel.data_hora_inicio > datetime.now(timezone.utc),
            AgendamentoModel.status != "CANCELADO",
        ).limit(1)
        
        result = await self._db.execute(stmt)
        return result.first() is not None
