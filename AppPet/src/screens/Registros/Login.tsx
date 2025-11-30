import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, Alert} from 'react-native';
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

export default function Login({ navigation }: RootStackScreenProps<'Login'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validações básicas
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha email e senha');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          senha: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Erro de autenticação (401) ou outro erro
        throw new Error(data.detail || 'Erro ao fazer login');
      }

      // Login bem-sucedido
      console.log('Login realizado:', data);
      
      if (data.tipo === 'tutor') {
                navigation.navigate('Home',  {usuario: {  
                                            id_usuario: data.id_usuario,  
                                            nome: data.nome,  
                                            email: data.email,  
                                            tipo: data.tipo,  
                                            telefone: data.telefone,  
                                            },}  );
      } else if (data.tipo === 'anfitriao') {
                navigation.navigate('Home_Host', {usuario: {  
                                            id_usuario: data.id_usuario,  
                                            nome: data.nome,  
                                            email: data.email,  
                                            tipo: data.tipo,  
                                            telefone: data.telefone,  
                                            },});
      }
      // navigation.navigate('Home', {  
      //   usuario: {  
      //   id_usuario: data.id_usuario,  
      //   nome: data.nome,  
      //   email: data.email,  
      //   tipo: data.tipo,  
      //   telefone: data.telefone,  
      //   },  
      // });
      // Aqui você pode salvar os dados do usuário
      // Exemplo com AsyncStorage:
      // await AsyncStorage.setItem('usuario', JSON.stringify(data));

      //teste para celular solução abaixo
      
      Alert.alert('Sucesso', data.message || 'Login realizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home', {  
              usuario: {  
                id_usuario: data.id_usuario,  
                nome: data.nome,  
                email: data.email,  
                tipo: data.tipo,  
                telefone: data.telefone,},      
              }),
        },
      ]);

    } catch (error: any) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', error.message || 'Não foi possível fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in pressed');
    Alert.alert('Em breve', 'Login com Google será implementado em breve!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <PetIcon />
        
        <View style={styles.formContainer}>
            <Text style={styles.title}>Faça seu Login!</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="E-mail"
            placeholderTextColor="#79b24e62"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Senha"
            placeholderTextColor="#79b24e62"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.signUpText}>
              <Text style={styles.signUpTextLight}>
                Não tem uma conta ainda?{' '}
              </Text>
              <Text style={styles.signUpTextDark}>Clique aqui!</Text>
            </Text>
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Estrutura geral
  container: {
    flex: 1,
    backgroundColor: '#B3D18C',
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 30,         
    marginBottom: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 35,
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
    flex: 1,
  },
  label: {
    fontSize: 15,
    color: '#7AB24E',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  title: {
    color: '#7AB24E',
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 55,
    borderWidth: 2,
    borderColor: '#B3D18C',
    borderRadius: 18,
    backgroundColor: '#FFF6E2',
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 15,
    fontFamily: 'Inter',
  },

  // Botões
  loginButton: {
    height: 55,
    backgroundColor: '#7AB24E',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#B3D18C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF6E2',
    fontFamily: 'Inter',
  },
  signUpText: {
    textAlign: 'center',
    marginBottom: 80,
    fontSize: 15,
    fontFamily: 'Inter',
  },
  signUpTextLight: {
    color: '#B3D18C',
  },
  signUpTextDark: {
    color: '#7AB24E',
  },

  // Divisor "ou"
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#B3D18C',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 15,
    color: '#B3D18C',
    fontFamily: 'Inter',
  },

  // Botão Google
  googleButton: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF6E2',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#B3D18C',
    paddingHorizontal: 22,
  },
  googleIcon: {
    width: 28,
    height: 28,
    marginRight: 35,
  },
  googleButtonText: {
    fontSize: 15,
    color: '#000',
    fontFamily: 'Inter',
  },
});