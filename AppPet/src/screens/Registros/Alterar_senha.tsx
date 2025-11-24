import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types'; 

// --- CONSTANTES DE ESTILO REAPROVEITADAS ---
const GREEN_DARK = '#7a9663ff'; // Cor do texto principal (ajustada pelo usuário)
const GREEN_MEDIUM = '#7AB24E';
const GREEN_LIGHT = '#B3D18C';
const BG_INNER = '#FFF6E2'; // Cor de fundo dos campos de input
const BG_INNER_WHITE = '#FFFFFF'; // Fundo do Inner Container

// Tipo de navegação
type ChangePasswordNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Alterar_senha'>;

// --- MODAL DE ALERTA/ERRO (Atenção / Erro) ---
interface AlertModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  isError?: boolean;
}

const CustomAlertModal = ({ isVisible, title, message, onClose, isError = false }: AlertModalProps) => (
  <Modal transparent visible={isVisible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={isError ? styles.errorIcon : styles.alertIcon}>{isError ? '!' : '⚠'}</Text> 
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity 
          style={isError ? styles.modalErrorButton : styles.modalAlertButton} 
          onPress={onClose}
        >
          <Text style={styles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// --- MODAL DE SUCESSO ---
interface SuccessModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const CustomSuccessModal = ({ isVisible, title, message, onClose }: SuccessModalProps) => (
  <Modal transparent visible={isVisible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.successIcon}>✓</Text> 
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity 
          style={styles.modalSuccessButton} 
          onPress={onClose}
        >
          <Text style={styles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);


export default function ChangePasswordScreen() {
  const navigation = useNavigation<ChangePasswordNavigationProp>();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados dos Modais
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({ title: '', message: '', isError: false });
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  
  const handleAlertClose = () => {
    setIsAlertModalVisible(false);
  };

  const handleSuccessClose = () => {
    setIsSuccessModalVisible(false);
    navigation.goBack();
  };

  const showAlert = (title: string, message: string, isError: boolean = false) => {
    setAlertModalContent({ title, message, isError });
    setIsAlertModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showAlert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert("Erro", "A nova senha e a confirmação não coincidem.", true);
      return;
    }

    setIsLoading(true);
    console.log("Tentativa de alterar senha...");

    // --- Simulação de API ---
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    // -------------------------

    setIsLoading(false);
    
    // Substituindo Alert.alert pelo modal personalizado
    setIsSuccessModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>

          <Text style={styles.headerTitle}>Alterar Senha</Text>

          {/* Senha Atual */}
          <Text style={styles.inputLabel}>Senha Atual</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha atual"
            placeholderTextColor="#A9A9A9"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          
          {/* Nova Senha */}
          <Text style={styles.inputLabel}>Nova Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#A9A9A9"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          {/* Confirmar Nova Senha */}
          <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a nova senha"
            placeholderTextColor="#A9A9A9"
            secureTextEntry
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />

          {/* BOTÃO DE SUBMIT (Salvar) */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Text>
          </TouchableOpacity>
          
          {/* BOTÃO VOLTAR */}
          <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
          >
              <Text style={styles.backButtonText}>
                  Voltar
              </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
      
      {/* Modais Personalizados */}
      <CustomAlertModal
        isVisible={isAlertModalVisible}
        title={alertModalContent.title}
        message={alertModalContent.message}
        onClose={handleAlertClose}
        isError={alertModalContent.isError}
      />
      
      <CustomSuccessModal
        isVisible={isSuccessModalVisible}
        title="Sucesso!"
        message="Sua senha foi alterada com êxito!"
        onClose={handleSuccessClose}
      />
      
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
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
    marginTop: 30, 
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
    marginTop: 40,
    marginBottom: 70, 
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: GREEN_DARK,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    height: 55,
    borderColor: GREEN_LIGHT,
    borderWidth: 2,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 15,
    color: GREEN_DARK,
    backgroundColor: BG_INNER,
  },
  
  // --- Botões de Ação (Reaproveitado do HostAvaliacao) ---
  submitButton: {
    backgroundColor: GREEN_MEDIUM, 
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: GREEN_DARK,
    alignItems: 'center',
    marginTop: 130, // Espaçamento maior para o botão principal
    shadowColor: GREEN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  backButton: {
    marginTop: 15,
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: GREEN_MEDIUM,
  },
  
  // --- MODAL STYLES ---
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
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Icons
  successIcon: { 
    fontSize: 40,
    color: GREEN_MEDIUM, // Green for success
    marginBottom: 10,
    fontWeight: 'bold',
  },
  alertIcon: { 
    fontSize: 40,
    color: '#FFC700', // Yellow/Orange for attention
    marginBottom: 10,
    fontWeight: 'bold',
  },
  errorIcon: { 
    fontSize: 40,
    color: '#FF6347', // Red for error
    marginBottom: 10,
    fontWeight: 'bold',
  },
  // Buttons
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
  modalAlertButton: {
    backgroundColor: GREEN_MEDIUM, // Uses GREEN_MEDIUM for generic OK button
    borderColor: GREEN_DARK, 
    borderWidth: 2,
    paddingHorizontal: 45,
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalErrorButton: {
    backgroundColor: '#FF6347', // Red for error confirmation
    borderColor: '#CC4C36',
    borderWidth: 2,
    paddingHorizontal: 45,
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
});