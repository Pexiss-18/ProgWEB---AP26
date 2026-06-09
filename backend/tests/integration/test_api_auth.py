"""
Testes de Integração — Autenticação.
Requer banco PostgreSQL de teste configurado em TEST_DATABASE_URL.
"""
import pytest
from fastapi.testclient import TestClient


class TestLoginAdmin:
    def test_login_credenciais_corretas_retorna_token(self, client: TestClient, db_session):
        """POST /api/admin/login com credenciais corretas retorna 200 e token JWT."""
        from app.infrastructure.models import AdminModel
        from app.infrastructure.security import hash_password

        admin = AdminModel(email="admin@test.com", senha_hash=hash_password("senha123"))
        db_session.add(admin)
        db_session.commit()

        res = client.post("/api/admin/login", json={"email": "admin@test.com", "senha": "senha123"})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_credenciais_incorretas_retorna_401(self, client: TestClient):
        """POST /api/admin/login com senha errada retorna 401."""
        res = client.post("/api/admin/login", json={"email": "ninguem@test.com", "senha": "errado"})
        assert res.status_code == 401

    def test_rota_protegida_sem_token_retorna_401(self, client: TestClient):
        """GET /api/admin/agendamentos sem token retorna 401."""
        res = client.get("/api/admin/agendamentos")
        assert res.status_code == 401
