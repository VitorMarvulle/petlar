from fastapi import APIRouter, HTTPException, UploadFile, File
import  requests
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
import uuid
from utils.config import SUPABASE_URL, SUPABASE_KEY, bcrypt_context
from Usuario.dto.LoginRequest import LoginRequest  # e LoginResponse se for usar

from Usuario.dto.CreateUsuario import UsuarioCreate, UsuarioUpdate

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

@usuario_router.post("/login", status_code=HTTP_200_OK)
def login_usuario(login_data: LoginRequest):
    """
    Autentica um usuário com email e senha.
    """
    # 1. Buscar usuário pelo email
    url = f"{SUPABASE_URL}/rest/v1/usuarios?email=eq.{login_data.email}"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    usuarios = response.json()

    # 2. Verificar se usuário existe
    if not usuarios:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")

    usuario = usuarios[0]

    # 3. Verificar senha (bcrypt)
    if not bcrypt_context.verify(login_data.senha, usuario["senha_hash"]):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")

    # 4. Montar resposta (sem senha)
    return {
        "id_usuario": usuario["id_usuario"],
        "nome": usuario["nome"],
        "email": usuario["email"],
        "tipo": usuario.get("tipo"),
        "telefone": usuario.get("telefone"),
        "message": "Login realizado com sucesso",
    }

@usuario_router.put("/{id}", status_code=HTTP_200_OK)
def update_usuario(id: int, usuario_update: UsuarioUpdate):
    """
    Atualiza parcialmente os dados de um usuário existente.
    Usado, por exemplo, após o cadastro inicial para completar informações
    na tela InfoAdc (foto de perfil, endereço, etc.).
    """
    url = f"{SUPABASE_URL}/rest/v1/usuarios?id_usuario=eq.{id}"

    # Converte para dict e remove campos None para não sobrescrever com null
    update_data = {k: v for k, v in usuario_update.dict().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")

    response = requests.patch(url, json=update_data, headers=HEADERS)  # PATCH para atualização parcial

    if response.status_code not in (200, 204):
        raise HTTPException(status_code=response.status_code, detail=response.text)

    # Supabase REST com Prefer=return=representation normalmente retorna o registro atualizado
    return response.json()

@usuario_router.post("/{id}/foto-perfil", status_code=HTTP_200_OK)
async def upload_foto_perfil(id: int, arquivo: UploadFile = File(...)):
    """
    Faz upload da foto de perfil do usuário para o bucket 'usuarios'
    no Supabase Storage e atualiza o campo foto_perfil_url na tabela usuarios.
    """
    # 1. Ler conteúdo do arquivo
    conteudo = await arquivo.read()

    # 2. Gerar um nome de arquivo único
    extensao = arquivo.filename.split(".")[-1] if "." in arquivo.filename else "jpg"
    nome_arquivo = f"perfil_{id}_{uuid.uuid4().hex}.{extensao}"
    caminho_storage = f"perfil/{id}/{nome_arquivo}"

    # 3. Upload para o Supabase Storage
    storage_url = f"{SUPABASE_URL}/storage/v1/object/usuarios/{caminho_storage}"

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

    # 4. Montar URL pública (se o bucket estiver público)
    # Formato típico de URL pública:
    # {SUPABASE_URL}/storage/v1/object/public/<nome_bucket>/<caminho>
    foto_perfil_url = f"{SUPABASE_URL}/storage/v1/object/public/usuarios/{caminho_storage}"

    # 5. Atualizar o usuário com a foto_perfil_url
    url_update = f"{SUPABASE_URL}/rest/v1/usuarios?id_usuario=eq.{id}"
    update_data = {"foto_perfil_url": foto_perfil_url}

    update_response = requests.patch(url_update, json=update_data, headers=HEADERS)

    if update_response.status_code not in (200, 204):
        raise HTTPException(
            status_code=update_response.status_code,
            detail=f"Erro ao atualizar usuário com URL da foto: {update_response.text}",
        )

    # 6. Retornar a URL da foto
    return {"foto_perfil_url": foto_perfil_url}