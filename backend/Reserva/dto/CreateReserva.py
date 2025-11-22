from pydantic import BaseModel
from typing import Optional
from datetime import date

class ReservaCreate(BaseModel):
    id_tutor: int
    id_anfitriao: int
    data_inicio: date
    data_fim: date
    status: Optional[str] = "pendente"

class ReservaUpdate(BaseModel):
    data_inicio: Optional[date]
    data_fim: Optional[date]
    status: Optional[str]