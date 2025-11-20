import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HostCardProps } from '../screens/Home';
import { Pet } from '../screens/Registros/AdicionarPet';

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Configuracoes: undefined;
  Home: undefined;
  Home_Host: undefined;
  Filtros: undefined;
  Perfil_Tutor: undefined;
  Perfil_Host: { host: HostCardProps };
  Card_Host: { host: HostCardProps };
  Favoritos: undefined;
  InfoAdc: undefined;
  AdicionarPet: { onAddPet: (newPet: Pet) => void };
  Reserva: undefined
  Reserva_Tutor: undefined
  Reserva_Host: undefined
  HostAvaliacao: { reservaId: string };
  TutorAvaliacao: { reservaId: string };
  Alterar_senha: undefined
  Alterar_email: undefined
  FAQ_Tutor: undefined
  FAQ_Host: undefined
  Criar_anuncio: undefined
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;
