from fastapi import FastAPI

from Usuario.usuario_routes import usuario_router
from Avaliacao.avaliacao_routes import avaliacao_router
from Anfitriao.anfitriao_routes import anfitriao_router
from Pet.pet_routes import pet_router
from Reserva.reserva_routes import reserva_router


app = FastAPI(title="Lar Doce Pet API")

app.include_router(usuario_router)  
app.include_router(pet_router)  
app.include_router(anfitriao_router)  
app.include_router(reserva_router)  
app.include_router(avaliacao_router)