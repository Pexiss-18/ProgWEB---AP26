"""
Testes de Integração — Agendamentos.
"""
from datetime import date, datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.infrastructure.models import AdminModel, AgendamentoModel, ServicoModel
from app.infrastructure.security import create_access_token, hash_password


def _setup(db_session):
    """Cria admin e serviço e retorna (token, servico)."""
    admin = AdminModel(email="admin@test.com", senha_hash=hash_password("senha123"))
    servico = ServicoModel(nome="Corte", preco=50.0, slot_size=1, ativo=True)
    db_session.add_all([admin, servico])
    db_session.commit()
    token = create_access_token({"sub": "admin@test.com", "id": admin.id})
    return token, servico


class TestAgendamentos:
    def test_listar_slots_disponiveis(self, client: TestClient, db_session):
        """GET /api/agendamentos/disponiveis retorna slots corretos."""
        _, servico = _setup(db_session)
        data = date.today().isoformat()
        res = client.get(f"/api/agendamentos/disponiveis?data={data}&servico_id={servico.id}")
        assert res.status_code == 200
        slots = res.json()["slots"]
        assert len(slots) > 0

    def test_criar_agendamento_publico_retorna_201(self, client: TestClient, db_session):
        """POST /api/agendamentos cria agendamento com status PENDENTE."""
        _, servico = _setup(db_session)
        data_hora = (datetime.now().replace(hour=14, minute=0, second=0, microsecond=0)
                     + timedelta(days=1)).isoformat()
        res = client.post(
            "/api/agendamentos",
            json={
                "servico_id": servico.id,
                "data_hora_inicio": data_hora,
                "nome_cliente": "Paulo",
                "telefone_cliente": "11999990000",
            },
        )
        assert res.status_code == 201
        assert res.json()["status"] == "PENDENTE"

    def test_patch_status_agendamento(self, client: TestClient, db_session):
        """PATCH /api/admin/agendamentos/{id}/status atualiza status corretamente."""
        token, servico = _setup(db_session)
        agendamento = AgendamentoModel(
            servico_id=servico.id,
            data_hora_inicio=datetime.now() + timedelta(hours=2),
            nome_cliente="Paulo",
            telefone_cliente="11999990000",
            status="PENDENTE",
        )
        db_session.add(agendamento)
        db_session.commit()

        res = client.patch(
            f"/api/admin/agendamentos/{agendamento.id}/status",
            json={"status": "CONFIRMADO"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        assert res.json()["status"] == "CONFIRMADO"

    def test_slot_duplicado_retorna_409(self, client: TestClient, db_session):
        """POST /api/agendamentos para slot já ocupado retorna 409."""
        _, servico = _setup(db_session)
        data_hora = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=1)

        # Primeiro agendamento
        agendamento_existente = AgendamentoModel(
            servico_id=servico.id,
            data_hora_inicio=data_hora,
            nome_cliente="Carlos",
            telefone_cliente="11888880000",
            status="CONFIRMADO",
        )
        db_session.add(agendamento_existente)
        db_session.commit()

        # Segundo agendamento para o mesmo slot
        res = client.post(
            "/api/agendamentos",
            json={
                "servico_id": servico.id,
                "data_hora_inicio": data_hora.isoformat(),
                "nome_cliente": "Paulo",
                "telefone_cliente": "11999990000",
            },
        )
        assert res.status_code == 409
