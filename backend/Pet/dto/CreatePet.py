from pydantic import BaseModel
from typing import Optional

class PetCreate(BaseModel):
    id_tutor: int
    nome: str
    especie: str
    raca: Optional[str]
    idade: Optional[int]
    observacoes: Optional[str]

class PetUpdate(BaseModel):
    nome: Optional[str]
    especie: Optional[str]
    raca: Optional[str]
    idade: Optional[int]
    observacoes: Optional[str]