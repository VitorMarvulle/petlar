import React, {useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Dimensions} from 'react-native';

const { width } = Dimensions.get('window');

// Import PNGs
const UserIconPng = require('../../../assets/icons/user.png'); // Adicione seu PNG para o ícone de usuário
const StarIconPng = require('../../../assets/icons/YellowStar.png'); // Adicione seu PNG para o ícone de estrela
const HouseIconPng = require('../../../assets/icons/casa.png'); // Adicione seu PNG para o ícone de casa
const SearchIconPng = require('../../../assets/icons/search.png'); // Adicione seu PNG para o ícone de busca
const CatIconPng = require('../../../assets/icons/animais/gatoVerde.png'); // Adicione seu PNG para o ícone de gato
const DogIconPng = require('../../../assets/icons/animais/cachorroVerde.png'); // Adicione seu PNG para o ícone de cachorro
const NaoFavorito = require('../../../assets/icons/GreyFav.png');
const Favorito = require('../../../assets/icons/GoldFav.png');

const FavoritarButton = ({ hostId }) => {
    const [isFavorito, setIsFavorito] = useState(false);
    
    const toggleFavorito = () => {
        const newState = !isFavorito;
        setIsFavorito(newState);
        
        if (newState) {
            console.log(`Usuário ${hostId} ADICIONADO aos favoritos!`);
        } else {
            console.log(`Usuário ${hostId} REMOVIDO dos favoritos.`);
        }
    };

    const imageSource = isFavorito ? Favorito : NaoFavorito;

    return (
          <View>
            <TouchableOpacity onPress={toggleFavorito}>
              <Image 
                source={imageSource} 
                style={styles.fav} 
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
    )
}

const UserAvatar = () => (
    <View style={styles.profileAvatar}> // Este View é a 'bola' verde 50x50
        <Image 
            source={UserIconPng} 
            style={styles.avatarInnerImage} // Este estilo vai ser menor que 50x50
            resizeMode="contain"
        />
    </View>
);

export default function PerfilHost({ navigation }) {
  const hostId = 'igor-gallo-seabra';
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
   
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.profileSectionNew}>
            <UserAvatar />
            <View style={styles.profileInfoNew}>

              <View style={styles.nameAndLocationRow}>
                <Text style={styles.hostNameNew}>Igor Gallo Seabra</Text>
                <Text style={styles.locationNew}>| Tupi</Text>
              </View>

              <View style={styles.sectionDivider} />

              <View style={styles.acceptedPetsRow}>
                <Text style={styles.acceptedLabelNew}>Aceita:</Text>
                <Image source={CatIconPng} style={styles.petTypeIcon} />
                <Image source={DogIconPng} style={styles.petTypeIcon} />
              </View>
                <Text style={styles.maxPetsText}>Máx de Pets por reserva: 3</Text>
              <Text style={styles.petWeightText}>Cuida de Pets de: 7-18kg</Text>
            </View>
          </View>

          <FavoritarButton hostId={hostId} />

          {/* Rating - Moved and Styled */}
          <View style={styles.ratingSectionNew}>
            <Image source={StarIconPng} style={styles.starIcon} />
            <Text style={styles.ratingTextNew}>5,0</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Descrição de Igor</Text>
            <Text style={styles.description}>
              Sou morador de Praia Grande e fico na Tupi, adoro animais e estou em busca de renda extra!
              {'\n\n'}
              Cuido de animais idosos sem problemas e também cuido de filhotes!
              {'\n\n'}
              Diaria<Text style={styles.dots}>................................................</Text>
              <Text style={styles.price}>R$ 65,00</Text>
              <Text style={styles.priceUnit}>/dia</Text>
            </Text>
          </View>


          <View style={styles.petSpaceSection}>
            <Text style={styles.sectionTitle}>Espaço para o Pet</Text>
            
            <View style={styles.imageGrid}>
              <View style={styles.imageRow}>
                <Image 
                  source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/fa2cf4f28fc33eefa8830aaf502e6d3c9ba73328?width=200' }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
                <Image 
                  source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/076127244d718d2dc74d00209ff14c4f71fcb007?width=200' }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
                <View style={styles.gridImagePlaceholder}>
                  <Image source={HouseIconPng} style={styles.houseIcon} />
                </View>
              </View>
              
              <View style={styles.imageRow}>
                <View style={styles.gridImagePlaceholder}>
                  <Image source={HouseIconPng} style={styles.houseIcon} />
                </View>
                <View style={styles.gridImagePlaceholder}>
                  <Image source={HouseIconPng} style={styles.houseIcon} />
                </View>
                <View style={styles.gridImagePlaceholder}>
                  <Image source={HouseIconPng} style={styles.houseIcon} />
                </View>
              </View>
            </View>


            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton_FAQ}>
                <Text style={styles.actionButtonText}>Perguntas Frequentes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton_Reserva} onPress={() => navigation.navigate('Reserva')}>
                <Text style={styles.actionButtonText}>Reserva</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Avaliações dos Hospedes</Text>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="pesquise algo espeficíco..."
                placeholderTextColor="#556A44"
              />
              <TouchableOpacity style={styles.searchButton}>
                <Image source={SearchIconPng} style={styles.searchIcon} />
              </TouchableOpacity>
            </View>

            {/* Review Cards */}
            <View style={styles.reviewCard}>
              <Image source={UserIconPng} style={styles.reviewUserAvatar} />
              <View style={styles.reviewContent}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>Vitor M.</Text>
                  <View style={styles.reviewRating}>
                    <Image source={StarIconPng} style={styles.starIconSmall} />
                    <Text style={styles.reviewRatingText}>5,0</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>
                  Recomendo o Igor! cuidou muito bem da minha tartaruga!
                </Text>
              </View>
            </View>

            <View style={styles.reviewCard}>
              <Image source={UserIconPng} style={styles.reviewUserAvatar} />
              <View style={styles.reviewContent}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>Gabriel D.</Text>
                  <View style={styles.reviewRating}>
                    <Image source={StarIconPng} style={styles.starIconSmall} />
                    <Text style={styles.reviewRatingText}>5,0</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>
                  Recomendo o Igor! cuidou muito bem da minha papagaio!
                </Text>
              </View>
            </View>
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
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 40,
  },
  avatarInnerImage: {
      width: '60%', // Faz a imagem ter 80% do tamanho do View pai (a bola)
      height: '60%',
      tintColor: '#FFF6E2', // Se for um ícone monocromático, pinte ele
      marginTop: 12,
      alignSelf: 'center'
  },
