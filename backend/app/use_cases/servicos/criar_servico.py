from app.domain.entities import Servico
from app.use_cases.interfaces import IServicoRepository


class CriarServico:
    def __init__(self, repo: IServicoRepository) -> None:
        self._repo = repo

    async def executar(self, nome: str, preco: float, slot_size: int) -> Servico:
        # Servico.__post_init__ valida preco e slot_size — levanta ValorInvalidoError se inválido
        novo = Servico(nome=nome, preco=preco, slot_size=slot_size, ativo=True)
        return await self._repo.criar(novo)
