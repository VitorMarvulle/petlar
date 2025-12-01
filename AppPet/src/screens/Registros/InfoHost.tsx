// AppPet/src/screens/Registros/InfoHost.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { RootStackScreenProps } from '../../navigation/types';
import * as ImagePicker from 'expo-image-picker';

type HostPreview = {
  id_anfitriao: number;
  descricao: string;
  capacidade_maxima: number;
  especie: string[];          // ['Cachorro', 'Gato', ...]
  tamanho_pet: string;        // 'Pequeno,Médio'
  preco: number;
  status: string;
  fotos_urls?: string[];      // área anfitrião
  foto_perfil_url?: string;   // do usuário
};

export default function InfoHostScreen({
  navigation,
  route,
}: RootStackScreenProps<'InfoHost'>) {
  const { id_usuario } = route.params;
  const API_BASE_URL = 'https://container-service-1.7q33f42wtcfq2.us-east-1.cs.amazonlightsail.com'; 
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [fotoPerfilFile, setFotoPerfilFile] = useState<File | null>(null); // WEB
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState<string | null>(null);

  const [hostPreview, setHostPreview] = useState<HostPreview | null>(null);
  const [loading, setLoading] = useState(false);

  // --- Quando voltar de CriarAnuncioDetalhes, atualiza prévia ---
  useEffect(() => {
    if (route.params && (route.params as any).hostCriado) {
      const { hostCriado, fotoPerfilUrl: novaFoto } = route.params as any;
      setHostPreview(hostCriado);
      if (novaFoto) setFotoPerfilUrl(novaFoto);
    }
  }, [route.params]);

  // 1) Foto de Perfil do Host (ImagePicker)
  const pickProfilePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Permissão para acessar a galeria é necessária!'
      );
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

      if (Platform.OS === 'web') {
        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          const filename = (asset as any).fileName ?? `perfil_${id_usuario}.jpg`;
          const file = new File([blob], filename, {
            type: blob.type || 'image/jpeg',
          });

          setFotoPerfilFile(file);
        } catch (err) {
          console.error('Erro ao converter imagem para File no web:', err);
          Alert.alert('Erro', 'Não foi possível preparar a imagem no navegador.');
        }
      }
    }
  };

  // 2) Upload foto de perfil (igual InfoAdc, usando seu endpoint /usuarios/{id}/foto-perfil)
  const uploadFotoPerfil = async () => {
    if (!fotoPerfil) return null;

    try {
      const formData = new FormData();

      const filenameFromUri =
        fotoPerfil.split('/').pop() || `perfil_${id_usuario}.jpg`;
      const match = /\.(\w+)$/.exec(filenameFromUri);
      const ext = match ? match[1] : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      if (Platform.OS === 'web') {
        if (!fotoPerfilFile) {
          console.warn(
            'fotoPerfilFile está nulo no web; tentando fallback simples.'
          );
          (formData as any).append('arquivo', {
            uri: fotoPerfil,
            name: filenameFromUri,
            type: mimeType,
          });
        } else {
          formData.append('arquivo', fotoPerfilFile);
        }
      } else {
        (formData as any).append('arquivo', {
          uri: fotoPerfil,
          name: filenameFromUri,
          type: mimeType,
        });
      }

      const response = await fetch(
        `${API_BASE_URL}/usuarios/${id_usuario}/foto-perfil`,
        {
          method: 'POST',
          body: formData,
        }
      );

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
        throw new Error(
          (data && (data.detail || data.message)) ||
            'Erro ao enviar foto de perfil'
        );
      }

      const url = data.foto_perfil_url;
      console.log('Foto de perfil atualizada:', url);
      setFotoPerfilUrl(url);
      return url;
    } catch (error) {
      console.error('Erro ao fazer upload da foto de perfil:', error);
      Alert.alert('Erro', 'Não foi possível enviar a foto de perfil.');
      return null;
    }
  };

  const handleIrParaCriarAnuncio = async () => {
    if (!fotoPerfil) {
      Alert.alert('Atenção', 'Adicione uma foto de perfil primeiro.');
      return;
    }

    setLoading(true);
    try {
      // Se ainda não subiu para o backend, sobe agora
      const url = fotoPerfilUrl || (await uploadFotoPerfil());
      if (!url) {
        throw new Error('Falha ao salvar foto de perfil.');
      }

      // Navega para a tela de detalhes do anúncio
      navigation.navigate('CriarAnuncioDetalhes', {
        id_usuario,
        fotoPerfilUrl: url,
      });
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível iniciar a criação do anúncio.');
    } finally {
      setLoading(false);
    }
  };

  const handleIrParaEndereco = () => {
    if (!hostPreview) {
      Alert.alert('Atenção', 'Você precisa criar o anúncio primeiro.');
      return;
    }

    navigation.navigate('Endereco', {
      id_usuario,
      // id_anfitriao: hostPreview.id_anfitriao,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>{'Seja um Anfitrião no \nLar Doce Pet!'}</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {'Antes de criar seu anúncio, defina sua foto de perfil.\n\nDepois você poderá configurar todos os detalhes da locação e ver uma prévia do seu anúncio.'}
              </Text>
            </View>

            {/* Foto de perfil do HOST */}
            <Text style={styles.textoMedio}>Foto de Perfil</Text>
            <TouchableOpacity style={styles.photoBox} onPress={pickProfilePhoto}>
              {fotoPerfil || fotoPerfilUrl ? (
                <Image
                  source={{ uri: fotoPerfil || fotoPerfilUrl! }}
                  style={{ width: 140, height: 140, borderRadius: 70 }}
                />
              ) : (
                <Text style={styles.textoFoto}>Adicionar foto de perfil</Text>
              )}
            </TouchableOpacity>

            {/* Botão Criar Anúncio */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleIrParaCriarAnuncio}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Carregando...' : 'Criar Anúncio'}
              </Text>
            </TouchableOpacity>

            {/* PRÉVIA DO ANÚNCIO (se já existir) */}
            {hostPreview && (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Prévia do seu Anúncio</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {fotoPerfilUrl && (
                    <Image
                      source={{ uri: fotoPerfilUrl }}
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        marginRight: 12,
                      }}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                      {`R$ ${hostPreview.preco.toFixed(2).replace('.', ',')}/dia`}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#556A44' }}>
                      {hostPreview.especie.join(', ')}
                    </Text>
                    <Text
                      style={{ fontSize: 13, color: '#556A44' }}
                      numberOfLines={2}
                    >
                      {hostPreview.descricao}
                    </Text>
                  </View>
                </View>

                {hostPreview.fotos_urls && hostPreview.fotos_urls.length > 0 && (
                  <View style={{ marginTop: 10, flexDirection: 'row' }}>
                    <Image
                      source={{ uri: hostPreview.fotos_urls[0] }}
                      style={{
                        width: 120,
                        height: 80,
                        borderRadius: 10,
                        marginRight: 8,
                      }}
                    />
                    {hostPreview.fotos_urls[1] && (
                      <Image
                        source={{ uri: hostPreview.fotos_urls[1] }}
                        style={{
                          width: 120,
                          height: 80,
                          borderRadius: 10,
                        }}
                      />
                    )}
                  </View>
                )}

                {/* BOTÃO PARA IR PARA CADASTRO DE ENDEREÇO */}
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleIrParaEndereco}
                >
                  <Text style={styles.secondaryButtonText}>
                    Cadastrar Endereço
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  infoBox: {
    justifyContent: 'center',
    width: '88%',
    alignSelf: 'center',
    marginBottom: 25,
    backgroundColor: '#b9d8a2ff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  infoText: {
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
  photoBox: {
    width: 145,
    height: 145,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#B3D18C',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    alignSelf: 'center',
    backgroundColor: '#FFF6E2',
  },
  textoFoto: {
    color: '#777',
    textAlign: 'center',
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#FFF6E2',
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#7AB24E',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#7AB24E',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
  },
  previewCard: {
    width: '90%',
    backgroundColor: '#dfe6d4',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#556A44',
    marginBottom: 10,
  },
});