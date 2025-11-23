// AppPet\src\screens\Favoritos.tsx
import React, { useEffect, useState, useMemo } from 'react';
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
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://localhost:8000';

// --- Navegação / Tipos ---
type FavoritosRouteProp = RouteProp<RootStackParamList, 'Favoritos'>;
type FavoritosNavProp = NativeStackNavigationProp<RootStackParamList, 'Favoritos'>;

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
  preco?: number | string | null;
  status?: string;
  fotos_urls?: string | string[];
  usuarios?: UsuarioFromApi;
  rating_medio?: number | null;
}

// Mesmo formato da Home
interface HostCardProps {
  id_anfitriao: number;
  name: string;
  location: string;
  rating: string;
  price: string;
  imageUri: string;
  petsAccepted: string[];
  rawData?: AnfitriaoFromApi;
  onPress?: () => void;
}

// --- ICONS ---
const ICON_STAR = require('../../assets/icons/star.png');
const ICON_SEARCH = require('../../assets/icons/search.png');
const ICON_LOGO_BRANCO = require('../../assets/icons/LogoBranco.png');

// --- COMPONENTES AUXILIARES ---

const PetIconItem = ({ petName }: { petName: string }) => {
  const icons: Record<string, any> = {
    cachorro: require('../../assets/icons/animais/cachorro.png'),
    gato: require('../../assets/icons/animais/gato.png'),
    passaro: require('../../assets/icons/animais/passaro.png'),
    tartaruga: require('../../assets/icons/animais/tartaruga.png'),
  };

  const source = icons[petName.toLowerCase()];
  if (!source) return null;

  return <Image source={source} style={styles.petIconImage} resizeMode="contain" />;
};

const PetIcons = ({ petsAccepted }: { petsAccepted: string[] }) => (
  <View style={styles.petIconsContainer}>
    {petsAccepted.map((pet, i) => (
      <PetIconItem key={i} petName={pet} />
    ))}
  </View>
);

const StarIcon = () => (
  <Image source={ICON_STAR} style={styles.starIconImage} resizeMode="contain" />
);

// --- HOST CARD ---
const HostCard = ({ name, location, rating, price, imageUri, petsAccepted, onPress }: HostCardProps) => (
  <TouchableOpacity style={styles.hostCard} onPress={onPress} activeOpacity={0.8}>
    <Image source={{ uri: imageUri }} style={styles.hostImage} resizeMode="cover" />
    <View style={styles.overlay} />
    <View style={styles.hostInfo}>
      <Text style={styles.hostName}>{name}</Text>
      <PetIcons petsAccepted={petsAccepted} />
      <Text style={styles.hostLocation}>{location}</Text>
    </View>

    <View style={styles.hostDetails}>
      <View style={styles.ratingContainer}>
        <StarIcon />
        <Text style={styles.rating}>{rating}</Text>
      </View>
      <Text style={styles.price}>
        <Text style={styles.priceAmount}>R$ {price}</Text>
        <Text style={styles.priceUnit}>/dia</Text>
      </Text>
    </View>
  </TouchableOpacity>
);

// --- COMPONENTES DA TELA FAVORITOS ---

const LogoLarDocePet = () => (
  <>
    <View style={styles.cornerImageContainer}>
      <Image source={ICON_LOGO_BRANCO} style={styles.cornerImage} resizeMode="contain" />
    </View>
    <Text style={styles.LogoText}>Lar Doce Pet</Text>
  </>
);

const SearchIconPNG = () => (
  <Image source={ICON_SEARCH} style={styles.searchIconImage} resizeMode="contain" />
);

// -------------------------------------------------------------------
// ------------------------- TELA FAVORITOS --------------------------
// -------------------------------------------------------------------

