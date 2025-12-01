import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, RootStackScreenProps } from '../navigation/types';

// --- CONSTANTES DE ESTILO ---
const GREEN_DARK = '#556A44'; 
const GREEN_MEDIUM = '#7AB24E'; 
const GREEN_LIGHT = '#B3D18C'; 
const BG_INNER = '#FFF6E2'; 
const BG_INNER_WHITE = '#FFFFFF'; 
const RED_ALERT = '#FF6347';
const FOOTER_TEXT_COLOR = GREEN_DARK;

const ICON_LOGO_BRANCO = require('../../assets/icons/LogoBranco.png');
const API_BASE_URL = 'http://localhost:8000'; // Ajuste conforme seu IP se necessário

// Tipo de navegação e props
type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Configuracoes'>;
type Props = RootStackScreenProps<'Configuracoes'>;

// --- COMPONENTE CUSTOMIZADO: LINHA DE CONFIGURAÇÃO ---
interface SettingItemProps {
  label: string;
  subLabel: string;
  onPress: () => void;
  showArrow?: boolean;
}

const SettingItem = ({ label, subLabel, onPress, showArrow = true }: SettingItemProps) => (
  <TouchableOpacity style={settingsStyles.settingItem} onPress={onPress}>
    <View>
      <Text style={settingsStyles.settingLabel}>{label}</Text>
      <Text style={settingsStyles.settingSubLabel}>{subLabel}</Text>
    </View>
    {showArrow && <Text style={settingsStyles.arrowIcon}>&gt;</Text>}
  </TouchableOpacity>
);

