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
};
export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;
