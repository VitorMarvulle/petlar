# backend/main.py (VERSÃO CORRETA)

from fastapi import FastAPI

# --- Esta é a linha que faltava ---
# Aqui você cria a instância do FastAPI e a atribui à variável "app"
# que o Uvicorn está procurando.
app = FastAPI()

# Vamos criar uma rota de teste para ter certeza de que tudo funciona.
# Esta é a rota raiz ("/").
@app.get("/")
def read_root():
    # Esta função será executada quando alguém acessar a URL principal da API.
    return {"message": "Bem-vindo à API do Lar Doce Pet!! Teste Docker!!!"}

# Você pode manter seus prints para ver quando o módulo é carregado, se quiser.
print("Módulo main.py carregado e instância FastAPI criada.")