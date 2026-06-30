"""
TESTES (TDD) — Use Case: Seed do Admin Inicial.
"""
from unittest.mock import AsyncMock, patch

import pytest

from app.domain.entities import Admin
from app.use_cases.auth.seed_admin_inicial import SeedAdminInicial
from app.use_cases.interfaces import IAdminRepository


class TestSeedAdminInicial:
    @pytest.mark.asyncio
    async def test_cria_admin_quando_nao_existe(self):
        repo = AsyncMock(spec=IAdminRepository)
        repo.buscar_por_email.return_value = None
        uc = SeedAdminInicial(repo)

        with patch(
            "app.use_cases.auth.seed_admin_inicial.hash_password",
            return_value="hash_seguro",
        ):
            await uc.executar(email="admin@marlonbarber.com", senha="senha123")

        repo.criar.assert_awaited_once()
        admin_criado: Admin = repo.criar.await_args.args[0]
        assert admin_criado.email == "admin@marlonbarber.com"
        assert admin_criado.senha_hash == "hash_seguro"

    @pytest.mark.asyncio
    async def test_nao_recria_admin_quando_ja_existe(self):
        repo = AsyncMock(spec=IAdminRepository)
        repo.buscar_por_email.return_value = Admin(
            id=1, email="admin@marlonbarber.com", senha_hash="ja_existe"
        )
        uc = SeedAdminInicial(repo)

        await uc.executar(email="admin@marlonbarber.com", senha="senha123")

        repo.criar.assert_not_awaited()
