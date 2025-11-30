// petlar\AppPet\src\services\reservaService.ts

import axios from 'axios';
import { 
    ReservaBackend, 
    ReservaCompleta, 
    Anfitriao, 
    Pet, 
    Usuario,
    calculateDays 
} from '../navigation/reservaTypes';

// ⚠️ ATENÇÃO AO IP:
// Use 'http://10.0.2.2:8000' se estiver no Emulador Android.
// Use 'http://localhost:8000' se estiver na Web.
// Use o IP da sua máquina (ex: 192.168.1.X:8000) se estiver em dispositivo físico.
const API_BASE_URL = 'http://localhost:8000'; 

export class ReservaService {

    // =========================================================================
    // 1. BUSCAR RESERVAS PARA O TUTOR (VISÃO: TUTOR VENDO HOST)
    // =========================================================================
    static async getReservasByTutor(id_tutor: number): Promise<ReservaCompleta[]> {
        try {
            const response = await axios.get<ReservaBackend[]>(
                `${API_BASE_URL}/reservas/tutor/${id_tutor}`
            );

            if (!response.data || !Array.isArray(response.data)) return [];

            const reservasCompletas = await Promise.all(
                response.data.map(async (reserva) => {
                    try {
                        return await this.montarReservaTutor(reserva);
                    } catch (error) {
                        console.warn(`Erro ao montar reserva (Tutor) ${reserva.id_reserva}:`, error);
                        return null;
                    }
                })
            );

            return reservasCompletas.filter((r): r is ReservaCompleta => r !== null);
        } catch (error) {
            console.error('Erro ao buscar reservas do tutor:', error);
            return [];
        }
    }

    // =========================================================================
    // 2. BUSCAR RESERVAS PARA O ANFITRIÃO (VISÃO: HOST VENDO TUTOR)
    // =========================================================================
    static async getReservasByHostCompleta(id_anfitriao: number): Promise<ReservaCompleta[]> {
        try {
            const response = await axios.get<ReservaBackend[]>(
                `${API_BASE_URL}/reservas/anfitriao/${id_anfitriao}`
            );

            if (!response.data || !Array.isArray(response.data)) return [];

            const reservasCompletas = await Promise.all(
                response.data.map(async (reserva) => {
                    try {
                        return await this.montarReservaHost(reserva);
                    } catch (error) {
                        console.warn(`Erro ao montar reserva (Host) ${reserva.id_reserva}:`, error);
                        return null;
                    }
                })
            );

            return reservasCompletas.filter((r): r is ReservaCompleta => r !== null);
        } catch (error) {
            console.error('Erro ao buscar reservas do anfitrião:', error);
            return [];
        }
    }

    // =========================================================================
    // 3. ACTIONS: CRIAR E ATUALIZAR STATUS
    // =========================================================================
    
    static async createReserva(reservaData: Omit<ReservaBackend, 'id_reserva'>): Promise<ReservaBackend> {
        try {
            const response = await axios.post<ReservaBackend>(
                `${API_BASE_URL}/reservas/`,
                reservaData
            );
            return response.data;
        } catch (error: any) {
            const msg = error.response?.data?.detail || 'Erro ao criar reserva';
            throw new Error(msg);
        }
    }

    // =========================================================================
    // ATUALIZAR STATUS (Com Log de Erro Melhorado)
    // =========================================================================
    static async updateStatusReserva(id_reserva: number, novoStatus: string): Promise<void> {
        try {
            console.log(`Enviando atualização para reserva ${id_reserva}:`, { status: novoStatus });
            
            await axios.put(`${API_BASE_URL}/reservas/${id_reserva}`, {
                status: novoStatus
            });
            
        } catch (error: any) {
            // Log detalhado para descobrir o motivo do 422
            if (error.response) {
                console.error('Erro 422 Detalhes:', JSON.stringify(error.response.data, null, 2));
                
                // Pega a mensagem de erro específica do backend (ex: "Field required")
                const detail = error.response.data?.detail;
                const msg = Array.isArray(detail) 
                    ? detail.map((d: any) => `${d.loc.join('.')} - ${d.msg}`).join('\n')
                    : detail || 'Erro de validação no servidor';
                    
                throw new Error(msg);
            } else {
                console.error('Erro de conexão ou genérico:', error);
                throw new Error('Falha ao atualizar status da reserva');
            }
        }
    }

    // =========================================================================
    // 4. MÉTODOS DE MONTAGEM (CONVERTE DADOS DO BANCO PARA DADOS DA TELA)
    // =========================================================================

