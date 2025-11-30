// AppPet\src\screens\Perfis\Perfil_Tutor.tsx
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useFocusEffect, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackScreenProps } from '../../navigation/types';

const ICON_STAR = require('../../../assets/icons/starFilled.png');
const ICON_AVATAR = require('../../../assets/icons/user.png');
const ICON_DELETE = require('../../../assets/icons/delete.png');
const ICON_ADD = require('../../../assets/icons/add.png');
const ICON_EDIT = require('../../../assets/icons/edit.png');
const ICON_CHECK = require('../../../assets/icons/check.png');

// ⚙️ CONFIGURAÇÃO DA API
const API_BASE_URL = 'http://localhost:8000'; // ⚠️ ALTERE PARA O IP DO SEU BACKEND

// ⭐️ Componente CustomAlert
const CustomAlert = ({
  visible,
  title,
  message,
  onConfirm,
  onClose,
  confirmText = 'OK',
  cancelText,
  isSuccess = false,
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
          {cancelText && (
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onClose}>
              <Text style={styles.modalCancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.modalButton,
              cancelText ? styles.modalConfirmButton : styles.modalSingleButton,
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

const UserAvatar = ({fotoUrl}) => (
  <View style={styles.avatarContainer}>
    <View style={styles.avatarIcon}>
      {fotoUrl ? (
        <Image
          source={{uri: fotoUrl}}
          style={styles.avatarImageContent}
          resizeMode="cover"
        />
      ) : (
        <Image
          source={ICON_AVATAR}
          style={styles.avatarImageContent}
          resizeMode="contain"
        />
      )}
    </View>
  </View>
);

const StarRating = ({rating}) => (
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
  ageUnit,
  weight,
  weightUnit,
  observations,
  onDelete,
}) => (
  <View style={styles.petCard}>
    <View style={styles.petImageContainer}>
      <Image
        source={{
          uri: imageUrl || 'https://via.placeholder.com/300x200?text=Sem+Foto',
        }}
        style={styles.petImage}
      />
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
        <Text style={styles.boldText}>Idade:</Text> {age} {ageUnit}
        {age > 1 ? 's' : ''}
      </Text>
      <Text style={styles.petDetailText}>
        <Text style={styles.boldText}>Peso:</Text> {weight}
        {weightUnit}
      </Text>
      {observations && (
        <>
          <Text style={styles.specificationsTitle}>Observações:</Text>
          <Text style={styles.specificationsText}>{observations}</Text>
        </>
      )}
    </View>
  </View>
);

const ActionButton = ({onPress, backgroundColor, iconSource, label}) => (
  <View style={styles.actionButtonWrapper}>
    <TouchableOpacity
      style={[styles.actionButton, {backgroundColor}]}
      onPress={onPress}>
      <Image source={iconSource} style={styles.actionIcon} resizeMode="contain" />
    </TouchableOpacity>
    <Text style={styles.actionButtonLabel}>{label}</Text>
  </View>
);

type PerfilTutorProps = RootStackScreenProps<'Perfil_Tutor'>;

export default function PerfilTutor({navigation, route}: PerfilTutorProps) {
  const [usuario, setUsuario] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    title: '',
    message: '',
    onConfirm: () => setAlertVisible(false),
    confirmText: 'OK',
    cancelText: undefined,
    isSuccess: false,
  });

  // 🆕 Pegar o id_usuario dos parâmetros da rota
  const { id_usuario } = route.params;

  // Função genérica para exibir o alerta
  const showAlert = (
    title,
    message,
    onConfirm,
    confirmText = 'OK',
    cancelText,
    isSuccess = false,
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

  // 🔄 Buscar dados do usuário logado
  const fetchUsuario = async () => {
    try {
      // 🆕 Usar o id_usuario dos parâmetros
      if (!id_usuario) {
        showAlert('Erro', 'Usuário não identificado.');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/usuarios/${id_usuario}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário');
      }

      const data = await response.json();
      setUsuario(data);
      
      // 🆕 Salvar no AsyncStorage para uso posterior
      await AsyncStorage.setItem('id_usuario', id_usuario.toString());
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      showAlert('Erro', 'Não foi possível carregar os dados do usuário.');
    }
  };

  // 🐾 Buscar pets do tutor
  const fetchPets = async () => {
    try {
      // 🆕 Usar o id_usuario dos parâmetros
      if (!id_usuario) return;

      const response = await fetch(`${API_BASE_URL}/pets/tutor/${id_usuario}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar pets');
      }

      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      showAlert('Erro', 'Não foi possível carregar os pets.');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Carregar dados ao montar o componente
  useEffect(() => {
    fetchUsuario();
    fetchPets();
  }, [id_usuario]); // 🆕 Adicionar id_usuario como dependência

  // 🔄 Recarregar pets quando a tela ganhar foco (após adicionar novo pet)
  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [id_usuario]),
  );

  // ➕ Adicionar novo pet (callback da tela AdicionarPet)
  // 🟢 CORREÇÃO: Função limpa, sem fetch interno.
  const addNewPet = (petSalvo) => {
    if (petSalvo) {
      // Atualiza a lista local adicionando o novo pet que veio da tela de cadastro
      setPets(currentPets => [...currentPets, petSalvo]);

      showAlert(
        'Pet Adicionado!',
        `${petSalvo.nome} foi adicionado à sua lista de pets com sucesso.`,
        undefined,
        'Entendido',
        undefined,
        true,
      );
    }
  };

  // ➕ Navegar para tela de adicionar pet
  const handleAdd = () => {
    navigation.navigate('AdicionarPet', {
      id_tutor: id_usuario, // 🆕 Passar o id_tutor
      onAddPet: addNewPet,
    });
  };

  // 🗑️ Deletar pet
  const handleDeletePet = (id, name) => {
    const confirmExclusion = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao excluir pet');
        }

        // Remover da lista local
        setPets(currentPets => currentPets.filter(pet => pet.id_pet !== id));

        showAlert(
          'Excluído! 💔',
          `${name} foi removido da sua lista.`,
          undefined,
          'OK',
          undefined,
          false,
        );
      } catch (error) {
        console.error('Erro ao excluir pet:', error);
        showAlert('Erro', 'Não foi possível excluir o pet. Tente novamente.');
      }
    };

    showAlert(
      'Confirmar Exclusão',
      `Tem certeza que deseja remover ${name} da sua lista de pets? Esta ação é irreversível.`,
      confirmExclusion,
      'Excluir',
      'Cancelar',
    );
  };

  // ✏️ Editar pet (implementar conforme necessário)
  const handleEdit = () => {
    navigation.navigate('EditarPet');
  };

  const CornerIconClickable = () => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Home', { 
        usuario: {
          id_usuario: id_usuario,
          nome: usuario?.nome || '',
          email: usuario?.email || '',
          tipo: usuario?.tipo,
          telefone: usuario?.telefone,
        }
      })}
      style={styles.cornerImageContainer}>
      <Image
        source={require('../../../assets/icons/PETLOGO.png')}
        style={styles.cornerImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  // 🔄 Tela de carregamento
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7AB24E" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <CornerIconClickable />

          <View style={styles.profileSection}>
            <UserAvatar fotoUrl={usuario?.foto_perfil_url} />
            <View style={styles.profileInfo}>
              <Text>Bem vindo(a), Tutor</Text>
              <Text style={styles.greeting}>
                {usuario?.nome || 'Carregando...'}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.Text}>Suas Avaliações</Text>
            </View>
            <View style={styles.profileRating}>
              <StarRating rating="5,0" />
            </View>
          </View>

          <View style={styles.petsSection}>
            <Text style={styles.sectionTitle}>Seus amados Pets</Text>

            {pets.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Você ainda não cadastrou nenhum pet.
                </Text>
                <Text style={styles.emptySubText}>
                  Clique em "Adicionar" para cadastrar seu primeiro pet! 🐾
                </Text>
              </View>
            ) : (
              pets.map(pet => (
                <PetCard
                  key={pet.id_pet}
                  id={pet.id_pet}
                  imageUrl={pet.fotos_urls?.[0]}
                  name={pet.nome}
                  species={pet.especie}
                  age={pet.idade}
                  ageUnit={pet.idade_unidade}
                  weight={pet.peso}
                  weightUnit={pet.peso_unidade}
                  observations={pet.observacoes}
                  onDelete={handleDeletePet}
                />
              ))
            )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#556A44',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#556A44',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#7AB24E',
    textAlign: 'center',
  },
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
  avatarImageContent: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
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
    overflow: 'hidden',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFF6E2',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderWidth: 3,
    borderColor: '#B3D18C',
    alignItems: 'center',
    elevation: 8,
  },
  modalIcon: {
    width: 40,
    height: 40,
    tintColor: '#7AB24E',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
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
    minWidth: 150,
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
    backgroundColor: '#FF6347',
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