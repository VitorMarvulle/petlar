import React from 'react';
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
} from 'react-native';

const { width } = Dimensions.get('window');

// --- ICONS ---
const ICON_STAR = require('../../assets/icons/star.png');
const ICON_SEARCH = require('../../assets/icons/search.png');
const ICON_LOGO_BRANCO = require('../../assets/icons/LogoBranco.png');

// --- COMPONENTES AUXILIARES (Reaproveitados de Home.js) ---

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
    {petsAccepted.map((pet, i) => <PetIconItem key={i} petName={pet} />)}
  </View>
);

const StarIcon = () => <Image source={ICON_STAR} style={styles.starIconImage} resizeMode="contain" />;

// --- HOST CARD (Reaproveitado de Home.js) ---
interface HostCardProps {
  name: string;
  location: string;
  rating: string;
  price: string;
  imageUri: string;
  petsAccepted: string[];
  onPress?: () => void;
}

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
      <Image
        source={ICON_LOGO_BRANCO} 
        style={styles.cornerImage}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.LogoText}>Lar Doce Pet</Text>
  </>
);

const SearchIconPNG = () => (
  <Image 
    source={ICON_SEARCH} 
    style={styles.searchIconImage} 
    resizeMode="contain"
  />
);

// --- DADOS MOCKADOS ORIGINAIS (3 Hosts) ---
const mockFavoriteHosts: HostCardProps[] = [
  {
    name: 'Igor S.',
    location: 'Praia Grande, Caiçara',
    rating: '5,0',
    price: '75,00',
    imageUri: 'https://api.builder.io/api/v1/image/assets/TEMP/c8b291796d5992f0a8ca9f01c61cf18449dd892b?width=722',
    petsAccepted: ['gato', 'passaro'],
  },
  {
    name: 'Ellen R.',
    location: 'Praia Grande, Mirim',
    rating: '5,0',
    price: '80,00',
    imageUri: 'https://api.builder.io/api/v1/image/assets/TEMP/af2836f80ee9f66f26be800dc23edbde1db69238?width=680',
    petsAccepted: ['cachorro', 'gato', 'passaro', 'tartaruga'],
  },
  {
    name: 'Vitor M.',
    location: 'Praia Grande, Tupi',
    rating: '4,5',
    price: '65,00',
    imageUri: 'https://api.builder.io/api/v1/image/assets/TEMP/6072e97bcbf70e38ce569688de21b40f922a177c?width=688',
    petsAccepted: ['gato', 'cachorro'],
  },
];

// -------------------------------------------------------------------
// ------------------------- TELA FAVORITOS --------------------------
// -------------------------------------------------------------------

export default function Favoritos() {

  return (
    // 1. O container principal usa flex: 1 para ocupar toda a tela
    <SafeAreaView style={styles.container}>
      
      {/* 2. Área do ScrollView (todo o conteúdo que deve rolar) */}
      <ScrollView style={styles.scrollContentArea} showsVerticalScrollIndicator={false}>
        
        {/* Logo Lar Doce Pet (Posicionado Absoluto dentro da área de scroll/view principal) */}
        <LogoLarDocePet />

        <View style={styles.innerContainer}>
          <Text style={styles.mainTitle}>Hosts Favoritos</Text>
          
          {/* Barra de Pesquisa */}
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquise por nome ou local..."
              placeholderTextColor="#556A44"
            />
            <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
              <SearchIconPNG />
            </TouchableOpacity>
          </View>

          {/* Lista de Hosts Favoritos */}
          <View style={styles.favoritesList}>
            {mockFavoriteHosts.map((host, i) => (
              <HostCard
                key={i}
                {...host}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 3. Rodapé Fixo (Fora do ScrollView, no final do SafeAreaView) */}
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
  // --- 1. Estrutura Geral (Atualizada) ---
  container: { 
    flex: 1, 
    backgroundColor: '#B3D18C' 
  },
  scrollContentArea: {
    // Permite que o ScrollView ocupe o máximo de espaço possível
    flex: 1, 
  },
  innerContainer: { 
    // É o card branco que tem o padding lateral e arredondamento
    marginHorizontal: 12, 
    marginTop: 100, // Ajuste para dar espaço ao Logo/Título
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

  // --- 2. LOGO DO PET (Estilos de Reserva_Lista.js) ---
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

  // --- 3. Barra de Pesquisa ---
  searchBarContainer: {
    flexDirection: 'row', 
    height: 54, 
    marginBottom: 20,
    borderWidth: 2, 
    borderColor: '#B3D18C', 
    backgroundColor: '#FFF6E2', 
    borderRadius: 6, 
    alignItems: 'center', 
    paddingHorizontal: 15
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
  
  // --- 4. Host Card (Estilos de Home.js) ---
  favoritesList: {
    marginBottom: 10,
    // Adiciona um padding extra para garantir que o último card não seja cortado pelo footer fixo
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
    position: 'relative' 
  },
  hostImage: { 
    width: '100%', 
    height: '150%', 
    position: 'absolute', 
    top: -40 
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.37)', 
    borderRadius: 14 
  },
  hostInfo: { 
    position: 'absolute', 
    top: 15, 
    left: 16, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  hostName: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: '700', 
    fontFamily: 'Inter', 
    marginRight: 8 
  },
  hostLocation: { 
    color: '#FFF', 
    fontSize: 13, 
    fontFamily: 'Inter', 
    position: 'absolute', 
    top: 24, 
    left: 0 
  },
  hostDetails: { 
    position: 'absolute', 
    bottom: 15, 
    right: 16, 
    alignItems: 'flex-end' 
  },
  ratingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  rating: { 
    color: '#FFF', 
    fontSize: 13, 
    fontFamily: 'Inter' 
  },
  price: { 
    color: '#FFF', 
    fontSize: 15, 
    fontFamily: 'Inter' 
  },
  priceAmount: { 
    fontWeight: '700' 
  },
  priceUnit: { 
    fontWeight: '400' 
  },
  petIconsContainer: { flexDirection: 'row', gap: 4 },
  petIconImage: { width: 25, height: 25 },
  starIconImage: { width: 15, height: 15 },
  
  // --- 5. Rodapé Fixo (Fora do ScrollView) ---
  footerFixed: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#B3D18C', 
    // Usando a cor de fundo do container principal para a faixa do footer
  },
  footerTextFixed: {
    color: '#556A44', 
    fontSize: 15, 
    fontWeight: '700', 
    fontFamily: 'Inter' 
  },
});