//Perfil
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
    bottom: 55 
  },

  petPawIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40, // Ajuste o tamanho da pata
    height: 40,
    resizeMode: 'contain',
    tintColor: '#7AB24E', // Se a pata for monocromática, pode aplicar um tint
  },

  // NEW RATING SECTION STYLES (for the 5,0 below the profile info)
  ratingSectionNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    marginTop: -98, // Traga para cima para sobrepor um pouco
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
    backgroundColor: '#E0EFD3', // Cor de fundo como na imagem de referência
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

  //fotos
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
    width: (width - 15 * 2 - 14 * 2 - 7 * 2 - 10 * 2) / 3, // Adjust calculation for spacing
    height: (width - 15 * 2 - 14 * 2 - 7 * 2 - 10 * 2) / 3, // Make square
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
    tintColor: '#FFF6E2', // Se o ícone de casa for monocromático
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  actionButton_FAQ: {
    width: 195, // Aproximadamente metade da largura da tela menos margens
    height: 50,
    backgroundColor: '#7AB24E',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B3D18C',
    justifyContent: 'center',
    alignItems: 'center',
  },
    actionButton_Reserva: {
    width: 110, // Aproximadamente metade da largura da tela menos margens
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
    height: 40, // Aumentei a altura
    marginBottom: 15,
    paddingHorizontal: 8,
    alignItems: 'center', // Alinhar itens verticalmente
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
    height: '100%', // Preencher a altura do container
  },
  searchButton: {
    width: 30, // Aumentei o tamanho do botão
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#7AB24E', // Cor de fundo do botão de busca
    borderRadius: 6,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFF6E2', // Cor do ícone de busca
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
    height: 75,
  },
  reviewUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7AB24E', // Cor de fundo do ícone de usuário na avaliação
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
    flexDirection: 'row', // Isso coloca os filhos (os dois Text) lado a lado
    alignItems: 'center', // Opcional: alinha verticalmente (se um texto for maior que o outro)
    marginBottom: 5, // Ajuste o espaçamento abaixo, se necessário
},
});