import pytest
from fastapi.testclient import TestClient
from main import app
from Usuario.dto.CreateUsuario import UsuarioCreate
import random

client = TestClient(app)

# ------------------------
# GET /usuarios
# ------------------------
def test_get_usuarios():
    response = client.get("/usuarios")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list), "GET /usuarios deve retornar lista"


# ------------------------
# GET /usuarios/{id}
# ------------------------
def test_get_usuarios_by_id():
    response = client.get("/usuarios/11")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict), "GET /usuarios/{id} deve retornar dict"


# ------------------------
# GET /usuarios/{id} - usuário inexistente
# ------------------------
def test_get_usuario_by_id_not_found():
    response = client.get("/usuarios/999999")  
    assert response.status_code == 404
    assert response.json()["detail"] == "Usuário não encontrado"



# ------------------------
# POST /usuarios
# ------------------------
def test_post_usuarios():

    user = dict(UsuarioCreate(
        nome="John Doe",
        email=f"lKb8A{random.randint(1000, 9999)}@example.com",
        senha_hash="hashed_password",
        telefone="1234567890",
        tipo="tutor",
        data_cadastro="2023-01-01",
        logradouro="Rua A",
        numero="123",
        bairro="Bairro X",
        cidade="Cidade Y",
        uf="UF",
        cep="12345-678",
        complemento="Complemento Z"
    ))

    response = client.post("/usuarios", json=user)
    assert response.status_code == 201

    body = response.json()
    assert isinstance(body, list), "POST /usuarios retorna lista"

    data = body[0]  # pega primeiro item da lista

    assert data["nome"] == user["nome"]
    assert data["email"] == user["email"]
    assert data["telefone"] == user["telefone"]
    assert data["tipo"] == user["tipo"]
    assert data["data_cadastro"].startswith(user["data_cadastro"])
    assert data["logradouro"] == user["logradouro"]
    assert data["numero"] == user["numero"]
    assert data["bairro"] == user["bairro"]
    assert data["cidade"] == user["cidade"]
    assert data["uf"] == user["uf"]
    assert data["cep"] == user["cep"]
    assert data["complemento"] == user["complemento"]


# ------------------------
# DELETE /usuarios/{id}
# ------------------------
def test_delete_usuario_by_id():
    response = client.delete("/usuarios/10")
    assert response.status_code in (200, 204), "DELETE deve retornar 200 ou 204"


# ------------------------
# DELETE /usuarios/{id} - não encontrado
# ------------------------
def test_delete_usuario_by_id_not_found():
    response = client.delete("/usuarios/999999")
    # Supabase retorna 204 mesmo quando o registro não existe
    assert response.status_code in (200, 204)
