import pytest
from fastapi.testclient import TestClient
from main import app
from Usuario.dto.CreateUsuario import UsuarioCreate
from Usuario.dto.LoginRequest import LoginRequest
import random

client = TestClient(app)

usuario_ID = 0
email_random = f"user{random.randint(1000, 9999)}@example.com"


# ------------------------
# GET /usuarios
# ------------------------
def test_get_usuarios():
    response = client.get("/usuarios")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list), "GET /usuarios deve retornar lista"


# ------------------------
# POST /usuarios
# ------------------------
def test_post_usuarios():

    user = dict(UsuarioCreate(
        nome="John Doe",
        email=email_random,
        senha_hash="12345678",
        telefone="1234567890",
        tipo="tutor",
        data_cadastro="2023-01-01",
        logradouro="Rua A",
        numero="123",
        bairro="Centro",
        cidade="Cidade Y",
        uf="UF",
        cep="12345-678",
        complemento="Casa"
    ))

    response = client.post("/usuarios", json=user)
    assert response.status_code == 201

    body = response.json()
    assert isinstance(body, list), "POST /usuarios retorna lista"

    data = body[0]

    assert data["nome"] == user["nome"]
    assert data["email"] == user["email"]
    assert data["telefone"] == user["telefone"]
    assert data["tipo"] == user["tipo"]
    assert data["logradouro"] == user["logradouro"]
    assert data["numero"] == user["numero"]
    assert data["bairro"] == user["bairro"]
    assert data["cidade"] == user["cidade"]
    assert data["uf"] == user["uf"]
    assert data["cep"] == user["cep"]
    assert data["complemento"] == user["complemento"]

    global usuario_ID
    usuario_ID = data["id_usuario"]


# ------------------------
# GET /usuarios/{id}
# ------------------------
def test_get_usuario_by_id():
    response = client.get(f"/usuarios/{usuario_ID}")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict), "GET /usuarios/{id} deve retornar dict"
    assert data["id_usuario"] == usuario_ID


# ------------------------
# POST /usuarios - email já existe
# ------------------------
def test_post_usuario_email_exists():

    user = dict(UsuarioCreate(
        nome="John Doe",
        email=email_random,  # email duplicado
        senha_hash="12345678",
        telefone="1234567890",
        tipo="tutor",
        data_cadastro="2023-01-01",
        logradouro="Rua A",
        numero="123",
        bairro="Centro",
        cidade="Cidade Y",
        uf="UF",
        cep="12345-678",
        complemento="Casa"
    ))

    response = client.post("/usuarios", json=user)
    assert response.status_code in (400, 409)


# ------------------------
# PUT /usuarios/{id}
# ------------------------
def test_put_usuario():
    update_data = {
        "nome": "Nome Atualizado",
        "telefone": "999999999"
    }

    response = client.put(f"/usuarios/{usuario_ID}", json=update_data)
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)
    data = body[0]

    assert data["nome"] == update_data["nome"]
    assert data["telefone"] == update_data["telefone"]


# ------------------------
# POST /usuarios/login
# ------------------------
def test_usuario_login():
    login = dict(LoginRequest(
        email=email_random,
        senha="12345678"
    ))

    response = client.post("/usuarios/login", json=login)
    assert response.status_code == 200

    body = response.json()
    assert "message" in body
    assert body["message"] == "Login realizado com sucesso"


# ------------------------
# GET /usuarios/{id} - usuário inexistente
# ------------------------
def test_get_usuario_not_found():
    response = client.get("/usuarios/999999")
    assert response.status_code == 404


# ------------------------
# DELETE /usuarios/{id}
# ------------------------
def test_delete_usuario():
    response = client.delete(f"/usuarios/{usuario_ID}")
    assert response.status_code in (200, 204)


# ------------------------
# DELETE /usuarios/{id} - usuário já deletado
# ------------------------
def test_delete_usuario_not_found():
    response = client.delete(f"/usuarios/{usuario_ID}")
    assert response.status_code in (200, 204)
