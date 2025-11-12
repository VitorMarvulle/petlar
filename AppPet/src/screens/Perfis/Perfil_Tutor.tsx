import React from 'react';
import {View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image} from 'react-native';
// Certifique-se de que '@react-navigation/native' está instalado e configurado
import {useNavigation} from '@react-navigation/native';

const ICON_STAR = require('../../../assets/icons/star.png'); 
const ICON_AVATAR = require('../../../assets/icons/user.png'); 
const ICON_DELETE = require('../../../assets/icons/delete.png'); 
const ICON_ADD = require('../../../assets/icons/add.png');
const ICON_EDIT = require('../../../assets/icons/edit.png');

const UserAvatar = () => (
  <View style={styles.avatarContainer}>
    <View style={styles.avatarIcon}>
      <Image
        source={ICON_AVATAR}
        style={styles.avatarImageContent}
        resizeMode="contain"
      />
    </View>
  </View>
);

const StarRating = ({rating}: {rating: string}) => (
  <View style={styles.ratingContainer}>
    <Image source={ICON_STAR} style={styles.starImage} resizeMode="contain" />
    <Text style={styles.ratingText}>{rating}</Text>
  </View>
);

const PetCard = ({
  imageUrl,
  name,
  species,
  age,
  weight,
  comportamento,
  specifications,
}: {
  imageUrl: string;
  name: string;
  species: string;
  age: string;
  weight: string;
  comportamento: string;
  specifications: string;
}) => (
  <View style={styles.petCard}>
    <View style={styles.petImageContainer}>
      <Image source={{uri: imageUrl}} style={styles.petImage} />
    </View>
    <View style={styles.petDetails}>
      <Text style={styles.petName}>{name}</Text>
      <Text style={styles.petDetailText}>
        <Text style={styles.boldText}>Espécie:</Text> {species} 🐾
      </Text>
      <Text style={styles.petDetailText}>
        <Text style={styles.boldText}>Idade:</Text> {age}
      </Text>
      <Text style={styles.petDetailText}>
        <Text style={styles.boldText}>Peso:</Text> {weight}
      </Text>
      <Text style={styles.petDetailText}>
        <Text style={styles.boldText}>Comportamento:</Text> {comportamento}
      </Text>
      <Text style={styles.specificationsTitle}>Especificações:</Text>
      <Text style={styles.specificationsText}>{specifications}</Text>
    </View>
  </View>
);

const ActionButton = ({
  onPress,
  backgroundColor,
  iconSource,
  label,
}: {
  onPress: () => void;
  backgroundColor: string;
  iconSource: any;
  label: string;
}) => (
  <View style={styles.actionButtonWrapper}>
    <TouchableOpacity
      style={[styles.actionButton, {backgroundColor}]}
      onPress={onPress}>
      <Image source={iconSource} style={styles.actionIcon} resizeMode="contain" />
    </TouchableOpacity>
    <Text style={styles.actionButtonLabel}>{label}</Text>
  </View>
);


