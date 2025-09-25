from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioCreate(BaseModel):
    id_usuario: int
    nome: str
    email: EmailStr
    senha_hash: str
    telefone: Optional[str]
    tipo: Optional[str]
    data_cadastro: Optional[str]
    logaduro: Optional[str]
    numero: Optional[str]
    bairro: Optional[str]
    cidade: Optional[str]
    uf: Optional[str]
    cep: Optional[str]
    complemento: Optional[str]