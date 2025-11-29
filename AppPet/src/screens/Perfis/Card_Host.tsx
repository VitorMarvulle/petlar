// AppPet\src\screens\Perfis\Card_Host.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://localhost:8000';

// Import PNGs
const UserIconPng = require('../../../assets/icons/user.png');
const StarIconPng = require('../../../assets/icons/YellowStar.png');
const HouseIconPng = require('../../../assets/icons/casa.png');
const SearchIconPng = require('../../../assets/icons/search.png');
const CatIconPng = require('../../../assets/icons/animais/gatoVerde.png');
const DogIconPng = require('../../../assets/icons/animais/cachorroVerde.png');
const PassaroIconPng = require('../../../assets/icons/animais/passaro.png');
const TartarugaIconPng = require('../../../assets/icons/animais/tartaruga.png');
const NaoFavorito = require('../../../assets/icons/GreyFav.png');
const Favorito = require('../../../assets/icons/GoldFav.png');

// Tipos
interface UsuarioFromApi {
  id_usuario: number;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  bairro?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  uf?: string;
  complemento?: string;
}

interface AnfitriaoFromApi {
  id_anfitriao: number;
  descricao?: string;
  capacidade_maxima: number;
  especie?: string[];
  tamanho_pet?: string;
  foto_perfil_url?: string;
  preco?: number | string | null;
  status?: string;
  fotos_urls?: string | string[];
  usuarios?: UsuarioFromApi;
  rating_medio?: number | null;
}

interface AvaliacaoFromApi {
  id_avaliacao: number;
  id_avaliador: number;
  id_avaliado: number;
  id_reserva: number;
  nota: number;
  comentario?: string;
  data_avaliacao?: string;
  avaliador?: UsuarioFromApi;
}

type CardHostRouteProp = RouteProp<RootStackParamList, 'Card_Host'>;
type CardHostNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Card_Host'>;

// Componente de Favoritar atualizado
interface FavoritarButtonProps {
  hostId: number;
  userId: number;
  initialFavorito: boolean;
}

