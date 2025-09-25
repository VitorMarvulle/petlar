from fastapi import FastAPI

from Usuario.usuario_routes import usuario_router




app = FastAPI()

app.include_router(usuario_router)