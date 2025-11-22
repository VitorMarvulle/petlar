// petlar\AppPet\src\screens\Registros\Cadastro.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { RootStackScreenProps } from '../../navigation/types';

const PetIcon = () => (
  <View style={styles.logoContainer}>
    <Image
      source={require('../../../assets/icons/PETLOGO.png')}
      style={styles.logoImage}
      resizeMode="contain"
    />
    <Text style={styles.logoText}>Lar Doce Pet</Text>
  </View>
);

export default function RegisterScreen({ navigation }: RootStackScreenProps<'Cadastro'>) {
  const [userType, setUserType] = useState<'tutor' | 'host' | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validações
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Atenção', 'Preencha nome, email e senha');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem');
      return;
    }

    if (!userType) {
      Alert.alert('Atenção', 'Você precisa escolher qual tipo de usuário será!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/usuarios/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.name,
          email: formData.email.trim(),
          senha_hash: formData.password,  // backend vai fazer o hash
          telefone: formData.phone || null,
          tipo: userType,                 // 'tutor' ou 'host'
          data_cadastro: null,
          logradouro: null,
          numero: null,
          bairro: null,
          cidade: null,
          uf: null,
          cep: null,
          complemento: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Erro cadastro:', data);
        throw new Error(data.detail || 'Erro ao cadastrar usuário');
      }

      console.log('Usuário cadastrado:', data);

      Alert.alert(
        'Sucesso',
        'Cadastro realizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
      navigation.navigate('InfoHost', { id_usuario: data[0].id_usuario });
      // data[0] = novo usuário  
      // if (data[0].userType == 'tutor'){
      //   navigation.navigate('InfoAdc', { id_usuario: data[0].id_usuario });
      // // navigation.navigate('InfoAdc');
      // } else{
      //   navigation.navigate('InfoHost', { id_usuario: data[0].id_usuario });
      // }

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      Alert.alert('Erro', error.message || 'Não foi possível cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    console.log('Registro via Google');
    Alert.alert('Em breve', 'Cadastro com Google será implementado em breve!');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <PetIcon />

          <View style={styles.formContainer}>
            <Text style={styles.title}>Hora de criar sua conta!</Text>

            {[
              { label: 'Nome completo do Tutor', field: 'name', keyboardType: 'default', secure: false },
              { label: 'E-mail', field: 'email', keyboardType: 'email-address', secure: false },
              { label: 'Telefone', field: 'phone', keyboardType: 'phone-pad', secure: false },
              { label: 'Senha', field: 'password', keyboardType: 'default', secure: true },
              { label: 'Confirmar senha', field: 'confirmPassword', keyboardType: 'default', secure: true },
            ].map(({ label, field, keyboardType, secure }) => (
              <View key={field} style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData[field]}
                  onChangeText={(value) => handleInputChange(field as keyof typeof formData, value)}
                  placeholder={label}
                  placeholderTextColor="#79b24e62"
                  secureTextEntry={secure}
                  keyboardType={keyboardType as any}
                  autoCapitalize={field === 'email' ? 'none' : 'words'}
                  editable={!loading}
                />
              </View>
            ))}
            
            {/* Escolha do tipo de usuário */}
            <Text style={styles.texto}>Que tipo de usuário gostaria de ser?</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[styles.userTypeOption, userType === 'tutor' && styles.userTypeOptionSelected]}
                onPress={() => setUserType('tutor')}
                disabled={loading}
              >
                <Text style={[styles.userTypeText, userType === 'tutor' && styles.userTypeTextSelected]}>
                  Sou Tutor
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.userTypeOption, userType === 'host' && styles.userTypeOptionSelected]}
                onPress={() => setUserType('host')}
                disabled={loading}
              >
                <Text style={[styles.userTypeText, userType === 'host' && styles.userTypeTextSelected]}>
                  Sou Host
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text style={styles.loginText}>
                <Text style={styles.loginTextNormal}>Já tem uma conta? </Text>
                <Text style={styles.loginTextLink}>Faça login!</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleGoogleRegister}
              disabled={loading}
            >
              <Image
                source={require('../../../assets/icons/google.png')}
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>Continuar com Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Estrutura geral
  container: {
    flex: 1,
    backgroundColor: '#B3D18C',
    paddingHorizontal: 12,
    paddingTop: 30,
    paddingBottom: 45,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 45,
    padding: 2,
    alignItems: 'center',
  },
  
  //texto
  texto: {
    color: '#B3D18C',
    fontFamily: 'Inter',
    fontSize: 15,
    marginBottom: 20,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 25,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 3,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7AB24E',
    fontFamily: 'Inter',
  },

  // Formulário
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: '#7AB24E',
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 18,
  },
  inputLabel: {
    color: '#7AB24E',
    fontFamily: 'Inter',
    fontSize: 15,
    marginBottom: 5,
    marginLeft: 17,
  },
  input: {
    width: 309,
    height: 55,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#B3D18C',
    backgroundColor: '#FFF6E2',
    paddingHorizontal: 17,
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#000',
    alignSelf: 'center',
  },

  // Botões
  registerButton: {
    width: 309,
    height: 55,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#B3D18C',
    backgroundColor: '#7AB24E',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFF6E2',
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
  },
  loginText: {
    marginBottom: 25,
  },
  loginTextNormal: {
    color: '#B3D18C',
    fontFamily: 'Inter',
    fontSize: 15,
  },
  loginTextLink: {
    color: '#7AB24E',
    fontFamily: 'Inter',
    fontSize: 15,
  },

  // Divisor
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 277,
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#B3D18C',
  },
  dividerText: {
    color: '#B3D18C',
    fontFamily: 'Inter',
    fontSize: 15,
    marginHorizontal: 10,
  },

  // Botão Google
  googleButton: {
    width: 309,
    height: 55,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#B3D18C',
    backgroundColor: '#FFF6E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  googleIcon: {
    width: 28,
    height: 28,
    marginRight: 35,
  },
  googleButtonText: {
    color: '#000',
    fontFamily: 'Inter',
    fontSize: 15,
  },

  //CheckBox
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '85%',
    alignSelf: 'center',
    marginBottom: 15,
  },
  userTypeOption: {
    borderWidth: 2,
    borderColor: '#B3D18C',
    backgroundColor: '#FFF6E2',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  userTypeOptionSelected: {
    backgroundColor: '#7AB24E',
    borderColor: '#7AB24E',
  },
  userTypeText: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#7AB24E',
    fontWeight: '600',
  },
  userTypeTextSelected: {
    color: '#FFF6E2',
  },
});