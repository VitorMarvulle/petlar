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
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackScreenProps } from '../../navigation/types';

const ICON_STAR = require('../../../assets/icons/starFilled.png');
const ICON_AVATAR = require('../../../assets/icons/user.png');
const ICON_DELETE = require('../../../assets/icons/delete.png');
const ICON_ADD = require('../../../assets/icons/add.png');
const ICON_EDIT = require('../../../assets/icons/edit.png');
const ICON_CHECK = require('../../../assets/icons/check.png');

const API_BASE_URL = 'http://localhost:8000';

// --- Componentes Auxiliares (CustomAlert, UserAvatar, StarRating) ---

const CustomAlert = ({
  visible,
  title = '',
  message = '',
  onConfirm,
  onClose,
  confirmText = 'OK',
  cancelText,
  isSuccess = false,
}: any) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        {isSuccess && (
          <Image
            source={ICON_CHECK}
            style={styles.modalIcon}
            resizeMode="contain"
            tintColor="#7AB24E"
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

const UserAvatar = ({fotoUrl}: any) => (
  <View style={styles.avatarContainer}>
    <View style={styles.avatarIcon}>
      {fotoUrl ? (
        <Image source={{uri: fotoUrl}} style={styles.avatarImageContent} resizeMode="cover" />
      ) : (
        <Image source={ICON_AVATAR} style={styles.avatarImageContent} resizeMode="contain" />
      )}
    </View>
  </View>
);

const StarRating = ({rating}: any) => (
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
  tamanho_pet,
  observations,
  onDelete,
  onEdit,
}: any) => (
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
            style={styles.smallIcon} 
            resizeMode="contain"
            tintColor="#FFFFFF"
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.editPetButton}
        onPress={() => onEdit(id)}
        activeOpacity={0.7}>
        <Image 
            source={ICON_EDIT} 
            style={styles.smallIcon} 
            resizeMode="contain" 
            tintColor="#FFFFFF"
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
        <Text style={styles.boldText}>Porte:</Text> {tamanho_pet || 'Não inf.'}
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

const ActionButton = ({onPress, backgroundColor, iconSource, label}: any) => (
  <View style={styles.actionButtonWrapper}>
    <TouchableOpacity
      style={[styles.actionButton, {backgroundColor}]}
      onPress={onPress}>
      <Image 
        source={iconSource} 
        style={styles.actionIcon} 
        resizeMode="contain"
        tintColor="#FFFFFF"
      />
    </TouchableOpacity>
    <Text style={styles.actionButtonLabel}>{label}</Text>
  </View>
);

// --- Componente Principal ---

type PerfilTutorProps = RootStackScreenProps<'Perfil_Tutor'>;

export default function PerfilTutor({navigation, route}: PerfilTutorProps) {
  const [usuario, setUsuario] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
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

  const { id_usuario } = route.params;

  const showAlert = (
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText = 'OK',
    cancelText?: string,
    isSuccess = false,
  ) => {
    setAlertData({
      title,
      message,
      onConfirm: onConfirm || (() => setAlertVisible(false)),
      confirmText,
      cancelText: cancelText as any,
      isSuccess,
    });
    setAlertVisible(true);
  };

  const fetchUsuario = async () => {
    try {
      if (!id_usuario) return;
      const response = await fetch(`${API_BASE_URL}/usuarios/${id_usuario}`);
      if (!response.ok) throw new Error('Erro usuario');
      const data = await response.json();
      setUsuario(data);
      await AsyncStorage.setItem('id_usuario', id_usuario.toString());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPets = async () => {
    try {
      if (!id_usuario) return;
      const response = await fetch(`${API_BASE_URL}/pets/tutor/${id_usuario}`);
      if (!response.ok) throw new Error('Erro pets');
      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuario();
    fetchPets();
  }, [id_usuario]);

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [id_usuario]),
  );

  const addNewPet = (petSalvo: any) => {
    fetchPets(); 
  };

  const handleAdd = () => {
    navigation.navigate('AdicionarPet', {
      id_tutor: id_usuario,
      onAddPet: addNewPet,
    });
  };

  const handleEditSpecificPet = (id_pet: number) => {
    const petToEdit = pets.find((p: any) => p.id_pet === id_pet);
    const mappedPet = {
      id_pet: petToEdit.id_pet,
      nome: petToEdit.nome,
      especie: petToEdit.especie,
      idade: petToEdit.idade.toString(),
      idadeUnidade: petToEdit.idade_unidade,
      tamanho_pet: petToEdit.tamanho_pet || 'Médio',
      especificacoes: petToEdit.observacoes,
      fotos_urls: petToEdit.fotos_urls
    };

    navigation.navigate('AdicionarPet', {
      id_tutor: id_usuario,
      onAddPet: addNewPet,
      petParaEditar: mappedPet
    });
  };

  const handleDeletePet = (id: number, name: string) => {
    const confirmExclusion = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/pets/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Erro delete');
        setPets(currentPets => currentPets.filter((pet: any) => pet.id_pet !== id));
        showAlert('Excluído! 💔', `${name} foi removido.`, undefined, 'OK', undefined, false);
      } catch (error) {
        showAlert('Erro', 'Não foi possível excluir.');
      }
    };
    showAlert('Confirmar Exclusão', `Remover ${name}?`, confirmExclusion, 'Excluir', 'Cancelar');
  };

  const CornerIconClickable = () => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Home', { usuario: { id_usuario, nome: usuario?.nome || '', email: usuario?.email || '', tipo: usuario?.tipo } })}
      style={styles.cornerImageContainer}>
      <Image source={require('../../../assets/icons/PETLOGO.png')} style={styles.cornerImage} resizeMode="contain" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7AB24E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <CornerIconClickable />

          {/* --- SEÇÃO DE PERFIL REESTRUTURADA --- */}
          <View style={styles.profileSection}>
            <UserAvatar fotoUrl={usuario?.foto_perfil_url} />
            
            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>Bem vindo(a), Tutor</Text>
              <Text style={styles.greeting}>{usuario?.nome || '...'}</Text>
              
              {/* Nova barra de avaliações (antigo divider) */}
              <View style={styles.ratingsBar}>
                 <Text style={styles.ratingsBarText}>Suas Avaliações</Text>
                 {/* Estrelas agora dentro da barra */}
                 <StarRating rating="5,0" />
              </View>
            </View>
            
            {/* Removemos a View profileRating antiga que ficava aqui fora */}
          </View>
          {/* ------------------------------------ */}

          <View style={styles.petsSection}>
            <Text style={styles.sectionTitle}>Seus amados Pets</Text>

            {pets.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Você ainda não cadastrou nenhum pet.</Text>
                <Text style={styles.emptySubText}>Clique em "Adicionar" abaixo!</Text>
              </View>
            ) : (
              pets.map((pet: any) => (
                <PetCard
                  key={pet.id_pet}
                  id={pet.id_pet}
                  imageUrl={pet.fotos_urls?.[0]}
                  name={pet.nome}
                  species={pet.especie}
                  age={pet.idade}
                  ageUnit={pet.idade_unidade}
                  tamanho_pet={pet.tamanho_pet}
                  observations={pet.observacoes}
                  onDelete={handleDeletePet}
                  onEdit={handleEditSpecificPet}
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
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Como funciona? | Quero ser host!</Text>
        </View>
      </ScrollView>
      <CustomAlert visible={alertVisible} {...alertData} onClose={() => setAlertVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#B3D18C' },
  scrollContainer: { flexGrow: 1 },
  innerContainer: {
    flex: 1, margin: 12, backgroundColor: '#FFFFFF', borderRadius: 49,
    paddingHorizontal: 20, paddingVertical: 20, marginTop: 32, marginBottom: 20,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#556A44', fontWeight: '600' },
  emptySubText: { fontSize: 14, color: '#7AB24E' },
  cornerImageContainer: { alignItems: 'center', marginTop: 30, marginBottom: -78, top: -35, left: 140 },
  cornerImage: { width: 55, height: 55, marginBottom: 3 },
  avatarImageContent: { width: '100%', height: '100%', borderRadius: 60 },
  starImage: { width: 22, height: 22, marginRight: 4 },
  actionIcon: { width: 20, height: 20 }, 
  
  // --- ESTILOS DO PERFIL ATUALIZADOS ---
  profileSection: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', // Alinha avatar e info no topo
    marginTop: 20, 
    marginBottom: 25, 
  },
  avatarContainer: { 
    marginRight: 15, 
    // marginTop: 28, <-- REMOVIDO (subiu a foto)
    marginLeft: 8,
  },
  avatarIcon: { width: 90, height: 90, backgroundColor: '#7AB24E', borderRadius: 60, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  profileInfo: { 
    flex: 1, // Ocupa o espaço restante
    paddingTop: 5, // Pequeno ajuste fino
  },
  welcomeText: { fontSize: 14, color: '#556A44' },
  greeting: { fontSize: 18, fontWeight: '700', color: '#556A44', marginBottom: 12 },
  
  // Nova barra verde que contém texto e estrelas
  ratingsBar: {
    height: 32,
    width: '100%', // Ocupa a largura do pai (profileInfo)
    borderRadius: 16,
    backgroundColor: '#B3D18C', // Cor da faixa
    flexDirection: 'row', // Itens lado a lado
    alignItems: 'center', // Centraliza verticalmente
    justifyContent: 'space-between', // Espaço entre texto e estrelas
    paddingHorizontal: 15, // Espaçamento interno lateral
  },
  // Texto dentro da barra
  ratingsBarText: { 
    fontSize: 14, 
    color: '#556A44', 
    fontWeight: '600',
    // bottom e zIndex removidos
  },
  // Container das estrelas (agora dentro da barra)
  ratingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    // marginTop: 39, <-- REMOVIDO (agora centralizado pelo ratingsBar)
  },
  ratingText: { fontSize: 14, color: '#556A44', fontWeight: '700' },
  // profileRating: { ... } <-- REMOVIDO O ESTILO ANTIGO
  // -------------------------------------

  petsSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#556A44', marginTop: -10, marginBottom: 20 },
  petCard: {
    flexDirection: 'row', backgroundColor: '#c8d3b7ff', borderRadius: 10,
    padding: 10, marginBottom: 20, elevation: 2, position: 'relative',
  },
  petImageContainer: {
    width: 130, height: 200, borderRadius: 6, overflow: 'hidden',
    marginRight: 10, position: 'relative',
  },
  petImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  deletePetButton: {
    position: 'absolute', top: 5, right: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.7)', borderRadius: 15,
    width: 30, height: 30, justifyContent: 'center', alignItems: 'center',
    zIndex: 10, elevation: 5,
  },
  editPetButton: {
    position: 'absolute', bottom: 5, right: 5,
    backgroundColor: 'rgba(122, 178, 78, 0.9)',
    borderRadius: 15, width: 30, height: 30,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10, elevation: 5,
  },
  smallIcon: { width: 15, height: 15 }, 

  petDetails: { flex: 1, paddingTop: 5 },
  petName: { fontSize: 17, fontWeight: '700', color: '#4d654bff', marginBottom: 4 },
  petDetailText: { fontSize: 13, color: '#556A44', lineHeight: 18 },
  boldText: { fontWeight: 'bold' },
  specificationsTitle: { fontSize: 13, fontWeight: 'bold', color: '#556A44', marginTop: 8, marginBottom: 2 },
  specificationsText: { fontSize: 12, color: '#556A44', lineHeight: 16, fontStyle: 'italic' },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 15, marginBottom: 20 },
  actionButtonWrapper: { alignItems: 'center', width: 80, marginBottom: -40 },
  actionButton: { width: 80, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 5, elevation: 4 },
  actionButtonLabel: { fontSize: 13, fontWeight: '800', color: '#556A44', marginTop: 2 },
  footer: { alignItems: 'center', paddingVertical: 15 },
  footerText: { fontSize: 17, fontWeight: '700', color: '#556A44', bottom: 20, marginBottom: 10 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: '#FFF6E2', borderRadius: 20, paddingVertical: 30, paddingHorizontal: 25, borderWidth: 3, borderColor: '#B3D18C', alignItems: 'center', elevation: 8 },
  modalIcon: { width: 40, height: 40, marginBottom: 10 }, 
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#556A44', marginBottom: 10, textAlign: 'center' },
  modalMessage: { fontSize: 16, color: '#556A44', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  modalButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  modalButton: { borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 2, borderColor: '#B3D18C', alignItems: 'center' },
  modalSingleButton: { backgroundColor: '#85B65E', minWidth: 150 },
  modalConfirmButton: { backgroundColor: '#85B65E', flex: 1, marginLeft: 10 },
  modalCancelButton: { backgroundColor: '#C8D3B7', flex: 1, marginRight: 10 },
  modalDeleteButton: { backgroundColor: '#FF6347' },
  modalButtonText: { color: '#FFF6E2', fontSize: 16, fontWeight: '700' },
  modalCancelButtonText: { color: '#556A44', fontSize: 16, fontWeight: '700' },
});