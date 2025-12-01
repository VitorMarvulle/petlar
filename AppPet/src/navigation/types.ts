// AppPet/src/navigation/types.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HostCardProps } from '../screens/Home';

// Definição do tipo Pet movida para cá ou importada para evitar dependência circular, 
// mas para este exemplo, manteremos a referência se o arquivo AdicionarPet exportar, 
// ou definimos 'any' temporariamente se necessário. 
// Idealmente, importe Pet de AdicionarPet ou crie um arquivo types/Pet.ts.
import { Pet } from '../screens/Registros/AdicionarPet'; 

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Endereco: {id_usuario: number};
  Home: { usuario: {  
    id_usuario: number;  
    nome: string;  
    email: string;  
    tipo?: string | null;  
    telefone?: string | null;  
  }};
  Filtros: undefined;
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
  
  // --- ATUALIZADO AQUI ---
  AdicionarPet: { 
    id_tutor: number;
    onAddPet?: (newPet: Pet) => void; // Opcional, pois na edição atualizamos a lista de outra forma
    petParaEditar?: Pet; // Novo parâmetro para passar os dados na edição
  };
  // -----------------------

  Reserva: {
    id_usuario: number;
    id_anfitriao: number;
    preco_diaria?: number;
  };
  Reserva_Lista: undefined;
  Configuracoes: undefined;
  Home_Host: { usuario: {  
    id_usuario: number;  
    nome: string;  
    email: string;  
    tipo?: string | null;  
    telefone?: string | null;  
  }};
  Reserva_Tutor: {usuario?: {
      id_usuario: number;
      nome: string;
      email: string;
      tipo?: string | null;
      telefone?: string | null;
    }};
  Reserva_Host: undefined;
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