    // Monta o objeto para a tela do TUTOR (precisa de dados do Anfitrião)
    private static async montarReservaTutor(reserva: ReservaBackend): Promise<ReservaCompleta> {
        // Blindagem de Tipos (Converte string para number se necessário)
        const petIds = this.parsePetIds(reserva.pets_tutor);
        const valorTotal = Number(reserva.valor_total_reserva) || 0;

        const anfitriaoData = await this.getAnfitriao(reserva.id_anfitriao);
        const petsData = await this.getPets(petIds);
        const dias = calculateDays(reserva.data_inicio, reserva.data_fim);
        
        return {
            id_reserva: reserva.id_reserva,
            id_tutor: reserva.id_tutor,
            data_inicio: reserva.data_inicio,
            data_fim: reserva.data_fim,
            dias,
            status: reserva.status,
            valor_total_reserva: valorTotal,
            ja_avaliado_tutor: reserva.ja_avaliado_tutor || false,
            ja_avaliado_host: reserva.ja_avaliado_host || false,
            
            anfitriao: {
                id_anfitriao: anfitriaoData.id_anfitriao,
                nome: anfitriaoData.usuarios?.nome || 'Anfitrião',
                localizacao: this.formatarLocalizacao(anfitriaoData.usuarios),
                foto_perfil_url: anfitriaoData.usuarios?.foto_perfil_url, 
                telefone: anfitriaoData.usuarios?.telefone
            },
            pets: petsData,
        };
    }

    // Monta o objeto para a tela do HOST (precisa de dados do Tutor)
    private static async montarReservaHost(reserva: ReservaBackend): Promise<ReservaCompleta> {
        // Blindagem de Tipos (Crucial para corrigir o erro do toFixed)
        const petIds = this.parsePetIds(reserva.pets_tutor);
        const valorTotal = Number(reserva.valor_total_reserva) || 0;

        const tutorData = await this.getUsuario(reserva.id_tutor);
        const petsData = await this.getPets(petIds);
        const dias = calculateDays(reserva.data_inicio, reserva.data_fim);
        
        return {
            id_reserva: reserva.id_reserva,
            id_tutor: reserva.id_tutor,
            data_inicio: reserva.data_inicio,
            data_fim: reserva.data_fim,
            dias,
            status: reserva.status,
            valor_total_reserva: valorTotal,
            ja_avaliado_tutor: reserva.ja_avaliado_tutor || false,
            ja_avaliado_host: reserva.ja_avaliado_host || false,
            
            // Dados Dummy para o anfitrião (já que sou eu mesmo)
            anfitriao: { 
                id_anfitriao: reserva.id_anfitriao, 
                nome: 'Eu', 
                localizacao: '' 
            },

            // Dados do Tutor (Importante para o Host ver)
            tutor: {
                id_usuario: tutorData.id_usuario,
                nome: tutorData.nome,
                localizacao: this.formatarLocalizacao(tutorData),
                foto_perfil_url: tutorData.foto_perfil_url,
                telefone: tutorData.telefone
            },
            pets: petsData,
        };
    }

    // =========================================================================
    // 5. HELPERS (MÉTODOS AUXILIARES DE BUSCA)
    // =========================================================================

    // Garante que o array de pets seja numérico, mesmo que venha ["1", "2"] do banco
    private static parsePetIds(pets: any): number[] {
        if (!pets) return [];
        if (Array.isArray(pets)) {
            return pets.map(id => Number(id)).filter(n => !isNaN(n));
        }
        return [];
    }

    static async getUsuario(id_usuario: number): Promise<Usuario> {
        try {
            const response = await axios.get<Usuario>(`${API_BASE_URL}/usuarios/${id_usuario}`);
            return response.data;
        } catch (error) {
            console.warn(`Usuario ${id_usuario} não encontrado, usando fallback.`);
            return { 
                id_usuario, 
                nome: 'Usuário Desconhecido', 
                email: '', 
                cidade: 'Local não informado' 
            } as Usuario;
        }
    }

    static async getAnfitriao(id_anfitriao: number): Promise<Anfitriao> {
        try {
            const response = await axios.get<Anfitriao>(`${API_BASE_URL}/anfitrioes/${id_anfitriao}`);
            return response.data;
        } catch (error) {
            console.error(`Anfitrião ${id_anfitriao} não encontrado.`);
            return {
                id_anfitriao,
                capacidade_maxima: 0,
                usuarios: { id_usuario: 0, nome: 'Desconhecido', email: '' }
            } as Anfitriao;
        }
    }

    static async getPets(petIds: number[]): Promise<Pet[]> {
        if (!petIds || petIds.length === 0) return [];
        
        const petsPromises = petIds.map(async (petId) => {
            try {
                const response = await axios.get<Pet>(`${API_BASE_URL}/pets/${petId}`);
                return response.data;
            } catch (error) {
                // Se um pet falhar, retorna null para filtrar depois
                return null;
            }
        });
        
        const results = await Promise.all(petsPromises);
        return results.filter((p): p is Pet => p !== null);
    }

    private static formatarLocalizacao(usuario?: any): string {
        if (!usuario) return 'Localização não informada';
        if (usuario.bairro && usuario.cidade) return `${usuario.bairro}, ${usuario.cidade}`;
        if (usuario.cidade) return usuario.cidade;
        return 'Brasil';
    }
}