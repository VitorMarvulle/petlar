from pydantic import BaseModel
from typing import Optional, List

class AnfitriaoCreate(BaseModel):
    id_anfitriao: int  # Referência ao id_usuario
    descricao: Optional[str] = None
    capacidade_maxima: int
    especie: Optional[List[str]] = None  # Array de espécies: cachorro, gato, passaro, silvestre
    tamanho: Optional[str] = None  # Tamanho do espaço: pequeno, medio, grande
    preco: Optional[float] = None  # Preço da diária
    status: Optional[str] = "pendente"

class AnfitriaoUpdate(BaseModel):
    descricao: Optional[str] = None
    capacidade_maxima: Optional[int] = None
    especie: Optional[List[str]] = None
    tamanho: Optional[str] = None
    preco: Optional[float] = None
    status: Optional[str] = None