// AppPet\src\screens\Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'http://localhost:8000';

// Tipos auxiliares pra resposta da API
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
  especie?: string[];         // array de espécies
  tamanho_pet?: string;
  preco?: number | string | null; // supabase às vezes devolve string  
  status?: string;  
  fotos_urls?: string | string[];      // array de URLs
  usuarios?: UsuarioFromApi;  // join vindo do backend
  rating_medio?: number | null;
}

interface GetAnfitrioesAtivosResponse {
  page: number;
  page_size: number;
  has_next: boolean;
  results: AnfitriaoFromApi[];
}

// --- Componentes auxiliares (sem alteração estrutural) ---
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

const HomeIcon = ({ name }: { name: string }) => {
  const icons: Record<string, { src: any; size: number }> = {
    config: { src: require('../../assets/icons/config.png'), size: 30 },
    Reservas: { src: require('../../assets/icons/planilha.png'), size: 35 },
    favoritos: { src: require('../../assets/icons/Favoritos.png'), size: 40 },
    conta: { src: require('../../assets/icons/user.png'), size: 30 },
  };

  const icon = icons[name];
  if (!icon) return null;
  return <Image source={icon.src} style={{ width: icon.size, height: icon.size }} resizeMode="contain" />;
};

const FilterIcon = () => (
  <Image source={require('../../assets/icons/filter.png')} style={styles.filterIconImage} resizeMode="contain" />
);

const StarIcon = () => (
  <Image source={require('../../assets/icons/star.png')} style={{ width: 15, height: 15 }} resizeMode="contain" />
);

const PetIcons = ({ petsAccepted }: { petsAccepted: string[] }) => (
  <View style={styles.petIconsContainer}>
    {petsAccepted.map((pet, i) => (
      <PetIconItem key={i} petName={pet} />
    ))}
  </View>
);

// --- Host Card ---
export interface HostCardProps {
  id_anfitriao: number;
  name: string;
  location: string;
  rating: string;
  price: string;
  imageUri: string;
  petsAccepted: string[];
  rawData?: AnfitriaoFromApi; // se quiser mandar tudo pro Card_Host
  onPress?: () => void;
}

