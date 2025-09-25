from dotenv import load_dotenv
from os import getenv

load_dotenv()

SUPABASE_URL = getenv('SUPABASE_URL')
SUPABASE_KEY = getenv('SUPABASE_KEY')