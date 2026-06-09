"""
TESTES (TDD) — Use Case: Autenticar Admin.
"""
from unittest.mock import AsyncMock, patch, MagicMock

import pytest

from app.domain.entities import Admin
from app.use_cases.interfaces import IAdminRepository
from app.use_cases.auth.autenticar_admin import AutenticarAdmin, CredenciaisInvalidasError


# Usa hash fake para não depender do bcrypt/passlib (que tem bug com Python 3.13)
FAKE_HASH = "bcrypt_fake_hash"


def make_admin() -> Admin:
    return Admin(id=1, email="admin@marlonbarber.com", senha_hash=FAKE_HASH)


class TestAutenticarAdmin:
    @pytest.mark.asyncio
    async def test_login_com_credenciais_corretas_retorna_token(self):
        repo = AsyncMock(spec=IAdminRepository)
        repo.buscar_por_email.return_value = make_admin()
        uc = AutenticarAdmin(repo)
        # Mocka verify_password E create_access_token para isolar completamente de infraestrutura
        with patch("app.use_cases.auth.autenticar_admin.verify_password", return_value=True), \
             patch("app.use_cases.auth.autenticar_admin.create_access_token", return_value="fake.jwt.token"):
            token = await uc.executar(email="admin@marlonbarber.com", senha="senha123")
        assert isinstance(token, str)
        assert len(token) > 10

    @pytest.mark.asyncio
    async def test_login_email_inexistente_levanta_erro(self):
        repo = AsyncMock(spec=IAdminRepository)
        repo.buscar_por_email.return_value = None
        uc = AutenticarAdmin(repo)
        with pytest.raises(CredenciaisInvalidasError):
            await uc.executar(email="naoexiste@example.com", senha="qualquer")

    @pytest.mark.asyncio
    async def test_login_senha_incorreta_levanta_erro(self):
        repo = AsyncMock(spec=IAdminRepository)
        repo.buscar_por_email.return_value = make_admin()
        uc = AutenticarAdmin(repo)
        with patch("app.use_cases.auth.autenticar_admin.verify_password", return_value=False):
            with pytest.raises(CredenciaisInvalidasError):
                await uc.executar(email="admin@marlonbarber.com", senha="senha_errada")
