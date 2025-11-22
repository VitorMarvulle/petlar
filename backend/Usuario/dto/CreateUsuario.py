from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha_hash: str
    telefone: Optional[str] = None
    tipo: Optional[str] = "tutor"
    data_cadastro: Optional[str]
    logradouro: Optional[str]
    numero: Optional[str]
    bairro: Optional[str]
    cidade: Optional[str]
    uf: Optional[str]
    cep: Optional[str]
    complemento: Optional[str]
    foto_perfil_url: Optional[str] = None

class UsuarioUpdate(BaseModel):  
    nome: Optional[str] = None  
    email: Optional[EmailStr] = None  
    telefone: Optional[str] = None  
    tipo: Optional[str] = None  
    data_cadastro: Optional[str] = None  
    logradouro: Optional[str] = None  
    numero: Optional[str] = None  
    bairro: Optional[str] = None  
    cidade: Optional[str] = None  
    uf: Optional[str] = None  
    cep: Optional[str] = None  
    complemento: Optional[str] = None  
    foto_perfil_url: Optional[str] = None