"""
Use Case: Autenticar Admin.
Valida credenciais e retorna um token JWT.
"""
from app.domain.entities import Admin
from app.domain.exceptions import DomainError
from app.infrastructure.security import create_access_token, verify_password
from app.use_cases.interfaces import IAdminRepository


class CredenciaisInvalidasError(DomainError):
    """Levantado quando e-mail ou senha são inválidos."""


class AutenticarAdmin:
    def __init__(self, repo: IAdminRepository) -> None:
        self._repo = repo

    async def executar(self, email: str, senha: str) -> str:
        admin = await self._repo.buscar_por_email(email)
        # Admin.verificar_senha encapsula a comparação — sem acessar senha_hash diretamente
        if admin is None or not admin.verificar_senha(verify_password, senha):
            raise CredenciaisInvalidasError("E-mail ou senha incorretos.")
        token = create_access_token(data={"sub": admin.email, "id": admin.id})
        return token
