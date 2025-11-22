# backend\Anfitriao\anfitriao_routes.py
from fastapi import APIRouter, HTTPException, UploadFile, File
import  requests
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
from typing import List
import uuid
from datetime import datetime
from utils.config import SUPABASE_URL, SUPABASE_KEY, bcrypt_context
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

# anfitriao_routes.py – exemplo de endpoint para fotos da área
@anfitriao_router.post("/{id_anfitriao}/fotos-area", status_code=HTTP_200_OK)
async def upload_fotos_area(id_anfitriao: int, arquivos: List[UploadFile] = File(...)):
    """
    Upload de fotos da área do anfitrião para bucket 'area_anfitriao'
    e atualização do campo fotos_urls na tabela anfitrioes.
    """
    if len(arquivos) > 10:
        raise HTTPException(status_code=400, detail="Máximo de 10 fotos permitidas")

    fotos_urls = []

    for arquivo in arquivos:
        conteudo = await arquivo.read()
        extensao = arquivo.filename.split(".")[-1] if "." in arquivo.filename else "jpg"
        nome_arquivo = f"area_{id_anfitriao}_{uuid.uuid4().hex}.{extensao}"
        caminho_storage = f"fotos/{id_anfitriao}/{nome_arquivo}"

        storage_url = f"{SUPABASE_URL}/storage/v1/object/area_anfitriao/{caminho_storage}"
        storage_headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": arquivo.content_type or "image/jpeg",
        }

        storage_response = requests.post(
            storage_url,
            headers=storage_headers,
            data=conteudo,
        )

        if storage_response.status_code not in (200, 201):
            raise HTTPException(
                status_code=storage_response.status_code,
                detail=f"Erro ao fazer upload da imagem: {storage_response.text}",
            )

        foto_url = f"{SUPABASE_URL}/storage/v1/object/public/area_anfitriao/{caminho_storage}"
        fotos_urls.append(foto_url)

    url_update = f"{SUPABASE_URL}/rest/v1/anfitrioes?id_anfitriao=eq.{id_anfitriao}"
    update_data = {"fotos_urls": fotos_urls}

    update_response = requests.patch(url_update, json=update_data, headers=HEADERS)

    if update_response.status_code not in (200, 204):
        raise HTTPException(
            status_code=update_response.status_code,
            detail=f"Erro ao atualizar anfitrião com URLs das fotos: {update_response.text}",
        )

    return {"fotos_totais": fotos_urls}