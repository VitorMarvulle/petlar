// petlar\AppPet\src\screens\Registros\Endereco.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { RootStackScreenProps } from '../../navigation/types';

export default function EnderecoScreen({ route, navigation }: RootStackScreenProps<'Endereco'>) {
  const { id_usuario } = route.params;

  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [formData, setFormData] = useState({
    cep: '',
    cidade: '',
    logradouro: '',
    bairro: '',
    numero: '',
    uf: '',
    complemento: '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBuscarCep = async () => {
    const cepLimpo = formData.cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      Alert.alert('CEP inválido', 'Digite um CEP com 8 números.');
      return;
    }

    setLoadingCep(true);
    Keyboard.dismiss();

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado.');
      }

      // Preenche os campos com base na resposta do ViaCEP
      setFormData(prev => ({
        ...prev,
        cep: cepLimpo,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        uf: data.uf || prev.uf,
      }));
    } catch (error: any) {
      console.error('Erro ao buscar CEP:', error);
      Alert.alert('Erro', error.message || 'Não foi possível buscar o CEP.');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSave = async () => {
    if (!formData.cep || !formData.cidade || !formData.logradouro || !formData.bairro || !formData.numero || !formData.uf) {
      Alert.alert('Atenção', 'Preencha CEP, cidade, logradouro, bairro, número e UF');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/usuarios/${id_usuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep: formData.cep.trim(),
          cidade: formData.cidade.trim(),
          logradouro: formData.logradouro.trim(),
          bairro: formData.bairro.trim(),
          numero: formData.numero.trim(),
          uf: formData.uf.trim().toUpperCase(),
          complemento: formData.complemento.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Erro ao salvar endereço:', data);
        throw new Error(data.detail || 'Erro ao salvar informações adicionais');
      }

      console.log('Endereço atualizado:', data);

      Alert.alert(
        'Sucesso',
        'Informações adicionais salvas com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              const usuarioAtualizado = Array.isArray(data) ? data[0] : data;
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Home',
                    params: {
                      usuario: {
                        id_usuario: usuarioAtualizado.id_usuario,
                        nome: usuarioAtualizado.nome,
                        email: usuarioAtualizado.email,
                        tipo: usuarioAtualizado.tipo,
                        telefone: usuarioAtualizado.telefone,
                      },
                    },
                  },
                ],
              });
            },
          },
        ]
      );
      
      navigation.navigate('Home', { id_usuario: id_usuario });

    } catch (error: any) {
      console.error('Erro na InfoAdc:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Informações Adicionais</Text>
          <Text style={styles.subtitle}>
            Complete seu endereço para encontrar anfitriões mais compatíveis.
          </Text>

          {/* Campo CEP + botão Buscar CEP */}
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              value={formData.cep}
              onChangeText={(value) => handleInputChange('cep', value)}
              placeholder="CEP"
              placeholderTextColor="#79b24e62"
              keyboardType="numeric"
              maxLength={9} // 8 números, pode permitir máscara depois
              editable={!loading && !loadingCep}
            />
            <TouchableOpacity
              style={styles.cepButton}
              onPress={handleBuscarCep}
              disabled={loading || loadingCep}
            >
              {loadingCep ? (
                <ActivityIndicator color="#FFF6E2" />
              ) : (
                <Text style={styles.cepButtonText}>Buscar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Demais campos (podem ser sobrescritos após o ViaCEP, mas o usuário ainda consegue editar) */}
          {[
            { label: 'Cidade', field: 'cidade', keyboardType: 'default' },
            { label: 'Logradouro', field: 'logradouro', keyboardType: 'default' },
            { label: 'Bairro', field: 'bairro', keyboardType: 'default' },
            { label: 'Número', field: 'numero', keyboardType: 'numeric' },
            { label: 'UF (ex: SP)', field: 'uf', keyboardType: 'default' },
            { label: 'Complemento (opcional)', field: 'complemento', keyboardType: 'default' },
          ].map(({ label, field, keyboardType }) => (
            <View key={field} style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData[field as keyof typeof formData]}
                onChangeText={(value) => handleInputChange(field as keyof typeof formData, value)}
                placeholder={label}
                placeholderTextColor="#79b24e62"
                keyboardType={keyboardType as any}
                autoCapitalize={field === 'uf' ? 'characters' : 'words'}
                editable={!loading}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveButton, (loading || loadingCep) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading || loadingCep}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Salvando...' : 'Salvar e ir para Home'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    color: '#7AB24E',
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#B3D18C',
    fontFamily: 'Inter',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 18,
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
  cepButton: {
    height: 55,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#B3D18C',
    backgroundColor: '#7AB24E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cepButtonText: {
    color: '#FFF6E2',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    width: 309,
    height: 55,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#B3D18C',
    backgroundColor: '#7AB24E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF6E2',
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
  },
});