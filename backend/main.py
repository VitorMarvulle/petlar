from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Usuario.usuario_routes import usuario_router
from Avaliacao.avaliacao_routes import avaliacao_router
from Anfitriao.anfitriao_routes import anfitriao_router
from Pet.pet_routes import pet_router
from Reserva.reserva_routes import reserva_router
from Pergunta.pergunta_routes import pergunta_router
from Upload.upload_routes import upload_router


app = FastAPI(title="Lar Doce Pet API")

# Configure CORS to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(usuario_router)  
app.include_router(pet_router)  
app.include_router(anfitriao_router)  
app.include_router(reserva_router)  
app.include_router(avaliacao_router)
app.include_router(pergunta_router)
app.include_router(upload_router)