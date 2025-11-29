// petlar\AppPet\src\services\reservaService.ts
// SIMPLIFICADO - Validações agora são no Backend

import axios from 'axios';
import { 
    ReservaBackend, 
    ReservaCompleta, 
    Anfitriao, 
    Pet, 
    calculateDays 
} from '../navigation/reservaTypes';

// ⚠️ CONFIGURE SEU IP AQUI
const API_BASE_URL = 'http://localhost:8000'; 

export class ReservaService {
    
    // ==========================================
    // BUSCAR RESERVAS DO TUTOR (Com dados completos)
    // ==========================================
    
    static async getReservasByTutor(id_tutor: number): Promise<ReservaCompleta[]> {
        try {
            const reservasResponse = await axios.get<ReservaBackend[]>(
                `${API_BASE_URL}/reservas/tutor/${id_tutor}`, 
                { timeout: 10000 }
            );

            if (!reservasResponse.data || reservasResponse.data.length === 0) return [];

            const reservasCompletas = await Promise.all(
                reservasResponse.data.map(async (reserva) => {
                    try {
                        return await this.montarReservaCompleta(reserva);
                    } catch (error) {
                        console.error(`Erro ao montar reserva ${reserva.id_reserva}`, error);
                        return null;
                    }
                })
            );

            return reservasCompletas.filter((r): r is ReservaCompleta => r !== null);
        } catch (error: any) {
            this.handleError(error);
            return [];
        }
    }

    // ==========================================
    // BUSCAR RESERVAS DO ANFITRIÃO
    // ==========================================
    
    static async getReservasByAnfitriao(id_anfitriao: number): Promise<ReservaBackend[]> {
        try {
            const response = await axios.get<ReservaBackend[]>(
                `${API_BASE_URL}/reservas/anfitriao/${id_anfitriao}`
            );
            return response.data;
        } catch (error) {
            console.warn('Erro ao buscar reservas do anfitrião:', error);
            return [];
        }
    }

    // ==========================================
    // MONTAR RESERVA COMPLETA (Com dados de anfitrião e pets)
    // ==========================================
    
    private static async montarReservaCompleta(reserva: ReservaBackend): Promise<ReservaCompleta> {
        const anfitriaoData = await this.getAnfitriao(reserva.id_anfitriao);
        const petsData = await this.getPets(reserva.pets_tutor);
        const dias = calculateDays(reserva.data_inicio, reserva.data_fim);
        
        const preco_diaria = anfitriaoData.preco || 65;
        const valor_total_reserva = reserva.valor_total_reserva ?? (preco_diaria * dias * petsData.length);
        
        return {
            id_reserva: reserva.id_reserva,
            id_tutor: reserva.id_tutor,
            data_inicio: reserva.data_inicio,
            data_fim: reserva.data_fim,
            dias,
            status: reserva.status,
            valor_total_reserva,
            anfitriao: {
                id_anfitriao: anfitriaoData.id_anfitriao,
                nome: anfitriaoData.usuarios?.nome || 'Anfitrião',
                localizacao: this.formatarLocalizacao(anfitriaoData.usuarios),
                foto_perfil_url: anfitriaoData.usuarios?.foto_perfil_url || undefined, 
                telefone: anfitriaoData.usuarios?.telefone
            },
            pets: petsData,
        };
    }

    // ==========================================
    // BUSCAR ANFITRIÃO
    // ==========================================
    
    static async getAnfitriao(id_anfitriao: number): Promise<Anfitriao> {
        try {
            const response = await axios.get<Anfitriao>(
                `${API_BASE_URL}/anfitrioes/${id_anfitriao}`
            );
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar anfitrião ${id_anfitriao}`, error);
            // Mock de erro para não quebrar a UI
            return {
                id_anfitriao,
                capacidade_maxima: 1,
                preco: 0,
                usuarios: {
                    id_usuario: 0,
                    nome: 'Desconhecido',
                    email: '',
                    cidade: 'N/A'
                }
            } as Anfitriao;
        }
    }

    // ==========================================
    // BUSCAR PETS
    // ==========================================
    
    static async getPets(petIds: number[]): Promise<Pet[]> {
        if (!petIds || petIds.length === 0) return [];
        
        const petsPromises = petIds.map(async (petId) => {
            try {
                const response = await axios.get<Pet>(`${API_BASE_URL}/pets/${petId}`);
                return response.data;
            } catch (error) {
                console.warn(`Pet ${petId} não encontrado`);
                return null;
            }
        });
        
        const results = await Promise.all(petsPromises);
        return results.filter((p): p is Pet => p !== null);
    }

    // ==========================================
    // CRIAR RESERVA (Validações no Backend)
    // ==========================================
    
    static async createReserva(reservaData: Omit<ReservaBackend, 'id_reserva'>): Promise<ReservaBackend> {
        try {
            const response = await axios.post<ReservaBackend>(
                `${API_BASE_URL}/reservas/`,
                reservaData
            );
            return response.data;
        } catch (error: any) {
            // Backend retorna mensagens de validação detalhadas
            this.handleError(error);
            throw error;
        }
    }

    // ==========================================
    // ATUALIZAR RESERVA
    // ==========================================
    
    static async updateReserva(id: number, data: Partial<ReservaBackend>) {
        try {
            const response = await axios.put(`${API_BASE_URL}/reservas/${id}`, data);
            return response.data;
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }

    // ==========================================
    // DELETAR RESERVA
    // ==========================================
    
    static async deleteReserva(id: number) {
        try {
            return await axios.delete(`${API_BASE_URL}/reservas/${id}`);
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }

    // ==========================================
    // AUXILIARES
    // ==========================================
    
    private static formatarLocalizacao(usuario?: any): string {
        if (!usuario) return 'Localização não informada';
        if (usuario.bairro && usuario.cidade) return `${usuario.bairro}, ${usuario.cidade}`;
        if (usuario.cidade) return usuario.cidade;
        return 'Brasil';
    }

    private static handleError(error: any) {
        if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
            throw new Error('Erro de conexão com o servidor.');
        }
        
        // Backend retorna mensagens de validação no campo 'detail'
        const msg = error.response?.data?.detail || 'Erro na operação de reserva';
        throw new Error(msg);
    }


    // Adicione este método para reutilizar a lógica:
    static async getReservaCompletaById(id_reserva: number): Promise<ReservaCompleta> {
        try {
            const response = await axios.get<ReservaBackend>(
                `${API_BASE_URL}/reservas/${id_reserva}`
            );
            
            return await this.montarReservaCompleta(response.data);
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }
}