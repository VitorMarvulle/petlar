import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Switch, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types'; // Certifique-se de que o caminho está correto

// --- CONSTANTES DE ESTILO REAPROVEITADAS ---
const GREEN_DARK = '#556A44'; // Cor do texto principal
const GREEN_MEDIUM = '#7AB24E'; // Cor principal dos botões/ícones
const GREEN_LIGHT = '#B3D18C'; // Cor de fundo da SafeAreaView/Borda dos cards
const BG_INNER = '#FFF6E2'; // Cor de fundo dos cards (usado no Host Avaliacao)
const BG_INNER_WHITE = '#FFFFFF'; // Fundo do Inner Container
const FOOTER_TEXT_COLOR = GREEN_DARK;

// Tipo de navegação, adaptado do seu código Home.tsx
type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Configuracoes'>;

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

// --- COMPONENTE CUSTOMIZADO: LINHA DE DISPLAY COM SWITCH (Modo Escuro) ---
interface DisplaySettingItemProps {
  label: string;
  isEnabled: boolean;
  toggleSwitch: () => void;
}

const DisplaySettingItem = ({ label, isEnabled, toggleSwitch }: DisplaySettingItemProps) => (
  <View style={[settingsStyles.settingItem, { justifyContent: 'space-between' }]}>
    <Text style={settingsStyles.settingLabel}>{label}</Text>
    <View style={settingsStyles.displaySwitchContainer}>
      <Text style={settingsStyles.displayIcon}>{isEnabled ? '🌙' : '☀️'}</Text>
      <Switch
        trackColor={{ false: GREEN_LIGHT, true: GREEN_MEDIUM }}
        thumbColor={isEnabled ? BG_INNER : BG_INNER}
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
  </View>
);

