import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HostCardProps } from '../screens/Home';
import { Pet } from '../screens/Registros/AdicionarPet';

export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Home: undefined;
  Filtros: undefined;
  Perfil_Tutor: undefined;
  PerfilHost: { host: HostCardProps };
  Favoritos: undefined;
  InfoAdc: undefined;
  AdicionarPet: { onAddPet: (newPet: Pet) => void };
  Reserva: undefined
  Reserva_Lista: undefined
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;
