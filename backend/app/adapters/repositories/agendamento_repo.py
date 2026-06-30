"""
SQLAlchemy implementation of IAgendamentoRepository (Async).
"""
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities import Agendamento, StatusAgendamento
from app.domain.exceptions import SlotIndisponivelError
from app.infrastructure.models import AgendamentoModel
from app.use_cases.interfaces import IAgendamentoRepository


def _to_entity(model: AgendamentoModel) -> Agendamento:
    return Agendamento(
        id=model.id,
        servico_id=model.servico_id,
        data_hora_inicio=model.data_hora_inicio,
        nome_cliente=model.nome_cliente,
        telefone_cliente=model.telefone_cliente,
        status=StatusAgendamento(model.status),
        slot_size=model.slot_size,
        criado_em=model.criado_em,
    )


class SqlAlchemyAgendamentoRepository(IAgendamentoRepository):
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def buscar_por_data(self, data: date) -> list[Agendamento]:
        inicio_do_dia = datetime(data.year, data.month, data.day, 0, 0, tzinfo=timezone.utc)
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
            status=agendamento.status.value,
            slot_size=agendamento.slot_size,
        )
        try:
            self._db.add(model)
            await self._db.flush()
        except IntegrityError:
            await self._db.rollback()
            raise SlotIndisponivelError("Este horário acabou de ser reservado. Escolha outro.")

        await self._db.commit()
        await self._db.refresh(model)
        return _to_entity(model)

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
