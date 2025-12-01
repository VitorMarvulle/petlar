import io
import pytest
from fastapi.testclient import TestClient
from main import app
from Pet.dto.CreatePet import PetCreate, PetUpdate
import random

client = TestClient(app)

# Variáveis globais para manter estado entre testes
PET_ID = None
PET_ID_SECOND = None


# ============================================================
# 1 — GET /pets
# ============================================================
def test_get_all_pets():
    response = client.get("/pets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


# ============================================================
# 2 — POST /pets
# ============================================================
def test_create_pet():
    global PET_ID
    pet_payload = dict(PetCreate(
        id_tutor=1,
        nome=f"Pet {random.randint(1000, 9999)}",
        especie="Cachorro",
        raca="Poodle",
        idade=3,
        observacoes="Observações do pet"
    ))

    response = client.post("/pets", json=pet_payload)
    assert response.status_code == 201
    data = response.json()[0]
    PET_ID = data["id_pet"]

    assert data["nome"] == pet_payload["nome"]
    assert data["especie"] == pet_payload["especie"]


# ============================================================
# 3 — POST /pets — segundo pet para testes de múltiplos uploads
# ============================================================
def test_create_second_pet():
    global PET_ID_SECOND
    pet_payload = dict(PetCreate(
        id_tutor=1,
        nome=f"Pet {random.randint(1000, 9999)}",
        especie="Gato",
        raca="Siamês",
        idade=2,
        observacoes="Segundo pet para teste"
    ))

    response = client.post("/pets", json=pet_payload)
    assert response.status_code == 201
    data = response.json()[0]
    PET_ID_SECOND = data["id_pet"]
    assert data["nome"] == pet_payload["nome"]


# ============================================================
# 4 — GET /pets/{id}
# ============================================================
def test_get_pet_by_id():
    response = client.get(f"/pets/{PET_ID}")
    assert response.status_code == 200
    data = response.json()
    assert data["id_pet"] == PET_ID


def test_get_pet_by_invalid_id():
    response = client.get("/pets/999999")
    assert response.status_code == 404


# ============================================================
# 5 — GET /pets/tutor/{id_tutor}
# ============================================================
def test_get_pets_by_tutor():
    response = client.get("/pets/tutor/1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all(p["id_tutor"] == 1 for p in data)


# ============================================================
# 6 — PUT /pets/{id} (update)
# ============================================================
def test_update_pet():
    payload = dict(PetUpdate(
        nome="Nome atualizado",
        especie="Cachorro",
        raca="Labrador",
        idade=4,
        observacoes="Atualização do pet"
    ))
    response = client.put(f"/pets/{PET_ID}", json=payload)
    assert response.status_code == 200
    data = response.json()[0]
    assert data["nome"] == "Nome atualizado"
    assert data["raca"] == "Labrador"


def test_update_nonexistent_pet():
    payload = dict(PetUpdate(nome="Inexistente"))
    response = client.put("/pets/999999", json=payload)

    # Supabase retorna 200 OK com lista vazia quando não há nada para atualizar
    assert response.status_code == 200
    data = response.json()
    assert data == [], "Esperado lista vazia ao atualizar pet inexistente"


# ============================================================
# 7 — DELETE /pets/{id}
# ============================================================
def test_delete_pet():
    response = client.delete(f"/pets/{PET_ID_SECOND}")
    assert response.status_code in (204, 200)


def test_delete_nonexistent_pet():
    response = client.delete("/pets/999999")

    # Supabase retorna 204 mesmo que não exista registro
    assert response.status_code == 204

# ============================================================
# 8 — POST /pets/{id_pet}/fotos — cenários variados
# ============================================================


def test_upload_single_photo():
    file_data = io.BytesIO(b"fake image data")
    response = client.post(
        f"/pets/{PET_ID}/fotos",
        files={"arquivos": ("foto.jpg", file_data, "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "fotos_urls" in data
    assert len(data["fotos_urls"]) == 1


def test_upload_multiple_photos():
    files = [
        ("arquivos", ("f1.jpg", io.BytesIO(b"1"), "image/jpeg")),
        ("arquivos", ("f2.jpg", io.BytesIO(b"2"), "image/jpeg")),
    ]
    response = client.post(f"/pets/{PET_ID}/fotos", files=files)
    assert response.status_code == 200
    assert len(response.json()["fotos_urls"]) == 2


def test_upload_more_than_10_photos():
    files = [("arquivos", (f"f{i}.jpg", io.BytesIO(
        b"x"), "image/jpeg")) for i in range(11)]
    response = client.post(f"/pets/{PET_ID}/fotos", files=files)
    assert response.status_code == 400
    assert response.json()["detail"] == "Máximo de 10 fotos permitidas"


def test_upload_photo_no_extension():
    file_data = io.BytesIO(b"no extension")
    response = client.post(
        f"/pets/{PET_ID}/fotos",
        files={"arquivos": ("arquivo", file_data, "image/jpeg")},
    )
    assert response.status_code == 200
    url = response.json()["fotos_urls"][0]
    assert url.endswith(".jpg")


def test_upload_photo_no_content_type():
    file_data = io.BytesIO(b"x")
    response = client.post(
        f"/pets/{PET_ID}/fotos",
        files={"arquivos": ("foto.jpg", file_data, None)},
    )
    assert response.status_code == 200
    assert response.json()["fotos_urls"]