const FavoritarButton = ({ hostId, userId, initialFavorito }: FavoritarButtonProps) => {
  const [isFavorito, setIsFavorito] = useState(initialFavorito);
  const [loading, setLoading] = useState(false);

  const toggleFavorito = async () => {
    try {
      setLoading(true);
      
      if (isFavorito) {
        // Remover dos favoritos
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/favoritos/${hostId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao remover favorito');
        }

        const data = await response.json();
        console.log('Favorito removido:', data);
        setIsFavorito(false);
        Alert.alert('Sucesso', 'Anfitrião removido dos favoritos!');
      } else {
        // Adicionar aos favoritos
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/favoritos/${hostId}`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Erro ao adicionar favorito');
        }

        const data = await response.json();
        console.log('Favorito adicionado:', data);
        setIsFavorito(true);
        Alert.alert('Sucesso', 'Anfitrião adicionado aos favoritos!');
      }
    } catch (error: any) {
      console.error('Erro ao favoritar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os favoritos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const imageSource = isFavorito ? Favorito : NaoFavorito;

  return (
    <View>
      <TouchableOpacity onPress={toggleFavorito} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#556A44" size="small" style={styles.fav} />
        ) : (
          <Image source={imageSource} style={styles.fav} resizeMode="contain" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const UserAvatar = () => (
  <View style={styles.profileAvatar}>
    <Image source={UserIconPng} style={styles.avatarInnerImage} resizeMode="contain" />
  </View>
);

// Componente para renderizar ícones de pets aceitos
const PetIcon = ({ petName }: { petName: string }) => {
  const icons: Record<string, any> = {
    cachorro: DogIconPng,
    gato: CatIconPng,
    passaro: PassaroIconPng,
    tartaruga: TartarugaIconPng,
  };

  const source = icons[petName.toLowerCase()];
  if (!source) return null;

  return <Image source={source} style={styles.petTypeIcon} />;
};

export default function PerfilHost() {
  const route = useRoute<CardHostRouteProp>();
  const navigation = useNavigation<CardHostNavigationProp>();

  const { host, usuario } = route.params;

  const [anfitriao, setAnfitriao] = useState<AnfitriaoFromApi | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFavorito, setIsFavorito] = useState(false);

  // Buscar dados do anfitrião e verificar se está nos favoritos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar anfitrião com dados do usuário
        const anfitriaoUrl = `${API_BASE_URL}/anfitrioes/${host.id_anfitriao}`;
        const anfitriaoResponse = await fetch(anfitriaoUrl);

        if (!anfitriaoResponse.ok) {
          throw new Error(`Erro ao buscar anfitrião: ${anfitriaoResponse.status}`);
        }

        const anfitriaoData: AnfitriaoFromApi = await anfitriaoResponse.json();
        setAnfitriao(anfitriaoData);

        // Buscar avaliações do anfitrião
        const avaliacoesUrl = `${API_BASE_URL}/avaliacoes/avaliado/${anfitriaoData.usuarios?.id_usuario}`;
        const avaliacoesResponse = await fetch(avaliacoesUrl);

        if (avaliacoesResponse.ok) {
          const avaliacoesData: AvaliacaoFromApi[] = await avaliacoesResponse.json();
          setAvaliacoes(avaliacoesData);
        }

        // Verificar se está nos favoritos do usuário logado
        if (usuario?.id_usuario) {
          const favoritosUrl = `${API_BASE_URL}/usuarios/${usuario.id_usuario}/favoritos`;
          const favoritosResponse = await fetch(favoritosUrl);

          if (favoritosResponse.ok) {
            const favoritosData = await favoritosResponse.json();
            const favoritos = favoritosData.anfitrioes_favoritos || [];
            setIsFavorito(favoritos.includes(host.id_anfitriao));
          }
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do anfitrião.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [host.id_anfitriao, usuario?.id_usuario]);

  const handleReservaPress = () => {
    if (!usuario?.id_usuario) {
      Alert.alert('Erro', 'Você precisa estar logado para fazer uma reserva.');
      return;
    }

    if (!anfitriao) {
      Alert.alert('Erro', 'Dados do anfitrião não disponíveis.');
      return;
    }

    const precoNumber = typeof anfitriao.preco === 'string' 
      ? parseFloat(anfitriao.preco) 
      : anfitriao.preco ?? 65.00;

    navigation.navigate('Reserva', {
      id_usuario: usuario.id_usuario,
      id_anfitriao: anfitriao.id_anfitriao,
      preco_diaria: precoNumber,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.innerContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#556A44" />
        </View>
      </SafeAreaView>
    );
  }

  if (!anfitriao) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.innerContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#556A44', fontSize: 16 }}>Anfitrião não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Processar dados
  const nome = anfitriao.usuarios?.nome ?? 'Anfitrião';
  const cidade = anfitriao.usuarios?.cidade ?? '';
  const bairro = anfitriao.usuarios?.bairro ?? '';
  const location = cidade && bairro ? `${cidade}, ${bairro}` : cidade || bairro || 'Local não informado';

  const ratingNumber = anfitriao.rating_medio ?? 5;
  const rating = ratingNumber.toFixed(1).replace('.', ',');

  const precoNumber = typeof anfitriao.preco === 'string' ? parseFloat(anfitriao.preco) : anfitriao.preco ?? 0;
  const price = precoNumber.toFixed(2).replace('.', ',');

  const petsAccepted = anfitriao.especie ?? [];

  // Processar fotos
  let fotosArray: string[] = [];
  if (Array.isArray(anfitriao.fotos_urls)) {
    fotosArray = anfitriao.fotos_urls;
  } else if (typeof anfitriao.fotos_urls === 'string' && anfitriao.fotos_urls.trim() !== '') {
    try {
      const parsed = JSON.parse(anfitriao.fotos_urls);
      if (Array.isArray(parsed)) {
        fotosArray = parsed;
      }
    } catch (e) {
      console.warn('Não foi possível fazer parse de fotos_urls:', anfitriao.fotos_urls);
    }
  }

  // Filtrar avaliações pela busca
  const avaliacoesFiltradas = avaliacoes.filter((av) =>
    av.comentario?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // Dentro do componente PerfilHost:

  const handleFAQPress = () => {
      if (!usuario?.id_usuario) {
        Alert.alert('Atenção', 'Você precisa estar logado para ver ou fazer perguntas.');
        return;
      }

      if (!anfitriao?.id_anfitriao) {
        return;
      }

      navigation.navigate('FAQ_Tutor', {
        id_anfitriao: anfitriao.id_anfitriao,
        id_tutor: usuario.id_usuario,
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Perfil */}
          <View style={styles.profileSectionNew}>
            <UserAvatar />
            <View style={styles.profileInfoNew}>
              <View style={styles.nameAndLocationRow}>
                <Text style={styles.hostNameNew}>{nome}</Text>
                <Text style={styles.locationNew}>| {bairro || 'Bairro'}</Text>
              </View>

              <View style={styles.sectionDivider} />

              <View style={styles.acceptedPetsRow}>
                <Text style={styles.acceptedLabelNew}>Aceita:</Text>
                {petsAccepted.map((pet, i) => (
                  <PetIcon key={i} petName={pet} />
                ))}
              </View>
              <Text style={styles.maxPetsText}>Máx de Pets por reserva: {anfitriao.capacidade_maxima}</Text>
              <Text style={styles.petWeightText}>
                Cuida de Pets de: {anfitriao.tamanho_pet || 'Todos os tamanhos'}
              </Text>
            </View>
          </View>

          {/* Botão de Favoritar */}
          {usuario?.id_usuario && (
            <FavoritarButton
              hostId={anfitriao.id_anfitriao}
              userId={usuario.id_usuario}
              initialFavorito={isFavorito}
            />
          )}

          {/* Rating */}
          <View style={styles.ratingSectionNew}>
            <Image source={StarIconPng} style={styles.starIcon} />
            <Text style={styles.ratingTextNew}>{rating}</Text>
          </View>

          {/* Descrição */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Descrição de {nome}</Text>
            <Text style={styles.description}>
              {anfitriao.descricao || 'Sem descrição disponível.'}
              {'\n\n'}
              Diaria<Text style={styles.dots}>................................................</Text>
              <Text style={styles.price}>R$ {price}</Text>
              <Text style={styles.priceUnit}>/dia</Text>
            </Text>
          </View>

          {/* Espaço para o Pet */}
          <View style={styles.petSpaceSection}>
            <Text style={styles.sectionTitle}>Espaço para o Pet</Text>

            <View style={styles.imageGrid}>
              <View style={styles.imageRow}>
                {fotosArray.slice(0, 3).map((foto, i) => (
                  <Image key={i} source={{ uri: foto }} style={styles.gridImage} resizeMode="cover" />
                ))}
                {Array.from({ length: Math.max(0, 3 - fotosArray.slice(0, 3).length) }).map((_, i) => (
                  <View key={`placeholder-${i}`} style={styles.gridImagePlaceholder}>
                    <Image source={HouseIconPng} style={styles.houseIcon} />
                  </View>
                ))}
              </View>

              <View style={styles.imageRow}>
                {fotosArray.slice(3, 6).map((foto, i) => (
                  <Image key={i} source={{ uri: foto }} style={styles.gridImage} resizeMode="cover" />
                ))}
                {Array.from({ length: Math.max(0, 3 - fotosArray.slice(3, 6).length) }).map((_, i) => (
                  <View key={`placeholder2-${i}`} style={styles.gridImagePlaceholder}>
                    <Image source={HouseIconPng} style={styles.houseIcon} />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                  style={styles.actionButton_FAQ} 
                  onPress={handleFAQPress} >
                    <Text style={styles.actionButtonText}>Perguntas Frequentes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton_Reserva} onPress={handleReservaPress}>
                <Text style={styles.actionButtonText}>Reserva</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Avaliações */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Avaliações dos Hospedes</Text>

            {/* Barra de busca */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="pesquise algo específico..."
                placeholderTextColor="#556A44"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.searchButton}>
                <Image source={SearchIconPng} style={styles.searchIcon} />
              </TouchableOpacity>
            </View>

            {/* Cards de avaliação */}
            {avaliacoesFiltradas.length === 0 ? (
              <Text style={styles.noReviewsText}>Nenhuma avaliação encontrada.</Text>
            ) : (
              avaliacoesFiltradas.map((av) => (
                <View key={av.id_avaliacao} style={styles.reviewCard}>
                  <View style={styles.reviewUserAvatar} />
                  <View style={styles.reviewContent}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewerName}>{av.avaliador?.nome || 'Usuário'}</Text>
                      <View style={styles.reviewRating}>
                        <Image source={StarIconPng} style={styles.starIconSmall} />
                        <Text style={styles.reviewRatingText}>{av.nota.toFixed(1).replace('.', ',')}</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewText}>{av.comentario || 'Sem comentário.'}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Como funciona? | Quero ser host!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3D18C',
    paddingTop: 38,
  },
  innerContainer: {
    flex: 1,
    margin: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 49,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 2,
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 40,
  },
  avatarInnerImage: {
    width: '60%',
    height: '60%',
    tintColor: '#FFF6E2',
    marginTop: 12,
    alignSelf: 'center',
  },
  profileSectionNew: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: -20,
    marginTop: -35,
    right: 8,
    position: 'relative',
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 60,
    backgroundColor: '#7AB24E',
    marginRight: 15,
    marginTop: -40,
  },
  profileInfoNew: {
    flex: 1,
  },
  hostNameNew: {
    color: '#556A44',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
    right: 4,
  },
  locationNew: {
    color: '#556A44',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Inter',
  },
  acceptedPetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -14,
    marginBottom: 3,
  },
  acceptedLabelNew: {
    color: '#556A44',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginRight: 5,
  },
  petTypeIcon: {
    width: 30,
    height: 25,
    marginRight: 5,
  },
  maxPetsText: {
    color: '#556A44',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Inter',
    marginBottom: 3,
  },
  petWeightText: {
    color: '#556A44',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Inter',
  },
  fav: {
    width: 75,
    height: 75,
    left: 250,
    bottom: 55,
  },
  ratingSectionNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    marginTop: -98,
    marginBottom: 20,
  },
  starIcon: {
    width: 18,
    height: 18,
    marginRight: 5,
  },
  ratingTextNew: {
    color: '#556A44',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  descriptionSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
    backgroundColor: '#E0EFD3',
    borderRadius: 15,
    paddingVertical: 15,
    marginHorizontal: 8,
  },
  descriptionTitle: {
    color: '#556A44',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter',
    marginBottom: 10,
  },
  description: {
    color: '#556A44',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 18,
  },
  dots: {
    color: '#556A44',
  },
  price: {
    color: '#556A44',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  priceUnit: {
    color: '#556A44',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Inter',
  },
  sectionDivider: {
    width: '100%',
    height: 2,
    backgroundColor: '#B3D18C',
    marginBottom: 20,
  },
  petSpaceSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#556A44',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter',
    marginBottom: 20,
    paddingLeft: 15,
  },
  imageGrid: {
    paddingHorizontal: 7,
    marginBottom: 20,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridImage: {
    width: (width - 15 * 2 - 14 * 2 - 7 * 2 - 10 * 2) / 3,
    height: (width - 15 * 2 - 14 * 2 - 7 * 2 - 10 * 2) / 3,
    borderRadius: 6,
  },
  gridImagePlaceholder: {
    width: (width - 15 * 2 - 14 * 2 - 7 * 2 - 10 * 2) / 3,
    height: (width - 15 * 2 - 14 * 2 - 7 * 2 - 10 * 2) / 3,
    backgroundColor: '#B3D18C',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  houseIcon: {
    width: 30,
    height: 30,
    tintColor: '#FFF6E2',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  actionButton_FAQ: {
    width: 195,
    height: 50,
    backgroundColor: '#7AB24E',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B3D18C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton_Reserva: {
    width: 110,
    height: 50,
    backgroundColor: '#608641',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B3D18C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF6E2',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  reviewsSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    height: 40,
    marginBottom: 15,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFF6E2',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#B3D18C',
    paddingHorizontal: 12,
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#556A44',
    height: '100%',
  },
  searchButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#7AB24E',
    borderRadius: 6,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFF6E2',
  },
  reviewCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF6E2',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#B3D18C',
    padding: 8,
    marginBottom: 15,
    marginHorizontal: 8,
    minHeight: 75,
  },
  reviewUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7AB24E',
    marginRight: 10,
  },
  reviewContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    color: '#556A44',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIconSmall: {
    width: 15,
    height: 15,
    marginRight: 3,
  },
  reviewRatingText: {
    color: '#556A44',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Inter',
  },
  reviewText: {
    color: '#556A44',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 16,
    flex: 1,
  },
  noReviewsText: {
    color: '#556A44',
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  footerText: {
    color: '#556A44',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  nameAndLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
});