export default function Favoritos() {
  const route = useRoute<FavoritosRouteProp>();
  const navigation = useNavigation<FavoritosNavProp>();

  const { usuario } = route.params;

  const [loading, setLoading] = useState(true);
  const [favoriteHosts, setFavoriteHosts] = useState<HostCardProps[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        setLoading(true);

        // 1. Buscar lista de IDs favoritos do usuário
        const favUrl = `${API_BASE_URL}/usuarios/${usuario.id_usuario}/favoritos`;
        const favResp = await fetch(favUrl);

        if (!favResp.ok) {
          const text = await favResp.text();
          throw new Error(text || `Erro HTTP favoritos ${favResp.status}`);
        }

        const favData: { anfitrioes_favoritos: number[] } = await favResp.json();
        const favoritosIds = favData.anfitrioes_favoritos || [];

        if (favoritosIds.length === 0) {
          setFavoriteHosts([]);
          return;
        }

        // 2. Para cada ID de anfitrião, buscar dados completos
        const anfitrioesPromises = favoritosIds.map(async (id_anfitriao) => {
          const url = `${API_BASE_URL}/anfitrioes/${id_anfitriao}`;
          const resp = await fetch(url);
          if (!resp.ok) {
            throw new Error(`Erro ao buscar anfitrião ${id_anfitriao}: ${resp.status}`);
          }
          const data: AnfitriaoFromApi = await resp.json();
          return data;
        });

        const anfitrioes = await Promise.all(anfitrioesPromises);

        // 3. Mapear para HostCardProps
        const mapped: HostCardProps[] = anfitrioes.map((item) => {
          const nome = item.usuarios?.nome ?? 'Anfitrião';
          const cidade = item.usuarios?.cidade ?? '';
          const bairro = item.usuarios?.bairro ?? '';
          const location =
            cidade && bairro ? `${cidade}, ${bairro}` : cidade || bairro || 'Local não informado';

          const ratingNumber = item.rating_medio ?? 5;
          const rating = ratingNumber.toFixed(1).replace('.', ',');

          let precoNumber: number;
          if (typeof item.preco === 'string') {
            precoNumber = parseFloat(item.preco) || 0;
          } else {
            precoNumber = item.preco ?? 0;
          }
          const price = precoNumber.toFixed(2).replace('.', ',');

          // fotos_urls pode vir como string JSON ou array → normalizar para array
          let fotosArray: string[] = [];

          if (Array.isArray(item.fotos_urls)) {
            fotosArray = item.fotos_urls;
          } else if (typeof item.fotos_urls === 'string' && item.fotos_urls.trim() !== '') {
            try {
              const parsed = JSON.parse(item.fotos_urls);
              if (Array.isArray(parsed)) {
                fotosArray = parsed;
              }
            } catch (e) {
              console.warn('Não foi possível fazer parse de fotos_urls:', item.fotos_urls);
            }
          }

          const firstPhoto =
            fotosArray.length > 0
              ? fotosArray[0]
              : 'https://via.placeholder.com/800x600/B3D18C/FFFFFF?text=Lar+Doce+Pet';

          const petsAccepted = item.especie ?? [];

          return {
            id_anfitriao: item.id_anfitriao,
            name: nome,
            location,
            rating,
            price,
            imageUri: firstPhoto,
            petsAccepted,
            rawData: item,
          };
        });

        setFavoriteHosts(mapped);
      } catch (error: any) {
        console.error('Erro ao carregar favoritos:', error);
        Alert.alert('Erro', 'Não foi possível carregar os hosts favoritos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritos();
  }, [usuario.id_usuario]);

  // Filtro por nome/local usando searchQuery
  const filteredHosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return favoriteHosts;

    return favoriteHosts.filter((host) => {
      const nameMatch = host.name.toLowerCase().includes(q);
      const locationMatch = host.location.toLowerCase().includes(q);
      return nameMatch || locationMatch;
    });
  }, [favoriteHosts, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContentArea} showsVerticalScrollIndicator={false}>
        <LogoLarDocePet />

        <View style={styles.innerContainer}>
          <Text style={styles.mainTitle}>Hosts Favoritos</Text>

          {/* Barra de Pesquisa */}
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquise por nome ou local..."
              placeholderTextColor="#556A44"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
              <SearchIconPNG />
            </TouchableOpacity>
          </View>

          {/* Loading ou Lista */}
          {loading ? (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <ActivityIndicator size="large" color="#556A44" />
            </View>
          ) : filteredHosts.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#556A44', marginTop: 20 }}>
              Você ainda não tem hosts favoritos.
            </Text>
          ) : (
            <View style={styles.favoritesList}>
              {filteredHosts.map((host) => (
                <HostCard
                  key={host.id_anfitriao}
                  {...host}
                  onPress={() =>
                    navigation.navigate('Card_Host', {
                      host: host.rawData || host,
                      usuario,
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footerFixed}>
        <Text style={styles.footerTextFixed}>Como funciona? | Quero ser host!</Text>
      </View>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------------
// ----------------------------- STYLES ------------------------------
// -------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3D18C',
  },
  scrollContentArea: {
    flex: 1,
  },
  innerContainer: {
    marginHorizontal: 12,
    marginTop: 100,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#556A44',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 0,
  },

  cornerImageContainer: {
    position: 'absolute',
    top: 29,
    right: 220,
    width: 60,
    height: 60,
    zIndex: 10,
  },
  cornerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  LogoText: {
    position: 'absolute',
    top: 60,
    left: 165,
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    zIndex: 10,
  },

  searchBarContainer: {
    flexDirection: 'row',
    height: 54,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#B3D18C',
    backgroundColor: '#FFF6E2',
    borderRadius: 6,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#556A44',
    fontSize: 15,
    fontFamily: 'Inter',
    paddingRight: 10,
  },
  searchButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconImage: {
    width: 25,
    height: 25,
  },

  favoritesList: {
    marginBottom: 10,
    paddingBottom: 20,
  },
  hostCard: {
    width: width - 64,
    height: 172,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#B3D18C',
    backgroundColor: '#FFF6E2',
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  hostImage: {
    width: '100%',
    height: '150%',
    position: 'absolute',
    top: -40,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.37)',
    borderRadius: 14,
  },
  hostInfo: {
    position: 'absolute',
    top: 15,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginRight: 8,
  },
  hostLocation: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Inter',
    position: 'absolute',
    top: 24,
    left: 0,
  },
  hostDetails: {
    position: 'absolute',
    bottom: 15,
    right: 16,
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Inter',
  },
  price: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Inter',
  },
  priceAmount: {
    fontWeight: '700',
  },
  priceUnit: {
    fontWeight: '400',
  },
  petIconsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  petIconImage: {
    width: 25,
    height: 25,
  },
  starIconImage: {
    width: 15,
    height: 15,
  },

  footerFixed: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#B3D18C',
  },
  footerTextFixed: {
    color: '#556A44',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});