const HostCard = ({
  name,
  location,
  rating,
  price,
  imageUri,
  petsAccepted,
  onPress,
}: HostCardProps) => (
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

// --- Home Screen ---
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();

  const { usuario } = route.params;
  console.log('Usuário logado na Home:', usuario);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5); // ajuste conforme quiser
  const [hosts, setHosts] = useState<HostCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const fetchHosts = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        const url = `${API_BASE_URL}/anfitrioes/ativos?page=${page}&page_size=${pageSize}`;
        const response = await fetch(url);

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Erro HTTP ${response.status}`);
        }

        const data: GetAnfitrioesAtivosResponse = await response.json();

        // Mapeia do formato da API para HostCardProps
        const mappedHosts: HostCardProps[] = data.results.map((item) => {
          const nome = item.usuarios?.nome ?? 'Anfitrião';
          const cidade = item.usuarios?.cidade ?? '';
          const bairro = item.usuarios?.bairro ?? '';
          const location =
            cidade && bairro ? `${cidade}, ${bairro}` : cidade || bairro || 'Local não informado';

          // rating: se vier média, usa; senão mock 5
          const ratingNumber = item.rating_medio ?? 5;
          const rating = ratingNumber.toFixed(1).replace('.', ',');

          // price: se vier null, coloca "0,00" ou qualquer padrão
          const precoNumber = item.preco ?? 0;
          const price = precoNumber.toFixed(2).replace('.', ',');

          // fotos_urls pode vir como string JSON ou array → normalizar para array  
          let fotosArray: string[] = [];  
            
          // se já veio array  
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
            
          // imagem: primeira foto ou placeholder  
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

        setHosts(mappedHosts);
        setHasNext(data.has_next);
        setCurrentPage(data.page);
      } catch (error: any) {
        console.error('Erro ao buscar anfitriões:', error);
        Alert.alert('Erro', 'Não foi possível carregar os anfitriões. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    fetchHosts(currentPage);
  }, [fetchHosts]);

  const handleChangePage = (page: number) => {
    if (page < 1) return;
    // se quiser bloquear avanço sem hasNext, descomente:
    // if (page > currentPage && !hasNext) return;
    fetchHosts(page);
  };

  // Cria o conjunto de páginas pra exibir
  const pagesToShow = [1, 2, 3, 4]; // simplificado, igual seu mock atual

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Top Navigation */}
        <View style={styles.topNav}>
          {['config', 'Reservas', 'favoritos', 'conta'].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.navButton}
              onPress={() => {
                if (item === 'favoritos') navigation.navigate('Favoritos');
                if (item === 'conta') navigation.navigate('Perfil_Tutor', { id_usuario: usuario.id_usuario });
                if (item === 'Reservas') navigation.navigate('Reserva_Tutor');
                if (item === 'config') navigation.navigate('Configuracoes');
              }}
            >
              <HomeIcon name={item} />
              <Text style={styles.navButtonText}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filtersHeader}>
          <TouchableOpacity
            style={styles.filtersButton}
            onPress={() => navigation.navigate('Filtros')}
          >
            <Text style={styles.filtersText}>Filtros de Busca</Text>
            <FilterIcon />
          </TouchableOpacity>
        </View>

        {/* Host Listings */}
        {loading && hosts.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color="#556A44" size="large" />
          </View>
        ) : (
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {hosts.map((host) => (
              <HostCard
                key={host.id_anfitriao}
                {...host}
                onPress={() => navigation.navigate('Card_Host', { host: host.rawData || host, usuario: usuario })}
              />
            ))}

            {/* Paginação */}
            <View style={styles.pagination}>
              {pagesToShow.map((page) => (
                <TouchableOpacity key={page} onPress={() => handleChangePage(page)}>
                  <Text
                    style={[
                      styles.pageNumber,
                      currentPage === page && styles.currentPage,
                    ]}
                  >
                    {page}
                  </Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.pageNumber}>...</Text>
              {/* Exemplo: ir para próxima página enquanto tiver dados */}
              <TouchableOpacity
                onPress={() => {
                  if (hasNext) handleChangePage(currentPage + 1);
                }}
              >
                <Text
                  style={[
                    styles.pageNumber,
                    // se quiser destacar a "página seguinte", pode ajustar aqui
                  ]}
                >
                  Próx
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Como funciona? | Quero ser host!</Text>
      </View>
    </SafeAreaView>
  );
}

// === Styles iguais aos seus originais ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#B3D18C' },
  innerContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 30,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },

  topNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  navButton: {
    width: 70,
    height: 70,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#B3D18C',
    backgroundColor: '#85B65E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: { color: '#FFF6E2', fontSize: 11, fontFamily: 'Inter', marginTop: 4 },

  searchContainer: { flexDirection: 'row', height: 54, marginBottom: 10 },
  searchFilters: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#B3D18C',
    backgroundColor: '#FFF6E2',
    borderRadius: 6,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  filterButton: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  filterText: { color: '#556A44', fontSize: 15, fontFamily: 'Inter', marginRight: 4 },
  dropdownArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#556A44',
  },
  filterDivider: { width: 1, height: 20, backgroundColor: '#B3D18C', marginHorizontal: 8 },

  filtersHeader: { alignItems: 'flex-end', marginBottom: 15 },
  filtersButton: { flexDirection: 'row', alignItems: 'center' },
  filtersText: { color: '#556A44', fontSize: 16, fontFamily: 'Inter', marginRight: 8 },
  filterIconImage: { width: 30, height: 30, marginLeft: 5 },

  scrollContainer: { flex: 1 },

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
  hostImage: { width: '100%', height: '150%', position: 'absolute', top: -40 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.37)', borderRadius: 14 },

  hostInfo: { position: 'absolute', top: 15, left: 16, flexDirection: 'row', alignItems: 'center' },
  hostName: { color: '#FFF', fontSize: 15, fontWeight: '700', fontFamily: 'Inter', marginRight: 8 },
  hostLocation: { color: '#FFF', fontSize: 13, fontFamily: 'Inter', position: 'absolute', top: 24, left: 0 },

  hostDetails: { position: 'absolute', bottom: 15, right: 16, alignItems: 'flex-end' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rating: { color: '#FFF', fontSize: 13, fontFamily: 'Inter' },
  price: { color: '#FFF', fontSize: 15, fontFamily: 'Inter' },
  priceAmount: { fontWeight: '700' },
  priceUnit: { fontWeight: '400' },

  petIconsContainer: { flexDirection: 'row', gap: 4 },
  petIconImage: { width: 25, height: 25 },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  pageNumber: { color: '#556A44', fontSize: 15, fontFamily: 'Inter' },
  currentPage: { fontWeight: '700' },

  footer: { alignItems: 'center', paddingVertical: 15 },
  footerText: { color: '#556A44', fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },
});