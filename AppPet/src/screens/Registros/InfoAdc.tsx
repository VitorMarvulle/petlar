import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { RootStackScreenProps } from '../../navigation/types';
import * as ImagePicker from 'expo-image-picker';


type Pet = {
  nome: string;
  especie: 'Gato' | 'Cachorro' | 'Pássaro' | 'Exótico';
  idade: string;
  peso: string;
  especificacoes?: string;
  fotos?: string[];
};

export default function InfoAdcScreen({ navigation }: RootStackScreenProps<'InfoAdc'>) {
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);

  // Foto de Perfil do Tutor
  const pickProfilePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão para acessar a galeria é necessária!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFotoPerfil(uri);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>

          <View style={styles.formContainer}>
            <Text style={styles.title}>{'Seja bem-vindo \nao Lar Doce Pet!'}</Text>

            <View style={styles.Info}>
              <Text style={styles.informacao}>
                {'Antes de finalizar, precisamos de algumas informações para suas futuras hospedagens! \n\nRelaxe, você poderá mudá-las depois.'}
              </Text>
            </View>

            {/* Foto de perfil do tutor */}
            <Text style={styles.textoMedio}>Foto de Perfil</Text>
            <TouchableOpacity style={styles.photoBox} onPress={pickProfilePhoto}>
              {fotoPerfil ? (
                <Image source={{ uri: fotoPerfil }} style={{ width: 140, height: 140, borderRadius: 10 }} />
              ) : (
                <Text style={styles.textoFoto}>Adicionar foto de perfil</Text>
              )}
            </TouchableOpacity>

            {/* Botão para adicionar pet */}
            <Text style={styles.textopet}>Adicione seu Pet</Text>
            <TouchableOpacity
              style={styles.addPetButton}
              onPress={() =>
                navigation.navigate('AdicionarPet', {
                  onAddPet: (newPet: Pet) => setPets(prev => [...prev, newPet]),
                })
              }
            >
              <Text style={styles.addPetButtonText}>Adicionar seu Pet</Text>
            </TouchableOpacity>

            {/* Lista de pets adicionados */}
            {pets.map((pet, index) => (
              <View key={index} style={styles.petCard}>
                {pet.fotos && pet.fotos.length > 0 && (
                  <View style={{ flexDirection: 'row' }}>
                    {pet.fotos.slice(0, 3).map((uri, i) => (
                      <View key={i} style={{ position: 'relative', marginRight: 5 }}>
                        <Image
                          source={{ uri }}
                          style={{ width: 93, height: 93, borderRadius: 10 }}
                        />
                        {i === 2 && pet.fotos.length > 3 && (
                          <View
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: 93,
                              height: 93,
                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: 10,
                            }}
                          >
                            <Text style={{ color: '#fff', fontSize: 20 }}>+{pet.fotos.length - 3}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{pet.nome}</Text>
                <Text>Espécie: {pet.especie}</Text>
                <Text>Idade: {pet.idade}</Text>
                <Text>Peso: {pet.peso}</Text>
                {pet.especificacoes ? <Text>Especificações: {pet.especificacoes}</Text> : null}
              </View>
            ))}

            {/* Botão Finalizar */}
            <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.registerButtonText}>Finalizar</Text>
            </TouchableOpacity>
          </View>
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
    padding: 2,
    alignItems: 'center',
  },

  Info: {
    justifyContent: 'center',
    width: '88%',
    alignSelf: 'center',
    marginBottom: 25,
    backgroundColor: '#b9d8a2ff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  informacao: {
    color: '#5b6e4cff',
    fontSize: 16,
    textAlign: 'center', 
  },
  textoMedio: {
    color: '#7AB24E',
    fontSize: 19,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: 25,
    marginBottom: 10,
  },
  textoFoto: {
    color: '#777',
    textAlign: 'center',
  },
  textopet: {
    width: '104%',
    marginTop: 15,
    marginBottom: -10,
    color: '#7AB24E',
    fontSize: 19,
    fontWeight: 'bold',
    marginLeft: 60,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: '#7AB24E',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  photoBox: {
    width: 145,
    height: 145,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#B3D18C',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    alignSelf: 'center',
  },
  addPetButton: {
    width: 309,
    height: 55,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#B3D18C',
    backgroundColor: '#7AB24E',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
        marginTop: 20,
    marginBottom: -3,
  },
  addPetButtonText: {
    color: '#FFF6E2',
    fontWeight: '700',
    fontSize: 18,
  },
  petCard: {
    width: '90%',
    backgroundColor: '#dfe6d4',
    padding: 15,
    borderRadius: 15,
    marginVertical: 15,
  },
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
  registerButtonText: {
    color: '#FFF6E2',
    fontSize: 20,
    fontWeight: '700',
  },
});
