// AppPet/src/navigation/types.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HostCardProps } from '../screens/Home';

// Definição do tipo Pet movida para cá ou importada para evitar dependência circular, 
// mas para este exemplo, manteremos a referência se o arquivo AdicionarPet exportar, 
// ou definimos 'any' temporariamente se necessário. 
// Idealmente, importe Pet de AdicionarPet ou crie um arquivo types/Pet.ts.
import { Pet } from '../screens/Registros/AdicionarPet'; 

// Definição da interface dos Filtros para tipagem forte
export interface FiltrosSearch {
  tipo?: string;
  region?: string | null;
  size?: string;
  priceMin?: number;
  priceMax?: number;
  dataEntrada?: string;
  dataSaida?: string;
}

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Endereco: {id_usuario: number};
  Home: { 
    usuario: {  
      id_usuario: number;  
      nome: string;  
      email: string;  
      tipo?: string | null;  
      telefone?: string | null;  
    };
    filtros?: FiltrosSearch; // <--- NOVO
  };
  Filtros: {
    usuario: {
      id_usuario: number;  
      nome: string;  
      tipo?: string | null; 
    }
  };
  Perfil_Tutor: { id_usuario: number };
  Perfil_Host: { host: HostCardProps };
  Card_Host: { 
    host: HostCardProps;
    usuario?: {
      id_usuario: number;
      nome: string;
      email: string;
      tipo?: string | null;
      telefone?: string | null;
    };
  };
  Favoritos: {
    usuario: {
      id_usuario: number;
      nome: string;
      email: string;
      tipo?: string | null;
      telefone?: string | null;
    };
  };
  InfoAdc: { id_usuario: number };
  
  AdicionarPet: { 
    id_tutor: number;
    onAddPet?: (newPet: Pet) => void; 
    petParaEditar?: Pet; 
  };

  Reserva: {
    id_usuario: number;
    id_anfitriao: number;
    preco_diaria?: number;
  };
  Reserva_Lista: undefined;
  Configuracoes: {
    usuario: {
      id_usuario: number;
      nome: string;
      email: string;
      tipo?: string | null;
      telefone?: string | null;
    };
  };
  Home_Host: { 
      usuario: {  
        id_usuario: number;  
        nome: string;  
        email: string;  
        tipo?: string | null;  
        telefone?: string | null;  
      };
      filtros?: FiltrosSearch; // <--- NOVO
    };
  Reserva_Tutor: {usuario?: {
      id_usuario: number;
      nome: string;
      email: string;
      tipo?: string | null;
      telefone?: string | null;
    }};
  Reserva_Host: { 
    usuario: {
      id_usuario: number;
      nome: string;
      email: string;
      tipo?: string | null;
      telefone?: string | null;
    }};
  HostAvaliacao: { reservaId: string };
  TutorAvaliacao: { reservaId: string };
  Alterar_senha: undefined;
  Alterar_email: undefined;
  FAQ_Tutor: {id_anfitriao: number; id_tutor: number};
  FAQ_Host: {id_anfitriao: number};
  InfoHost: { id_usuario: number; hostCriado?: any; fotoPerfilUrl?: string };  
  CriarAnuncioDetalhes: { id_usuario: number; fotoPerfilUrl: string };
  EditarAnuncio: { 
    hostData: any; 
    id_usuario: number;
  };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;