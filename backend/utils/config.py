from dotenv import load_dotenv
from os import getenv
from passlib.context import CryptContext

load_dotenv()

SUPABASE_URL = getenv('SUPABASE_URL')
SUPABASE_KEY = getenv('SUPABASE_KEY')

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
