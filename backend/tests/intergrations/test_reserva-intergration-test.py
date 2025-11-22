import pytest
from fastapi.testclient import TestClient
from main import app
from datetime import date, timedelta
from Reserva.dto.CreateReserva import ReservaCreate, ReservaUpdate

client = TestClient(app)

# IDs fixos para teste
ID_TUTOR = 15
ID_ANFITRIAO = 2
reserva_ID = None


# ---------------------------
# POST /reservas
# ---------------------------
def test_create_reserva():
    global reserva_ID
    today = date.today()

    payload = ReservaCreate(
        id_tutor=ID_TUTOR,
        id_anfitriao=ID_ANFITRIAO,
        data_inicio=today + timedelta(days=1),
        data_fim=today + timedelta(days=3)
    ).model_dump()

    # Converter datas para string ISO
    payload['data_inicio'] = payload['data_inicio'].isoformat()
    payload['data_fim'] = payload['data_fim'].isoformat()

    response = client.post("/reservas/", json=payload)
    assert response.status_code == 201, response.text

    body = response.json()
    # Supabase retorna lista
    reserva_data = body[0]
    assert "id_reserva" in reserva_data

    reserva_ID = reserva_data["id_reserva"]
    assert isinstance(reserva_ID, int)
    assert reserva_data["id_tutor"] == ID_TUTOR
    assert reserva_data["id_anfitriao"] == ID_ANFITRIAO
    assert reserva_data["status"] == "pendente"


# ---------------------------
# GET /reservas/{id}
# ---------------------------
def test_get_reserva_by_id():
    response = client.get(f"/reservas/{reserva_ID}")
    assert response.status_code == 200, response.text

    body = response.json()
    # Supabase retorna lista
    assert body["id_reserva"] == reserva_ID
    assert body["id_tutor"] == ID_TUTOR
    assert body["id_anfitriao"] == ID_ANFITRIAO


# ---------------------------
# GET /reservas/tutor/{id_tutor}
# ---------------------------
def test_get_reservas_by_tutor():
    response = client.get(f"/reservas/tutor/{ID_TUTOR}")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)
    assert any(r["id_reserva"] == reserva_ID for r in body)


# ---------------------------
# GET /reservas/anfitriao/{id_anfitriao}
# ---------------------------
def test_get_reservas_by_anfitriao():
    response = client.get(f"/reservas/anfitriao/{ID_ANFITRIAO}")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)
    assert any(r["id_reserva"] == reserva_ID for r in body)


# ---------------------------
# GET /reservas/status/{status}
# ---------------------------
def test_get_reservas_by_status():
    response = client.get("/reservas/status/pendente")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)
    assert any(r["id_reserva"] == reserva_ID for r in body)


# ---------------------------
# PUT /reservas/{id}
# ---------------------------
def test_update_reserva():
    update_payload = ReservaUpdate(
        status="confirmada",
        data_inicio=date.today() + timedelta(days=2),
        data_fim=date.today() + timedelta(days=4)
    ).model_dump()

    # Converter datas para string ISO
    if update_payload.get('data_inicio'):
        update_payload['data_inicio'] = update_payload['data_inicio'].isoformat()
    if update_payload.get('data_fim'):
        update_payload['data_fim'] = update_payload['data_fim'].isoformat()

    response = client.put(f"/reservas/{reserva_ID}", json=update_payload)
    assert response.status_code == 200, response.text

    body = response.json()
    # Supabase retorna lista
    updated_reserva = body[0]
    assert updated_reserva["status"] == "confirmada"


# ---------------------------
# DELETE /reservas/{id}
# ---------------------------
def test_delete_reserva():
    response = client.delete(f"/reservas/{reserva_ID}")
    assert response.status_code in (200, 204)
