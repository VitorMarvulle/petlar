from fastapi import APIRouter, HTTPException
import requests
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT
from utils.config import SUPABASE_URL, SUPABASE_KEY
from Reserva.dto.CreateReserva import ReservaCreate, ReservaUpdate

reserva_router = APIRouter(prefix='/reservas', tags=['reserva'])

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

@reserva_router.get("/", status_code=HTTP_200_OK)
def get_reservas():
    """Retorna todas as reservas"""
    url = f"{SUPABASE_URL}/rest/v1/reservas"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@reserva_router.get("/{id}", status_code=HTTP_200_OK)
def get_reserva_by_id(id: int):
    """Retorna uma reserva específica por ID"""
    url = f"{SUPABASE_URL}/rest/v1/reservas?id_reserva=eq.{id}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    data = response.json()
    if not data:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")
    
    return data[0]

@reserva_router.get("/tutor/{id_tutor}", status_code=HTTP_200_OK)
def get_reservas_by_tutor(id_tutor: int):
    """Retorna todas as reservas de um tutor específico"""
    url = f"{SUPABASE_URL}/rest/v1/reservas?id_tutor=eq.{id_tutor}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@reserva_router.get("/anfitriao/{id_anfitriao}", status_code=HTTP_200_OK)
def get_reservas_by_anfitriao(id_anfitriao: int):
    """Retorna todas as reservas de um anfitrião específico"""
    url = f"{SUPABASE_URL}/rest/v1/reservas?id_anfitriao=eq.{id_anfitriao}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@reserva_router.get("/status/{status}", status_code=HTTP_200_OK)
def get_reservas_by_status(status: str):
    """Retorna reservas filtradas por status (pendente, confirmada, concluida, cancelada)"""
    url = f"{SUPABASE_URL}/rest/v1/reservas?status=eq.{status}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@reserva_router.post("/", status_code=HTTP_201_CREATED)
def create_reserva(reserva: ReservaCreate):
    """Cria uma nova reserva (RN004: validar disponibilidade de datas)"""
    url = f"{SUPABASE_URL}/rest/v1/reservas"
    
    # Converte datas para string no formato ISO
    reserva_dict = reserva.dict()
    reserva_dict['data_inicio'] = str(reserva_dict['data_inicio'])
    reserva_dict['data_fim'] = str(reserva_dict['data_fim'])
    
    response = requests.post(url, json=reserva_dict, headers=HEADERS)

    if response.status_code != 201:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@reserva_router.put("/{id}", status_code=HTTP_200_OK)
def update_reserva(id: int, reserva: ReservaUpdate):
    """Atualiza uma reserva existente"""
    url = f"{SUPABASE_URL}/rest/v1/reservas?id_reserva=eq.{id}"
    
    # Remove campos None do update e converte datas
    update_data = {}
    for k, v in reserva.dict().items():
        if v is not None:
            if k in ['data_inicio', 'data_fim']:
                update_data[k] = str(v)
            else:
                update_data[k] = v
    
    response = requests.patch(url, json=update_data, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()

@reserva_router.delete("/{id}", status_code=HTTP_204_NO_CONTENT)
def delete_reserva_by_id(id: int):
    """Deleta uma reserva por ID"""
    url = f"{SUPABASE_URL}/rest/v1/reservas?id_reserva=eq.{id}"
    response = requests.delete(url, headers=HEADERS)

    if response.status_code not in (200, 204):
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return None