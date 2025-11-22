import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';  
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import {View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, FlatList } from 'react-native';

const { width } = Dimensions.get('window');

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

const DropdownArrow = () => <View style={styles.dropdownArrow} />;
const FilterIcon = () => <Image source={require('../../assets/icons/filter.png')} style={styles.filterIconImage} resizeMode="contain" />;
const StarIcon = () => <Image source={require('../../assets/icons/star.png')} style={{ width: 15, height: 15 }} resizeMode="contain" />;

const PetIcons = ({ petsAccepted }: { petsAccepted: string[] }) => (
  <View style={styles.petIconsContainer}>
    {petsAccepted.map((pet, i) => <PetIconItem key={i} petName={pet} />)}
  </View>
  );

// --- Host Card ---
export interface HostCardProps {
  name: string;
  location: string;
  rating: string;
  price: string;
  imageUri: string;
  petsAccepted: string[];
  onPress?: () => void; // função opcional para clique
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

// --- Home Screen ---
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;  
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;


export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();

  const { usuario } = route.params;  // <- aqui você pega o usuário logado  
  
  console.log('Usuário logado na Home:', usuario);


  const [currentPage, setCurrentPage] = useState(1);

// mock hosts
  const hostData: HostCardProps[] = [
    {
      name: 'Vitor M.',
      location: 'Praia Grande, Tupi',
      rating: '4,5',
      price: '65,00',
      imageUri: 'https://api.builder.io/api/v1/image/assets/TEMP/6072e97bcbf70e38ce569688de21b40f922a177c?width=688',
      petsAccepted: ['gato', 'cachorro'],
    },
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
  ];

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
                if (item === 'conta') navigation.navigate('Perfil_Tutor');
                if (item === 'Reservas') navigation.navigate('Reserva_Tutor');
                if (item === 'config') navigation.navigate('Configuracoes');
              }}>
              
              <HomeIcon name={item} />
              <Text style={styles.navButtonText}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
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
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {hostData.map((host, i) => (
            <HostCard
              key={i}
              {...host}
              onPress={() => navigation.navigate('Card_Host', { host })}
            />
          ))}

          {/* Pagination */}
          <View style={styles.pagination}>
            {[1, 2, 3, 4].map((page) => (
              <TouchableOpacity key={page} onPress={() => setCurrentPage(page)}>
                <Text style={[styles.pageNumber, currentPage === page && styles.currentPage]}>{page}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.pageNumber}>...</Text>
            <TouchableOpacity onPress={() => setCurrentPage(10)}>
              <Text style={[styles.pageNumber, currentPage === 10 && styles.currentPage]}>10</Text>
            </TouchableOpacity>
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
  // === Container Principal ===
  container: { flex: 1, backgroundColor: '#B3D18C' }, 
  innerContainer: { flex: 1, marginHorizontal: 12, marginTop: 30, marginBottom: 4, backgroundColor: '#FFFFFF', borderRadius: 40, paddingHorizontal: 20, paddingVertical: 28,}, 

  // === Top Navigation (Ícones Config/Chats/Favoritos/Conta) ===
  topNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  navButton: { width: 70, height: 70, borderRadius: 17, borderWidth: 2, borderColor: '#B3D18C', backgroundColor: '#85B65E', justifyContent: 'center', alignItems: 'center' },
  navButtonText: { color: '#FFF6E2', fontSize: 11, fontFamily: 'Inter', marginTop: 4 },

  // === Filtros de Busca ===
  searchContainer: { flexDirection: 'row', height: 54, marginBottom: 10 },
  searchFilters: { flex: 1, flexDirection: 'row', borderWidth: 2, borderColor: '#B3D18C', backgroundColor: '#FFF6E2', borderRadius: 6, alignItems: 'center', paddingHorizontal: 15 },
  filterButton: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  filterText: { color: '#556A44', fontSize: 15, fontFamily: 'Inter', marginRight: 4 },
  dropdownArrow: { width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderTopWidth: 4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#556A44' },
  filterDivider: { width: 1, height: 20, backgroundColor: '#B3D18C', marginHorizontal: 8 },

  // === Botão de Filtros Adicionais ===
  filtersHeader: { alignItems: 'flex-end', marginBottom: 15 },
  filtersButton: { flexDirection: 'row', alignItems: 'center' },
  filtersText: { color: '#556A44', fontSize: 16, fontFamily: 'Inter', marginRight: 8 },
  filterIconImage: { width: 30, height: 30, marginLeft: 5 },

  // === ScrollView dos Hosts ===
  scrollContainer: { flex: 1 },

  // === Host Card ===
  hostCard: { width: width - 64, height: 172, borderRadius: 15, borderWidth: 2, borderColor: '#B3D18C', backgroundColor: '#FFF6E2', marginBottom: 15, overflow: 'hidden', position: 'relative' },
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

  // === Ícones dos Pets ===
  petIconsContainer: { flexDirection: 'row', gap: 4 },
  petIconImage: { width: 25, height: 25 },

  // === Paginação ===
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20, gap: 20 },
  pageNumber: { color: '#556A44', fontSize: 15, fontFamily: 'Inter' },
  currentPage: { fontWeight: '700' },

  // === Footer ===
  footer: { alignItems: 'center', paddingVertical: 15 },
  footerText: { color: '#556A44', fontSize: 15, fontWeight: '700', fontFamily: 'Inter' },
});
