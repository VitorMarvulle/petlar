// src/navigation/index.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import Login from '../screens/Registros/Login';
import Cadastro from '../screens/Registros/Cadastro';
import InfoAdc from '../screens/Registros/InfoAdc';
import Endereco from '../screens/Registros/Endereco';
import AdicionarPet from '../screens/Registros/AdicionarPet';
import Configuracoes from '../screens/Configuracoes';
import Alterar_senha from '../screens/Registros/Alterar_senha';
import Alterar_email from '../screens/Registros/Alterar_email';

import Perfil_Tutor from '../screens/Perfis/Perfil_Tutor';
import Perfil_Host from '../screens/Perfis/Perfil_Host';
import Card_Host from '../screens/Perfis/Card_Host';

import Home from '../screens/Home';
import Home_Host from '../screens/Home_Host';
import Favoritos from '../screens/Favoritos';
import Filtros from '../screens/Filtros'

import Reserva from '../screens/Reserva'
import Reserva_Tutor from '../screens/Reserva_Tutor'
import Reserva_Host from '../screens/Reserva_Host'
import HostAvaliacao from '../screens/Registros/HostAvaliacao'
import TutorAvaliacao from '../screens/Registros/TutorAvaliacao'
import FAQ_Tutor from '../screens/FAQ_Tutor'
import FAQ_Host from '../screens/FAQ_Host'
// import Criar_anuncio from '../screens/Registros/Criar_anuncio'

import CriarAnuncioDetalhes from '../screens/Registros/CriarAnuncioDetalhes'
import InfoHost from '../screens/Registros/InfoHost'


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Endereco" component={Endereco} options={{ headerShown: false }} />
      <Stack.Screen name="Home_Host" component={Home_Host} options={{ headerShown: false }} />
      <Stack.Screen name="Cadastro" component={Cadastro} options={{ headerShown: false }} />
      <Stack.Screen name="Perfil_Tutor" component={Perfil_Tutor} options={{ headerShown: false }} />
      <Stack.Screen name="Perfil_Host" component={Perfil_Host} options={{ headerShown: false }} />
      <Stack.Screen name="Card_Host" component={Card_Host} options={{ headerShown: false }} />
      <Stack.Screen name="Favoritos" component={Favoritos} options={{ headerShown: false }} />
      <Stack.Screen name="InfoAdc" component={InfoAdc} options={{ headerShown: false }} />
      <Stack.Screen name="Filtros" component={Filtros} options={{ headerShown: false }} />
      <Stack.Screen name="AdicionarPet" component={AdicionarPet} options={{ headerShown: false }} />
      <Stack.Screen name="Reserva" component={Reserva} options={{ headerShown: false }} />
      <Stack.Screen name="Reserva_Tutor" component={Reserva_Tutor} options={{ headerShown: false }} />
      <Stack.Screen name="Reserva_Host" component={Reserva_Host} options={{ headerShown: false }} />
      <Stack.Screen name="HostAvaliacao" component={HostAvaliacao} options={{ headerShown: false }} />
      <Stack.Screen name="TutorAvaliacao" component={TutorAvaliacao} options={{ headerShown: false }} />
      <Stack.Screen name="Configuracoes" component={Configuracoes} options={{ headerShown: false }} />
      <Stack.Screen name="Alterar_senha" component={Alterar_senha} options={{ headerShown: false }} />
      <Stack.Screen name="Alterar_email" component={Alterar_email} options={{ headerShown: false }} />
      <Stack.Screen name="FAQ_Tutor" component={FAQ_Tutor} options={{ headerShown: false }} />
      <Stack.Screen name="FAQ_Host" component={FAQ_Host} options={{ headerShown: false }} />
      {/* <Stack.Screen name="Criar_anuncio" component={Criar_anuncio} options={{ headerShown: false }} /> */}
      <Stack.Screen name="CriarAnuncioDetalhes" component={CriarAnuncioDetalhes} options={{ headerShown: false }} />
      <Stack.Screen name="InfoHost" component={InfoHost} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
