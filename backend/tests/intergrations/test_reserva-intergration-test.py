import pytest
from fastapi.testclient import TestClient
from main import app
from datetime import date, timedelta
from Reserva.dto.CreateReserva import ReservaCreate, ReservaUpdate

client = TestClient(app)

# -------------------------------------------------------------
# CONFIGURAÇÕES DE TESTE (IDs DEVEM EXISTIR NO SUPABASE)
# -------------------------------------------------------------
ID_TUTOR = 1358
ID_ANFITRIAO = 1356
ID_PET = 156


# -------------------------------------------------------------
# FIXTURE GLOBAL - ARMAZENA O ID DA RESERVA CRIADA
# -------------------------------------------------------------
@pytest.fixture(scope="session")
def reserva_data():
    return {"id": None}


# -------------------------------------------------------------
# FIXTURE - PAYLOAD BASE PARA CRIAÇÃO DE RESERVA
# -------------------------------------------------------------
@pytest.fixture
def reserva_payload():
    tomorrow = date.today() + timedelta(days=1)
    after = date.today() + timedelta(days=3)

    payload = ReservaCreate(
        id_tutor=ID_TUTOR,
        id_anfitriao=ID_ANFITRIAO,
        data_inicio=tomorrow,
        data_fim=after,
        pets_tutor=[ID_PET],
        qtd_pets=1,
        valor_diaria=100,
        qtd_dias=2,
        valor_total_reserva=200
    ).model_dump()

    payload["data_inicio"] = payload["data_inicio"].isoformat()
    payload["data_fim"] = payload["data_fim"].isoformat()
    return payload


# =========================================================================================
# TESTES DO POST /reservas/
# =========================================================================================
def test_create_reserva(reserva_payload, reserva_data):
    response = client.post("/reservas/", json=reserva_payload)

    assert response.status_code == 201, response.text
    body = response.json()
    assert isinstance(body, list)
    assert len(body) == 1

    reserva = body[0]

    # Salva o ID para os outros testes
    reserva_data["id"] = reserva["id_reserva"]

    # Validações
    assert reserva["id_tutor"] == ID_TUTOR
    assert reserva["id_anfitriao"] == ID_ANFITRIAO
    assert reserva["status"] == "pendente"
    assert reserva["pets_tutor"] == [ID_PET]


# =========================================================================================
# TESTES DE FALHA NO CREATE
# =========================================================================================
def test_create_reserva_data_invalida(reserva_payload):
    # Colocando data de fim antes da data de início
    reserva_payload["data_fim"] = (
        date.today() + timedelta(days=1)).isoformat()
    reserva_payload["data_inicio"] = (
        date.today() + timedelta(days=2)).isoformat()

    response = client.post("/reservas/", json=reserva_payload)
    assert response.status_code == 400
    assert "saída" in response.json()["detail"].lower()


def test_create_reserva_pet_inexistente(reserva_payload):
    reserva_payload["pets_tutor"] = [999999]  # pet inexistente
    reserva_payload["qtd_pets"] = 1

    response = client.post("/reservas/", json=reserva_payload)
    assert response.status_code == 400
    assert "não foram encontrados" in response.json()["detail"].lower()


# =========================================================================================
# GET /reservas/{id}
# =========================================================================================
def test_get_reserva_by_id(reserva_data):
    response = client.get(f"/reservas/{reserva_data['id']}")

    assert response.status_code == 200
    reserva = response.json()

    assert reserva["id_reserva"] == reserva_data["id"]
    assert reserva["id_tutor"] == ID_TUTOR
    assert reserva["id_anfitriao"] == ID_ANFITRIAO


# =========================================================================================
# GET /reservas/tutor/{id}
# =========================================================================================
def test_get_reservas_by_tutor(reserva_data):
    response = client.get(f"/reservas/tutor/{ID_TUTOR}")
    assert response.status_code == 200

    reservas = response.json()
    assert any(r["id_reserva"] == reserva_data["id"] for r in reservas)


# =========================================================================================
# GET /reservas/anfitriao/{id}
# =========================================================================================
def test_get_reservas_by_anfitriao(reserva_data):
    response = client.get(f"/reservas/anfitriao/{ID_ANFITRIAO}")
    assert response.status_code == 200

    reservas = response.json()
    assert any(r["id_reserva"] == reserva_data["id"] for r in reservas)


# =========================================================================================
# GET /reservas/status/pendente
# =========================================================================================
def test_get_reservas_by_status(reserva_data):
    response = client.get("/reservas/status/pendente")
    assert response.status_code == 200

    reservas = response.json()
    assert any(r["id_reserva"] == reserva_data["id"] for r in reservas)


# =========================================================================================
# PUT /reservas/{id}
# =========================================================================================
def test_update_reserva(reserva_data):
    update_payload = ReservaUpdate(
        status="confirmada",
        data_inicio=date.today() + timedelta(days=2),
        data_fim=date.today() + timedelta(days=4)
    ).model_dump()

    update_payload["data_inicio"] = update_payload["data_inicio"].isoformat()
    update_payload["data_fim"] = update_payload["data_fim"].isoformat()

    response = client.put(
        f"/reservas/{reserva_data['id']}", json=update_payload)
    assert response.status_code == 200

    updated = response.json()[0]
    assert updated["status"] == "confirmada"


# =========================================================================================
# DELETE /reservas/{id}
# =========================================================================================
def test_delete_reserva(reserva_data):
    response = client.delete(f"/reservas/{reserva_data['id']}")
    assert response.status_code in (200, 204)

    # Certificar que foi removido
    response = client.get(f"/reservas/{reserva_data['id']}")
    assert response.status_code == 404
