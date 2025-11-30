// AppPet\src\screens\Home_Host.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
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
  Alert
} from 'react-native';

const { width } = Dimensions.get('window');
// Ajuste para o IP da sua máquina se estiver rodando no Android Emulator ou Dispositivo Físico
// Ex: 'http://10.0.2.2:8000' (Emulador Android Padrão) ou seu IP local 'http://192.168.x.x:8000'
const API_BASE_URL = 'http://localhost:8000'; 

// --- Interfaces ---
interface UsuarioFromApi {
  id_usuario: number;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  bairro?: string;
  foto_perfil_url?: string;
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

// --- Componentes de UI ---
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

const FilterIcon = () => <Image source={require('../../assets/icons/filter.png')} style={styles.filterIconImage} resizeMode="contain" />;
const StarIcon = () => <Image source={require('../../assets/icons/star.png')} style={{ width: 15, height: 15 }} resizeMode="contain" />;

const PetIcons = ({ petsAccepted }: { petsAccepted: string[] }) => (
  <View style={styles.petIconsContainer}>
    {petsAccepted.map((pet, i) => <PetIconItem key={i} petName={pet} />)}
  </View>
);

// --- Card do Host ---
export interface HostCardProps {
  id_anfitriao?: number;
  name: string;
  location: string;
  rating: string;
  price: string;
  imageUri: string;
  petsAccepted: string[];
  rawData?: AnfitriaoFromApi;
  onPress?: () => void;
  isMine?: boolean;
}

const HostCard = ({ name, location, rating, price, imageUri, petsAccepted, onPress, isMine }: HostCardProps) => (
  <TouchableOpacity 
    style={[styles.hostCard, isMine && styles.myHostCardBorder]} 
    onPress={onPress} 
    activeOpacity={0.8}
  >
    <Image source={{ uri: imageUri }} style={styles.hostImage} resizeMode="cover" />
    <View style={styles.overlay} />
    {isMine && (
      <View style={styles.myTagContainer}>
        <Text style={styles.myTagText}>Você</Text>
      </View>
    )}
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

// --- Tela Principal ---
type HomeHostScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home_Host'>;
type HomeHostScreenRouteProp = RouteProp<RootStackParamList, 'Home_Host'>;

export default function Home_Host() {
  const navigation = useNavigation<HomeHostScreenNavigationProp>();
  const route = useRoute<HomeHostScreenRouteProp>();
  const { usuario } = route.params;

  // Estados
  const [loading, setLoading] = useState(false);
  const [myHost, setMyHost] = useState<HostCardProps | null>(null);
  const [otherHosts, setOtherHosts] = useState<HostCardProps[]>([]);
  
  // Paginação
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const pageSize = 10; // Reduzi para 10 para testar a paginação mais facilmente

  const mapApiToCard = (item: AnfitriaoFromApi): HostCardProps => {
    const nome = item.usuarios?.nome ?? 'Anfitrião';
    const cidade = item.usuarios?.cidade ?? '';
    const bairro = item.usuarios?.bairro ?? '';
    const location = cidade && bairro ? `${cidade}, ${bairro}` : cidade || bairro || 'Local não informado';

    const ratingNumber = item.rating_medio ?? 5;
    const rating = ratingNumber.toFixed(1).replace('.', ',');

    const precoNumber = typeof item.preco === 'number' ? item.preco : Number(item.preco) || 0;
    const price = precoNumber.toFixed(2).replace('.', ',');

    let fotosArray: string[] = [];
    if (Array.isArray(item.fotos_urls)) {
      fotosArray = item.fotos_urls;
    } else if (typeof item.fotos_urls === 'string' && item.fotos_urls.trim() !== '') {
      try {
        const parsed = JSON.parse(item.fotos_urls);
        if (Array.isArray(parsed)) fotosArray = parsed;
      } catch (e) {
        if (item.fotos_urls.startsWith('http')) fotosArray = [item.fotos_urls];
      }
    }

    const firstPhoto = fotosArray.length > 0 
      ? fotosArray[0] 
      : 'https://via.placeholder.com/800x600/B3D18C/FFFFFF?text=Lar+Doce+Pet';

    return {
      id_anfitriao: item.id_anfitriao,
      name: nome,
      location,
      rating,
      price,
      imageUri: firstPhoto,
      petsAccepted: item.especie ?? [],
      rawData: item
    };
  };

  const fetchHosts = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/anfitrioes/ativos?page=${currentPage}&page_size=${pageSize}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Falha ao buscar anfitriões');

      const data: GetAnfitrioesAtivosResponse = await response.json();
      
      let foundMyHost: HostCardProps | null = null;
      const others: HostCardProps[] = [];

      data.results.forEach((item) => {
        const cardData = mapApiToCard(item);
        if (item.usuarios && item.usuarios.id_usuario === usuario.id_usuario) {
          foundMyHost = { ...cardData, isMine: true };
        } else {
          others.push(cardData);
        }
      });

      // Só atualiza o "meu host" se encontrar nesta página ou se ainda não tiver encontrado
      if (foundMyHost) setMyHost(foundMyHost);
      
      setOtherHosts(others);
      setHasNext(data.has_next);

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar os anúncios.');
    } finally {
      setLoading(false);
    }
  }, [usuario.id_usuario]);

  useEffect(() => {
    fetchHosts(page);
  }, [page, fetchHosts]);

  const handleChangePage = (newPage: number) => {
    if (newPage < 1) return;
    setPage(newPage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        
        {/* Nav Topo */}
        <View style={styles.topNav}>
          {['config', 'Reservas', 'conta'].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.navButton}
              onPress={() => {
                if (item === 'conta') navigation.navigate('Perfil_Host', { host: myHost || {} as any });
                if (item === 'Reservas') navigation.navigate('Reserva_Host', { usuario: usuario });
                if (item === 'config') navigation.navigate('Configuracoes');
              }}>
              <HomeIcon name={item} />
              <Text style={styles.navButtonText}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filtros */}
        <View style={styles.filtersHeader}>
          <TouchableOpacity 
            style={styles.filtersButton}
            onPress={() => navigation.navigate('Filtros')}
            >
            <Text style={styles.filtersText}>Filtros de Busca</Text>
            <FilterIcon />
          </TouchableOpacity>
        </View>

        {loading && otherHosts.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#556A44" />
          </View>
        ) : (
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            
            {/* --- SEU ANÚNCIO --- */}
            {/* Mostra sempre, mesmo que tenha vindo de outra paginação se já foi carregado antes */}
            {myHost && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Seu Anúncio</Text>
                <HostCard
                  {...myHost}
                  onPress={() => navigation.navigate('Perfil_Host', { host: myHost })}
                />
                <View style={styles.divider} />
              </View>
            )}

            {/* --- OUTROS HOSTS --- */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Outros Anfitriões</Text>
              {otherHosts.length > 0 ? (
                otherHosts.map((host, i) => (
                  <HostCard
                    key={host.id_anfitriao || i}
                    {...host}
                    onPress={() => navigation.navigate('Card_Host', { host, usuario })}
                  />
                ))
              ) : (
                <Text style={styles.infoText}>Nenhum outro anfitrião nesta página.</Text>
              )}
            </View>

            {/* --- PAGINAÇÃO --- */}
            <View style={styles.pagination}>
              {/* Botão Anterior */}
              {page > 1 && (
                <TouchableOpacity onPress={() => handleChangePage(page - 1)}>
                  <Text style={styles.pageNumber}>{'<'}</Text>
                </TouchableOpacity>
              )}

              {/* Número da Página Atual */}
              <TouchableOpacity disabled>
                <Text style={[styles.pageNumber, styles.currentPage]}>{page}</Text>
              </TouchableOpacity>

              {/* Botão Próximo */}
              {hasNext && (
                <TouchableOpacity onPress={() => handleChangePage(page + 1)}>
                  <Text style={styles.pageNumber}>{'>'}</Text>
                </TouchableOpacity>
              )}
            </View>

          </ScrollView>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Como funciona? | Central de Ajuda</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#B3D18C' }, 
  innerContainer: { flex: 1, marginHorizontal: 12, marginTop: 30, marginBottom: 4, backgroundColor: '#FFFFFF', borderRadius: 40, paddingHorizontal: 20, paddingVertical: 28,}, 

  topNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  navButton: { width: 100, height: 70, borderRadius: 17, borderWidth: 2, borderColor: '#B3D18C', backgroundColor: '#85B65E', justifyContent: 'center', alignItems: 'center' },
  navButtonText: { color: '#FFF6E2', fontSize: 11, fontFamily: 'Inter', marginTop: 4 },

  filtersHeader: { alignItems: 'flex-end', marginBottom: 15 },
  filtersButton: { flexDirection: 'row', alignItems: 'center' },
  filtersText: { color: '#556A44', fontSize: 16, fontFamily: 'Inter', marginRight: 8 },
  filterIconImage: { width: 30, height: 30, marginLeft: 5 },

  scrollContainer: { flex: 1 },
  sectionContainer: { marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#556A44', marginBottom: 10, fontFamily: 'Inter' },
  infoText: { color: '#888', fontStyle: 'italic', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 15 },

  hostCard: { width: width - 64, height: 172, borderRadius: 15, borderWidth: 2, borderColor: '#B3D18C', backgroundColor: '#FFF6E2', marginBottom: 15, overflow: 'hidden', position: 'relative' },
  myHostCardBorder: { borderColor: '#556A44', borderWidth: 3 },
  
  hostImage: { width: '100%', height: '150%', position: 'absolute', top: -40 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.37)', borderRadius: 14 },
  
  myTagContainer: { position: 'absolute', top: 0, right: 0, backgroundColor: '#556A44', borderBottomLeftRadius: 10, paddingHorizontal: 10, paddingVertical: 4, zIndex: 10 },
  myTagText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

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

  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20, gap: 20 },
  pageNumber: { color: '#556A44', fontSize: 18, fontFamily: 'Inter' },
  currentPage: { fontWeight: '700', fontSize: 20, textDecorationLine: 'underline' },

  footer: { alignItems: 'center', paddingVertical: 15 },
  footerText: { color: '#556A44', fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },
});