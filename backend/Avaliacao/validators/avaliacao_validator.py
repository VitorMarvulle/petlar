# backend/Avaliacao/validators/avaliacao_validator.py
from fastapi import HTTPException
import requests
from utils.config import SUPABASE_URL, SUPABASE_KEY

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

class AvaliacaoValidator:
    """Classe para validações de negócio relacionadas a avaliações"""
    
    @staticmethod
    def validar_reserva_existe(id_reserva: int) -> dict:
        """Verifica se a reserva existe e retorna seus dados"""
        url = f"{SUPABASE_URL}/rest/v1/reservas?id_reserva=eq.{id_reserva}"
        response = requests.get(url, headers=HEADERS)
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Erro ao buscar reserva")
        
        data = response.json()
        if not data:
            raise HTTPException(status_code=404, detail="Reserva não encontrada")
        
        return data[0]
    
    @staticmethod
    def validar_reserva_concluida(reserva: dict):
        """Verifica se a reserva está concluída"""
        if reserva.get('status') != 'concluida':
            raise HTTPException(
                status_code=400, 
                detail="Apenas reservas concluídas podem ser avaliadas"
            )
    
    @staticmethod
    def validar_participante(id_avaliador: int, id_avaliado: int, reserva: dict):
        """Verifica se avaliador e avaliado participaram da reserva"""
        id_tutor = reserva.get('id_tutor')
        id_anfitriao = reserva.get('id_anfitriao')
        
        # O avaliador deve ser o tutor ou o anfitrião
        if id_avaliador not in [id_tutor, id_anfitriao]:
            raise HTTPException(
                status_code=403, 
                detail="Você não participou desta reserva"
            )
        
        # O avaliado deve ser o outro participante
        if id_avaliado not in [id_tutor, id_anfitriao]:
            raise HTTPException(
                status_code=400, 
                detail="Usuário avaliado não participou desta reserva"
            )
        
        # Avaliador e avaliado não podem ser a mesma pessoa
        if id_avaliador == id_avaliado:
            raise HTTPException(
                status_code=400, 
                detail="Você não pode avaliar a si mesmo"
            )
    
    @staticmethod
    def validar_avaliacao_duplicada(id_reserva: int, id_avaliador: int):
        """Verifica se já existe uma avaliação deste avaliador para esta reserva (RN005)"""
        url = f"{SUPABASE_URL}/rest/v1/avaliacoes?id_reserva=eq.{id_reserva}&id_avaliador=eq.{id_avaliador}"
        response = requests.get(url, headers=HEADERS)
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Erro ao verificar avaliações existentes")
        
        avaliacoes = response.json()
        if avaliacoes:
            raise HTTPException(
                status_code=409, 
                detail="Você já avaliou esta reserva"
            )
    
    @staticmethod
    def validar_nota(nota: int):
        """Valida se a nota está entre 1 e 5"""
        if not 1 <= nota <= 5:
            raise HTTPException(
                status_code=400, 
                detail="A nota deve estar entre 1 e 5"
            )
    
    @classmethod
    def validar_criacao_avaliacao(cls, avaliacao_data: dict) -> dict:
        """
        Valida todas as regras de negócio antes de criar uma avaliação
        Retorna os dados da reserva se válidos
        """
        id_reserva = avaliacao_data.get('id_reserva')
        id_avaliador = avaliacao_data.get('id_avaliador')
        id_avaliado = avaliacao_data.get('id_avaliado')
        nota = avaliacao_data.get('nota')
        
        # 1. Valida nota
        cls.validar_nota(nota)
        
        # 2. Verifica se reserva existe
        reserva = cls.validar_reserva_existe(id_reserva)
        
        # 3. Verifica se reserva está concluída
        cls.validar_reserva_concluida(reserva)
        
        # 4. Verifica se avaliador e avaliado participaram da reserva
        cls.validar_participante(id_avaliador, id_avaliado, reserva)
        
        # 5. Verifica se já existe avaliação (RN005)
        cls.validar_avaliacao_duplicada(id_reserva, id_avaliador)
        
        return reserva