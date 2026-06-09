"""
SQLAlchemy implementation of IAgendamentoRepository (Async).
"""
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities import Agendamento
from app.infrastructure.models import AgendamentoModel
from app.use_cases.interfaces import IAgendamentoRepository


def _to_entity(model: AgendamentoModel) -> Agendamento:
    slot_size = model.servico.slot_size if model.servico else 1
    return Agendamento(
        id=model.id,
        servico_id=model.servico_id,
        data_hora_inicio=model.data_hora_inicio,
        nome_cliente=model.nome_cliente,
        telefone_cliente=model.telefone_cliente,
        status=model.status,
        slot_size=slot_size,
        criado_em=model.criado_em,
    )


class SqlAlchemyAgendamentoRepository(IAgendamentoRepository):
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def buscar_por_data(self, data: date) -> list[Agendamento]:
        inicio_do_dia = datetime(data.year, data.month, data.day, 0, 0)
        fim_do_dia = inicio_do_dia + timedelta(days=1)
        
        stmt = (
            select(AgendamentoModel)
            .options(selectinload(AgendamentoModel.servico))
            .where(
                AgendamentoModel.data_hora_inicio >= inicio_do_dia,
                AgendamentoModel.data_hora_inicio < fim_do_dia,
            )
        )
        
        result = await self._db.execute(stmt)
        rows = result.scalars().all()
        return [_to_entity(r) for r in rows]

    async def criar(self, agendamento: Agendamento) -> Agendamento:
        model = AgendamentoModel(
            servico_id=agendamento.servico_id,
            data_hora_inicio=agendamento.data_hora_inicio,
            nome_cliente=agendamento.nome_cliente,
            telefone_cliente=agendamento.telefone_cliente,
            status=agendamento.status.value,  # Enum value
        )
        self._db.add(model)
        await self._db.flush()   # obtém ID sem commit ainda
        
        # Load relationship safely after flush to get correct slot_size
        stmt = select(AgendamentoModel).options(selectinload(AgendamentoModel.servico)).where(AgendamentoModel.id == model.id)
        res = await self._db.execute(stmt)
        model_with_rel = res.scalar_one()
        
        await self._db.commit()
        return _to_entity(model_with_rel)

    async def atualizar_status(self, id: int, status: str) -> Agendamento:
        stmt = select(AgendamentoModel).options(selectinload(AgendamentoModel.servico)).where(AgendamentoModel.id == id)
        result = await self._db.execute(stmt)
        model = result.scalar_one_or_none()
        
        if model is None:
            raise ValueError("Agendamento não encontrado")
            
        model.status = status
        await self._db.commit()
        await self._db.refresh(model)
        return _to_entity(model)

    async def buscar_por_id(self, id: int) -> Agendamento | None:
        stmt = select(AgendamentoModel).options(selectinload(AgendamentoModel.servico)).where(AgendamentoModel.id == id)
        result = await self._db.execute(stmt)
        model = result.scalar_one_or_none()
        return _to_entity(model) if model else None

    async def possui_agendamentos_futuros(self, servico_id: int) -> bool:
        stmt = select(AgendamentoModel).where(
            AgendamentoModel.servico_id == servico_id,
            AgendamentoModel.data_hora_inicio > datetime.now(timezone.utc),
            AgendamentoModel.status != "CANCELADO",
        ).limit(1)
        
        result = await self._db.execute(stmt)
        return result.first() is not None
