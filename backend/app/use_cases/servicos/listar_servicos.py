from app.domain.entities import Servico
from app.use_cases.interfaces import IServicoRepository


class ListarServicos:
    def __init__(self, repo: IServicoRepository) -> None:
        self._repo = repo

    async def executar(self) -> list[Servico]:
        return await self._repo.listar_ativos()
