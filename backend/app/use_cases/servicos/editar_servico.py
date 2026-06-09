from app.domain.entities import Servico
from app.use_cases.interfaces import IServicoRepository


class EditarServico:
    def __init__(self, repo: IServicoRepository) -> None:
        self._repo = repo

    async def executar(self, id: int, **kwargs) -> Servico:
        servico = await self._repo.buscar_por_id(id)
        if servico is None:
            raise ValueError("Serviço não encontrado")

        # Delega a mutação para a entidade — que valida internamente
        # ValorInvalidoError é levantado se preco <= 0 ou slot_size inválido
        servico.atualizar(
            nome=kwargs.get("nome"),
            preco=kwargs.get("preco"),
            slot_size=kwargs.get("slot_size"),
        )
        return await self._repo.atualizar(servico)
