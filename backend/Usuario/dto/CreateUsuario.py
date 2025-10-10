from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha_hash: str
    telefone: Optional[str]
    tipo: Optional[str] = "tutor"
    data_cadastro: Optional[str]
    logradouro: Optional[str]
    numero: Optional[str]
    bairro: Optional[str]
    cidade: Optional[str]
    uf: Optional[str]
    cep: Optional[str]
    complemento: Optional[str]