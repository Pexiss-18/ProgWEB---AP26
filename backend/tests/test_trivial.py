"""Teste trivial para validar que o pytest está funcionando."""


def test_soma_trivial():
    assert 1 + 1 == 2


def test_api_root(client):
    """Testa que a rota raiz da API responde corretamente."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
