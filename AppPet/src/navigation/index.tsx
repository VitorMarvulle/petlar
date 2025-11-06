// src/navigation/index.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import Login from '../screens/Registros/Login';
import Cadastro from '../screens/Registros/Cadastro';
import InfoAdc from '../screens/Registros/InfoAdc';
import AdicionarPet from '../screens/Registros/AdicionarPet';

import Perfil_Tutor from '../screens/Perfis/Perfil_Tutor';
import PerfilHost from '../screens/Perfis/Card_Host';

import Home from '../screens/Home';
import Favoritos from '../screens/Favoritos';
import Filtros from '../screens/Filtros'

import Reserva from '../screens/Reserva'
import Reserva_Lista from '../screens/Reserva_Lista'


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Cadastro" component={Cadastro} options={{ headerShown: false }} />
      <Stack.Screen name="Perfil_Tutor" component={Perfil_Tutor} options={{ headerShown: false }} />
      <Stack.Screen name="PerfilHost" component={PerfilHost} options={{ headerShown: false }} />
      <Stack.Screen name="Favoritos" component={Favoritos} options={{ headerShown: false }} />
      <Stack.Screen name="InfoAdc" component={InfoAdc} options={{ headerShown: false }} />
      <Stack.Screen name="Filtros" component={Filtros} options={{ headerShown: false }} />
      <Stack.Screen name="AdicionarPet" component={AdicionarPet} options={{ headerShown: false }} />
      <Stack.Screen name="Reserva" component={Reserva} options={{ headerShown: false }} />
      <Stack.Screen name="Reserva_Lista" component={Reserva_Lista} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
