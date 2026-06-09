"""
Testes unitários direto nas Entidades de Domínio.
Estes testes provam que o domínio é RICO — as entidades protegem suas próprias regras.
"""
from datetime import date, datetime, timezone

import pytest

from app.domain.entities import Admin, Agendamento, Servico, StatusAgendamento
from app.domain.exceptions import (
    AgendamentoPassadoError,
    TransicaoStatusInvalidaError,
    ValorInvalidoError,
)
from app.domain.value_objects import SlotGrid


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_agendamento(
    hora: int = 10,
    minuto: int = 0,
    slot_size: int = 1,
    status: StatusAgendamento = StatusAgendamento.PENDENTE,
    data: date = date(2099, 12, 20),  # futuro garantido
) -> Agendamento:
    return Agendamento(
        id=1,
        servico_id=1,
        data_hora_inicio=datetime(data.year, data.month, data.day, hora, minuto),
        nome_cliente="Paulo",
        telefone_cliente="11999990000",
        status=status,
        slot_size=slot_size,
    )


def make_servico(**kwargs) -> Servico:
    defaults = dict(id=1, nome="Corte", preco=50.0, slot_size=1, ativo=True)
    return Servico(**{**defaults, **kwargs})


# ---------------------------------------------------------------------------
# Servico — validação na criação
# ---------------------------------------------------------------------------

class TestServicoCriacao:
    def test_preco_negativo_levanta_erro(self):
        with pytest.raises(ValorInvalidoError, match="Preço"):
            Servico(nome="X", preco=-10.0, slot_size=1)

    def test_preco_zero_levanta_erro(self):
        with pytest.raises(ValorInvalidoError, match="Preço"):
            Servico(nome="X", preco=0.0, slot_size=1)

    def test_slot_size_invalido_levanta_erro(self):
        with pytest.raises(ValorInvalidoError, match="slot_size"):
            Servico(nome="X", preco=50.0, slot_size=3)

    def test_servico_valido_nasce_ativo(self):
        s = Servico(nome="Corte", preco=50.0, slot_size=1)
        assert s.ativo is True

    def test_duracao_minutos_1_slot(self):
        s = make_servico(slot_size=1)
        assert s.duracao_minutos == 30

    def test_duracao_minutos_2_slots(self):
        s = make_servico(slot_size=2)
        assert s.duracao_minutos == 60


class TestServicoComportamento:
    def test_esta_disponivel_quando_ativo(self):
        s = make_servico(ativo=True)
        assert s.esta_disponivel() is True

    def test_nao_esta_disponivel_quando_inativo(self):
        s = make_servico(ativo=False)
        assert s.esta_disponivel() is False

    def test_desativar_muda_ativo_para_false(self):
        s = make_servico(ativo=True)
        s.desativar()
        assert s.ativo is False

    def test_atualizar_preco_valido(self):
        s = make_servico(preco=50.0)
        s.atualizar(preco=75.0)
        assert s.preco == 75.0

    def test_atualizar_preco_invalido_levanta_erro(self):
        s = make_servico(preco=50.0)
        with pytest.raises(ValorInvalidoError):
            s.atualizar(preco=0)

    def test_atualizar_slot_size_invalido_levanta_erro(self):
        s = make_servico(slot_size=1)
        with pytest.raises(ValorInvalidoError):
            s.atualizar(slot_size=5)

    def test_atualizar_nome_apenas(self):
        s = make_servico(nome="Corte", preco=50.0)
        s.atualizar(nome="Barba")
        assert s.nome == "Barba"
        assert s.preco == 50.0  # imutável


# ---------------------------------------------------------------------------
# Agendamento — propriedades calculadas
# ---------------------------------------------------------------------------

class TestAgendamentoPropriedades:
    def test_duracao_minutos_1_slot(self):
        a = make_agendamento(slot_size=1)
        assert a.duracao_minutos == 30

    def test_duracao_minutos_2_slots(self):
        a = make_agendamento(slot_size=2)
        assert a.duracao_minutos == 60

    def test_hora_fim_calculada_corretamente(self):
        a = make_agendamento(hora=10, minuto=0, slot_size=1)
        assert a.hora_fim == datetime(2099, 12, 20, 10, 30)

    def test_hora_fim_2_slots(self):
        a = make_agendamento(hora=10, minuto=0, slot_size=2)
        assert a.hora_fim == datetime(2099, 12, 20, 11, 0)


# ---------------------------------------------------------------------------
# Agendamento — transições de status
# ---------------------------------------------------------------------------

