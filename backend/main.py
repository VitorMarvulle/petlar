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

# Configuração de CORS
origins = [
    "http://localhost:19006",  # Expo Web (ajuste se a porta for outra)
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8081",
    "http://localhost",        # genérico
    "*",                       # durante desenvolvimento, pode deixar * (não é recomendado em produção)
]

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],
    allow_origins=origins,              # ou ["*"] para liberar tudo em dev
    allow_credentials=True,
    allow_methods=["*"],            # GET, POST, PUT, DELETE, OPTIONS, etc
    allow_headers=["*"],            # Headers customizados
)

app.include_router(usuario_router)  
app.include_router(pet_router)  
app.include_router(anfitriao_router)  
app.include_router(reserva_router)  
app.include_router(avaliacao_router)
app.include_router(pergunta_router)
app.include_router(upload_router)