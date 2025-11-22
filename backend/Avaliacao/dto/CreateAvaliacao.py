from pydantic import BaseModel, Field
from typing import Optional

class AvaliacaoCreate(BaseModel):
    id_reserva: int
    id_avaliador: int
    id_avaliado: int
    nota: int = Field(..., ge=1, le=5)
    comentario: Optional[str]

class AvaliacaoUpdate(BaseModel):
    nota: Optional[int] = Field(None, ge=1, le=5)
    comentario: Optional[str]