// --- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ---
interface DeleteModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteConfirmationModal = ({ isVisible, onClose, onConfirm, isLoading }: DeleteModalProps) => (
  <Modal transparent visible={isVisible} animationType="fade">
    <View style={settingsStyles.modalOverlay}>
      <View style={settingsStyles.modalContainer}>
        <Text style={settingsStyles.modalTitle}>Excluir Conta</Text>
        <Text style={settingsStyles.modalMessage}>
          Você tem certeza que deseja excluir permanentemente sua conta? 
          Esta ação é irreversível.
        </Text>

        <View style={settingsStyles.modalButtonRow}>
          <TouchableOpacity style={[settingsStyles.modalButton, settingsStyles.modalButtonCancel]} onPress={onClose} disabled={isLoading}>
            <Text style={[settingsStyles.modalButtonText, {color: GREEN_DARK}]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[settingsStyles.modalButton, settingsStyles.modalButtonConfirm]} onPress={onConfirm} disabled={isLoading}>
            <Text style={settingsStyles.modalButtonText}>{isLoading ? 'Excluindo...' : 'Excluir'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// --- HEADER LOGO ---
const HeaderLogo = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity style={settingsStyles.headerLogoContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={settingsStyles.logoImageWrapper}>
        <Image source={ICON_LOGO_BRANCO} style={settingsStyles.logoImage} resizeMode="contain" />
      </View>
      <Text style={settingsStyles.logoText}>PetLar</Text>
    </TouchableOpacity>
);

// --- TELA PRINCIPAL DE CONFIGURAÇÕES ---
export default function Configuracoes() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const route = useRoute<Props['route']>();
  const { usuario } = route.params;

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); 
  const [loadingDelete, setLoadingDelete] = useState(false);

  // --- LÓGICA DE PERFIL ---
  const handleProfileNavigation = () => {
    if (!usuario) return;

    if (usuario.tipo === 'anfitriao' || usuario.tipo === 'host') {
      // Cria uma estrutura básica de host baseada no usuário logado para não quebrar a tela de Perfil Host
      const mockHostData = {
        name: usuario.nome,
        location: `${usuario.cidade || ''}, ${usuario.uf || ''}`,
        price: '0', 
        imageUri: usuario.foto_perfil_url || '',
        petsAccepted: [],
        rating: 'Novo',
        rawData: { usuarios: usuario, id_anfitriao: usuario.id_usuario } // Passando dados necessários
      };
      navigation.navigate('Perfil_Host', { host: mockHostData as any });
    } else {
      // Redirecionamento para Tutor
      navigation.navigate('Perfil_Tutor', { id_usuario: usuario.id_usuario });
    }
  };

  // --- LÓGICA DE EXCLUSÃO DE CONTA ---
  const handleDeleteAccount = async () => {
    try {
      setLoadingDelete(true);
      const response = await fetch(`${API_BASE_URL}/usuarios/${usuario.id_usuario}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
      });

      if (response.ok || response.status === 204) {
        setIsDeleteModalVisible(false);
        Alert.alert('Conta Excluída', 'Sua conta foi removida com sucesso.', [
            { text: 'OK', onPress: () => handleLogout() }
        ]);
      } else {
        Alert.alert('Erro', 'Não foi possível excluir a conta. Tente novamente.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
    } finally {
      setLoadingDelete(false);
    }
  };

  // --- LÓGICA DE LOGOUT ---
  const handleLogout = async () => {
    try {
        await AsyncStorage.clear();
        // Reseta a navegação para a tela de Login, impedindo voltar
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    } catch (e) {
        console.error("Erro ao sair", e);
    }
  };

  const handleLogoPress = () => {
      navigation.goBack();
  };

  return (
    <SafeAreaView style={settingsStyles.container}>
      
      <HeaderLogo onPress={handleLogoPress} />

      <ScrollView contentContainerStyle={settingsStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={settingsStyles.innerContainer}>
          
          <Text style={settingsStyles.headerTitle}>Configurações</Text>
          
          {/* SEÇÃO: Informações do Perfil */}
          <View style={settingsStyles.card}>
            <SettingItem
              label="Informações do perfil"
              subLabel="Visualizar seu perfil público"
              onPress={handleProfileNavigation}
            />
          </View>
          
          {/* SEÇÃO: Acesso à segurança */}
          <View style={settingsStyles.card}>
            <SettingItem
              label="Alterar senha"
              subLabel="Aumente a segurança da sua conta"
              onPress={() => navigation.navigate('Alterar_senha')}
            />
            <View style={settingsStyles.separator} />
            <SettingItem
              label="Endereço de e-mail"
              subLabel="Mude o e-mail cadastrado"
              onPress={() => navigation.navigate('Alterar_email')}
            />
          </View>

          {/* SEÇÃO: Gerenciamento de conta */}
          <View style={settingsStyles.card}>
            <SettingItem
              label="Excluir conta"
              subLabel="Esta ação é irreversível"
              onPress={() => setIsDeleteModalVisible(true)}
              showArrow={true}
            />
          </View>

          {/* BOTÃO SAIR (LOGOUT) */}
          <TouchableOpacity style={settingsStyles.logoutButton} onPress={handleLogout}>
            <Text style={settingsStyles.logoutButtonText}>Sair da conta</Text>
          </TouchableOpacity>
          
        </View>
        
        {/* Footer */}
        <View style={settingsStyles.footer}>
          <Text style={settingsStyles.footerText}>Como funciona? | Quero ser host!</Text>
        </View>
        
      </ScrollView>

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmationModal
        isVisible={isDeleteModalVisible}
        isLoading={loadingDelete}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleDeleteAccount}
      />

    </SafeAreaView>
  );
}

const settingsStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: GREEN_LIGHT,
  }, 
  scrollContainer: { 
    flexGrow: 1,
    paddingBottom: 40,
  },
  innerContainer: { 
    flex: 1, 
    marginHorizontal: 12, 
    marginTop: 100, 
    marginBottom: 4, 
    backgroundColor: BG_INNER_WHITE, 
    borderRadius: 40, 
    paddingHorizontal: 20, 
    paddingVertical: 28,
  }, 
  headerTitle: {
    fontSize: 26, 
    fontWeight: '800', 
    color: GREEN_DARK, 
    marginBottom: 30, 
    textAlign: 'center',
  },
  
  // --- HEADER LOGO STYLES ---
  headerLogoContainer: {
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  logoImageWrapper: {
    width: 60,
    height: 60,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  card: {
    backgroundColor: BG_INNER, 
    borderRadius: 15,
    borderWidth: 2,
    borderColor: GREEN_LIGHT, 
    marginBottom: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN_DARK,
    marginBottom: 2,
  },
  settingSubLabel: {
    fontSize: 13,
    color: GREEN_DARK,
    opacity: 0.8,
  },
  separator: {
    height: 2,
    backgroundColor: GREEN_LIGHT,
    marginHorizontal: 15,
  },
  arrowIcon: {
    fontSize: 20,
    color: GREEN_MEDIUM,
    fontWeight: '300',
  },
  
  // Estilo do Botão Sair
  logoutButton: {
    backgroundColor: BG_INNER_WHITE,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: RED_ALERT, 
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: RED_ALERT,
  },

  footer: {
    alignItems: 'center', 
    paddingVertical: 20,
  },
  footerText: {
    color: FOOTER_TEXT_COLOR, 
    fontSize: 15, 
    fontWeight: '700', 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: BG_INNER, 
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderWidth: 3,
    borderColor: GREEN_MEDIUM, 
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: GREEN_DARK,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: GREEN_DARK,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#B3D18C',
    borderColor: GREEN_MEDIUM,
  },
  modalButtonConfirm: {
    backgroundColor: RED_ALERT, 
    borderColor: '#CC4C36',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});