// petlar\AppPet\src\navigation\reservaTypes.ts

// --- TIPAGENS GERAIS ---

export type ReservaStatus = 'pendente' | 'confirmada' | 'negada' | 'em_andamento' | 'concluida' | 'cancelada';

export const STATUS_DISPLAY_MAP: Record<ReservaStatus, string> = {
    'pendente': 'Pendente',
    'confirmada': 'Confirmada',
    'negada': 'Negada',
    'em_andamento': 'Em Andamento',
    'concluida': 'Concluída',
    'cancelada': 'Cancelada',
};

// --- INTERFACES DO BACKEND (Refletindo Pydantic) ---

// Reflete UsuarioCreate / Update
export interface Usuario {
    id_usuario: number;
    nome: string;
    email: string;
    telefone?: string;
    tipo?: string; // 'tutor' | 'anfitriao'
    data_cadastro?: string;
    // Endereço
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
    complemento?: string;
    foto_perfil_url?: string; // Atualizado
    anfitrioes_favoritos?: number[];
}

// Reflete PetCreate / Update
export interface Pet {
    id_pet: number;
    id_tutor: number;
    nome: string;
    especie: string; // Ex: 'cachorro', 'gato'
    raca?: string;
    idade?: number;
    idade_unidade?: string; // 'ano' | 'mes'
    peso?: number;
    peso_unidade?: string; // 'kg' | 'g'
    observacoes?: string;
    fotos_urls?: string[];
}

// Reflete AnfitriaoCreate / Update
export interface Anfitriao {
    id_anfitriao: number;
    id_usuario?: number; // Pode vir solto ou dentro do objeto usuario
    descricao?: string;
    capacidade_maxima: number; // Novo campo
    especie?: string[]; // Lista de espécies aceitas. Ex: ['cachorro', 'gato']
    tamanho_pet?: string; // Ex: 'pequeno', 'medio', 'grande'
    preco?: number;
    status?: string; // 'ativo', 'inativo', etc.
    fotos_urls?: string[];
    usuarios?: Usuario; // O backend geralmente popula isso no GET
}

// Reflete ReservaBackend
export interface ReservaBackend {
    id_reserva: number;
    id_tutor: number;
    id_anfitriao: number;
    data_inicio: string; // ISO Date String
    data_fim: string;    // ISO Date String
    status: ReservaStatus;
    pets_tutor: number[]; // Lista de IDs dos pets
    valor_total_reserva?: number;
    created_at?: string;
    updated_at?: string;
}

// --- INTERFACE DE UI (Reserva Montada) ---

export interface ReservaCompleta {
    id_reserva: number;
    id_tutor: number;
    data_inicio: string;
    data_fim: string;
    dias: number;
    status: ReservaStatus;
    valor_total_reserva: number;
    anfitriao: {
        id_anfitriao: number;
        nome: string;
        localizacao: string;
        foto_perfil_url?: string;
        telefone?: string;
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
        return dateString;
    }
};

export const calculateDays = (dataInicio: string, dataFim: string): number => {
    try {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        // Zera as horas para calcular apenas dias cheios
        inicio.setHours(0,0,0,0);
        fim.setHours(0,0,0,0);
        
        const diffTime = Math.abs(fim.getTime() - inicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 0 ? 1 : diffDays; // Mínimo de 1 diária
    } catch (error) {
        return 1;
    }
};

export const getStatusColor = (status: ReservaStatus): { backgroundColor: string; textColor: string } => {
    switch (status) {
        case 'pendente': return { backgroundColor: '#f3d111ff', textColor: '#353535ff' };
        case 'confirmada': return { backgroundColor: '#7AB24E', textColor: '#fff' };
        case 'negada':
        case 'cancelada': return { backgroundColor: '#d85e38ff', textColor: '#fff' };
        case 'em_andamento': return { backgroundColor: '#007BFF', textColor: '#fff' };
        case 'concluida': return { backgroundColor: '#e49030ff', textColor: '#fff' };
        default: return { backgroundColor: '#6C757D', textColor: '#fff' };
    }
};