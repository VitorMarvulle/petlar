# backend\Reserva\dto\CreateReserva.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class ReservaCreate(BaseModel):
    id_tutor: int
    id_anfitriao: int
    data_inicio: date
    data_fim: date
    status: Optional[str] = "pendente"
    pets_tutor: List[int] = []
    valor_diaria: float
    qtd_pets: int
    qtd_dias: int
    valor_total_reserva: float

class ReservaUpdate(BaseModel):
    data_inicio: Optional[date]
    data_fim: Optional[date]
    status: Optional[str]
    pets_tutor: Optional[List[int]] = []
    valor_diaria: Optional[float]
    qtd_pets: Optional[int]
    qtd_dias: Optional[int]
    valor_total_reserva:Optional[float] 