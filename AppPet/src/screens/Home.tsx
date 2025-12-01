// AppPet\src\screens\Home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, FiltrosSearch } from '../navigation/types';
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

// Ajuste para o seu IP local
const API_BASE_URL = 'https://container-service-1.7q33f42wtcfq2.us-east-1.cs.amazonlightsail.com';

// --- Interfaces ---
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

interface GetAnfitrioesAtivosResponse {
  page: number;
  page_size: number;
  has_next: boolean;
  results: AnfitriaoFromApi[];
}

// --- Componentes Auxiliares ---
const PetIconItem = ({ petName }: { petName: string }) => {
  const icons: Record<string, any> = {
    cachorro: require('../../assets/icons/animais/cachorro.png'),
    gato: require('../../assets/icons/animais/gato.png'),
    passaro: require('../../assets/icons/animais/passaro.png'),
    tartaruga: require('../../assets/icons/animais/tartaruga.png'),
  };
  const source = icons[petName.toLowerCase()] || icons['cachorro']; // Fallback
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
  rawData?: AnfitriaoFromApi;
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

  const { usuario, filtros } = route.params;
  
  // Estado para armazenar filtros ativos
  const [activeFilters, setActiveFilters] = useState<FiltrosSearch | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [hosts, setHosts] = useState<HostCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  // Monitora alterações nos params da rota (quando volta da tela de Filtros)
  useEffect(() => {
    if (filtros) {
        setActiveFilters(filtros);
        setCurrentPage(1); // Reseta para primeira página ao filtrar
    }
  }, [filtros]);

  // Função para limpar filtros
  const clearFilters = () => {
      setActiveFilters(null);
      setCurrentPage(1);
      navigation.setParams({ filtros: undefined }); // Limpa params da rota
  };

  const fetchHosts = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        
        let url = '';

        // SE houver filtros ativos, usa a rota de busca
        if (activeFilters) {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('page_size', pageSize.toString());
            
            if (activeFilters.region) params.append('cidade', activeFilters.region);
            if (activeFilters.tipo) params.append('tipo_pet', activeFilters.tipo);
            if (activeFilters.size) params.append('tamanho', activeFilters.size);
            
            // Lógica de Preço Atualizada
            if (activeFilters.priceMin !== undefined) {
                params.append('preco_min', activeFilters.priceMin.toString());
            }
            if (activeFilters.priceMax !== undefined) {
                params.append('preco_max', activeFilters.priceMax.toString());
            }
            
            url = `${API_BASE_URL}/anfitrioes/buscar?${params.toString()}`;
        } else {
            // Rota padrão (sem filtros)
            url = `${API_BASE_URL}/anfitrioes/ativos?page=${page}&page_size=${pageSize}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Erro HTTP ${response.status}`);
        }

        const data: GetAnfitrioesAtivosResponse = await response.json();

        // Mapeamento de dados
        const mappedHosts: HostCardProps[] = data.results.map((item) => {
          const nome = item.usuarios?.nome ?? 'Anfitrião';
          const cidade = item.usuarios?.cidade ?? '';
          const bairro = item.usuarios?.bairro ?? '';
          const location = cidade && bairro ? `${cidade}, ${bairro}` : cidade || bairro || 'Local não informado';

          const ratingNumber = item.rating_medio ?? 5;
          const rating = ratingNumber.toFixed(1).replace('.', ',');

          const precoNumber = typeof item.preco === 'number' ? item.preco : Number(item.preco) || 0;
          const price = precoNumber.toFixed(2).replace('.', ',');

          // Tratamento de fotos (pode vir array ou string JSON)
          let fotosArray: string[] = [];  
          if (Array.isArray(item.fotos_urls)) {  
            fotosArray = item.fotos_urls;  
          } else if (typeof item.fotos_urls === 'string' && item.fotos_urls.trim() !== '') {  
            try { 
                const parsed = JSON.parse(item.fotos_urls); 
                if (Array.isArray(parsed)) fotosArray = parsed; 
            } catch (e) {
                // Se falhar parse, assume que é URL direta se começar com http
                if(item.fotos_urls.startsWith('http')) fotosArray = [item.fotos_urls];
            }  
          }  
            
          const firstPhoto = fotosArray.length > 0 
            ? fotosArray[0] 
            : 'https://via.placeholder.com/800x600/B3D18C/FFFFFF?text=Pet';

          return {
            id_anfitriao: item.id_anfitriao,
            name: nome,
            location,
            rating,
            price,
            imageUri: firstPhoto,
            petsAccepted: item.especie ?? [],
            rawData: item,
          };
        });

        setHosts(mappedHosts);
        setHasNext(data.has_next);
        setCurrentPage(data.page);
      } catch (error: any) {
        console.error('Erro ao buscar anfitriões:', error);
        Alert.alert('Erro', 'Não foi possível carregar os anfitriões.');
      } finally {
        setLoading(false);
      }
    },
    [pageSize, activeFilters], // Recarrega se filtros mudarem
  );

  useEffect(() => {
    fetchHosts(currentPage);
  }, [fetchHosts, currentPage]);

  const handleChangePage = (page: number) => {
    if (page < 1) return;
    fetchHosts(page);
  };

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
                if (item === 'favoritos') navigation.navigate('Favoritos', { usuario });
                if (item === 'conta') navigation.navigate('Perfil_Tutor', { id_usuario: usuario.id_usuario });
                if (item === 'Reservas') navigation.navigate('Reserva_Tutor', { usuario});
                if (item === 'config') navigation.navigate('Configuracoes', { usuario});
              }}
            >
              <HomeIcon name={item} />
              <Text style={styles.navButtonText}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão de Filtros */}
        <View style={styles.filtersHeader}>
          <TouchableOpacity
            style={styles.filtersButton}
            onPress={() => navigation.navigate('Filtros', { usuario })} // Passa usuário para saber voltar
          >
            <Text style={styles.filtersText}>Filtros de Busca</Text>
            <FilterIcon />
          </TouchableOpacity>
        </View>

        {/* BANNER DE FILTRO ATIVO (Novo) */}
        {activeFilters && (
            <View style={styles.activeFilterContainer}>
                <View style={{flexDirection:'column'}}>
                    <Text style={styles.activeFilterTitle}>Filtro Ativo:</Text>
                    <Text style={styles.activeFilterText}>
                         {activeFilters.tipo} • {activeFilters.region || 'Todas regiões'}
                    </Text>
                </View>
                <TouchableOpacity onPress={clearFilters} style={styles.closeFilterButton}>
                    <Text style={styles.closeFilterX}>X</Text>
                </TouchableOpacity>
            </View>
        )}

        {/* Lista de Anfitriões */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color="#556A44" size="large" />
          </View>
        ) : hosts.length === 0 ? (
           // Estado Vazio com Filtro
           <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{color: '#556A44', fontSize: 16, textAlign: 'center', marginBottom: 20}}>
                    Nenhum anfitrião encontrado com esses critérios.
                </Text>
                {activeFilters && (
                    <TouchableOpacity onPress={clearFilters} style={styles.clearFilterButton}>
                        <Text style={styles.clearFilterButtonText}>Limpar Filtros</Text>
                    </TouchableOpacity>
                )}
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
               {currentPage > 1 && (
                  <TouchableOpacity onPress={() => handleChangePage(currentPage - 1)}>
                     <Text style={styles.pageNumber}>{'<'}</Text>
                  </TouchableOpacity>
               )}
               <Text style={[styles.pageNumber, styles.currentPage]}>{currentPage}</Text>
               {hasNext && (
                  <TouchableOpacity onPress={() => handleChangePage(currentPage + 1)}>
                     <Text style={styles.pageNumber}>{'>'}</Text>
                  </TouchableOpacity>
               )}
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

  filtersHeader: { alignItems: 'flex-end', marginBottom: 15 },
  filtersButton: { flexDirection: 'row', alignItems: 'center' },
  filtersText: { color: '#556A44', fontSize: 16, fontFamily: 'Inter', marginRight: 8 },
  filterIconImage: { width: 30, height: 30, marginLeft: 5 },

  // --- Estilos do Filtro Ativo ---
  activeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#85B65E',
    padding: 12,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#B3D18C'
  },
  activeFilterTitle: { color: '#FFF6E2', fontSize: 10, fontWeight: 'bold' },
  activeFilterText: { color: '#FFF6E2', fontSize: 14, fontWeight: '600' },
  closeFilterButton: { padding: 5 },
  closeFilterX: { color: '#FFF6E2', fontSize: 18, fontWeight: '900' },
  
  clearFilterButton: { backgroundColor: '#85B65E', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  clearFilterButtonText: { color: '#FFF', fontWeight: 'bold' },
  // ------------------------------

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
  pageNumber: { color: '#556A44', fontSize: 18, fontFamily: 'Inter' },
  currentPage: { fontWeight: '700', fontSize: 20, textDecorationLine: 'underline' },

  footer: { alignItems: 'center', paddingVertical: 15 },
  footerText: { color: '#556A44', fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },
});