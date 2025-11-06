from fastapi import APIRouter, HTTPException
import requests
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
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