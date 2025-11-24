from fastapi import APIRouter, HTTPException, status
import requests
from utils.config import SUPABASE_URL, SUPABASE_KEY
from Pergunta.dto.CreatePergunta import CreatePergunta, CreateResposta, PerguntaComResposta

pergunta_router = APIRouter(prefix="/perguntas", tags=["Perguntas"])

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}


# GET all questions for a specific host
@pergunta_router.get("/anfitriao/{id_anfitriao}")
async def get_perguntas_by_anfitriao(id_anfitriao: int):
    """
    Fetch all questions and their answers for a specific host
    """
    try:
        # Buscar todas as perguntas para o anfitrião com respostas relacionadas
        url = f"{SUPABASE_URL}/rest/v1/perguntas?id_anfitriao=eq.{id_anfitriao}&select=*,respostas(*)"
        response = requests.get(url, headers=HEADERS)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erro ao buscar perguntas: {response.text}"
            )

        perguntas = response.json()
        
        # Transformar dados para o formato esperado
        perguntas_with_respostas = []
        for pergunta in perguntas:
            pergunta_data = {
                "id_pergunta": pergunta.get("id_pergunta"),
                "id_tutor": pergunta.get("id_tutor"),
                "id_anfitriao": pergunta.get("id_anfitriao"),
                "pergunta": pergunta.get("pergunta"),
                "data_envio": pergunta.get("data_envio"),
                "resposta": pergunta.get("respostas")[0] if pergunta.get("respostas") and len(pergunta.get("respostas", [])) > 0 else None
            }
            perguntas_with_respostas.append(pergunta_data)

        return perguntas_with_respostas

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar perguntas: {str(e)}"
        )


# GET a single question by ID
@pergunta_router.get("/{id_pergunta}")
async def get_pergunta_by_id(id_pergunta: int):
    """
    Fetch a single question with its answer
    """
    try:
        url = f"{SUPABASE_URL}/rest/v1/perguntas?id_pergunta=eq.{id_pergunta}&select=*,respostas(*)"
        response = requests.get(url, headers=HEADERS)

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erro ao buscar pergunta: {response.text}"
            )

        perguntas = response.json()
        if not perguntas:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pergunta não encontrada"
            )

        pergunta = perguntas[0]
        pergunta_data = {
            "id_pergunta": pergunta.get("id_pergunta"),
            "id_tutor": pergunta.get("id_tutor"),
            "id_anfitriao": pergunta.get("id_anfitriao"),
            "pergunta": pergunta.get("pergunta"),
            "data_envio": pergunta.get("data_envio"),
            "resposta": pergunta.get("respostas")[0] if pergunta.get("respostas") and len(pergunta.get("respostas", [])) > 0 else None
        }

        return pergunta_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar pergunta: {str(e)}"
        )


# POST create a new question
@pergunta_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_pergunta(pergunta: CreatePergunta):
    """
    Create a new question
    """
    try:
        url = f"{SUPABASE_URL}/rest/v1/perguntas"
        response = requests.post(url, json=pergunta.dict(), headers=HEADERS)

        if response.status_code != 201:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erro ao criar pergunta: {response.text}"
            )

        return response.json()[0] if response.json() else {}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar pergunta: {str(e)}"
        )


# POST create a response to a question
@pergunta_router.post("/respostas", status_code=status.HTTP_201_CREATED)
async def create_resposta(resposta: CreateResposta):
    """
    Create a response to a question
    """
    try:
        url = f"{SUPABASE_URL}/rest/v1/respostas"
        response = requests.post(url, json=resposta.dict(), headers=HEADERS)

        if response.status_code != 201:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erro ao criar resposta: {response.text}"
            )

        return response.json()[0] if response.json() else {}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar resposta: {str(e)}"
        )

