// petlar\AppPet\src\services\reservaService.ts
import axios from 'axios';
import { ReservaBackend, ReservaCompleta, Anfitriao, Pet, calculateDays } from '../navigation/reservaTypes';

// ⚠️ CONFIGURE SEU IP AQUI
const API_BASE_URL = 'http://localhost:8000'; // ALTERE PARA SEU IP LOCAL

// --- SERVIÇO DE RESERVAS ---

export class ReservaService {
    
    /**
     * Busca todas as reservas de um tutor específico
     */
    static async getReservasByTutor(id_tutor: number): Promise<ReservaCompleta[]> {
        try {
            console.log(`[ReservaService] Buscando reservas do tutor ${id_tutor}...`);
            
            // 1. Buscar reservas do tutor
            const reservasResponse = await axios.get<ReservaBackend[]>(
                `${API_BASE_URL}/reservas/tutor/${id_tutor}`,
                { timeout: 10000 }
            );

            console.log(`[ReservaService] ${reservasResponse.data.length} reservas encontradas`);

            if (!reservasResponse.data || reservasResponse.data.length === 0) {
                return [];
            }

            // 2. Para cada reserva, buscar dados relacionados
            const reservasCompletas = await Promise.all(
                reservasResponse.data.map(async (reserva) => {
                    try {
                        return await this.montarReservaCompleta(reserva);
                    } catch (error) {
                        console.error(`[ReservaService] Erro ao montar reserva ${reserva.id_reserva}:`, error);
                        return null;
                    }
                })
            );

            // 3. Filtrar reservas que falharam
            const reservasValidas = reservasCompletas.filter(
                (reserva): reserva is ReservaCompleta => reserva !== null
            );

            console.log(`[ReservaService] ${reservasValidas.length} reservas montadas com sucesso`);
            return reservasValidas;

        } catch (error: any) {
            console.error('[ReservaService] Erro ao buscar reservas:', error);
            
            if (error.code === 'ECONNABORTED') {
                throw new Error('Tempo de conexão esgotado. Verifique se o backend está rodando.');
            }
            
            if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                throw new Error('Erro de conexão. Verifique o IP da API e se o backend está rodando.');
            }
            
            throw new Error(error.response?.data?.detail || 'Erro ao carregar reservas');
        }
    }

    /**
     * Monta uma reserva completa com todos os dados relacionados
     */
    private static async montarReservaCompleta(reserva: ReservaBackend): Promise<ReservaCompleta> {
        // Buscar dados do anfitrião
        const anfitriaoData = await this.getAnfitriao(reserva.id_anfitriao);
        
        // Buscar dados dos pets
        const petsData = await this.getPets(reserva.pets_tutor);
        
        // Calcular dias
        const dias = calculateDays(reserva.data_inicio, reserva.data_fim);
        
        // Calcular preço total (se não vier do backend)
        const preco_diaria = anfitriaoData.preco || 65;
        const valor_total_reserva = reserva.valor_total_reserva || (preco_diaria * dias * petsData.length);
        
        // Montar objeto completo
        const reservaCompleta: ReservaCompleta = {
            id_reserva: reserva.id_reserva,
            data_inicio: reserva.data_inicio,
            data_fim: reserva.data_fim,
            dias,
            status: reserva.status,
            valor_total_reserva,
            anfitriao: {
                id_anfitriao: anfitriaoData.id_anfitriao,
                nome: anfitriaoData.usuarios?.nome || 'Anfitrião',
                localizacao: this.formatarLocalizacao(anfitriaoData.usuarios),
                foto_perfil: anfitriaoData.fotos_urls?.[0],
            },
            pets: petsData,
        };

        return reservaCompleta;
    }

    /**
     * Busca dados de um anfitrião
     */
    private static async getAnfitriao(id_anfitriao: number): Promise<Anfitriao> {
        try {
            console.log(`[ReservaService] Buscando anfitrião ${id_anfitriao}...`);
            
            const response = await axios.get<Anfitriao>(
                `${API_BASE_URL}/anfitrioes/${id_anfitriao}`,
                { timeout: 5000 }
            );

            return response.data;
        } catch (error: any) {
            console.error(`[ReservaService] Erro ao buscar anfitrião ${id_anfitriao}:`, error);
            
            // Retornar dados mockados em caso de erro
            return {
                id_anfitriao,
                id_usuario: 0,
                preco_diaria: 65,
                usuarios: {
                    id_usuario: 0,
                    nome: 'Anfitrião Indisponível',
                    email: '',
                    bairro: 'Localização não disponível',
                },
            };
        }
    }

    /**
     * Busca dados de múltiplos pets
     */
    private static async getPets(petIds: number[]): Promise<Pet[]> {
        if (!petIds || petIds.length === 0) {
            return [];
        }

        const petsPromises = petIds.map(async (petId) => {
            try {
                console.log(`[ReservaService] Buscando pet ${petId}...`);
                
                const response = await axios.get<Pet>(
                    `${API_BASE_URL}/pets/${petId}`,
                    { timeout: 5000 }
                );

                return response.data;
            } catch (error) {
                console.error(`[ReservaService] Erro ao buscar pet ${petId}:`, error);
                
                // Retornar dados mockados em caso de erro
                return {
                    id_pet: petId,
                    id_tutor: 0,
                    nome: 'Pet Indisponível',
                    fotos_urls: [],
                };
            }
        });

        const pets = await Promise.all(petsPromises);
        return pets;
    }

    /**
     * Formata a localização do usuário
     */
    private static formatarLocalizacao(usuario?: any): string {
        if (!usuario) {
            return 'Localização não informada';
        }

        if (usuario.bairro && usuario.cidade) {
            return `${usuario.bairro}, ${usuario.cidade}`;
        }

        if (usuario.bairro) {
            return usuario.bairro;
        }

        if (usuario.cidade) {
            return usuario.cidade;
        }

        return 'Localização não informada';
    }

    /**
     * Busca reservas por status
     */
    static async getReservasByStatus(status: string): Promise<ReservaBackend[]> {
        try {
            const response = await axios.get<ReservaBackend[]>(
                `${API_BASE_URL}/reservas/status/${status}`,
                { timeout: 10000 }
            );

            return response.data;
        } catch (error: any) {
            console.error('[ReservaService] Erro ao buscar reservas por status:', error);
            throw new Error(error.response?.data?.detail || 'Erro ao carregar reservas');
        }
    }

    /**
     * Cria uma nova reserva
     */
    static async createReserva(reservaData: Omit<ReservaBackend, 'id_reserva'>): Promise<ReservaBackend> {
        try {
            const response = await axios.post<ReservaBackend>(
                `${API_BASE_URL}/reservas/`,
                reservaData,
                { timeout: 10000 }
            );

            return response.data;
        } catch (error: any) {
            console.error('[ReservaService] Erro ao criar reserva:', error);
            throw new Error(error.response?.data?.detail || 'Erro ao criar reserva');
        }
    }

    /**
     * Atualiza uma reserva existente
     */
    static async updateReserva(id_reserva: number, updateData: Partial<ReservaBackend>): Promise<ReservaBackend> {
        try {
            const response = await axios.put<ReservaBackend>(
                `${API_BASE_URL}/reservas/${id_reserva}`,
                updateData,
                { timeout: 10000 }
            );

            return response.data;
        } catch (error: any) {
            console.error('[ReservaService] Erro ao atualizar reserva:', error);
            throw new Error(error.response?.data?.detail || 'Erro ao atualizar reserva');
        }
    }

    /**
     * Deleta uma reserva
     */
    static async deleteReserva(id_reserva: number): Promise<void> {
        try {
            await axios.delete(
                `${API_BASE_URL}/reservas/${id_reserva}`,
                { timeout: 10000 }
            );
        } catch (error: any) {
            console.error('[ReservaService] Erro ao deletar reserva:', error);
            throw new Error(error.response?.data?.detail || 'Erro ao deletar reserva');
        }
    }
}