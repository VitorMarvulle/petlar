// AppPet/src/screens/Registros/InfoAdc.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, Platform } from 'react-native';
import { RootStackScreenProps } from '../../navigation/types';
import * as ImagePicker from 'expo-image-picker';

type Pet = {
  id_pet?: number;
  nome: string;
  especie: 'Gato' | 'Cachorro' | 'Pássaro' | 'Exótico';
  idade: string;
  idadeUnidade?: 'ano' | 'mês';
  peso: string;
  unidade?: 'kg' | 'g';
  especificacoes?: string;
  fotos?: string[];
  fotos_urls?: string[]; // URLs do Supabase
};

export default function InfoAdcScreen({ navigation, route }: RootStackScreenProps<'InfoAdc'>) {
  const { id_usuario } = route.params;
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [fotoPerfilFile, setFotoPerfilFile] = useState<File | null>(null); // WEB
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  // 1) Foto de Perfil do Tutor (ImagePicker)
  const pickProfilePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permissão para acessar a galeria é necessária!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setFotoPerfil(asset.uri);

      // Tratamento específico para WEB
      if (Platform.OS === 'web') {
        try {
          // No web, asset.uri costuma ser um blob:URL
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          // Inferir nome e tipo (fallback simples)
          const filename = asset.fileName ?? `perfil_${id_usuario}.jpg`;
          const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });

          setFotoPerfilFile(file);
        } catch (err) {
          console.error('Erro ao converter imagem para File no web:', err);
          Alert.alert('Erro', 'Não foi possível preparar a imagem no navegador.');
        }
      }
    }
  };

  // 2) Função para enviar a foto para a API (upload para Supabase via backend)
  const uploadFotoPerfil = async () => {
    if (!fotoPerfil) return null;

    try {
      const formData = new FormData();

      // NOME DO ARQUIVO
      const filenameFromUri = fotoPerfil.split('/').pop() || `perfil_${id_usuario}.jpg`;
      const match = /\.(\w+)$/.exec(filenameFromUri);
      const ext = match ? match[1] : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      if (Platform.OS === 'web') {
        // No web, usamos o File que criamos no pickProfilePhoto
        if (!fotoPerfilFile) {
          console.warn('fotoPerfilFile está nulo no web; tentando fallback simples.');
          // Fallback: monta um objeto, mas isso pode falhar dependendo do navegador
          (formData as any).append('arquivo', {
            uri: fotoPerfil,
            name: filenameFromUri,
            type: mimeType,
          });
        } else {
          formData.append('arquivo', fotoPerfilFile);
        }
      } else {
        // Mobile nativo (Android/iOS)
        (formData as any).append('arquivo', {
          uri: fotoPerfil,
          name: filenameFromUri,
          type: mimeType,
        });
      }

      // NÃO definir manualmente Content-Type; o fetch preenche com boundary
      const response = await fetch(`http://localhost:8000/usuarios/${id_usuario}/foto-perfil`, {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      console.log('Resposta upload foto perfil:', response.status, data);

      if (!response.ok) {
        console.log('Erro upload foto:', data);
        throw new Error((data && (data.detail || data.message)) || 'Erro ao enviar foto de perfil');
      }

      const url = data.foto_perfil_url;
      console.log('Foto de perfil atualizada:', url);
      return url;
    } catch (error) {
      console.error('Erro ao fazer upload da foto de perfil:', error);
      Alert.alert('Erro', 'Não foi possível enviar a foto de perfil.');
      return null;
    }
  };

  const handleFinalizar = async () => {
    try {
      setLoading(true);

      if (fotoPerfil) {
        await uploadFotoPerfil();
      }

      // Pets já foram salvos no backend via AdicionarPet
      // Aqui só finalizamos o cadastro

      Alert.alert('Sucesso', 'Cadastro finalizado com sucesso!');
      navigation.navigate('Login');
    } catch (e) {
      console.log('Erro ao finalizar cadastro:', e);
      Alert.alert('Erro', 'Não foi possível finalizar seu cadastro.');
    } finally {
      setLoading(false);
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
                  id_tutor: id_usuario, // ✅ PASSAR O ID DO TUTOR
                  onAddPet: (newPet: Pet) => setPets(prev => [...prev, newPet]),
                })
              }
            >
              <Text style={styles.addPetButtonText}>Adicionar seu Pet</Text>
            </TouchableOpacity>

            {/* Lista de pets adicionados (PRÉVIA) */}
            {pets.map((pet, index) => {
              // ✅ Usar fotos_urls (do Supabase) se disponível, senão usar fotos (local)
              const fotosParaExibir = pet.fotos_urls && pet.fotos_urls.length > 0 
                ? pet.fotos_urls 
                : pet.fotos || [];

              return (
                <View key={index} style={styles.petCard}>
                  {fotosParaExibir.length > 0 && (
                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                      {fotosParaExibir.slice(0, 3).map((uri, i) => (
                        <View key={i} style={{ position: 'relative', marginRight: 5 }}>
                          <Image
                            source={{ uri }}
                            style={{ width: 93, height: 93, borderRadius: 10 }}
                          />
                          {i === 2 && fotosParaExibir.length > 3 && (
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
                              <Text style={{ color: '#fff', fontSize: 20 }}>
                                +{fotosParaExibir.length - 3}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
                    {pet.nome}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#556A44' }}>
                    Espécie: {pet.especie}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#556A44' }}>
                    Idade: {pet.idade} {pet.idadeUnidade || 'ano(s)'}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#556A44' }}>
                    Peso: {pet.peso} {pet.unidade || 'kg'}
                  </Text>
                  {pet.especificacoes ? (
                    <Text style={{ fontSize: 14, color: '#556A44', marginTop: 4 }}>
                      Especificações: {pet.especificacoes}
                    </Text>
                  ) : null}
                </View>
              );
            })}

            {/* Botão Finalizar */}
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleFinalizar}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Finalizando...' : 'Finalizar'}
              </Text>
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
    elevation: 2, 
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
    elevation: 2, 
  },
  registerButtonText: {
    color: '#FFF6E2',
    fontSize: 20,
    fontWeight: '700',
  },
});