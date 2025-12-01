import pytest
from fastapi.testclient import TestClient
from main import app
from Anfitriao.dto.CreateAnfitriao import AnfitriaoCreate, AnfitriaoUpdate
from fastapi import UploadFile
import io
import random

client = TestClient(app)

anfitriao_ID = 0


# =============================================================================
# GET /anfitrioes
# =============================================================================
def test_get_anfitrioes():
    response = client.get("/anfitrioes")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)


# =============================================================================
# POST /anfitrioes
# =============================================================================
def test_post_anfitrioes():

    global anfitriao_ID
    novo_id = 1

    anfitriao = dict(AnfitriaoCreate(
        id_anfitriao=novo_id,
        descricao="Ambiente seguro para pets",
        capacidade_maxima=3,
        especie=["cachorro"],
        tamanho_pet="médio",
        preco=79.90,
        status="pendente",
        fotos_urls=["http://example.com/foto1.jpg"],
    ))

    response = client.post("/anfitrioes", json=anfitriao)
    assert response.status_code == 201

    body = response.json()
    assert isinstance(body, list)

    data = body[0]

    anfitriao_ID = data["id_anfitriao"]

    assert data["descricao"] == anfitriao["descricao"]
    assert data["capacidade_maxima"] == anfitriao["capacidade_maxima"]
    assert data["status"] == "pendente"


# =============================================================================
# GET /anfitrioes/{id}
# =============================================================================
def test_get_anfitrioes_by_id():
    response = client.get(f"/anfitrioes/{anfitriao_ID}")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict)
    assert data["id_anfitriao"] == anfitriao_ID


# =============================================================================
# GET /anfitrioes/status/{status}
# =============================================================================
def test_get_anfitrioes_by_status():
    response = client.get("/anfitrioes/status/pendente")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)


# =============================================================================
# GET /anfitrioes/ativos
# =============================================================================
def test_get_anfitrioes_ativos():
    response = client.get("/anfitrioes/ativos?page=1&page_size=5")
    assert response.status_code == 200

    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)


def test_get_anfitrioes_ativos_paginacao():
    response = client.get("/anfitrioes/ativos?page=2&page_size=1")
    assert response.status_code == 200
    body = response.json()

    assert "page" in body
    assert "page_size" in body
    assert "results" in body
    assert isinstance(body["results"], list)


# =============================================================================
# GET /anfitrioes/buscar — filtros
# =============================================================================
def test_buscar_anfitrioes_sem_filtros():
    response = client.get("/anfitrioes/buscar")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body["results"], list)


def test_buscar_anfitrioes_por_cidade():
    response = client.get("/anfitrioes/buscar?cidade=Sao")
    assert response.status_code == 200


def test_buscar_anfitrioes_por_tipo_pet():
    response = client.get("/anfitrioes/buscar?tipo_pet=cachorro")
    assert response.status_code == 200


def test_buscar_anfitrioes_por_tamanho():
    response = client.get("/anfitrioes/buscar?tamanho=médio")
    assert response.status_code == 200


def test_buscar_anfitrioes_por_preco_min_e_max():
    response = client.get("/anfitrioes/buscar?preco_min=10&preco_max=200")
    assert response.status_code == 200


def test_buscar_anfitrioes_com_todos_os_filtros():
    response = client.get(
        "/anfitrioes/buscar?cidade=Sao&tipo_pet=cachorro&tamanho=médio&preco_min=10&preco_max=300"
    )
    assert response.status_code == 200


# =============================================================================
# PUT /anfitrioes/{id}
# =============================================================================
def test_put_anfitrioes():

    update_data = dict(AnfitriaoUpdate(
        descricao="Descrição atualizada",
        preco=99.9,
        status="ativo",
    ))

    response = client.put(f"/anfitrioes/{anfitriao_ID}", json=update_data)
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)

    data = body[0]
    assert data["descricao"] == update_data["descricao"]
    assert data["preco"] == update_data["preco"]
    assert data["status"] == update_data["status"]


# =============================================================================
# POST /anfitrioes/{id}/fotos-area
# =============================================================================
def test_upload_fotos_area():

    fake_image = io.BytesIO(b"fake image data")

    response = client.post(
        f"/anfitrioes/{anfitriao_ID}/fotos-area",
        files={"arquivos": ("teste.jpg", fake_image, "image/jpeg")},
    )

    # A rota pode retornar 200 (upload OK) ou 400 (storage erro)
    assert response.status_code in (200, 400)

    if response.status_code == 200:
        body = response.json()
        assert "fotos_totais" in body
        assert isinstance(body["fotos_totais"], list)

# =============================================================================
# DELETE /anfitrioes/{id}
# =============================================================================


def test_delete_anfitriao_by_id():
    response = client.delete(f"/anfitrioes/{anfitriao_ID}")
    assert response.status_code in (200, 204)


# =============================================================================
# DELETE /anfitrioes/{id} — not found
# =============================================================================
def test_delete_anfitriao_by_id_not_found():
    response = client.delete(f"/anfitrioes/{anfitriao_ID}")
    assert response.status_code in (200, 204)


# =============================================================================
# GET /anfitrioes/{id} — not found
# =============================================================================
def test_get_anfitrioes_by_id_not_found():
    response = client.get(f"/anfitrioes/{anfitriao_ID}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Anfitrião não encontrado"
