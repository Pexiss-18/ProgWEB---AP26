"""
TESTES (TDD) — Use Case: Criar Agendamento.
"""
from datetime import datetime
from unittest.mock import MagicMock, AsyncMock

import pytest

from app.domain.entities import Agendamento, Servico, StatusAgendamento
from app.domain.exceptions import ServicoInativoError, SlotIndisponivelError
from app.use_cases.interfaces import IAgendamentoRepository, IServicoRepository, IWhatsAppGateway
from app.use_cases.agendamentos.criar_agendamento import CriarAgendamento


DATA_HORA = datetime(2099, 10, 20, 10, 0)


def make_servico(slot_size: int = 1, ativo: bool = True) -> Servico:
    return Servico(id=1, nome="Corte", preco=50.0, slot_size=slot_size, ativo=ativo)


def make_agendamento_salvo() -> Agendamento:
    return Agendamento(
        id=1, servico_id=1, data_hora_inicio=DATA_HORA,
        nome_cliente="Paulo", telefone_cliente="11999990000",
        status=StatusAgendamento.PENDENTE, slot_size=1,
    )


class TestCriarAgendamento:
    def _make_uc(self, servico: Servico | None = None) -> tuple:
        agendamento_repo = AsyncMock(spec=IAgendamentoRepository)
        servico_repo = AsyncMock(spec=IServicoRepository)
        whatsapp_gw = AsyncMock(spec=IWhatsAppGateway)
        servico_repo.buscar_por_id.return_value = servico or make_servico()
        return (
            CriarAgendamento(agendamento_repo, servico_repo, whatsapp_gw),
            agendamento_repo, servico_repo, whatsapp_gw,
        )

    @pytest.mark.asyncio
    async def test_cria_agendamento_com_slot_disponivel(self):
        """Slot disponível → cria com status PENDENTE e chama WhatsApp gateway."""
        uc, agendamento_repo, servico_repo, whatsapp_gw = self._make_uc()
        agendamento_repo.buscar_por_data.return_value = []  # sem conflitos
        agendamento_repo.criar.return_value = make_agendamento_salvo()

        result = await uc.executar(
            servico_id=1,
            data_hora_inicio=DATA_HORA,
            nome_cliente="Paulo",
            telefone_cliente="11999990000",
        )

        assert result.status == StatusAgendamento.PENDENTE
        agendamento_repo.criar.assert_called_once()
        whatsapp_gw.enviar_confirmacao.assert_called_once()

    @pytest.mark.asyncio
    async def test_levanta_slot_indisponivel_quando_horario_ocupado(self):
        """Slot ocupado → levanta SlotIndisponivelError sem salvar."""
        uc, agendamento_repo, servico_repo, whatsapp_gw = self._make_uc()
        # Mesmo horário já ocupado
        agendamento_existente = Agendamento(
            id=2, servico_id=1, data_hora_inicio=DATA_HORA,
            nome_cliente="Outro", telefone_cliente="11888880000",
            status=StatusAgendamento.CONFIRMADO, slot_size=1,
        )
        agendamento_repo.buscar_por_data.return_value = [agendamento_existente]

        with pytest.raises(SlotIndisponivelError):
            await uc.executar(
                servico_id=1,
                data_hora_inicio=DATA_HORA,
                nome_cliente="Paulo",
                telefone_cliente="11999990000",
            )
        agendamento_repo.criar.assert_not_called()

    @pytest.mark.asyncio
    async def test_levanta_servico_inativo_error(self):
        """Serviço inativo → levanta ServicoInativoError sem salvar."""
        uc, agendamento_repo, servico_repo, whatsapp_gw = self._make_uc(
            servico=make_servico(ativo=False)
        )
        with pytest.raises(ServicoInativoError):
            await uc.executar(
                servico_id=1,
                data_hora_inicio=DATA_HORA,
                nome_cliente="Paulo",
                telefone_cliente="11999990000",
            )
        agendamento_repo.criar.assert_not_called()

    @pytest.mark.asyncio
    async def test_falha_twilio_nao_desfaz_agendamento(self):
        """Falha no WhatsApp gateway → agendamento foi salvo, erro é ignorado."""
        uc, agendamento_repo, servico_repo, whatsapp_gw = self._make_uc()
        agendamento_repo.buscar_por_data.return_value = []
        agendamento_repo.criar.return_value = make_agendamento_salvo()
        whatsapp_gw.enviar_confirmacao.side_effect = Exception("Twilio timeout")

        result = await uc.executar(
            servico_id=1,
            data_hora_inicio=DATA_HORA,
            nome_cliente="Paulo",
            telefone_cliente="11999990000",
        )

        assert result.id == 1
        agendamento_repo.criar.assert_called_once()
