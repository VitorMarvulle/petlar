from pydantic import BaseModel
from typing import Optional

class AnfitriaoCreate(BaseModel):
    id_anfitriao: int  # Referência ao id_usuario
    descricao: Optional[str]
    capacidade_maxima: int
    status: Optional[str] = "pendente"

class AnfitriaoUpdate(BaseModel):
    descricao: Optional[str]
    capacidade_maxima: Optional[int]
    status: Optional[str]