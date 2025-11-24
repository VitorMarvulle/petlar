from fastapi import APIRouter, HTTPException
import requests
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
from utils.config import SUPABASE_URL, SUPABASE_KEY
from Avaliacao.dto.CreateAvaliacao import AvaliacaoCreate, AvaliacaoUpdate

avaliacao_router = APIRouter(prefix='/avaliacoes', tags=['avaliacao'])

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

@avaliacao_router.get("/", status_code=HTTP_200_OK)
def get_avaliacoes():
    """Retorna todas as avaliações"""
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@avaliacao_router.get("/{id}", status_code=HTTP_200_OK)
def get_avaliacao_by_id(id: int):
    """Retorna uma avaliação específica por ID"""
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_avaliacao=eq.{id}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    data = response.json()
    if not data:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    
    return data[0]

@avaliacao_router.get("/reserva/{id_reserva}", status_code=HTTP_200_OK)
def get_avaliacoes_by_reserva(id_reserva: int):
    """Retorna todas as avaliações de uma reserva específica"""
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_reserva=eq.{id_reserva}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@avaliacao_router.get("/avaliado/{id_avaliado}", status_code=HTTP_200_OK)
def get_avaliacoes_by_avaliado(id_avaliado: int):
    """Retorna todas as avaliações recebidas por um usuário com dados do avaliador"""
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_avaliado=eq.{id_avaliado}&select=*,avaliador:usuarios!id_avaliador(id_usuario,nome,email)"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@avaliacao_router.get("/avaliador/{id_avaliador}", status_code=HTTP_200_OK)
def get_avaliacoes_by_avaliador(id_avaliador: int):
    """Retorna todas as avaliações feitas por um usuário"""
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_avaliador=eq.{id_avaliador}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@avaliacao_router.post("/", status_code=HTTP_201_CREATED)
def create_avaliacao(avaliacao: AvaliacaoCreate):
    """Cria uma nova avaliação (RN005: apenas 1 avaliação por reserva/avaliador)"""
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes"
    response = requests.post(url, json=avaliacao.dict(), headers=HEADERS)

    if response.status_code != 201:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@avaliacao_router.put("/{id}", status_code=HTTP_200_OK)
def update_avaliacao(id: int, avaliacao: AvaliacaoUpdate):
    """Atualiza uma avaliação existente"""
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_avaliacao=eq.{id}"
    
    # Remove campos None do update
    update_data = {k: v for k, v in avaliacao.dict().items() if v is not None}
    
    response = requests.patch(url, json=update_data, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@avaliacao_router.delete("/{id}", status_code=HTTP_204_NO_CONTENT)
def delete_avaliacao_by_id(id: int):
    """Deleta uma avaliação por ID"""
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_avaliacao=eq.{id}"
    response = requests.delete(url, headers=HEADERS)

    if response.status_code not in (200, 204):
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return None