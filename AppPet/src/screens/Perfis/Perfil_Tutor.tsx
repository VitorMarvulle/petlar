import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert, // Manter Alert para tipagem, mas usaremos Modal customizado
  Modal, // Importar Modal para o alerta customizado
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const ICON_STAR = require('../../../assets/icons/starFilled.png');
const ICON_AVATAR = require('../../../assets/icons/user.png');
const ICON_DELETE = require('../../../assets/icons/delete.png');
const ICON_ADD = require('../../../assets/icons/add.png');
const ICON_EDIT = require('../../../assets/icons/edit.png');
// Novo Ícone para o Alerta de Sucesso (Opcional, mas útil visualmente)
const ICON_CHECK = require('../../../assets/icons/check.png'); 

// --- DADOS MOCADOS DE PETS ---
const MOCKED_PETS = [
  {
    id: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop',
    name: 'Nina',
    species: 'Gato',
    age: '8 anos',
    weight: '3kg',
    comportamento: 'Calma',
    specifications:
      'Gosta de sachê pela manhã, é bastante falante e ODEIA colo, sempre nos arranha e fica brava quando fazemos isso.',
  },
  {
    id: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300&h=200&fit=crop',
    name: 'Bolinho Fofo',
    species: 'Gato',
    age: '3 meses',
    weight: '0.5kg',
    comportamento: 'Medrosa',
    specifications:
      'Gosta de sachê pela manhã, é bastante falante e ODEIA colo, sempre nos arranha e fica brava quando fazemos isso.',
  },
];
// ------------------------------------------------------------------------

let nextId = MOCKED_PETS.length + 1;

type NewPetData = {
  nome: string;
  especie: string;
  idade: string;
  idadeUnidade: string;
  peso: string;
  unidade: string;
  especificacoes?: string;
  fotos?: string[];
};

