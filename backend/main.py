from fastapi import FastAPI
import  requests
from os import getenv
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = getenv('SUPABASE_URL')
SUPABASE_KEY = getenv('SUPABASE_KEY')
app = FastAPI()

@app.get("/usuarios")
def get_usuarios():
    url = f"{SUPABASE_URL}/rest/v1/usuarios"
    headers = {
        "apikey":SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    response = requests.get(url, headers=headers)
    return response.json()