from fastapi import APIRouter, HTTPException
import  requests
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
from utils.config import SUPABASE_URL, SUPABASE_KEY, bcrypt_context

from Usuario.dto.CreateUsuario import UsuarioCreate

usuario_router = APIRouter(prefix='/usuarios', tags=['usuario'])

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

@usuario_router.get("/", status_code=HTTP_200_OK)
def get_usuarios():
    url = f"{SUPABASE_URL}/rest/v1/usuarios"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@usuario_router.get("/{id}", status_code=HTTP_200_OK)
def get_usuario_by_id(id: int):
    url = f"{SUPABASE_URL}/rest/v1/usuarios?id_usuario=eq.{id}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    data = response.json()
    return data[0]

@usuario_router.post("/", status_code=HTTP_201_CREATED)
def create_usuario(usuario: UsuarioCreate):
    url = f"{SUPABASE_URL}/rest/v1/usuarios"

    usuario.senha_hash = bcrypt_context.hash(usuario.senha_hash)

    response = requests.post(url, json=usuario.dict(), headers=HEADERS)

    if response.status_code != 201:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@usuario_router.delete("/{id}", status_code=HTTP_204_NO_CONTENT)
def delete_usuario_by_id(id: int):
    url = f"{SUPABASE_URL}/rest/v1/usuarios?id_usuario=eq.{id}"
    response = requests.delete(url, headers=HEADERS)

    if response.status_code not in (200, 204):
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return None