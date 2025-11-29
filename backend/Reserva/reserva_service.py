# backend/Reserva/reserva_service.py

from fastapi import HTTPException
from datetime import datetime, date
from typing import List, Dict
import requests
from utils.config import SUPABASE_URL, SUPABASE_KEY

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}


class ReservaService:
    """
    Service com regras de negócio para validação de reservas
    """

    @staticmethod
    def validar_reserva(
        id_tutor: int,
        id_anfitriao: int,
        data_inicio: date,
        data_fim: date,
        pets_tutor: List[int],
        qtd_pets: int
    ) -> Dict:
        """
        Valida todas as regras de negócio antes de criar uma reserva.
        Retorna dict com 'valido' (bool) e 'mensagem' (str) em caso de erro.
        """
        
        # 1. Validações básicas de datas
        hoje = datetime.now().date()
        
        if data_inicio < hoje:
            return {
                "valido": False,
                "mensagem": "A data de início não pode ser no passado."
            }
        
        if data_fim <= data_inicio:
            return {
                "valido": False,
                "mensagem": "A data de saída deve ser posterior à data de entrada."
            }
        
        if not pets_tutor or qtd_pets == 0:
            return {
                "valido": False,
                "mensagem": "Selecione pelo menos um pet para a reserva."
            }
        
        # 2. Buscar dados do anfitrião
        anfitriao = ReservaService._get_anfitriao(id_anfitriao)
        if not anfitriao:
            return {
                "valido": False,
                "mensagem": "Anfitrião não encontrado."
            }
        
        # 3. Validar status do anfitrião
        if anfitriao.get("status") not in ["ativo", "disponivel"]:
            return {
                "valido": False,
                "mensagem": "Este anfitrião não está disponível para reservas no momento."
            }
        
        # 4. Validar capacidade máxima
        capacidade_maxima = anfitriao.get("capacidade_maxima", 1)
        if qtd_pets > capacidade_maxima:
            return {
                "valido": False,
                "mensagem": f"O anfitrião aceita no máximo {capacidade_maxima} pet(s) por reserva. Você selecionou {qtd_pets}."
            }
        
        # 5. Buscar pets do tutor
        pets = ReservaService._get_pets(pets_tutor)
        if len(pets) != qtd_pets:
            return {
                "valido": False,
                "mensagem": "Alguns pets selecionados não foram encontrados."
            }
        
        # 6. Validar espécies aceitas pelo anfitrião
        especies_aceitas = [e.lower() for e in (anfitriao.get("especie") or [])]
        
        for pet in pets:
            especie_pet = pet.get("especie", "").lower()
            if especie_pet not in especies_aceitas:
                return {
                    "valido": False,
                    "mensagem": f"O anfitrião não aceita a espécie '{pet.get('especie')}' (Pet: {pet.get('nome')}). Aceita apenas: {', '.join(especies_aceitas)}."
                }
        
        # 7. Validar disponibilidade do anfitrião nas datas
        # REGRA: Apenas UMA reserva por vez - não permite múltiplos tutores simultaneamente
        reservas_anfitriao = ReservaService._get_reservas_anfitriao(id_anfitriao)
        conflito_anfitriao = ReservaService._verificar_periodo_ocupado(
            reservas_anfitriao,
            data_inicio,
            data_fim
        )
        
        if conflito_anfitriao:
            return conflito_anfitriao
        
        # 8. Validar se os pets já têm reserva nas datas
        reservas_tutor = ReservaService._get_reservas_tutor(id_tutor)
        conflito_pet = ReservaService._verificar_conflito_pets(
            reservas_tutor,
            data_inicio,
            data_fim,
            pets_tutor,
            pets
        )
        
        if conflito_pet:
            return conflito_pet
        
        # Todas as validações passaram
        return {"valido": True}

    @staticmethod
    def _get_anfitriao(id_anfitriao: int) -> Dict:
        """Busca dados do anfitrião"""
        try:
            url = f"{SUPABASE_URL}/rest/v1/anfitrioes?id_anfitriao=eq.{id_anfitriao}&select=*"
            response = requests.get(url, headers=HEADERS, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else None
            return None
        except Exception as e:
            print(f"Erro ao buscar anfitrião: {e}")
            return None

    @staticmethod
    def _get_pets(pet_ids: List[int]) -> List[Dict]:
        """Busca dados dos pets"""
        try:
            pets = []
            for pet_id in pet_ids:
                url = f"{SUPABASE_URL}/rest/v1/pets?id_pet=eq.{pet_id}"
                response = requests.get(url, headers=HEADERS, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        pets.append(data[0])
            
            return pets
        except Exception as e:
            print(f"Erro ao buscar pets: {e}")
            return []

    @staticmethod
    def _get_reservas_anfitriao(id_anfitriao: int) -> List[Dict]:
        """Busca reservas ativas do anfitrião"""
        try:
            url = f"{SUPABASE_URL}/rest/v1/reservas?id_anfitriao=eq.{id_anfitriao}&status=in.(pendente,confirmada,em_andamento)"
            response = requests.get(url, headers=HEADERS, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"Erro ao buscar reservas do anfitrião: {e}")
            return []

    @staticmethod
    def _get_reservas_tutor(id_tutor: int) -> List[Dict]:
        """Busca reservas ativas do tutor"""
        try:
            url = f"{SUPABASE_URL}/rest/v1/reservas?id_tutor=eq.{id_tutor}&status=in.(pendente,confirmada,em_andamento)"
            response = requests.get(url, headers=HEADERS, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"Erro ao buscar reservas do tutor: {e}")
            return []

    @staticmethod
    def _verificar_periodo_ocupado(
        reservas: List[Dict],
        data_inicio: date,
        data_fim: date
    ) -> Dict:
        """
        Verifica se o anfitrião já possui QUALQUER reserva ativa no período.
        REGRA: Apenas UMA reserva por vez - não permite múltiplos tutores simultaneamente.
        Retorna dict com erro ou None se não houver conflito.
        """
        for reserva in reservas:
            try:
                res_inicio = datetime.fromisoformat(reserva["data_inicio"]).date()
                res_fim = datetime.fromisoformat(reserva["data_fim"]).date()
                
                # Verifica sobreposição de datas
                if ReservaService._datas_sobrepoem(data_inicio, data_fim, res_inicio, res_fim):
                    # Formata as datas da reserva existente para mensagem amigável
                    inicio_formatado = res_inicio.strftime("%d/%m/%Y")
                    fim_formatado = res_fim.strftime("%d/%m/%Y")
                    
                    return {
                        "valido": False,
                        "mensagem": f"O anfitrião já possui uma reserva de {inicio_formatado} até {fim_formatado}. Escolha datas após {fim_formatado}."
                    }
                    
            except (ValueError, KeyError) as e:
                print(f"Erro ao processar reserva: {e}")
                continue
        
        return None  # Sem conflito

    @staticmethod
    def _contar_pets_reservados(
        reservas: List[Dict],
        data_inicio: date,
        data_fim: date
    ) -> int:
        """
        MÉTODO LEGADO - Mantido por compatibilidade mas não é mais usado.
        Agora usamos _verificar_periodo_ocupado() que bloqueia qualquer sobreposição.
        """
        return 0  # Desabilitado

    @staticmethod
    def _verificar_conflito_datas(
        reservas: List[Dict],
        data_inicio: date,
        data_fim: date,
        capacidade_maxima: int
    ) -> bool:
        """
        MÉTODO LEGADO - Mantido por compatibilidade mas não é mais usado.
        Use _contar_pets_reservados() para lógica mais precisa.
        """
        return False  # Desabilitado - validação agora é feita por _contar_pets_reservados

    @staticmethod
    def _verificar_conflito_pets(
        reservas: List[Dict],
        data_inicio: date,
        data_fim: date,
        pets_ids: List[int],
        pets: List[Dict]
    ) -> Dict:
        """
        Verifica se algum pet já está em outra reserva nas datas.
        Retorna dict com erro ou None se não houver conflito.
        """
        for reserva in reservas:
            try:
                res_inicio = datetime.fromisoformat(reserva["data_inicio"]).date()
                res_fim = datetime.fromisoformat(reserva["data_fim"]).date()
                
                # Verifica sobreposição de datas
                if ReservaService._datas_sobrepoem(data_inicio, data_fim, res_inicio, res_fim):
                    # Verifica se algum pet está nesta reserva
                    pets_reserva = reserva.get("pets_tutor", [])
                    pets_em_comum = [pid for pid in pets_ids if pid in pets_reserva]
                    
                    if pets_em_comum:
                        # Busca nome do pet para mensagem mais amigável
                        pet_conflito = next(
                            (p for p in pets if p.get("id_pet") == pets_em_comum[0]),
                            None
                        )
                        nome_pet = pet_conflito.get("nome", "Um dos pets") if pet_conflito else "Um dos pets"
                        
                        return {
                            "valido": False,
                            "mensagem": f"{nome_pet} já está incluído em outra reserva neste período."
                        }
            except (ValueError, KeyError) as e:
                print(f"Erro ao processar reserva do tutor: {e}")
                continue
        
        return None

    @staticmethod
    def _datas_sobrepoem(inicio1: date, fim1: date, inicio2: date, fim2: date) -> bool:
        """Verifica se dois períodos de datas se sobrepõem"""
        return inicio1 < fim2 and inicio2 < fim1