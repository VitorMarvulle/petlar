import pytest
from fastapi.testclient import TestClient
from main import app
from Pet.dto.CreatePet import PetCreate
import random

client = TestClient(app)

pet_ID = 0

# ------------------------
# GET /pets
# ------------------------
def test_get_pets():
    response = client.get("/pets")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list), "GET /pets deve retornar lista"


# ------------------------
# GET /pets/{id}
# ------------------------
def test_get_pets_by_id():
    response = client.get("/pets/2")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict), "GET /pets/{id} deve retornar dict"


# ------------------------
# POST /pets
# ------------------------
def test_post_pets():
    pet = dict(PetCreate(
        id_tutor=1,
        nome=f"Pet {random.randint(1000, 9999)}",
        especie="Cachorro",
        raca="Poodle",
        idade=3,
        observacoes="Observações do pet"
    ))

    response = client.post("/pets", json=pet)
    assert response.status_code == 201

    body = response.json()
    assert isinstance(body, list), "POST /pets retorna lista"

    data = body[0]  # pega primeiro item da lista

    assert data["nome"] == pet["nome"]
    assert data["especie"] == pet["especie"]
    assert data["raca"] == pet["raca"]
    assert data["idade"] == pet["idade"]
    assert data["observacoes"] == pet["observacoes"]

    global pet_ID
    pet_ID = data["id_pet"]


# ------------------------
# PUT /pets/{id}
# ------------------------
def test_put_pets_by_id():
    pet = dict(PetCreate(
        id_tutor=1,
        nome=f"Pet {random.randint(1000, 9999)}",
        especie="Cachorro",
        raca="Golden Retriever",
        idade=3,
        observacoes="Observações do pet"
    ))

    response = client.put(f"/pets/{pet_ID}", json=pet)
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list), "PUT /pets/{id} retorna lista"

    data = body[0]  # pega primeiro item da lista

    assert data["nome"] == pet["nome"]
    assert data["especie"] == pet["especie"]
    assert data["raca"] == pet["raca"]
    assert data["idade"] == pet["idade"]
    assert data["observacoes"] == pet["observacoes"]


# ------------------------
# DELETE /pets/{id}
# ------------------------
def test_delete_pets_by_id():
    response = client.delete(f"/pets/{pet_ID}")
    assert response.status_code == 204