from fastapi import APIRouter, HTTPException
import requests
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
from utils.config import SUPABASE_URL, SUPABASE_KEY
from Anfitriao.dto.CreateAnfitriao import AnfitriaoCreate, AnfitriaoUpdate

anfitriao_router = APIRouter(prefix='/anfitrioes', tags=['anfitriao'])

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

@anfitriao_router.get("/", status_code=HTTP_200_OK)
def get_anfitrioes():
    """Retorna todos os anfitriões com dados do usuário"""
    # Join anfitrioes com usuarios para retornar dados completos
    url = f"{SUPABASE_URL}/rest/v1/anfitrioes?select=*,usuarios(id_usuario,nome,email,telefone,cidade,bairro,cep,logradouro,numero,uf,complemento)"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@anfitriao_router.get("/{id}", status_code=HTTP_200_OK)
def get_anfitriao_by_id(id: int):
    """Retorna um anfitrião específico por ID com dados do usuário"""
    url = f"{SUPABASE_URL}/rest/v1/anfitrioes?id_anfitriao=eq.{id}&select=*,usuarios(id_usuario,nome,email,telefone,cidade,bairro,cep,logradouro,numero,uf,complemento)"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    data = response.json()
    if not data:
        raise HTTPException(status_code=404, detail="Anfitrião não encontrado")
    
    return data[0]

@anfitriao_router.get("/status/{status}", status_code=HTTP_200_OK)
def get_anfitrioes_by_status(status: str):
    """Retorna anfitriões filtrados por status (pendente, ativo, inativo, banido) com dados do usuário"""
    url = f"{SUPABASE_URL}/rest/v1/anfitrioes?status=eq.{status}&select=*,usuarios(id_usuario,nome,email,telefone,cidade,bairro,cep,logradouro,numero,uf,complemento)"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@anfitriao_router.post("/", status_code=HTTP_201_CREATED)
def create_anfitriao(anfitriao: AnfitriaoCreate):
    """Cria um novo anfitrião"""
    url = f"{SUPABASE_URL}/rest/v1/anfitrioes"
    response = requests.post(url, json=anfitriao.dict(), headers=HEADERS)

    if response.status_code != 201:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@anfitriao_router.put("/{id}", status_code=HTTP_200_OK)
def update_anfitriao(id: int, anfitriao: AnfitriaoUpdate):
    """Atualiza um anfitrião existente"""
    url = f"{SUPABASE_URL}/rest/v1/anfitrioes?id_anfitriao=eq.{id}"
    
    # Remove campos None do update
    update_data = {k: v for k, v in anfitriao.dict().items() if v is not None}
    
    response = requests.patch(url, json=update_data, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@anfitriao_router.delete("/{id}", status_code=HTTP_204_NO_CONTENT)
def delete_anfitriao_by_id(id: int):
    """Deleta um anfitrião por ID"""
    url = f"{SUPABASE_URL}/rest/v1/anfitrioes?id_anfitriao=eq.{id}"
    response = requests.delete(url, headers=HEADERS)

    if response.status_code not in (200, 204):
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return None