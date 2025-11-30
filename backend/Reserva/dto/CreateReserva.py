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
    valor_total_reserva: Optional[float]
    ja_avaliado_host: Optional[bool] = False
    ja_avaliado_tutor: Optional[bool] = False


class ReservaUpdate(BaseModel):
    id_tutor: Optional[int] = None
    id_anfitriao: Optional[int] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    status: Optional[str] = None       
    pets_tutor: Optional[list[int]] = None
    valor_diaria: Optional[float] = None
    qtd_pets: Optional[int] = None
    qtd_dias: Optional[int] = None
    valor_total_reserva: Optional[float] = None
    ja_avaliado_host: Optional[bool] = None
    ja_avaliado_tutor: Optional[bool] = None