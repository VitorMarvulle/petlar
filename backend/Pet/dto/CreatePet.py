# Pet/dto/CreatePet.py
from pydantic import BaseModel
from typing import Optional, List

class PetCreate(BaseModel):
    id_tutor: int
    nome: str
    especie: str  
    raca: Optional[str] = None
    idade: Optional[int] = None
    idade_unidade: Optional[str] = 'ano' 
    peso: Optional[float] = None
    peso_unidade: Optional[str] = 'kg'  
    observacoes: Optional[str] = None
    fotos_urls: Optional[List[str]] = []  

class PetUpdate(BaseModel):
    nome: Optional[str] = None
    especie: Optional[str] = None
    raca: Optional[str] = None
    idade: Optional[int] = None
    idade_unidade: Optional[str] = None
    peso: Optional[float] = None
    peso_unidade: Optional[str] = None
    observacoes: Optional[str] = None
    fotos_urls: Optional[List[str]] = None