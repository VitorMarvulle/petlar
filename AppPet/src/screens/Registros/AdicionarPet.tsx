// AppPet/src/screens/Registros/AdicionarPet.tsx
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  StyleSheet, ScrollView, SafeAreaView, Alert, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';

export type Pet = {
  id_pet?: number;
  nome: string;
  especie: 'Gato' | 'Cachorro' | 'Pássaro' | 'Exótico';
  idade: string;
  idadeUnidade: 'ano' | 'mês';
  peso: string;
  unidade: 'kg' | 'g';
  especificacoes?: string;
  fotos?: string[];
  fotos_urls?: string[]; // URLs do Supabase
};

export default function FormularioPet() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id_tutor, onAddPet }: any = route.params || {};

  const [petData, setPetData] = useState<Pet>({
    nome: '',
    especie: 'Gato',
    idade: '',
    idadeUnidade: 'ano',
    peso: '',
    unidade: 'kg',
    especificacoes: '',
    fotos: [],
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof Pet, value: string) => {
    setPetData(prev => ({ ...prev, [field]: value }));
  };

  const handleUnitChange = (field: 'unidade' | 'idadeUnidade', value: 'kg' | 'g' | 'ano' | 'mês') => {
    setPetData(prev => ({ ...prev, [field]: value }));
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      const newPhotos = [...(petData.fotos || []), ...selectedUris].slice(0, 10);
      setPetData(prev => ({ ...prev, fotos: newPhotos }));
    }
  };

  // Função para criar o pet no backend
  const createPetInBackend = async () => {
    try {
      const response = await fetch('http://localhost:8000/pets/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_tutor: id_tutor,
          nome: petData.nome,
          especie: petData.especie,
          idade: parseInt(petData.idade),
          idade_unidade: petData.idadeUnidade,
          peso: parseFloat(petData.peso),
          peso_unidade: petData.unidade,
          observacoes: petData.especificacoes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar pet');
      }

      const createdPet = await response.json();
      return createdPet[0]; // Supabase retorna array
    } catch (error) {
      console.error('Erro ao criar pet:', error);
      throw error;
    }
  };

  // Função para fazer upload das fotos
  const uploadFotosPet = async (id_pet: number) => {
    if (!petData.fotos || petData.fotos.length === 0) return [];

    try {
      const formData = new FormData();

      for (const fotoUri of petData.fotos) {
        const filename = fotoUri.split('/').pop() || `pet_${id_pet}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

        if (Platform.OS === 'web') {
          // Web: converter blob para File
          const response = await fetch(fotoUri);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: mimeType });
          formData.append('arquivos', file);
        } else {
          // Mobile
          (formData as any).append('arquivos', {
            uri: fotoUri,
            name: filename,
            type: mimeType,
          });
        }
      }

      const response = await fetch(`http://localhost:8000/pets/${id_pet}/fotos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao enviar fotos');
      }

      const data = await response.json();
      return data.fotos_urls;
    } catch (error) {
      console.error('Erro ao fazer upload das fotos:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!petData.nome || !petData.idade || !petData.peso) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios!');
      return;
    }
    if (!petData.fotos || petData.fotos.length < 3) {
      Alert.alert('Atenção', 'Adicione pelo menos 3 fotos do seu pet!');
      return;
    }

    try {
      setLoading(true);

      // 1. Criar o pet no backend
      const createdPet = await createPetInBackend();
      const id_pet = createdPet.id_pet;

      // 2. Fazer upload das fotos
      const fotos_urls = await uploadFotosPet(id_pet);

      // 3. Preparar dados para a prévia na InfoAdc
      const petComFotos: Pet = {
        ...petData,
        id_pet,
        fotos_urls,
      };

      // 4. Callback para InfoAdc (prévia)
      if (onAddPet) onAddPet(petComFotos);

      Alert.alert('Sucesso', 'Pet cadastrado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível cadastrar o pet.');
    } finally {
      setLoading(false);
    }
  };

  const speciesOptions: Pet['especie'][] = ['Gato', 'Cachorro', 'Pássaro', 'Exótico'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          
          <Text style={styles.title}>Cadastro do seu Pet</Text>

          {/* Seletor de espécie */}
          <View style={styles.speciesContainer}>
            {speciesOptions.map(specie => (
              <TouchableOpacity
                key={specie}
                style={[
                  styles.speciesButton,
                  petData.especie === specie && styles.speciesButtonSelected,
                ]}
                onPress={() => handleChange('especie', specie)}
              >
                <Text style={petData.especie === specie ? styles.speciesTextSelected : styles.speciesText}>
                  {specie}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nome */}
          <TextInput
            placeholder="Nome do pet"
            placeholderTextColor="#7AB24E80"
            value={petData.nome}
            onChangeText={v => handleChange('nome', v)}
            style={styles.input}
          />

          {/* Idade */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Idade"
                placeholderTextColor="#7AB24E80"
                value={petData.idade}
                onChangeText={v => handleChange('idade', v)}
                style={styles.inputNoMargin}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.unitSelector}>
              {(['ano', 'mês'] as const).map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitButton, petData.idadeUnidade === u && styles.unitSelected]}
                  onPress={() => handleUnitChange('idadeUnidade', u)}
                >
                  <Text style={petData.idadeUnidade === u ? styles.unitTextSelected : styles.unitText}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Peso */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Peso"
                placeholderTextColor="#7AB24E80"
                value={petData.peso}
                onChangeText={v => handleChange('peso', v)}
                style={styles.inputNoMargin}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.unitSelector}>
              {(['kg', 'g'] as const).map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitButton, petData.unidade === u && styles.unitSelected]}
                  onPress={() => handleUnitChange('unidade', u)}
                >
                  <Text style={petData.unidade === u ? styles.unitTextSelected : styles.unitText}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Especificações */}
          <TextInput
            placeholder="Especificações (opcional)"
            placeholderTextColor="#7AB24E80"
            value={petData.especificacoes}
            onChangeText={v => handleChange('especificacoes', v)}
            style={[styles.input, styles.multilineInput]}
            multiline
          />

          {/* Fotos */}
          <Text style={styles.texto}>Galeria de fotos do seu pet</Text>
          <TouchableOpacity style={styles.photoBox} onPress={pickImages} activeOpacity={0.8}>
            {petData.fotos && petData.fotos.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {petData.fotos.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={styles.photo}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.textoFoto}>📸 Adicionar fotos</Text>
            )}
          </TouchableOpacity>

          {/* Botão */}
          <TouchableOpacity 
            style={styles.addPetButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.addPetButtonText}>
              {loading ? 'Salvando...' : 'Salvar Pet'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... (estilos permanecem os mesmos)
const styles = StyleSheet.create({
  // --- Fundo ---
  container: {
    flex: 1,
    backgroundColor: '#B3D18C',
  },
  scrollContainer: {
    flexGrow: 1,
  },

  // --- Caixa branca ---
  innerContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 25,
    marginBottom: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 25,
    paddingVertical: 25,
    alignItems: 'center',
    elevation: 4,
  },

  title: {
    color: '#7AB24E',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },

  // --- Inputs ---
  input: {
    width: '100%',
    height: 55,
    borderWidth: 2,
    borderColor: '#B3D18C',
    borderRadius: 18,
    backgroundColor: '#FFF6E2',
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 15,
    color: '#556A44',
  },
  inputNoMargin: {
    width: '100%',
    height: 55,
    borderWidth: 2,
    borderColor: '#B3D18C',
    borderRadius: 18,
    backgroundColor: '#FFF6E2',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#556A44',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  // --- Layout de linhas ---
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },

  // --- Seletor de unidade ---
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
  },
  unitButton: {
    height: 55,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B3D18C',
    borderRadius: 15,
    backgroundColor: '#FFF6E2',
    marginLeft: 6,
  },
  unitSelected: {
    backgroundColor: '#7AB24E',
    borderColor: '#7AB24E',
  },
  unitText: {
    color: '#7AB24E',
    fontWeight: '600',
  },
  unitTextSelected: {
    color: '#FFF6E2',
    fontWeight: '700',
  },

  // --- Espécie ---
  speciesContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  speciesButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#B3D18C',
    borderRadius: 15,
    backgroundColor: '#FFF6E2',
    alignItems: 'center',
  },
  speciesButtonSelected: {
    backgroundColor: '#7AB24E',
    borderColor: '#7AB24E',
  },
  speciesText: {
    color: '#7AB24E',
    fontWeight: '600',
  },
  speciesTextSelected: {
    color: '#FFF6E2',
    fontWeight: '700',
  },

  // --- Fotos ---
  texto: {
    color: '#7AB24E',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  textoFoto: {
    color: '#7AB24E',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },
  photoBox: {
    width: '100%',
    minHeight: 130,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#B3D18C',
    backgroundColor: '#FFF6E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    padding: 10,
  },
  photo: {
    width: 110,
    height: 110,
    borderRadius: 12,
    marginRight: 8,
  },

  // --- Botão final ---
  addPetButton: {
    height: 55,
    width: '100%',
    backgroundColor: '#7AB24E',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#B3D18C',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    elevation: 3,
  },
  addPetButtonText: {
    color: '#FFF6E2',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