// ⭐️ NOVO: Componente CustomAlert (Adaptado da sua tela reserva)
const CustomAlert = ({
  visible,
  title,
  message,
  onConfirm, // Usado para a confirmação de exclusão
  onClose,
  confirmText = 'OK', // Texto padrão
  cancelText, // Se houver, é um modal de confirmação
  isSuccess = false, // Para mostrar um ícone de sucesso/check
}: {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  isSuccess?: boolean;
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        {isSuccess && (
          <Image
            source={ICON_CHECK}
            style={styles.modalIcon}
            resizeMode="contain"
          />
        )}
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>

        <View style={styles.modalButtonsContainer}>
          {/* Botão de Cancelar (se for confirmação) */}
          {cancelText && (
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onClose}>
              <Text style={styles.modalCancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
          )}

          {/* Botão Principal/Confirmação */}
          <TouchableOpacity
            style={[
              styles.modalButton,
              cancelText ? styles.modalConfirmButton : styles.modalSingleButton,
              // Mudar cor se for uma ação destrutiva (exclusão)
              title.includes('Excluir') && styles.modalDeleteButton,
            ]}
            onPress={onConfirm || onClose}>
            <Text style={styles.modalButtonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);
// ------------------------------------------------------------------------

const UserAvatar = () => (
  <View style={styles.avatarContainer}>
    <View style={styles.avatarIcon}>
      <Image style={styles.avatarImageContent} resizeMode="contain" />
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
  id,
  imageUrl,
  name,
  species,
  age,
  weight,
  comportamento,
  specifications,
  onDelete,
}: {
  id: number;
  imageUrl: string;
  name: string;
  species: string;
  age: string;
  weight: string;
  comportamento: string;
  specifications: string;
  onDelete: (id: number, name: string) => void;
}) => (
  <View style={styles.petCard}>
    <View style={styles.petImageContainer}>
      <Image source={{uri: imageUrl}} style={styles.petImage} />
      <TouchableOpacity
        style={styles.deletePetButton}
        onPress={() => onDelete(id, name)}
        activeOpacity={0.7}>
        <Image
          source={ICON_DELETE}
          style={styles.deletePetIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
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
  const [pets, setPets] = useState(MOCKED_PETS);
  // ⭐️ NOVO: Estado para gerenciar o CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    title: '',
    message: '',
    onConfirm: () => setAlertVisible(false),
    confirmText: 'OK',
    cancelText: undefined as string | undefined,
    isSuccess: false,
  });

  // Função genérica para exibir o alerta
  const showAlert = (
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText: string = 'OK',
    cancelText?: string,
    isSuccess: boolean = false,
  ) => {
    setAlertData({
      title,
      message,
      onConfirm: onConfirm || (() => setAlertVisible(false)),
      confirmText,
      cancelText,
      isSuccess,
    });
    setAlertVisible(true);
  };

  // ⭐️ MODIFICADO: Função para adicionar um novo pet ao estado
  const addNewPet = (newPetData: NewPetData) => {
    const newPet = {
      id: nextId++,
      imageUrl: newPetData.fotos?.[0] || 'https://via.placeholder.com/300x200?text=Sem+Foto',
      name: newPetData.nome,
      species: newPetData.especie,
      age: `${newPetData.idade} ${newPetData.idadeUnidade}s`,
      weight: `${newPetData.peso}${newPetData.unidade}`,
      comportamento: 'A definir',
      specifications: newPetData.especificacoes || 'Nenhuma especificação adicional.',
    };

    setPets(currentPets => [...currentPets, newPet]);

    // ⭐️ NOVO: Usando CustomAlert para sucesso
    showAlert(
      'Pet Adicionado!',
      `${newPet.name} foi adicionado à sua lista de pets com sucesso.`,
      undefined,
      'Entendido',
      undefined,
      true, // isSuccess = true
    );
  };

  const handleAdd = () => {
    navigation.navigate('AdicionarPet', {
      onAddPet: addNewPet,
    });
  };

  // ⭐️ MODIFICADO: Implementação da função de exclusão com CustomAlert
  const handleDeletePet = (id: number, name: string) => {
    const confirmExclusion = () => {
      setPets(currentPets => currentPets.filter(pet => pet.id !== id));
      // Exibir alerta de sucesso após a exclusão
      showAlert(
        'Excluído! 💔',
        `${name} foi removido da sua lista.`,
        undefined,
        'OK',
        undefined,
        false, // Não é um sucesso feliz, mas uma confirmação de ação
      );
    };

    // Usando CustomAlert como modal de Confirmação (dois botões)
    showAlert(
      'Confirmar Exclusão',
      `Tem certeza que deseja remover ${name} da sua lista de pets? Esta ação é irreversível.`,
      confirmExclusion, // Função de confirmação
      'Excluir', // Texto do botão de confirmação
      'Cancelar', // Texto do botão de cancelamento
    );
  };

  const handleEdit = () => {
    navigation.navigate('EditarPet');
  };

  const CornerIconClickable = () => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Home')}
      style={styles.cornerImageContainer}>
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
              <Text>Bem vindo(a), Tutor</Text>
              <Text style={styles.greeting}>Ellen Rodrigues Magueta Newerkla</Text>
              <View style={styles.divider} />
              <Text style={styles.Text}>Suas Avaliações</Text>
            </View>
            <View style={styles.profileRating}>
              <StarRating rating="5,0" />
            </View>
          </View>

          <View style={styles.petsSection}>
            <Text style={styles.sectionTitle}>Seus amados Pets</Text>

            {pets.map(pet => (
              <PetCard
                key={pet.id}
                id={pet.id}
                imageUrl={pet.imageUrl}
                name={pet.name}
                species={pet.species}
                age={pet.age}
                weight={pet.weight}
                comportamento={pet.comportamento}
                specifications={pet.specifications}
                onDelete={handleDeletePet}
              />
            ))}

            <View style={styles.actionButtonsContainer}>
              <ActionButton
                onPress={handleAdd}
                backgroundColor="#7AB24E"
                iconSource={ICON_ADD}
                label="Adicionar"
              />
              <ActionButton
                onPress={handleEdit}
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

      {/* ⭐️ NOVO: Renderização do CustomAlert */}
      <CustomAlert
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        onConfirm={alertData.onConfirm}
        onClose={() => setAlertVisible(false)}
        confirmText={alertData.confirmText}
        cancelText={alertData.cancelText}
        isSuccess={alertData.isSuccess}
      />
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
    width: '80%',
    height: '80%',
  },
  starImage: {
    width: 22,
    height: 22,
    marginRight: 4,
    zIndex: 10,
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
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
    marginTop: 28,
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
    fontSize: 17,
    fontWeight: '700',
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
    marginTop: 39,
  },
  ratingText: {
    fontSize: 13,
    color: '#556A44',
    fontFamily: 'Inter',
    fontWeight: '700',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#556A44',
    fontFamily: 'Inter',
    marginTop: -10,
    marginBottom: 20,
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: '#c8d3b7ff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    elevation: 2,
    position: 'relative',
  },
  petImageContainer: {
    width: 130,
    height: 200,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // ESTILOS DE EXCLUSÃO
  deletePetButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
  deletePetIcon: {
    width: 15,
    height: 15,
    tintColor: '#FFFFFF',
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
    width: 80,
    marginBottom: -40,
  },
  actionButton: {
    width: 80,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    elevation: 4,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: '800',
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
    color: '#556A44',
    fontFamily: 'Inter',
    bottom: 20,
    marginBottom: 10,
  },

  // ⭐️ NOVOS ESTILOS DO CUSTOM ALERT ⭐️
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%', // Ligeiramente maior que o original para melhor visualização
    backgroundColor: '#FFF6E2',
    borderRadius: 20,
    paddingVertical: 30, // Mais padding vertical
    paddingHorizontal: 25,
    borderWidth: 3,
    borderColor: '#B3D18C',
    alignItems: 'center',
    elevation: 8,
  },
  modalIcon: {
    width: 40,
    height: 40,
    tintColor: '#7AB24E', // Cor verde para o check
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22, // Maior
    fontWeight: '800', // Mais forte
    color: '#556A44',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#556A44',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#B3D18C',
    alignItems: 'center',
  },
  modalSingleButton: {
    backgroundColor: '#85B65E',
    minWidth: 150, // Botão único é mais largo
  },
  modalConfirmButton: {
    backgroundColor: '#85B65E',
    flex: 1,
    marginLeft: 10,
  },
  modalCancelButton: {
    backgroundColor: '#C8D3B7',
    flex: 1,
    marginRight: 10,
  },
  modalDeleteButton: {
    backgroundColor: '#FF6347', // Cor vermelha para exclusão
  },
  modalButtonText: {
    color: '#FFF6E2',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCancelButtonText: {
    color: '#556A44',
    fontSize: 16,
    fontWeight: '700',
  },
});