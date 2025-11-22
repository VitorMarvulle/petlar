# Pet/routes/pet_routes.py
from fastapi import APIRouter, HTTPException, UploadFile, File
import requests
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
from typing import List
import uuid
from utils.config import SUPABASE_URL, SUPABASE_KEY
from Pet.dto.CreatePet import PetCreate, PetUpdate

pet_router = APIRouter(prefix='/pets', tags=['pet'])

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

@pet_router.get("/", status_code=HTTP_200_OK)
def get_pets():
    """Retorna todos os pets"""
    url = f"{SUPABASE_URL}/rest/v1/pets"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@pet_router.get("/{id}", status_code=HTTP_200_OK)
def get_pet_by_id(id: int):
    """Retorna um pet específico por ID"""
    url = f"{SUPABASE_URL}/rest/v1/pets?id_pet=eq.{id}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    data = response.json()
    if not data:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    
    return data[0]

@pet_router.get("/tutor/{id_tutor}", status_code=HTTP_200_OK)
def get_pets_by_tutor(id_tutor: int):
    """Retorna todos os pets de um tutor específico"""
    url = f"{SUPABASE_URL}/rest/v1/pets?id_tutor=eq.{id_tutor}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@pet_router.post("/", status_code=HTTP_201_CREATED)
def create_pet(pet: PetCreate):
    """Cria um novo pet"""
    url = f"{SUPABASE_URL}/rest/v1/pets"
    response = requests.post(url, json=pet.dict(), headers=HEADERS)

    if response.status_code != 201:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@pet_router.post("/{id_pet}/fotos", status_code=HTTP_200_OK)
async def upload_fotos_pet(id_pet: int, arquivos: List[UploadFile] = File(...)):
    """
    Faz upload de múltiplas fotos do pet para o bucket 'pets'
    no Supabase Storage e atualiza o campo fotos_urls na tabela pets.
    """
    if len(arquivos) > 10:
        raise HTTPException(status_code=400, detail="Máximo de 10 fotos permitidas")
    
    fotos_urls = []
    
    for arquivo in arquivos:
        # 1. Ler conteúdo do arquivo
        conteudo = await arquivo.read()
        
        # 2. Gerar um nome de arquivo único
        extensao = arquivo.filename.split(".")[-1] if "." in arquivo.filename else "jpg"
        nome_arquivo = f"pet_{id_pet}_{uuid.uuid4().hex}.{extensao}"
        caminho_storage = f"fotos/{id_pet}/{nome_arquivo}"
        
        # 3. Upload para o Supabase Storage
        storage_url = f"{SUPABASE_URL}/storage/v1/object/pets/{caminho_storage}"
        
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
        
        # 4. Montar URL pública
        foto_url = f"{SUPABASE_URL}/storage/v1/object/public/pets/{caminho_storage}"
        fotos_urls.append(foto_url)
    
    # 5. Atualizar o pet com as fotos_urls
    url_update = f"{SUPABASE_URL}/rest/v1/pets?id_pet=eq.{id_pet}"
    update_data = {"fotos_urls": fotos_urls}
    
    update_response = requests.patch(url_update, json=update_data, headers=HEADERS)
    
    if update_response.status_code not in (200, 204):
        raise HTTPException(
            status_code=update_response.status_code,
            detail=f"Erro ao atualizar pet com URLs das fotos: {update_response.text}",
        )
    
    # 6. Retornar as URLs das fotos
    return {"fotos_urls": fotos_urls}

@pet_router.put("/{id}", status_code=HTTP_200_OK)
def update_pet(id: int, pet: PetUpdate):
    """Atualiza um pet existente"""
    url = f"{SUPABASE_URL}/rest/v1/pets?id_pet=eq.{id}"
    
    # Remove campos None do update
    update_data = {k: v for k, v in pet.dict().items() if v is not None}
    
    response = requests.patch(url, json=update_data, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@pet_router.delete("/{id}", status_code=HTTP_204_NO_CONTENT)
def delete_pet_by_id(id: int):
    """Deleta um pet por ID"""
    url = f"{SUPABASE_URL}/rest/v1/pets?id_pet=eq.{id}"
    response = requests.delete(url, headers=HEADERS)

    if response.status_code not in (200, 204):
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return None