export default function PerfilTutor({navigation}) {
    
    const handleAdd = () => {
        navigation.navigate('AdicionarPet');};

    const handleDelete = () => {
        navigation.navigate('ExcluirPet');};

    const handleEdit = () => {
        navigation.navigate('EditarPet');};

    const CornerIconClickable = () => (
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.cornerImageContainer}>
            <Image
                source={require('../../../assets/icons/PETLOGO.png')} 
                style={styles.cornerImage}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <CornerIconClickable />

          <View style={styles.profileSection}>
            <UserAvatar />
            <View style={styles.profileInfo}>
              <Text style={styles.greeting}>Olá, Ellen Rodrigues!</Text> 
              <View style={styles.divider} />
              <Text style={styles.Text}>Suas Avaliações</Text>

            </View>
            <View style={styles.profileRating}>
              <StarRating rating="5,0" />
            </View>

          </View>


          <View style={styles.petsSection}>
            <Text style={styles.sectionTitle}>Seus amados Pets</Text>

            <PetCard
              imageUrl="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop"
              name="Nina"
              species="Gato"
              age="8 anos"
              weight="3kg"
              comportamento ='Calma'
              specifications="Gosta de sachê pela manhã, é bastante falante e ODEIA colo, sempre nos arranha e fica brava quando fazemos isso."
            />

            <PetCard
              imageUrl="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300&h=200&fit=crop"
              name="Bolinho Fofo"
              species="Gato"
              age="3 meses"
              weight="0.5kg"
              comportamento ='Medrosa'
              specifications="Gosta de sachê pela manhã, é bastante falante e ODEIA colo, sempre nos arranha e fica brava quando fazemos isso."
            />

            {/* 2. USO DAS FUNÇÕES DE NAVEGAÇÃO */}
            <View style={styles.actionButtonsContainer}>
              <ActionButton
                onPress={handleDelete} // Chama a função que navega para 'ExcluirPet'
                backgroundColor="#556A44"
                iconSource={ICON_DELETE}
                label="Excluir"
              />

              <ActionButton
                onPress={handleAdd} // Chama a função que navega para 'AdicionarPet'
                backgroundColor="#7AB24E"
                iconSource={ICON_ADD}
                label="Adicionar"
              />

              <ActionButton
                onPress={handleEdit} // Chama a função que navega para 'EditarPet'
                backgroundColor="#A6C57F"
                iconSource={ICON_EDIT}
                label="Editar"
              />
            </View>
          </View>
 
        </View>
            <View style={styles.footer}>
            <Text style={styles.footerText}>Como funciona? | Quero ser host!</Text>
          </View>


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3D18C',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    margin: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 49,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 32,
    marginBottom: 20,
    position: 'relative',
  },

    //LOGO DO PET
  cornerImageContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: -78,
    top: -35,
    left: 140,
  },
  cornerImage: {
    width: 55,
    height: 55,
    marginBottom: 3,
},

  // ESTILOS DE IMAGEM E ÍCONES
  avatarImageContent: {
    width: '80%', // Ajuste o tamanho da imagem dentro do círculo
    height: '80%',
  },
  starImage: {
    width: 22,
    height: 22,
    marginRight: 4, // Aumentei um pouco a margem
    zIndex: 10,
  },
  // NOVO ESTILO: Para a imagem dos ícones de ação (PNGs)
  actionIcon: {
    width: 20, // Tamanho da imagem dentro do botão (ajuste o que melhor se encaixa)
    height: 20,
    tintColor: '#FFFFFF', // Se os seus PNGs forem pretos e você quiser pintar de branco
  },

  // SEÇÃO PERFIL DO TUTOR
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 15,
    zIndex: 10,
    left: 8,
  },
  avatarIcon: {
    width: 90,
    height: 90,
    backgroundColor: '#7AB24E',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileInfo: {
    flex: 1,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 17, // Aumentei o tamanho para destaque
    fontWeight: '700', // Tornei mais forte
    color: '#556A44',
    fontFamily: 'Inter',
    marginBottom: 5,
  },
  divider: {
    height: 30,
    width: 335,
    borderRadius: 30,
    right: 113,
    backgroundColor: '#B3D18C',
    marginBottom: 8,
    zIndex: 1,
  },
  Text: {
    fontSize: 16,
    color: '#556A44',
    fontFamily: 'Inter',
    bottom: 34,
    zIndex: 5,
  },

  profileRating: {
    marginTop: 40,
    zIndex: 10,
    right: 7,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#556A44',
    fontFamily: 'Inter',
    fontWeight: '700', // Destaque na nota
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#B3D18C',
    marginVertical: 20,
  },

  // SEÇÃO PETS
  petsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18, // Aumentei o tamanho
    fontWeight: '700', // Destaque
    color: '#556A44',
    fontFamily: 'Inter',
    marginTop: -10,
    marginBottom: 20,
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: '#c8d3b7ff', // Fundo leve para destaque
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    elevation: 2,
  },
  petImageContainer: {
    width: 130,
    height: 200,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
  },
  petImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  petDetails: {
    flex: 1,
    paddingTop: 5,
  },
  petName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4d654bff',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  petDetailText: {
    fontSize: 13,
    color: '#556A44',
    fontFamily: 'Inter',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: 'bold',
  },
  specificationsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#556A44',
    fontFamily: 'Inter',
    marginTop: 8,
    marginBottom: 2,
  },
  specificationsText: {
    fontSize: 12,
    color: '#556A44',
    fontFamily: 'Inter',
    lineHeight: 16,
    fontStyle: 'italic',
  },

  // SEÇÃO BOTÕES DE AÇÃO
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: 20,
  },
  actionButtonWrapper: {
    alignItems: 'center',
    width: 80, // Largura para garantir espaçamento uniforme
    marginBottom: -40,
  },
  actionButton: {
    width: 80, // Dimensões do botão redondo/quadrado
    height: 60,
    borderRadius: 20, // Deixei mais redondo para um visual mais moderno/divertido
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    elevation: 4,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: '800', // Destaque no rótulo
    color: '#556A44',
    fontFamily: 'Inter',
    marginTop: 2,
  },


  // RODAPÉ
  footer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  footerText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#556A44', // Destaque na cor
    fontFamily: 'Inter',
    bottom: 20,
    marginBottom: 10,
  },
});