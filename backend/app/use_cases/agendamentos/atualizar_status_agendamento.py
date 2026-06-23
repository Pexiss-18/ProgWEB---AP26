"""
Use Case: Atualizar Status de Agendamento (Admin).

Fluxo:
1. Carrega a entidade pelo ID
2. Aplica a transição via método do domínio (confirmar/cancelar)
   — impede transições inválidas como CANCELADO → CONFIRMADO
3. Persiste o novo status
"""
from app.domain.entities import Agendamento
from app.domain.exceptions import TransicaoStatusInvalidaError
from app.use_cases.interfaces import IAgendamentoRepository


class AtualizarStatusAgendamento:
    def __init__(self, repo: IAgendamentoRepository) -> None:
        self._repo = repo

    async def executar(self, id: int, novo_status: str) -> Agendamento:
        agendamento = await self._repo.buscar_por_id(id)
        if agendamento is None:
            raise ValueError("Agendamento não encontrado")

        if novo_status == "CONFIRMADO":
            agendamento.confirmar()
        elif novo_status == "CANCELADO":
            agendamento.cancelar()
        else:
            raise TransicaoStatusInvalidaError(
                f"Transição para '{novo_status}' não é permitida via esta operação."
            )

        return await self._repo.atualizar_status(id, agendamento.status.value)
