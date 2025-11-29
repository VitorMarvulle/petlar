# backend/Avaliacao/routes/avaliacao_routes.py
from fastapi import APIRouter, HTTPException
import requests
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
from utils.config import SUPABASE_URL, SUPABASE_KEY
from Avaliacao.dto.CreateAvaliacao import AvaliacaoCreate, AvaliacaoUpdate
from Avaliacao.validators.avaliacao_validator import AvaliacaoValidator

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
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_avaliado=eq.{id_avaliado}&select=*,avaliador:usuarios!id_avaliador(id_usuario,nome,email,foto_perfil_url)"
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

@avaliacao_router.get("/media/{id_usuario}", status_code=HTTP_200_OK)
def get_media_avaliacoes_usuario(id_usuario: int):
    """Retorna a média de avaliações recebidas por um usuário"""
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_avaliado=eq.{id_usuario}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    avaliacoes = response.json()
    
    if not avaliacoes:
        return {
            "id_usuario": id_usuario,
            "media": 0,
            "total_avaliacoes": 0
        }
    
    total = sum(av['nota'] for av in avaliacoes)
    media = total / len(avaliacoes)
    
    return {
        "id_usuario": id_usuario,
        "media": round(media, 2),
        "total_avaliacoes": len(avaliacoes)
    }

@avaliacao_router.post("/", status_code=HTTP_201_CREATED)
def create_avaliacao(avaliacao: AvaliacaoCreate):
    """
    Cria uma nova avaliação com validações completas
    
    Validações aplicadas:
    - RN005: Apenas 1 avaliação por reserva/avaliador
    - Reserva deve estar concluída
    - Avaliador e avaliado devem ter participado da reserva
    - Nota entre 1 e 5
    """
    # Valida todas as regras de negócio
    AvaliacaoValidator.validar_criacao_avaliacao(avaliacao.dict())
    
    # Se passou por todas as validações, cria a avaliação
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes"
    response = requests.post(url, json=avaliacao.dict(), headers=HEADERS)

    if response.status_code != 201:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@avaliacao_router.put("/{id}", status_code=HTTP_200_OK)
def update_avaliacao(id: int, avaliacao: AvaliacaoUpdate):
    """Atualiza uma avaliação existente"""
    # Valida se a avaliação existe
    url_check = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_avaliacao=eq.{id}"
    response_check = requests.get(url_check, headers=HEADERS)
    
    if response_check.status_code != 200:
        raise HTTPException(status_code=500, detail="Erro ao verificar avaliação")
    
    if not response_check.json():
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    
    # Valida nota se fornecida
    if avaliacao.nota is not None:
        AvaliacaoValidator.validar_nota(avaliacao.nota)
    
    # Remove campos None do update
    update_data = {k: v for k, v in avaliacao.dict().items() if v is not None}
    
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_avaliacao=eq.{id}"
    response = requests.patch(url, json=update_data, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@avaliacao_router.delete("/{id}", status_code=HTTP_204_NO_CONTENT)
def delete_avaliacao_by_id(id: int):
    """Deleta uma avaliação por ID"""
    # Verifica se existe
    url_check = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_avaliacao=eq.{id}"
    response_check = requests.get(url_check, headers=HEADERS)
    
    if response_check.status_code != 200:
        raise HTTPException(status_code=500, detail="Erro ao verificar avaliação")
    
    if not response_check.json():
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    
    # Deleta
    url = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_avaliacao=eq.{id}"
    response = requests.delete(url, headers=HEADERS)

    if response.status_code not in (200, 204):
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return None