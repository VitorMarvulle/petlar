// petlar\AppPet\src\navigation\types.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HostCardProps } from '../screens/Home';
import { Pet } from '../screens/Registros/AdicionarPet';

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Home: { usuario: {  
    id_usuario: number;  
    nome: string;  
    email: string;  
    tipo?: string | null;  
    telefone?: string | null;  
  }};
  Filtros: undefined;
  Perfil_Tutor: undefined;
  Perfil_Host: { host: HostCardProps };
  Card_Host: { host: HostCardProps };
  Favoritos: undefined;
  InfoAdc: { id_usuario: number };
  AdicionarPet: { 
    id_tutor: number; // ADICIONAR
    onAddPet: (newPet: Pet) => void 
  };
  Reserva: undefined;
  Reserva_Lista: undefined;
  Configuracoes: undefined;
  Home_Host: undefined;
  Reserva_Tutor: undefined;
  Reserva_Host: undefined;
  HostAvaliacao: { reservaId: string };
  TutorAvaliacao: { reservaId: string };
  Alterar_senha: undefined;
  Alterar_email: undefined;
  FAQ_Tutor: undefined;
  FAQ_Host: undefined;
  // Criar_anuncio: {  id_usuario: number;  };
  InfoHost: { id_usuario: number; hostCriado?: any; fotoPerfilUrl?: string };  
  CriarAnuncioDetalhes: { id_usuario: number; fotoPerfilUrl: string };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;
