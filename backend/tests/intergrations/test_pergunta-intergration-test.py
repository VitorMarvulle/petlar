import pytest
from fastapi.testclient import TestClient
from main import app
import random
from datetime import datetime
from Pergunta.dto.CreatePergunta import (
    CreatePergunta,
    CreateResposta,
    PerguntaComResposta,
    RespostaPergunta
)

client = TestClient(app)

# IDs usados entre os testes
ID_PERGUNTA = None
ID_ANFITRIAO = 2
ID_TUTOR = 15


# ---------------------------
# POST /perguntas
# ---------------------------
def test_create_pergunta():
    global ID_PERGUNTA

    payload = dict(CreatePergunta(
        id_tutor=ID_TUTOR,
        id_anfitriao=ID_ANFITRIAO,
        pergunta=f"Pergunta {random.randint(1000, 9999)}"
    ))

    response = client.post("/perguntas", json=payload)
    assert response.status_code == 201, response.text

    body = response.json()

    # Validar o retorno modelo PerguntaComResposta (mesmo que sem resposta)
    assert isinstance(body, dict)
    assert "id_pergunta" in body
    assert body["id_tutor"] == payload["id_tutor"]
    assert body["id_anfitriao"] == payload["id_anfitriao"]
    assert body["pergunta"] == payload["pergunta"]

    ID_PERGUNTA = body["id_pergunta"]
    assert isinstance(ID_PERGUNTA, int)


# ---------------------------
# GET /perguntas/{id}
# ---------------------------
def test_get_pergunta_by_id():
    response = client.get(f"/perguntas/{ID_PERGUNTA}")
    assert response.status_code == 200

    body = PerguntaComResposta(**response.json())

    assert body.id_pergunta == ID_PERGUNTA
    assert body.id_anfitriao == ID_ANFITRIAO
    assert body.resposta is None  # ainda não existe resposta


# ---------------------------
# POST /perguntas/respostas
# ---------------------------
def test_create_resposta_to_question():
    payload = dict(CreateResposta(
        id_pergunta=ID_PERGUNTA,
        id_anfitriao=ID_ANFITRIAO,
        resposta=f"Resposta automática {random.randint(1000, 9999)}"
    ))

    response = client.post("/perguntas/respostas", json=payload)
    assert response.status_code == 201, response.text

    body = response.json()

    resposta_dto = RespostaPergunta(
        id_resposta=body["id_resposta"],
        id_pergunta=body["id_pergunta"],
        id_anfitriao=body["id_anfitriao"],
        resposta=body["resposta"],
        data_envio=body["data_envio"]
    )

    assert resposta_dto.id_pergunta == payload["id_pergunta"]
    assert resposta_dto.id_anfitriao == payload["id_anfitriao"]
    assert resposta_dto.resposta == payload["resposta"]


# ---------------------------
# GET /perguntas/{id} COM RESPOSTA
# ---------------------------
def test_get_pergunta_by_id_with_response():
    response = client.get(f"/perguntas/{ID_PERGUNTA}")
    assert response.status_code == 200

    body = PerguntaComResposta(**response.json())

    assert body.id_pergunta == ID_PERGUNTA
    assert body.resposta is not None
    assert isinstance(body.resposta, dict) or isinstance(
        body.resposta, RespostaPergunta)


# ---------------------------
# GET /perguntas/anfitriao/{id}
# ---------------------------
def test_get_perguntas_by_anfitriao():
    response = client.get(f"/perguntas/anfitriao/{ID_ANFITRIAO}")
    assert response.status_code == 200

    body = response.json()
    assert isinstance(body, list)

    # deve existir a pergunta criada anteriormente
    assert any(p["id_pergunta"] == ID_PERGUNTA for p in body)


# ---------------------------
# GET /perguntas/{id} — NOT FOUND
# ---------------------------
def test_get_pergunta_not_found():
    response = client.get("/perguntas/999999999")  # ID improvável
    assert response.status_code == 500

    data = response.json()
    assert isinstance(data, dict)
    assert "Pergunta não encontrada" in data["detail"]
