import pytest
from fastapi.testclient import TestClient
from main import app
from Anfitriao.dto.CreateAnfitriao import AnfitriaoCreate, AnfitriaoUpdate
import random

client = TestClient(app)

anfitriao_ID = 0



# ------------------------
# GET /anfitrioes
# ------------------------
def test_get_anfitrioes():
    response = client.get("/anfitrioes")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list), "GET /anfitrioes deve retornar lista"



# ------------------------
# POST /anfitrioes
# ------------------------
def test_post_anfitrioes():

    anfitriao = dict(AnfitriaoCreate(
        id_anfitriao=1,
        descricao="Local aconchegante para pets",
        capacidade_maxima=5,
        especie=["cachorro", "gato"],
        tamanho_pet="médio",
        preco=49.90,
        status="pendente",
        foto_url="http://example.com/foto.jpg"
    ))

    response = client.post("/anfitrioes", json=anfitriao)
    assert response.status_code == 201

    body = response.json()
    assert isinstance(body, list), "POST /anfitrioes retorna lista"

    data = body[0]

    assert data["id_anfitriao"] == anfitriao["id_anfitriao"]
    assert data["descricao"] == anfitriao["descricao"]
    assert data["capacidade_maxima"] == anfitriao["capacidade_maxima"]
    assert data["especie"] == anfitriao["especie"]
    assert data["tamanho_pet"] == anfitriao["tamanho_pet"]
    assert data["preco"] == anfitriao["preco"]
    assert data["status"] == anfitriao["status"]
    assert data["foto_url"] == anfitriao["foto_url"]

    global anfitriao_ID
    anfitriao_ID = data["id_anfitriao"]



# ------------------------
# GET /anfitrioes/{id}
# ------------------------
def test_get_anfitrioes_by_id():
    response = client.get(f"/anfitrioes/{anfitriao_ID}")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict), "GET /anfitrioes/{id} deve retornar dict"
    assert data["id_anfitriao"] == anfitriao_ID



# ------------------------
# GET /anfitrioes/status/{status}
# ------------------------
def test_get_anfitrioes_by_status():
    response = client.get("/anfitrioes/status/pendente")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list), "GET /anfitrioes/status/{status} deve retornar lista"



# ------------------------
# PUT /anfitrioes/{id}
# ------------------------
def test_put_anfitrioes():

    update_data = dict(AnfitriaoUpdate(
        descricao="Atualizado",
        preco=79.90,
        status="ativo"
    ))

    response = client.put(f"/anfitrioes/{anfitriao_ID}", json=update_data)
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list), "PUT /anfitrioes retorna lista"

    data = body[0]

    assert data["descricao"] == update_data["descricao"]
    assert data["preco"] == update_data["preco"]
    assert data["status"] == update_data["status"]



# ------------------------
# DELETE /anfitrioes/{id}
# ------------------------
def test_delete_anfitriao_by_id():
    response = client.delete(f"/anfitrioes/{anfitriao_ID}")
    assert response.status_code in (200, 204), "DELETE deve retornar 200 ou 204"



# ------------------------
# DELETE /anfitrioes/{id} - não encontrado
# ------------------------
def test_delete_anfitriao_by_id_not_found():
    response = client.delete(f"/anfitrioes/{anfitriao_ID}")
    # Supabase retorna 204 mesmo que já não exista
    assert response.status_code in (200, 204)



# ------------------------
# GET /anfitrioes/{id} - anfitrião inexistente
# ------------------------
def test_get_anfitrioes_by_id_not_found():
    response = client.get(f"/anfitrioes/{anfitriao_ID}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Anfitrião não encontrado"
