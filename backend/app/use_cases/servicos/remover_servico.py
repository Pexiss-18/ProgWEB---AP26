from app.domain.entities import Servico
from app.domain.exceptions import ServicoComAgendamentosFuturosError
from app.use_cases.interfaces import IAgendamentoRepository, IServicoRepository


class RemoverServico:
    def __init__(
        self,
        servico_repo: IServicoRepository,
        agendamento_repo: IAgendamentoRepository,
    ) -> None:
        self._servico_repo = servico_repo
        self._agendamento_repo = agendamento_repo

    async def executar(self, id: int) -> Servico:
        servico = await self._servico_repo.buscar_por_id(id)
        if servico is None:
            raise ValueError("Serviço não encontrado")

        if await self._agendamento_repo.possui_agendamentos_futuros(id):
            raise ServicoComAgendamentosFuturosError(
                "Este serviço possui agendamentos futuros. Confirma a remoção?"
            )

        # A entidade controla a desativação
        servico.desativar()
        return await self._servico_repo.atualizar(servico)
