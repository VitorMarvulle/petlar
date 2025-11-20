from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CreatePergunta(BaseModel):
    id_tutor: int
    id_anfitriao: int
    pergunta: str


class RespostaPergunta(BaseModel):
    id_resposta: int
    id_pergunta: int
    id_anfitriao: int
    resposta: str
    data_envio: datetime


class PerguntaComResposta(BaseModel):
    id_pergunta: int
    id_tutor: int
    id_anfitriao: int
    pergunta: str
    data_envio: datetime
    resposta: Optional[RespostaPergunta] = None


class CreateResposta(BaseModel):
    id_pergunta: int
    id_anfitriao: int
    resposta: str
