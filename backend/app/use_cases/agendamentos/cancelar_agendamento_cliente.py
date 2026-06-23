"""
Use Case: Cancelar Agendamento pelo Cliente.

Fluxo:
1. Localiza o agendamento pelo ID
2. Verifica que o telefone informado corresponde ao do agendamento (prova de identidade)
3. Delega o cancelamento para a entidade (que valida se já está cancelado ou no passado)
4. Persiste o novo status
"""
from app.domain.entities import Agendamento
from app.domain.exceptions import IdentidadeNaoConfirmadaError
from app.use_cases.interfaces import IAgendamentoRepository


class CancelarAgendamentoCliente:
    def __init__(self, repo: IAgendamentoRepository) -> None:
        self._repo = repo

    async def executar(self, id: int, telefone_cliente: str) -> Agendamento:
        agendamento = await self._repo.buscar_por_id(id)
        if agendamento is None:
            raise ValueError("Agendamento não encontrado")
        if agendamento.telefone_cliente != telefone_cliente:
            raise IdentidadeNaoConfirmadaError(
                "Telefone não confere com o agendamento."
            )
        agendamento.cancelar()
        return await self._repo.atualizar_status(id, agendamento.status.value)
