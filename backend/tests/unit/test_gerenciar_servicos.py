"""
TESTES (TDD) — Use Cases de Serviços.
"""
from unittest.mock import MagicMock, AsyncMock
import pytest

from app.domain.entities import Agendamento, Servico, StatusAgendamento
from app.domain.exceptions import ServicoComAgendamentosFuturosError, ValorInvalidoError
from app.use_cases.interfaces import IAgendamentoRepository, IServicoRepository
from app.use_cases.servicos.listar_servicos import ListarServicos
from app.use_cases.servicos.criar_servico import CriarServico
from app.use_cases.servicos.editar_servico import EditarServico
from app.use_cases.servicos.remover_servico import RemoverServico


# --------------------------------------------------------------------------- #
# Helpers / Factories
# --------------------------------------------------------------------------- #

def make_servico(**kwargs) -> Servico:
    defaults = dict(id=1, nome="Corte", preco=50.0, slot_size=1, ativo=True)
    return Servico(**{**defaults, **kwargs})


# --------------------------------------------------------------------------- #
# ListarServicos
# --------------------------------------------------------------------------- #

class TestListarServicos:
    @pytest.mark.asyncio
    async def test_retorna_apenas_servicos_ativos(self):
        repo = AsyncMock(spec=IServicoRepository)
        repo.listar_ativos.return_value = [
            make_servico(id=1, ativo=True),
            make_servico(id=2, ativo=True),
        ]
        uc = ListarServicos(repo)
        result = await uc.executar()
        assert len(result) == 2
        assert all(s.ativo for s in result)

    @pytest.mark.asyncio
    async def test_retorna_lista_vazia_quando_sem_servicos(self):
        repo = AsyncMock(spec=IServicoRepository)
        repo.listar_ativos.return_value = []
        uc = ListarServicos(repo)
        result = await uc.executar()
        assert result == []


# --------------------------------------------------------------------------- #
# CriarServico
# --------------------------------------------------------------------------- #

class TestCriarServico:
    @pytest.mark.asyncio
    async def test_cria_servico_com_dados_validos(self):
        repo = AsyncMock(spec=IServicoRepository)
        repo.criar.return_value = Servico(id=1, nome="Barba", preco=40.0, slot_size=1, ativo=True)
        uc = CriarServico(repo)
        result = await uc.executar(nome="Barba", preco=40.0, slot_size=1)
        repo.criar.assert_called_once()
        assert result.id == 1
        assert result.nome == "Barba"

    @pytest.mark.asyncio
    async def test_novo_servico_nasce_ativo(self):
        repo = AsyncMock(spec=IServicoRepository)
        repo.criar.return_value = make_servico(ativo=True)
        uc = CriarServico(repo)
        await uc.executar(nome="Combo", preco=70.0, slot_size=2)
        criado: Servico = repo.criar.call_args[0][0]
        assert criado.ativo is True

    @pytest.mark.asyncio
    async def test_preco_invalido_levanta_valor_invalido_error(self):
        repo = AsyncMock(spec=IServicoRepository)
        uc = CriarServico(repo)
        with pytest.raises(ValorInvalidoError):
            await uc.executar(nome="X", preco=0.0, slot_size=1)
        repo.criar.assert_not_called()

    @pytest.mark.asyncio
    async def test_slot_size_invalido_levanta_valor_invalido_error(self):
        repo = AsyncMock(spec=IServicoRepository)
        uc = CriarServico(repo)
        with pytest.raises(ValorInvalidoError):
            await uc.executar(nome="X", preco=50.0, slot_size=3)
        repo.criar.assert_not_called()


# --------------------------------------------------------------------------- #
# EditarServico
# --------------------------------------------------------------------------- #

class TestEditarServico:
    @pytest.mark.asyncio
    async def test_atualiza_preco_e_preserva_id(self):
        repo = AsyncMock(spec=IServicoRepository)
        existente = make_servico(id=1, nome="Barba", preco=40.0)
        repo.buscar_por_id.return_value = existente
        atualizado = make_servico(id=1, nome="Barba", preco=45.0)
        repo.atualizar.return_value = atualizado
        uc = EditarServico(repo)
        result = await uc.executar(id=1, preco=45.0)
        assert result.id == 1
        assert result.preco == 45.0

    @pytest.mark.asyncio
    async def test_levanta_erro_se_servico_nao_encontrado(self):
        repo = AsyncMock(spec=IServicoRepository)
        repo.buscar_por_id.return_value = None
        uc = EditarServico(repo)
        with pytest.raises(ValueError, match="Serviço não encontrado"):
            await uc.executar(id=99, nome="X")

    @pytest.mark.asyncio
    async def test_preco_invalido_levanta_valor_invalido_error(self):
        repo = AsyncMock(spec=IServicoRepository)
        repo.buscar_por_id.return_value = make_servico(id=1)
        uc = EditarServico(repo)
        with pytest.raises(ValorInvalidoError):
            await uc.executar(id=1, preco=-5.0)
        repo.atualizar.assert_not_called()


# --------------------------------------------------------------------------- #
# RemoverServico
# --------------------------------------------------------------------------- #

class TestRemoverServico:
    @pytest.mark.asyncio
    async def test_desativa_servico_sem_agendamentos_futuros(self):
        servico_repo = AsyncMock(spec=IServicoRepository)
        agendamento_repo = AsyncMock(spec=IAgendamentoRepository)
        servico_repo.buscar_por_id.return_value = make_servico(id=1)
        agendamento_repo.possui_agendamentos_futuros.return_value = False
        servico_repo.atualizar.return_value = make_servico(id=1, ativo=False)
        uc = RemoverServico(servico_repo, agendamento_repo)
        result = await uc.executar(id=1)
        servico_repo.atualizar.assert_called_once()
        assert result.ativo is False

    @pytest.mark.asyncio
    async def test_levanta_erro_se_possui_agendamentos_futuros(self):
        servico_repo = AsyncMock(spec=IServicoRepository)
        agendamento_repo = AsyncMock(spec=IAgendamentoRepository)
        servico_repo.buscar_por_id.return_value = make_servico(id=1)
        agendamento_repo.possui_agendamentos_futuros.return_value = True
        uc = RemoverServico(servico_repo, agendamento_repo)
        with pytest.raises(ServicoComAgendamentosFuturosError):
            await uc.executar(id=1)
        servico_repo.atualizar.assert_not_called()
