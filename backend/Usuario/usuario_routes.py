from fastapi import APIRouter, Depends, HTTPException
from starlette.status import HTTP_201_CREATED, HTTP_409_CONFLICT
import  requests
from utils.config import SUPABASE_URL, SUPABASE_KEY


usuario_router = APIRouter(prefix='/usuarios', tags=['usuario'])

@usuario_router.get("/")
def get_usuarios():
    url = f"{SUPABASE_URL}/rest/v1/usuarios"
    headers = {
        "apikey":SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    response = requests.get(url, headers=headers)
    return response.json()

