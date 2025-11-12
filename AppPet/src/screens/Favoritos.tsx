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

const SearchIcon = () => (
  <View style={styles.searchIconContainer}>
    <View style={styles.searchCircle} />
    <View style={styles.searchHandle} />
  </View>
);

const StarIcon = () => (
  <View style={styles.starContainer}>
    <View style={styles.star} />
  </View>
);

const PetIcon = ({ type }: { type: 'cat' | 'dog' | 'bird' | 'fish' }) => {
  const getIconColor = () => {
    switch (type) {
      case 'cat':
        return '#F4A460';
      case 'dog':
        return '#D2691E';
      case 'bird':
        return '#90EE90';
      case 'fish':
        return '#87CEEB';
      default:
        return '#FFF';
    }
  };

  return (
    <View style={[styles.petIcon, { backgroundColor: getIconColor() }]} />
  );
};

const PetIcons = ({ pets }: { pets: ('cat' | 'dog' | 'bird' | 'fish')[] }) => (
  <View style={styles.petIconsContainer}>
    {pets.map((pet, index) => (
      <PetIcon key={index} type={pet} />
    ))}
  </View>
);

const FavoriteCard = ({ 
  name, 
  location, 
  rating, 
  price, 
  imageUri,
  pets
}: {
  name: string;
  location: string;
  rating: string;
  price: string;
  imageUri: string;
  pets: ('cat' | 'dog' | 'bird' | 'fish')[];
}) => (
  <TouchableOpacity style={styles.favoriteCard}>
    <Image 
      source={{ uri: imageUri }} 
      style={styles.cardImage}
      resizeMode="cover"
    />
    <View style={styles.cardOverlay} />
    
    <View style={styles.cardContent}>
      <View style={styles.hostInfo}>
        <Text style={styles.hostName}>{name}</Text>
        <Text style={styles.hostLocation}>{location}</Text>
      </View>
      
      <PetIcons pets={pets} />
      
      <View style={styles.cardBottom}>
        <View style={styles.ratingContainer}>
          <StarIcon />
          <Text style={styles.rating}>{rating}</Text>
        </View>
        <Text style={styles.price}>
          <Text style={styles.priceAmount}>R$ {price}</Text>
          <Text style={styles.priceUnit}>/dia</Text>
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function Favoritos() {
  const favoriteHosts = [
    {
      name: 'Igor S.',
      location: 'Praia Grande, Caiçara',
      rating: '5,0',
      price: '75,00',
      imageUri: 'https://api.builder.io/api/v1/image/assets/TEMP/c8b291796d5992f0a8ca9f01c61cf18449dd892b',
      pets: ['cat', 'dog'] as ('cat' | 'dog' | 'bird' | 'fish')[],
    },
    {
      name: 'Ellen R.',
      location: 'Praia Grande, Mirim',
      rating: '5,0',
      price: '80,00',
      imageUri: 'https://api.builder.io/api/v1/image/assets/TEMP/af2836f80ee9f66f26be800dc23edbde1db69238',
      pets: ['cat', 'dog', 'bird', 'fish'] as ('cat' | 'dog' | 'bird' | 'fish')[],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Background decorative elements */}
      <View style={styles.decorativeElements}>
        <View style={[styles.pawPrint, styles.pawPrint1]} />
        <View style={[styles.pawPrint, styles.pawPrint2]} />
        <View style={[styles.pawPrint, styles.pawPrint3]} />
      </View>

      <View style={styles.mainContainer}>
        {/* Logo area */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground} />
          <View style={styles.petLogo} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Hosts Favoritos</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput}
            placeholder="pesquise algo espeficíco..."
            placeholderTextColor="rgba(85, 106, 68, 0.45)"
          />
          <TouchableOpacity style={styles.searchButton}>
            <SearchIcon />
          </TouchableOpacity>
        </View>

        {/* Favorites List */}
        <ScrollView 
          style={styles.favoritesContainer} 
          showsVerticalScrollIndicator={false}
        >
          {favoriteHosts.map((host, index) => (
            <FavoriteCard
              key={index}
              name={host.name}
              location={host.location}
              rating={host.rating}
              price={host.price}
              imageUri={host.imageUri}
              pets={host.pets}
            />
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Como funciona? | Quero ser host!</Text>
        </View>
      </View>

      {/* Bottom decorative elements */}
      <View style={styles.bottomDecorative}>
        <View style={[styles.pawPrint, styles.pawPrint4]} />
        <View style={[styles.pawPrint, styles.pawPrint5]} />
        <View style={[styles.pawPrint, styles.pawPrint6]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3D18C',
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
  },
  pawPrint: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(179, 209, 140, 0.6)',
    borderRadius: 20,
    position: 'absolute',
  },
  pawPrint1: {
    top: 20,
    right: 40,
    transform: [{ rotate: '30deg' }],
  },
  pawPrint2: {
    top: 60,
    right: 80,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  pawPrint3: {
    top: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    transform: [{ rotate: '-20deg' }],
  },
  bottomDecorative: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 200,
    height: 200,
  },
  pawPrint4: {
    bottom: 100,
    left: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  pawPrint5: {
    bottom: 60,
    left: 60,
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  pawPrint6: {
    bottom: 20,
    left: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    transform: [{ rotate: '45deg' }],
  },
  mainContainer: {
    flex: 1,
    margin: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 49,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  logoContainer: {
    position: 'absolute',
    top: -22,
    right: 20,
    width: 179,
    height: 179,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBackground: {
    width: 132,
    height: 121,
    backgroundColor: '#B3D18C',
    borderRadius: 60,
    transform: [{ rotate: '-135deg' }],
  },
  petLogo: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#B3D18C',
    borderRadius: 25,
    transform: [{ rotate: '-0.5deg' }],
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#556A44',
    textAlign: 'center',
    marginTop: 80,
    marginBottom: 30,
    fontFamily: 'Inter',
  },
  searchContainer: {
    height: 30,
    marginHorizontal: 17,
    marginBottom: 30,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    height: 30,
    borderWidth: 2,
    borderColor: '#B3D18C',
    borderRadius: 6,
    backgroundColor: '#FFF6E2',
    paddingHorizontal: 12,
    paddingRight: 50,
    fontSize: 13,
    color: '#556A44',
    fontFamily: 'Inter',
  },
  searchButton: {
    position: 'absolute',
    right: 5,
    top: 5,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconContainer: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  searchCircle: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: '#7AB24E',
    borderRadius: 7,
    position: 'absolute',
    top: 1,
    left: 1,
  },
  searchHandle: {
    width: 6,
    height: 2,
    backgroundColor: '#7AB24E',
    borderRadius: 1,
    position: 'absolute',
    bottom: 1,
    right: 1,
    transform: [{ rotate: '45deg' }],
  },
  favoritesContainer: {
    flex: 1,
    paddingHorizontal: 9,
  },
  favoriteCard: {
    width: 336,
    height: 172,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#B3D18C',
    backgroundColor: '#FFF6E2',
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '106%',
    height: 240,
    position: 'absolute',
    top: -68,
    left: 0,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.37)',
    borderRadius: 14,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  hostInfo: {
    alignSelf: 'flex-start',
  },
  hostName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  hostLocation: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Inter',
  },
  petIconsContainer: {
    position: 'absolute',
    top: 9,
    right: 16,
    flexDirection: 'row',
    gap: 2,
  },
  petIcon: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    width: 15,
    height: 15,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    width: 15,
    height: 15,
    backgroundColor: '#FFF',
    transform: [{ rotate: '45deg' }],
  },
  rating: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '400',
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
  footer: {
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  footerText: {
    color: '#556A44',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