class TestAgendamentoTransicoes:
    def test_confirmar_pendente_muda_para_confirmado(self):
        a = make_agendamento()
        a.confirmar()
        assert a.status == StatusAgendamento.CONFIRMADO

    def test_confirmar_cancelado_levanta_erro(self):
        a = make_agendamento(status=StatusAgendamento.CANCELADO)
        with pytest.raises(TransicaoStatusInvalidaError):
            a.confirmar()

    def test_confirmar_ja_confirmado_levanta_erro(self):
        a = make_agendamento(status=StatusAgendamento.CONFIRMADO)
        with pytest.raises(TransicaoStatusInvalidaError):
            a.confirmar()

    def test_cancelar_pendente_muda_para_cancelado(self):
        a = make_agendamento()
        a.cancelar()
        assert a.status == StatusAgendamento.CANCELADO

    def test_cancelar_confirmado_muda_para_cancelado(self):
        a = make_agendamento(status=StatusAgendamento.CONFIRMADO)
        a.cancelar()
        assert a.status == StatusAgendamento.CANCELADO

    def test_cancelar_ja_cancelado_levanta_erro(self):
        a = make_agendamento(status=StatusAgendamento.CANCELADO)
        with pytest.raises(TransicaoStatusInvalidaError):
            a.cancelar()

    def test_cancelar_agendamento_passado_levanta_erro(self):
        a = Agendamento(
            servico_id=1,
            data_hora_inicio=datetime(2000, 1, 1, 10, 0),  # passado garantido
            nome_cliente="Paulo",
            telefone_cliente="11999990000",
        )
        with pytest.raises(AgendamentoPassadoError):
            a.cancelar()

    def test_esta_cancelado_helper(self):
        a = make_agendamento(status=StatusAgendamento.CANCELADO)
        assert a.esta_cancelado() is True

    def test_esta_confirmado_helper(self):
        a = make_agendamento(status=StatusAgendamento.CONFIRMADO)
        assert a.esta_confirmado() is True


# ---------------------------------------------------------------------------
# Agendamento — colisão
# ---------------------------------------------------------------------------

class TestAgendamentoColisao:
    DATA = date(2099, 12, 20)

    def _make(self, hora: int, slot_size: int = 1) -> Agendamento:
        return make_agendamento(hora=hora, slot_size=slot_size, data=self.DATA)

    def test_mesmo_horario_colide(self):
        a = self._make(10)
        b = self._make(10)
        assert a.colide_com(b) is True

    def test_horarios_consecutivos_nao_colidem(self):
        a = self._make(10, slot_size=1)  # 10:00–10:30
        b = self._make(11, slot_size=1)  # 11:00–11:30  (sem sobreposição)
        assert a.colide_com(b) is False

    def test_horarios_adjacentes_nao_colidem(self):
        a = self._make(10, slot_size=1)  # 10:00–10:30
        b = make_agendamento(hora=10, minuto=30, slot_size=1, data=self.DATA)  # 10:30–11:00
        assert a.colide_com(b) is False

    def test_sobreposicao_parcial_colide(self):
        a = self._make(10, slot_size=2)  # 10:00–11:00
        b = make_agendamento(hora=10, minuto=30, slot_size=1, data=self.DATA)  # 10:30–11:00
        assert a.colide_com(b) is True

    def test_cancelado_nao_colide(self):
        a = self._make(10)
        b = make_agendamento(hora=10, status=StatusAgendamento.CANCELADO, data=self.DATA)
        assert a.colide_com(b) is False


# ---------------------------------------------------------------------------
# Admin — verificação de senha
# ---------------------------------------------------------------------------

class TestAdmin:
    def test_verificar_senha_correta(self):
        admin = Admin(email="admin@test.com", senha_hash="hashed")
        verify_fn = lambda plain, hashed: plain == "secret" and hashed == "hashed"
        assert admin.verificar_senha(verify_fn, "secret") is True

    def test_verificar_senha_errada(self):
        admin = Admin(email="admin@test.com", senha_hash="hashed")
        verify_fn = lambda plain, hashed: False
        assert admin.verificar_senha(verify_fn, "wrong") is False


# ---------------------------------------------------------------------------
# SlotGrid — geração e filtragem de slots
# ---------------------------------------------------------------------------

class TestSlotGrid:
    DATA = date(2099, 12, 20)
    grid = SlotGrid()

    def test_gera_slots_de_09_a_17h30(self):
        slots = self.grid.gerar_todos(self.DATA)
        times = [s.strftime("%H:%M") for s in slots]
        assert "09:00" in times
        assert "17:30" in times
        assert "18:00" not in times

    def test_dia_vazio_todos_slots_disponiveis(self):
        slots = self.grid.filtrar_disponiveis(self.DATA, duracao_slots=1, agendamentos=[])
        assert len(slots) == 18  # 09:00 a 17:30 = 18 slots de 30min

    def test_slot_ocupado_nao_aparece(self):
        ocupado = make_agendamento(hora=10, slot_size=1, data=self.DATA)
        slots = self.grid.filtrar_disponiveis(self.DATA, duracao_slots=1, agendamentos=[ocupado])
        times = [s.strftime("%H:%M") for s in slots]
        assert "10:00" not in times
        assert "09:00" in times
        assert "10:30" in times

    def test_servico_2_slots_bloqueia_vizinhos(self):
        ocupado = make_agendamento(hora=10, minuto=30, slot_size=1, data=self.DATA)
        slots = self.grid.filtrar_disponiveis(self.DATA, duracao_slots=2, agendamentos=[ocupado])
        times = [s.strftime("%H:%M") for s in slots]
        assert "10:00" not in times   # 10:00–11:00 colide com 10:30
        assert "09:30" in times       # 09:30–10:30 termina quando 10:30 inicia — sem colisão
        assert "09:00" in times

    def test_cancelado_nao_bloqueia_slot(self):
        cancelado = make_agendamento(
            hora=10, slot_size=1, status=StatusAgendamento.CANCELADO, data=self.DATA
        )
        slots = self.grid.filtrar_disponiveis(self.DATA, duracao_slots=1, agendamentos=[cancelado])
        times = [s.strftime("%H:%M") for s in slots]
        assert "10:00" in times  # cancelado não bloqueia
