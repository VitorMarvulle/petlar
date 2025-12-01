import pytest
from fastapi.testclient import TestClient
from main import app
from Usuario.dto.CreateUsuario import UsuarioCreate, UsuarioUpdate
from Usuario.dto.LoginRequest import LoginRequest
import random
import io

client = TestClient(app)

# Variáveis globais para manter estado entre testes
usuario_ID = None
email_random = f"user{random.randint(10000, 99999)}@example.com"


# =========================================================
# GET /usuarios
# =========================================================
def test_get_usuarios():
    response = client.get("/usuarios")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# =========================================================
# POST /usuarios (SUCESSO)
# =========================================================
def test_post_usuarios():
    global usuario_ID

    user = UsuarioCreate(
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
    )

    response = client.post("/usuarios", json=user.dict())
    assert response.status_code == 201

    data = response.json()[0]
    assert data["email"] == email_random
    assert "id_usuario" in data

    usuario_ID = data["id_usuario"]


# =========================================================
# GET /usuarios/{id} (SUCESSO)
# =========================================================
def test_get_usuario_by_id():
    response = client.get(f"/usuarios/{usuario_ID}")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict)
    assert data["id_usuario"] == usuario_ID


# =========================================================
# POST /usuarios (EMAIL DUPLICADO)
# =========================================================
def test_post_usuario_email_exists():
    user = UsuarioCreate(
        nome="Outro",
        email=email_random,  # email duplicado
        senha_hash="abc123",
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
    )

    response = client.post("/usuarios", json=user.dict())
    assert response.status_code in (400, 409)


# =========================================================
# PUT /usuarios/{id} SUCESSO
# =========================================================
def test_put_usuario():
    update_data = dict(UsuarioUpdate(
        nome="John Updated",
        telefone="9876543210"
    ).dict())

    response = client.put(f"/usuarios/{usuario_ID}", json=update_data)
    assert response.status_code == 200

    data = response.json()[0]
    assert data["nome"] == update_data["nome"]
    assert data["telefone"] == update_data["telefone"]


# =========================================================
# POST /usuarios/login SUCESSO
# =========================================================


def test_usuario_login_success():
    login = LoginRequest(
        email=email_random,
        senha="12345678",
    )

    response = client.post("/usuarios/login", json=login.dict())
    assert response.status_code == 200

    data = response.json()
    assert data["message"] == "Login realizado com sucesso"
    assert data["email"] == email_random


# =========================================================
# POST /usuarios/login FALHA (senha errada)
# =========================================================
def test_usuario_login_wrong_password():
    login = LoginRequest(
        email=email_random,
        senha="senha_errada",
    )

    response = client.post("/usuarios/login", json=login.dict())
    assert response.status_code == 401


# =========================================================
# POST /usuarios/login FALHA (email inexistente)
# =========================================================
def test_usuario_login_nonexistent_email():
    login = LoginRequest(email="naoexiste@example.com", senha="12345678")
    response = client.post("/usuarios/login", json=login.dict())
    assert response.status_code == 401
    assert "Email ou senha incorretos" in response.json()["detail"]


# =========================================================
# GET /usuarios/{id} – INEXISTENTE
# =========================================================
def test_get_usuario_inexistente():
    response = client.get("/usuarios/99999999")
    assert response.status_code == 404


# =========================================================
# POST /usuarios/{id}/foto-perfil
# =========================================================
def test_upload_foto_perfil():
    fake_image = io.BytesIO(b"fake-image-data")

    response = client.post(
        f"/usuarios/{usuario_ID}/foto-perfil",
        files={"arquivo": ("foto.png", fake_image, "image/png")}
    )

    assert response.status_code == 200
    body = response.json()
    assert "foto_perfil_url" in body
    assert body["foto_perfil_url"].startswith("http")


# =========================================================
# POST /usuarios/{id}/foto-perfil – USUÁRIO INEXISTENTE
# =========================================================
def test_upload_foto_perfil_nonexistent():
    fake_image = io.BytesIO(b"fake-image-data")
    response = client.post(
        "/usuarios/99999999/foto-perfil",
        files={"arquivo": ("foto.png", fake_image, "image/png")}
    )
    assert response.status_code == 200


# =========================================================
# GET /usuarios/{id}/favoritos – VAZIO
# =========================================================
def test_get_favoritos_usuario_empty():
    response = client.get(f"/usuarios/{usuario_ID}/favoritos")
    assert response.status_code == 200
    data = response.json()
    assert "anfitrioes_favoritos" in data
    assert isinstance(data["anfitrioes_favoritos"], list)


# =========================================================
# POST /usuarios/{id}/favoritos – ADICIONAR
# =========================================================
def test_add_favorito():
    id_anfitriao = 12345
    response = client.post(f"/usuarios/{usuario_ID}/favoritos/{id_anfitriao}")
    assert response.status_code == 200
    data = response.json()
    assert id_anfitriao in data["anfitrioes_favoritos"]


# =========================================================
# POST /usuarios/{id}/favoritos – ADICIONAR REPETIDO
# =========================================================
def test_add_favorito_repetido():
    id_anfitriao = 12345
    response = client.post(f"/usuarios/{usuario_ID}/favoritos/{id_anfitriao}")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Anfitrião já está nos favoritos"


# =========================================================
# DELETE /usuarios/{id}/favoritos – REMOVER EXISTENTE
# =========================================================
def test_remove_favorito():
    id_anfitriao = 12345
    response = client.delete(
        f"/usuarios/{usuario_ID}/favoritos/{id_anfitriao}")
    assert response.status_code == 200
    data = response.json()
    assert id_anfitriao not in data["anfitrioes_favoritos"]


# =========================================================
# DELETE /usuarios/{id}/favoritos – REMOVER NÃO EXISTENTE
# =========================================================
def test_remove_favorito_not_exists():
    id_anfitriao = 99999
    response = client.delete(
        f"/usuarios/{usuario_ID}/favoritos/{id_anfitriao}")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Anfitrião não está nos favoritos"


# =========================================================
# GET /usuarios/{id}/favoritos – USUÁRIO INEXISTENTE
# =========================================================
def test_get_favoritos_usuario_not_found():
    response = client.get("/usuarios/99999999/favoritos")
    assert response.status_code == 404
    assert "Usuário não encontrado" in response.json()["detail"]


# =========================================================
# DELETE /usuarios/{id} SUCESSO
# =========================================================
def test_delete_usuario():
    response = client.delete(f"/usuarios/{usuario_ID}")
    assert response.status_code in (200, 204)


# =========================================================
# DELETE /usuarios/{id} – JÁ DELETADO
# =========================================================
def test_delete_usuario_not_found():
    response = client.delete(f"/usuarios/{usuario_ID}")
    assert response.status_code in (200, 204)
