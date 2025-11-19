from pydantic import BaseModel
from typing import Optional, List

class AnfitriaoCreate(BaseModel):
    id_anfitriao: int 
    descricao: Optional[str] = None
    capacidade_maxima: int
    especie: Optional[List[str]] = None 
    tamanho_pet: Optional[str] = None 
    preco: Optional[float] = None  
    status: Optional[str] = "pendente"
    foto_url: Optional[str] = None

class AnfitriaoUpdate(BaseModel):
    descricao: Optional[str] = None
    capacidade_maxima: Optional[int] = None
    especie: Optional[List[str]] = None
    tamanho_pet: Optional[str] = None
    preco: Optional[float] = None
    status: Optional[str] = None
    foto_url: Optional[str] = None