import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';

export type Pet = {
  nome: string;
  especie: 'Gato' | 'Cachorro' | 'Pássaro' | 'Exótico';
  idade: string;
  idadeUnidade: 'ano' | 'mês';
  peso: string;
  unidade: 'kg' | 'g';
  especificacoes?: string;
  fotos?: string[];
};

export default function FormularioPet() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onAddPet }: any = route.params || {};

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

  const handleSubmit = () => {
    if (!petData.nome || !petData.idade || !petData.peso) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    if (!petData.fotos || petData.fotos.length < 3) {
      alert('Adicione pelo menos 3 fotos do seu pet!');
      return;
    }

    if (onAddPet) onAddPet(petData);
    navigation.goBack();
  };

  const speciesOptions: Pet['especie'][] = ['Gato', 'Cachorro', 'Pássaro', 'Exótico'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Cadastro do seu Pet</Text>

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
                <Text style={petData.especie === specie ? { color: '#fff' } : { color: '#7AB24E' }}>
                  {specie}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Nome do pet"
            placeholderTextColor="#79b24e62"
            value={petData.nome}
            onChangeText={v => handleChange('nome', v)}
            style={styles.input}
          />


          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Idade"
                placeholderTextColor="#79b24e62"
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
                  <Text style={{ color: petData.idadeUnidade === u ? '#fff' : '#7AB24E', fontSize: 12 }}>
                    {u === 'mês' ? 'mês' : 'ano'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

{/* Campo de peso com unidade (apenas ajustando a chamada da função) */}
          <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder="Peso"
              placeholderTextColor="#79b24e62"
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
                onPress={() => handleUnitChange('unidade', u)} // <-- Mudança aqui
              >
                <Text style={{ color: petData.unidade === u ? '#fff' : '#7AB24E' }}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

          <TextInput
            placeholder="Especificações (opcional)"
            placeholderTextColor="#79b24e62"
            value={petData.especificacoes}
            onChangeText={v => handleChange('especificacoes', v)}
            style={[styles.input, { height: 100 }]}
            multiline
          />

          <Text style={styles.texto}>Galeria de fotos do seu pet:</Text>
          <TouchableOpacity style={styles.photoBox} onPress={pickImages}>
            {petData.fotos && petData.fotos.length > 0 ? (
              <ScrollView horizontal>
                {petData.fotos.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={{ width: 120, height: 120, borderRadius: 10, marginRight: 5 }}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.textoFoto}>Adicionar fotos</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.addPetButton} onPress={handleSubmit}>
            <Text style={styles.addPetButtonText}>Salvar Pet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Fundo verde padrão
  container: {
    flex: 1,
    backgroundColor: '#B3D18C',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  // Caixa branca central
  innerContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 30,
    marginBottom: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    color: '#7AB24E',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
    marginTop: 30,
  },
  input: {
    width: '100%',
    height: 55,
    borderWidth: 2,
    borderColor: '#B3D18C',
    borderRadius: 18,
    backgroundColor: '#FFF6E2',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: -4,
    fontSize: 15,
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
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },
unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55, // mesma altura do input
  },
  unitButton: {
    height: 55, // igual ao input
    width: 75,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B3D18C',
    borderRadius: 18,
    backgroundColor: '#FFF6E2',
    marginLeft: 4,
  },
  unitSelected: {
    backgroundColor: '#7AB24E',
    borderColor: '#7AB24E',
  },
  texto: {
    color: '#7AB24E',
    fontSize: 16,
    marginBottom: 10,
    alignSelf: 'center',
  },
    texto2: {
    color: '#7AB24E',
    fontSize: 16,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  textoFoto: {
    color: '#7AB24E',
    textAlign: 'center',
  },
  speciesContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: -4,
  },
  speciesButton: {
    padding: 10,
    borderWidth: 2,
    backgroundColor: '#FFF6E2',
    borderColor: '#b2d09bff',
    borderRadius: 13,
    marginRight: 5,
  },
  speciesButtonSelected: {
    backgroundColor: '#84b55eff',
    borderColor: '#7AB24E',
  },
  photoBox: {
    width: 150,
    height: 150,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#B3D18C',
    backgroundColor: '#FFF6E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
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
  },
  addPetButtonText: {
    color: '#FFF6E2',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
