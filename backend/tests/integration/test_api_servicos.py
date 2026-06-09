"""
Testes de Integração — Serviços.
"""
import pytest
from fastapi.testclient import TestClient

from app.infrastructure.models import AdminModel, ServicoModel
from app.infrastructure.security import create_access_token, hash_password


def _setup_admin_token(db_session) -> str:
    admin = AdminModel(email="admin@test.com", senha_hash=hash_password("senha123"))
    db_session.add(admin)
    db_session.commit()
    return create_access_token({"sub": "admin@test.com", "id": admin.id})


class TestServicos:
    def test_listar_servicos_retorna_apenas_ativos(self, client: TestClient, db_session):
        """GET /api/servicos retorna apenas serviços com ativo=True."""
        db_session.add(ServicoModel(nome="Corte", preco=50.0, slot_size=1, ativo=True))
        db_session.add(ServicoModel(nome="Inativo", preco=10.0, slot_size=1, ativo=False))
        db_session.commit()

        res = client.get("/api/servicos")
        assert res.status_code == 200
        nomes = [s["nome"] for s in res.json()]
        assert "Corte" in nomes
        assert "Inativo" not in nomes

    def test_criar_servico_admin_retorna_201(self, client: TestClient, db_session):
        """POST /api/admin/servicos com token válido retorna 201."""
        token = _setup_admin_token(db_session)
        res = client.post(
            "/api/admin/servicos",
            json={"nome": "Barba", "preco": 40.0, "slot_size": 1},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 201
        assert res.json()["nome"] == "Barba"

    def test_remover_servico_com_agendamento_futuro_retorna_409(self, client: TestClient, db_session):
        """DELETE /api/admin/servicos/{id} com agendamento futuro retorna 409."""
        from datetime import datetime, timedelta, timezone
        token = _setup_admin_token(db_session)
        servico = ServicoModel(nome="Combo", preco=70.0, slot_size=2, ativo=True)
        db_session.add(servico)
        db_session.commit()

        from app.infrastructure.models import AgendamentoModel
        futuro = AgendamentoModel(
            servico_id=servico.id,
            data_hora_inicio=datetime.now(timezone.utc) + timedelta(days=1),
            nome_cliente="Paulo",
            telefone_cliente="11999990000",
            status="PENDENTE",
        )
        db_session.add(futuro)
        db_session.commit()

        res = client.delete(
            f"/api/admin/servicos/{servico.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 409
