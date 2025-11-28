// petlar\AppPet\src\navigation\reservaTypes.ts

// --- TIPAGENS PARA RESERVAS ---

export type ReservaStatus = 'pendente' | 'confirmada' | 'negada' | 'em_andamento' | 'concluida' | 'cancelada';
export type FilterStatus = ReservaStatus | 'todos';

// Mapeamento de status do backend para exibição
export const STATUS_DISPLAY_MAP: Record<ReservaStatus, string> = {
    'pendente': 'Pendente',
    'confirmada': 'Confirmada',
    'negada': 'Negada',
    'em_andamento': 'Em Andamento',
    'concluida': 'Concluída',
    'cancelada': 'Cancelada',
};

// Interface para Pet (do backend)
export interface Pet {
    id_pet: number;
    id_tutor: number;
    nome: string;
    especie?: string;
    raca?: string;
    idade?: number;
    peso?: number;
    sexo?: string;
    castrado?: boolean;
    vacinado?: boolean;
    observacoes?: string;
    fotos_urls?: string[];
}

// Interface para Usuário (do backend)
export interface Usuario {
    id_usuario: number;
    nome: string;
    email: string;
    telefone?: string;
    cidade?: string;
    bairro?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    uf?: string;
    complemento?: string;
    tipo?: string;
}

// Interface para Anfitrião (do backend)
export interface Anfitriao {
    id_anfitriao: number;
    id_usuario: number;
    descricao?: string;
    preco?: number;
    aceita_gatos?: boolean;
    aceita_caes?: boolean;
    tamanho_max_pet?: string;
    tem_quintal?: boolean;
    tem_piscina?: boolean;
    status?: string;
    fotos_urls?: string[];
    usuarios?: Usuario;
}

// Interface para Reserva (do backend)
export interface ReservaBackend {
    id_reserva: number;
    id_tutor: number;
    id_anfitriao: number;
    data_inicio: string;
    data_fim: string;
    status: ReservaStatus;
    pets_tutor: number[];
    valor_total_reserva?: number;
    created_at?: string;
    updated_at?: string;
}

// Interface para Reserva Completa (com dados relacionados)
export interface ReservaCompleta {
    id_reserva: number;
    data_inicio: string;
    data_fim: string;
    dias: number;
    status: ReservaStatus;
    valor_total_reserva: number;
    anfitriao: {
        id_anfitriao: number;
        nome: string;
        localizacao: string;
        foto_perfil?: string;
    };
    pets: Pet[];
}

// --- FUNÇÕES AUXILIARES ---

export const formatCurrency = (value: number): string => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return dateString;
    }
};

export const calculateDays = (dataInicio: string, dataFim: string): number => {
    try {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        const diffTime = Math.abs(fim.getTime() - inicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays || 1;
    } catch (error) {
        console.error('Erro ao calcular dias:', error);
        return 1;
    }
};

export const getStatusColor = (status: ReservaStatus): { backgroundColor: string; textColor: string } => {
    switch (status) {
        case 'pendente':
            return { backgroundColor: '#f3d111ff', textColor: '#353535ff' };
        case 'confirmada':
            return { backgroundColor: '#7AB24E', textColor: '#353535ff' };
        case 'negada':
        case 'cancelada':
            return { backgroundColor: '#d85e38ff', textColor: '#353535ff' };
        case 'em_andamento':
            return { backgroundColor: '#007BFF', textColor: '#353535ff' };
        case 'concluida':
            return { backgroundColor: '#e49030ff', textColor: '#353535ff' };
        default:
            return { backgroundColor: '#6C757D', textColor: '#353535ff' };
    }
};