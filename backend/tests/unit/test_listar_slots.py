"""
TESTES (TDD) — Use Case: Listar Slots Disponíveis.
"""
from datetime import date, datetime
from unittest.mock import MagicMock, AsyncMock

import pytest

from app.domain.entities import Agendamento, StatusAgendamento
from app.use_cases.interfaces import IAgendamentoRepository
from app.use_cases.agendamentos.listar_slots_disponiveis import ListarSlotsDisponiveis


def make_agendamento(hora: int, minuto: int, slot_size: int = 1, data: date = date(2099, 10, 20)) -> Agendamento:
    return Agendamento(
        id=1,
        servico_id=1,
        data_hora_inicio=datetime(data.year, data.month, data.day, hora, minuto),
        nome_cliente="Paulo",
        telefone_cliente="11999990000",
        status=StatusAgendamento.CONFIRMADO,
        slot_size=slot_size,
    )


class TestListarSlotsDisponiveis:
    DATA = date(2099, 10, 20)

    def _make_uc(self, agendamentos: list) -> ListarSlotsDisponiveis:
        repo = AsyncMock(spec=IAgendamentoRepository)
        repo.buscar_por_data.return_value = agendamentos
        return ListarSlotsDisponiveis(repo)

    @pytest.mark.asyncio
    async def test_dia_vazio_retorna_todos_os_slots(self):
        """Dia sem agendamentos deve retornar todos os slots de 09:00 a 17:30."""
        uc = self._make_uc([])
        slots = await uc.executar(data=self.DATA, slot_size_solicitado=1)
        times = [s.strftime("%H:%M") for s in slots]
        assert "09:00" in times
        assert "17:30" in times
        assert "18:00" not in times

    @pytest.mark.asyncio
    async def test_slot_ocupado_nao_aparece_servico_1_slot(self):
        """Spec: slot 10:00 ocupado por 1 slot → não deve aparecer."""
        uc = self._make_uc([make_agendamento(10, 0, slot_size=1)])
        slots = await uc.executar(data=self.DATA, slot_size_solicitado=1)
        times = [s.strftime("%H:%M") for s in slots]
        assert "10:00" not in times
        assert "09:00" in times
        assert "09:30" in times
        assert "10:30" in times

    @pytest.mark.asyncio
    async def test_servico_2_slots_exclui_slots_que_colidem(self):
        """
        Spec: agendamento em 10:30 com 1 slot.
        Solicitando serviço de 2 slots (60min):
        - 10:00 NÃO disponível (10:00+60m colide com 10:30)
        - 09:30 disponível (09:30+60m = 10:30, termina exatamente onde inicia)
        - 09:00 disponível
        """
        uc = self._make_uc([make_agendamento(10, 30, slot_size=1)])
        slots = await uc.executar(data=self.DATA, slot_size_solicitado=2)
        times = [s.strftime("%H:%M") for s in slots]
        assert "10:00" not in times
        assert "09:30" in times
        assert "09:00" in times

    @pytest.mark.asyncio
    async def test_agendamento_cancelado_nao_bloqueia_slot(self):
        """Agendamento CANCELADO não deve bloquear o slot."""
        cancelado = Agendamento(
            id=2, servico_id=1,
            data_hora_inicio=datetime(self.DATA.year, self.DATA.month, self.DATA.day, 10, 0),
            nome_cliente="X", telefone_cliente="11000000000",
            status=StatusAgendamento.CANCELADO, slot_size=1,
        )
        uc = self._make_uc([cancelado])
        slots = await uc.executar(data=self.DATA, slot_size_solicitado=1)
        times = [s.strftime("%H:%M") for s in slots]
        assert "10:00" in times
