"""
Use Case: Listar Slots Disponíveis para uma data e tamanho de serviço.

Delegamos toda a lógica de grade de horários para o Value Object SlotGrid,
que vive no domínio e encapsula as regras de negócio do barbeiro.
"""
from datetime import date, datetime

from app.domain.value_objects import SlotGrid
from app.use_cases.interfaces import IAgendamentoRepository

_grid = SlotGrid()


class ListarSlotsDisponiveis:
    def __init__(self, repo: IAgendamentoRepository) -> None:
        self._repo = repo

    async def executar(self, data: date, slot_size_solicitado: int) -> list[datetime]:
        agendamentos = await self._repo.buscar_por_data(data)
        return _grid.filtrar_disponiveis(
            data=data,
            duracao_slots=slot_size_solicitado,
            agendamentos=agendamentos,
        )