// --- 1. MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (DUPLO BOTÃO) ---
interface DeleteModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal = ({ isVisible, onClose, onConfirm }: DeleteModalProps) => (
  <Modal transparent visible={isVisible} animationType="fade">
    <View style={settingsStyles.modalOverlay}>
      <View style={settingsStyles.modalContainer}>
        <Text style={settingsStyles.modalTitle}>Excluir Conta</Text>
        <Text style={settingsStyles.modalMessage}>
          Você tem certeza que deseja excluir permanentemente sua conta? 
          Esta ação é irreversível.
        </Text>

        <View style={settingsStyles.modalButtonRow}>
          <TouchableOpacity style={[settingsStyles.modalButton, settingsStyles.modalButtonCancel]} onPress={onClose}>
            <Text style={[settingsStyles.modalButtonText, {color: GREEN_DARK}]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[settingsStyles.modalButton, settingsStyles.modalButtonConfirm]} onPress={onConfirm}>
            <Text style={settingsStyles.modalButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// --- 2. NOVO MODAL DE SUCESSO/ALERTA GERAL (BOTÃO ÚNICO) ---
interface SuccessAlertModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const SuccessAlertModal = ({ isVisible, title, message, onClose }: SuccessAlertModalProps) => (
  <Modal transparent visible={isVisible} animationType="fade">
    <View style={settingsStyles.modalOverlay}>
      <View style={settingsStyles.modalContainer}>
        {/* Ícone de verificação para feedback visual de sucesso */}
        <Text style={settingsStyles.successIcon}>✓</Text> 
        <Text style={settingsStyles.modalTitle}>{title}</Text>
        <Text style={settingsStyles.modalMessage}>{message}</Text>

        <TouchableOpacity 
          style={settingsStyles.modalSuccessButton} 
          onPress={onClose}
        >
          <Text style={settingsStyles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// --- TELA PRINCIPAL DE CONFIGURAÇÕES ---
export default function Configuracoes() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Estado para o modal de exclusão
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); 
  
  // Novo estado para o modal de sucesso/alerta
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({ title: '', message: '' });

  const toggleDarkMode = () => setIsDarkMode(previousState => !previousState);

  const handleAlertClose = (action?: () => void) => {
    setIsSuccessModalVisible(false);
    if (action) action();
  }

  const handleDeleteAccount = () => {
    // Simular a exclusão da conta
    console.log("Conta excluída!");
    setIsDeleteModalVisible(false);

    // Substituindo Alert.alert pelo modal personalizado
    setSuccessModalContent({
      title: "Conta Excluída",
      message: "Sua conta foi excluída com sucesso. Sentiremos sua falta!",
    });
    setIsSuccessModalVisible(true);
  };

  const handleApply = () => {
    console.log("Configurações aplicadas. Modo Escuro:", isDarkMode);
    
    // Substituindo Alert.alert pelo modal personalizado
    setSuccessModalContent({
      title: "Sucesso!",
      message: "As suas configurações foram salvas com êxito.",
    });
    setIsSuccessModalVisible(true);
  };
  
  // Função para navegar, usando a tipagem correta
  const navigateTo = (screenName: keyof RootStackParamList) => {
    // Nota: O tipo 'any' é usado aqui para simplificar a navegação em um ambiente sem a RootStackParamList completa.
    navigation.navigate(screenName as any);
  };

  return (
    <SafeAreaView style={settingsStyles.container}>

      <ScrollView contentContainerStyle={settingsStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={settingsStyles.innerContainer}>
          
          <Text style={settingsStyles.headerTitle}>Configurações</Text>
          
          {/* SEÇÃO: Informações do Perfil */}
          <View style={settingsStyles.card}>
            <SettingItem
              label="Informações do perfil"
              subLabel="Nome, localização e informações"
              onPress={() => navigateTo('Perfil_Tutor')} // Adapte para sua rota de edição de perfil
            />
            <View style={settingsStyles.separator} />
            <SettingItem
              label="Informações do pet"
              subLabel="Adicionar, editar ou remover pets"
              onPress={() => navigateTo('Perfil_Tutor')} // Adapte para sua rota de lista de pets
            />
          </View>
          
          {/* SEÇÃO: Exibição */}
          <View style={settingsStyles.card}>
            <DisplaySettingItem
              label="Modo de Exibição"
              isEnabled={isDarkMode}
              toggleSwitch={toggleDarkMode}
            />
          </View>

          {/* SEÇÃO: Acesso à segurança */}
          <View style={settingsStyles.card}>
            <SettingItem
              label="Alterar senha"
              subLabel="Aumente a segurança da sua conta"
              onPress={() => navigateTo('Alterar_senha')} // Adapte para sua rota de alteração de senha
            />
            <View style={settingsStyles.separator} />
            <SettingItem
              label="Endereço de e-mail"
              subLabel="Mude o e-mail cadastrado"
              onPress={() => navigateTo('Alterar_email')} // Adapte para sua rota de alteração de email
            />
          </View>

          {/* SEÇÃO: Gerenciamento de conta */}
          <View style={settingsStyles.card}>
            <SettingItem
              label="Excluir conta"
              subLabel="Esta ação é irreversível"
              onPress={() => setIsDeleteModalVisible(true)} // Abre o Modal de Exclusão
              showArrow={true} // Mantém a seta para indicar a ação
            />
          </View>

          {/* BOTÃO APLICAR (Ação principal como no protótipo) */}
          <TouchableOpacity style={settingsStyles.applyButton} onPress={handleApply}>
            <Text style={settingsStyles.applyButtonText}>Aplicar</Text>
          </TouchableOpacity>
          
        </View>
        
        {/* Footer (Reaproveitado do seu código Home.tsx) */}
        <View style={settingsStyles.footer}>
          <Text style={settingsStyles.footerText}>Como funciona? | Quero ser host!</Text>
        </View>
        
      </ScrollView>

      
      {/* Modal de Confirmação de Exclusão (Duplo Botão) */}
      <DeleteConfirmationModal
        isVisible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleDeleteAccount}
      />

      {/* NOVO Modal de Sucesso (Botão Único) */}
      <SuccessAlertModal
        isVisible={isSuccessModalVisible}
        title={successModalContent.title}
        message={successModalContent.message}
        onClose={() => handleAlertClose()} // Função para fechar o modal
      />
    </SafeAreaView>
  );
}

// -------------------------------------------------------------------
// ----------------------------- STYLES ------------------------------
// -------------------------------------------------------------------

const settingsStyles = StyleSheet.create({
  // --- Estrutura Geral ---
  container: { 
    flex: 1, 
    backgroundColor: GREEN_LIGHT, // Cor de fundo da Home
  }, 
  scrollContainer: { 
    flexGrow: 1,
    paddingBottom: 40,
  },
  innerContainer: { 
    flex: 1, 
    marginHorizontal: 12, 
    marginTop: 30, 
    marginBottom: 4, 
    backgroundColor: BG_INNER_WHITE, // Fundo branco com borda da cor principal
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
  
  // --- Ícones de Decoração (Adaptados do protótipo) ---
  cornerPawContainer: {
    position: 'absolute',
    top: 30, 
    right: 20, 
    width: 90, 
    height: 90,
    zIndex: 10, 
    opacity: 0.7,
  },
  bottomPawContainer: {
    position: 'absolute',
    bottom: 20, 
    left: 20, 
    width: 90, 
    height: 90,
    zIndex: 10, 
    opacity: 0.7,
  },
  
  // --- Card de Configuração (Baseado no seu HostCard com BG_INNER) ---
  card: {
    backgroundColor: BG_INNER, // Cor Creme dos seus cards
    borderRadius: 15,
    borderWidth: 2,
    borderColor: GREEN_LIGHT, // Borda verde clara
    marginBottom: 20,
    overflow: 'hidden', // Importante para o borderRadius funcionar com os separadores
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
  
  // --- Switch de Exibição ---
  displaySwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  
  // --- Botão Aplicar (Baseado no protótipo) ---
  applyButton: {
    backgroundColor: GREEN_MEDIUM,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 3,
    borderColor: GREEN_LIGHT, // Borda para destaque
    shadowColor: GREEN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // --- Footer ---
  footer: {
    alignItems: 'center', 
    paddingVertical: 20,
  },
  footerText: {
    color: FOOTER_TEXT_COLOR, 
    fontSize: 15, 
    fontWeight: '700', 
  },

  // --- Modal (Base) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: BG_INNER, // Cor Creme dos cards
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderWidth: 3,
    borderColor: GREEN_MEDIUM, // Borda verde médio
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
  // Estilo do botão Cancelar (Modal de Exclusão)
  modalButtonCancel: {
    backgroundColor: '#B3D18C',
    borderColor: GREEN_MEDIUM,
  },
  // Estilo do botão Confirmar (Modal de Exclusão)
  modalButtonConfirm: {
    backgroundColor: '#FF6347', // Vermelho para indicar perigo
    borderColor: '#CC4C36',
  },
  // Estilo do NOVO botão de sucesso (Modal de Sucesso)
  modalSuccessButton: {
    backgroundColor: GREEN_MEDIUM, 
    borderColor: GREEN_DARK, 
    borderWidth: 2,
    paddingHorizontal: 45,
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Ícone de Sucesso
  successIcon: { 
    fontSize: 40,
    color: GREEN_MEDIUM,
    marginBottom: 10,
    fontWeight: 'bold',
  },
});