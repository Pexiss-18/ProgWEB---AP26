"""
Use Case: Seed do Admin Inicial.
Garante que existe pelo menos um admin no sistema, criando-o a partir de
ADMIN_EMAIL/ADMIN_PASSWORD caso ainda não exista nenhum com esse e-mail.
"""
from app.domain.entities import Admin
from app.infrastructure.security import hash_password
from app.use_cases.interfaces import IAdminRepository


class SeedAdminInicial:
    def __init__(self, repo: IAdminRepository) -> None:
        self._repo = repo

    async def executar(self, email: str, senha: str) -> None:
        existente = await self._repo.buscar_por_email(email)
        if existente is not None:
            return
        admin = Admin(email=email, senha_hash=hash_password(senha))
        await self._repo.criar(admin)
