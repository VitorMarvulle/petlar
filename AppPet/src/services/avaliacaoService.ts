// AppPet/src/services/avaliacaoService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Ajuste conforme sua configuração

export interface AvaliacaoCreate {
    id_reserva: number;
    id_avaliador: number;
    id_avaliado: number;
    nota: number;
    comentario?: string;
}

export interface AvaliacaoResponse {
    id_avaliacao: number;
    id_reserva: number;
    id_avaliador: number;
    id_avaliado: number;
    nota: number;
    comentario?: string;
    created_at: string;
}

export class AvaliacaoService {
    /**
     * Cria uma nova avaliação
     */
    static async createAvaliacao(data: AvaliacaoCreate): Promise<AvaliacaoResponse> {
        try {
            const response = await axios.post<AvaliacaoResponse[]>(
                `${API_URL}/avaliacoes/`,
                data
            );
            
            // O Supabase retorna um array, pegamos o primeiro elemento
            return response.data[0];
        } catch (error: any) {
            if (error.response) {
                // Tratamento de erros específicos
                if (error.response.status === 409) {
                    throw new Error('Você já avaliou esta reserva.');
                }
                throw new Error(error.response.data.detail || 'Erro ao criar avaliação.');
            }
            throw new Error('Erro de conexão com o servidor.');
        }
    }

    /**
     * Busca avaliações por reserva
     */
    static async getAvaliacoesByReserva(idReserva: number): Promise<AvaliacaoResponse[]> {
        try {
            const response = await axios.get<AvaliacaoResponse[]>(
                `${API_URL}/avaliacoes/reserva/${idReserva}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.detail || 'Erro ao buscar avaliações.');
            }
            throw new Error('Erro de conexão com o servidor.');
        }
    }

    /**
     * Busca avaliações recebidas por um usuário
     */
    static async getAvaliacoesByAvaliado(idAvaliado: number): Promise<AvaliacaoResponse[]> {
        try {
            const response = await axios.get<AvaliacaoResponse[]>(
                `${API_URL}/avaliacoes/avaliado/${idAvaliado}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.detail || 'Erro ao buscar avaliações.');
            }
            throw new Error('Erro de conexão com o servidor.');
        }
    }

    /**
     * Verifica se o usuário já avaliou uma reserva específica
     */
    static async verificarAvaliacaoExistente(
        idReserva: number, 
        idAvaliador: number
    ): Promise<boolean> {
        try {
            const avaliacoes = await this.getAvaliacoesByReserva(idReserva);
            return avaliacoes.some(av => av.id_avaliador === idAvaliador);
        } catch (error) {
            console.error('Erro ao verificar avaliação existente:', error);
            return false;
        }
    }
}