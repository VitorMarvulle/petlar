// AppPet/src/screens/Registros/AdicionarPet.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  StyleSheet, ScrollView, SafeAreaView, Alert, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackScreenProps } from '../../navigation/types';

// Importamos o ícone de delete que você já tem no projeto
const ICON_DELETE = require('../../../assets/icons/delete.png');

export type Pet = {
  id_pet?: number;
  nome: string;
  especie: 'Gato' | 'Cachorro' | 'Pássaro' | 'Silvestre';
  idade: string;
  idadeUnidade: 'ano' | 'mês';
  tamanho_pet: 'Pequeno' | 'Médio' | 'Grande';
  especificacoes?: string;
  fotos?: string[];
  fotos_urls?: string[];
};

type Props = RootStackScreenProps<'AdicionarPet'>;

export default function FormularioPet() {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();
  
  const { id_tutor, onAddPet, petParaEditar } = route.params || {};

  const [petData, setPetData] = useState<Pet>({
    nome: '',
    especie: 'Gato',
    idade: '',
    idadeUnidade: 'ano',
    tamanho_pet: 'Médio',
    especificacoes: '',
    fotos: [],
    fotos_urls: []
  });
  
  const [loading, setLoading] = useState(false);
  const isEditing = !!petParaEditar;

  useEffect(() => {
    if (petParaEditar) {
      setPetData({
        ...petParaEditar,
        fotos: petParaEditar.fotos_urls || [], 
      });
      navigation.setOptions({ title: 'Editar Pet' });
    }
  }, [petParaEditar]);

  const handleChange = (field: keyof Pet, value: any) => {
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
      // Limita a 10 fotos no total
      const newPhotos = [...(petData.fotos || []), ...selectedUris].slice(0, 10);
      setPetData(prev => ({ ...prev, fotos: newPhotos }));
    }
  };

  // --- NOVA FUNÇÃO: REMOVER FOTO ---
  const removePhoto = (indexToRemove: number) => {
    const updatedPhotos = petData.fotos?.filter((_, index) => index !== indexToRemove);
    setPetData(prev => ({ ...prev, fotos: updatedPhotos }));
  };

  const savePetInBackend = async () => {
    const url = isEditing 
      ? `http://localhost:8000/pets/${petData.id_pet}`
      : 'http://localhost:8000/pets/';
    
    const method = isEditing ? 'PUT' : 'POST';

    const bodyPayload = {
        id_tutor: id_tutor,
        nome: petData.nome,
        especie: petData.especie,
        idade: parseInt(petData.idade),
        idade_unidade: petData.idadeUnidade,
        tamanho_pet: petData.tamanho_pet,
        peso: 0,
        peso_unidade: 'kg', 
        observacoes: petData.especificacoes || null,
        // Se estiver editando, podemos enviar a lista atualizada de URLs (backend precisa suportar isso)
        fotos_urls: isEditing ? petData.fotos?.filter(f => f.startsWith('http')) : undefined
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao salvar pet');
      }

      const savedData = await response.json();
      const savedPet = Array.isArray(savedData) ? savedData[0] : savedData;
      return savedPet;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  };

  const uploadFotosPet = async (id_pet: number) => {
    const novasFotos = petData.fotos?.filter(f => !f.startsWith('http')) || [];
    
    // Se não há fotos novas, retorna as URLs que já existem (que não foram removidas)
    if (novasFotos.length === 0) {
        return petData.fotos?.filter(f => f.startsWith('http')) || [];
    }

    try {
      const formData = new FormData();

      for (const fotoUri of novasFotos) {
        const filename = fotoUri.split('/').pop() || `pet_${id_pet}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

        if (Platform.OS === 'web') {
          const response = await fetch(fotoUri);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: mimeType });
          formData.append('arquivos', file);
        } else {
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

      if (!response.ok) throw new Error('Erro ao enviar fotos');
      
      const data = await response.json();
      
      // Retorna fotos antigas (que sobraram) + novas fotos
      const fotosAntigas = petData.fotos?.filter(f => f.startsWith('http')) || [];
      return [...fotosAntigas, ...data.fotos_urls];
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!petData.nome || !petData.idade) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios!');
      return;
    }

    if (!petData.fotos || petData.fotos.length < 1) {
       Alert.alert('Atenção', 'Adicione pelo menos uma foto do seu pet!');
       return;
    }

    try {
      setLoading(true);

      const savedPet = await savePetInBackend();
      const id_pet = savedPet.id_pet || petData.id_pet;

      const fotos_urls = await uploadFotosPet(id_pet);

      const petFinal: Pet = {
        ...petData,
        id_pet,
        fotos_urls,
        fotos: fotos_urls
      };

      if (onAddPet) onAddPet(petFinal);

      Alert.alert('Sucesso', `Pet ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar.');
    } finally {
      setLoading(false);
    }
  };

  const speciesOptions: Pet['especie'][] = ['Gato', 'Cachorro', 'Pássaro', 'Silvestre'];
  const sizeOptions: Pet['tamanho_pet'][] = ['Pequeno', 'Médio', 'Grande'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          
          <Text style={styles.title}>
            {isEditing ? 'Editar Pet' : 'Cadastro do seu Pet'}
          </Text>

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
                value={petData.idade ? String(petData.idade) : ''}
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
                  onPress={() => handleChange('idadeUnidade', u)}
                >
                  <Text style={petData.idadeUnidade === u ? styles.unitTextSelected : styles.unitText}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Porte */}
          <Text style={styles.labelPorte}>Porte</Text>
          <View style={styles.speciesContainer}>
            {sizeOptions.map(size => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.speciesButton,
                  petData.tamanho_pet === size && styles.speciesButtonSelected,
                ]}
                onPress={() => handleChange('tamanho_pet', size)}
              >
                <Text style={petData.tamanho_pet === size ? styles.speciesTextSelected : styles.speciesText}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
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

          {/* Galeria de Fotos */}
          <Text style={styles.texto}>Galeria de fotos do seu pet</Text>
          <TouchableOpacity style={styles.photoBox} onPress={pickImages} activeOpacity={0.8}>
            {petData.fotos && petData.fotos.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {petData.fotos.map((uri, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image
                      source={{ uri }}
                      style={styles.photo}
                    />
                    {/* BOTÃO X PARA REMOVER */}
                    <TouchableOpacity 
                        style={styles.removePhotoButton} 
                        onPress={(e) => {
                            e.stopPropagation(); // Impede que abra a galeria ao clicar no X
                            removePhoto(index);
                        }}
                    >
                         <Image 
                            source={ICON_DELETE} 
                            style={styles.removePhotoIcon}
                            tintColor="#FFFFFF" 
                         />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.textoFoto}>📸 Adicionar fotos</Text>
            )}
          </TouchableOpacity>

          {/* Botão Salvar */}
          <TouchableOpacity 
            style={styles.addPetButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.addPetButtonText}>
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar Pet' : 'Salvar Pet')}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (mesmos estilos anteriores)
  container: { flex: 1, backgroundColor: '#B3D18C' },
  scrollContainer: { flexGrow: 1 },
  innerContainer: {
    flex: 1, marginHorizontal: 16, marginTop: 25, marginBottom: 45,
    backgroundColor: '#FFFFFF', borderRadius: 40, paddingHorizontal: 25,
    paddingVertical: 25, alignItems: 'center', elevation: 4,
  },
  title: { color: '#7AB24E', fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  input: {
    width: '100%', height: 55, borderWidth: 2, borderColor: '#B3D18C',
    borderRadius: 18, backgroundColor: '#FFF6E2', paddingHorizontal: 16,
    marginBottom: 16, fontSize: 15, color: '#556A44',
  },
  inputNoMargin: {
    width: '100%', height: 55, borderWidth: 2, borderColor: '#B3D18C',
    borderRadius: 18, backgroundColor: '#FFF6E2', paddingHorizontal: 16,
    fontSize: 15, color: '#556A44',
  },
  multilineInput: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 18 },
  unitSelector: { flexDirection: 'row', alignItems: 'center', height: 55 },
  unitButton: {
    height: 55, width: 70, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#B3D18C', borderRadius: 15,
    backgroundColor: '#FFF6E2', marginLeft: 6,
  },
  unitSelected: { backgroundColor: '#7AB24E', borderColor: '#7AB24E' },
  unitText: { color: '#7AB24E', fontWeight: '600' },
  unitTextSelected: { color: '#FFF6E2', fontWeight: '700' },
  speciesContainer: {
    flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 20,
  },
  speciesButton: {
    flex: 1, paddingVertical: 10, marginHorizontal: 4, borderWidth: 2,
    borderColor: '#B3D18C', borderRadius: 15, backgroundColor: '#FFF6E2',
    alignItems: 'center',
  },
  speciesButtonSelected: { backgroundColor: '#7AB24E', borderColor: '#7AB24E' },
  speciesText: { color: '#7AB24E', fontWeight: '600', fontSize: 13 },
  speciesTextSelected: { color: '#FFF6E2', fontWeight: '700', fontSize: 13 },
  texto: { color: '#7AB24E', fontSize: 16, fontWeight: '600', marginBottom: 8, alignSelf: 'flex-start' },
  textoFoto: { color: '#7AB24E', textAlign: 'center', fontSize: 15, fontWeight: '500' },
  photoBox: {
    width: '100%', minHeight: 130, borderRadius: 18, borderWidth: 3,
    borderColor: '#B3D18C', backgroundColor: '#FFF6E2', justifyContent: 'center',
    alignItems: 'center', marginVertical: 12, padding: 10,
  },
  
  // --- ESTILOS ATUALIZADOS DA FOTO ---
  photoContainer: {
    position: 'relative',
    marginRight: 8, // Margem movida para o container
  },
  photo: { 
    width: 110, 
    height: 110, 
    borderRadius: 12, 
    // marginRight removido daqui para não atrapalhar o container
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 68, 68, 0.9)', // Vermelho semi-transparente
    borderRadius: 15, // Redondo
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  removePhotoIcon: {
    width: 12,
    height: 12,
  },
  // ------------------------------------

  addPetButton: {
    height: 55, width: '100%', backgroundColor: '#7AB24E', borderRadius: 18,
    borderWidth: 3, borderColor: '#B3D18C', justifyContent: 'center',
    alignItems: 'center', marginTop: 25, elevation: 3,
  },
  addPetButtonText: { color: '#FFF6E2', fontWeight: 'bold', fontSize: 18 },
  labelPorte: {
    width: '100%', color: '#7AB24E', fontSize: 16, fontWeight: '600',
    marginBottom: 8, textAlign: 'left', paddingLeft: 4
  }
});