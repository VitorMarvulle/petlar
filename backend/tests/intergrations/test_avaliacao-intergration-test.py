import pytest
from fastapi.testclient import TestClient
from main import app
from Avaliacao.dto.CreateAvaliacao import AvaliacaoCreate
import random

client = TestClient(app)

avaliacao_ID = 0


# =====================================================================
# GET /avaliacoes
# =====================================================================
def test_get_avaliacoes():
    response = client.get("/avaliacoes")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)


# =====================================================================
# POST /avaliacoes  (SUCESSO)
# =====================================================================
def test_post_avaliacoes():
    avaliacao = dict(AvaliacaoCreate(
        id_reserva=1,
        id_avaliador=15,
        id_avaliado=2,
        nota=random.randint(1, 5),
        comentario=f"Comentário {random.randint(1000, 9999)}"
    ))

    response = client.post("/avaliacoes", json=avaliacao)
    assert response.status_code == 201, response.text

    body = response.json()
    assert isinstance(body, list)

    data = body[0]

    assert data["id_reserva"] == avaliacao["id_reserva"]
    assert data["id_avaliador"] == avaliacao["id_avaliador"]
    assert data["id_avaliado"] == avaliacao["id_avaliado"]
    assert data["nota"] == avaliacao["nota"]
    assert data["comentario"] == avaliacao["comentario"]

    global avaliacao_ID
    avaliacao_ID = data["id_avaliacao"]


# =====================================================================
# POST /avaliacoes (ERRO: CAMPOS INVÁLIDOS)
# =====================================================================
def test_post_avaliacoes_invalid_nota():
    avaliacao = {
        "id_reserva": 1,
        "id_avaliador": 15,
        "id_avaliado": 2,
        "nota": 10,  # inválido
        "comentario": "nota inválida"
    }

    response = client.post("/avaliacoes", json=avaliacao)
    assert response.status_code == 422  # validação Pydantic


def test_post_avaliacoes_missing_field():
    avaliacao = {
        "id_reserva": 1,
        "id_avaliador": 15,
        # id_avaliado faltando
        "nota": 4
    }

    response = client.post("/avaliacoes", json=avaliacao)
    assert response.status_code == 422


# =====================================================================
# GET /avaliacoes/{id}
# =====================================================================
def test_get_avaliacao_by_id():
    response = client.get(f"/avaliacoes/{avaliacao_ID}")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict)
    assert data["id_avaliacao"] == avaliacao_ID


# =====================================================================
# GET /avaliacoes/{id} - NÃO ENCONTRADO
# =====================================================================
def test_get_avaliacao_by_id_not_found():
    response = client.get("/avaliacoes/999999")
    assert response.status_code == 404

    data = response.json()
    assert "detail" in data


# =====================================================================
# GET /avaliacoes/reserva/{id_reserva}
# =====================================================================
def test_get_avaliacoes_by_reserva():
    response = client.get("/avaliacoes/reserva/1")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)


# =====================================================================
# GET /avaliacoes/avaliado/{id_avaliado}
# =====================================================================
def test_get_avaliacoes_by_avaliado():
    response = client.get("/avaliacoes/avaliado/2")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)


# =====================================================================
# GET /avaliacoes/avaliador/{id_avaliador}
# =====================================================================
def test_get_avaliacoes_by_avaliador():
    response = client.get("/avaliacoes/avaliador/15")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)


# =====================================================================
# PUT /avaliacoes/{id}  (SUCESSO)
# =====================================================================
def test_put_avaliacoes_by_id():
    update_data = {
        "nota": random.randint(1, 5),
        "comentario": f"Comentário atualizado {random.randint(1000, 9999)}"
    }

    response = client.put(f"/avaliacoes/{avaliacao_ID}", json=update_data)
    assert response.status_code == 200

    data = response.json()[0]
    assert data["nota"] == update_data["nota"]
    assert data["comentario"] == update_data["comentario"]


# =====================================================================
# PUT /avaliacoes/{id} - ERRO: NOTA INVÁLIDA
# =====================================================================
def test_put_avaliacoes_invalid_nota():
    update_data = {"nota": 99}  # inválido

    response = client.put(f"/avaliacoes/{avaliacao_ID}", json=update_data)
    assert response.status_code == 422


# =====================================================================
# PUT /avaliacoes/{id} - ID NÃO EXISTE
# =====================================================================
def test_put_avaliacoes_not_found():
    update_data = {"comentario": "novo comentário"}

    response = client.put("/avaliacoes/999999", json=update_data)

    # quando o PATCH retorna 0 linhas modificadas,
    # o Supabase costuma retornar 200 + lista vazia
    assert response.status_code in (200, 404)

    if response.status_code == 200:
        assert response.json() == []


# =====================================================================
# DELETE /avaliacoes/{id} (SUCESSO)
# =====================================================================
def test_delete_avaliacao_by_id():
    response = client.delete(f"/avaliacoes/{avaliacao_ID}")
    assert response.status_code == 204


# =====================================================================
# DELETE /avaliacoes/{id} - ID NÃO EXISTE
# =====================================================================
def test_delete_avaliacao_not_found():
    response = client.delete("/avaliacoes/999999")

    # Supabase geralmente retorna 204 mesmo se não existir
    assert response.status_code in (204, 404)
