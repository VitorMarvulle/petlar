// AppPet/src/screens/Registros/EditarAnuncio.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  Platform,
  ActivityIndicator
} from 'react-native';
import { RootStackScreenProps } from '../../navigation/types';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

// --- COMPONENTES AUXILIARES (Reaproveitados) ---
interface SelectionOptionProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const SelectionOption = ({ label, isSelected, onPress }: SelectionOptionProps) => (
  <TouchableOpacity
    style={[
      listingStyles.optionButton,
      isSelected && listingStyles.optionButtonSelected,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[listingStyles.optionText, isSelected && listingStyles.optionTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ImagePreview = ({ imageUri, isCover, onDelete }: { imageUri: string; isCover: boolean; onDelete: () => void }) => (
  <View style={listingStyles.imagePreviewContainer}>
    <Image source={{ uri: imageUri }} style={listingStyles.imagePreview} resizeMode="cover" />
    {isCover && (
      <View style={listingStyles.coverBadge}>
        <Text style={listingStyles.coverText}>Capa</Text>
      </View>
    )}
    <TouchableOpacity style={listingStyles.deleteImageButton} onPress={onDelete}>
      <Text style={listingStyles.deleteImageText}>X</Text>
    </TouchableOpacity>
  </View>
);

const CustomAlert = ({ visible, title, message, onConfirm, onCancel, confirmText, cancelText, isConfirmation = true }: any) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={alertStyles.modalOverlay}>
      <View style={alertStyles.modalContainer}>
        <Text style={alertStyles.modalTitle}>{title}</Text>
        <Text style={alertStyles.modalMessage}>{message}</Text>
        <View style={alertStyles.modalButtonsContainer}>
          {isConfirmation && (
            <TouchableOpacity style={[alertStyles.modalButton, alertStyles.modalCancelButton]} onPress={onCancel}>
              <Text style={alertStyles.modalCancelButtonText}>{cancelText || 'Cancelar'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={alertStyles.modalButton} onPress={onConfirm}>
            <Text style={alertStyles.modalButtonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// --- TELA DE EDIÇÃO ---
export default function EditarAnuncioScreen({ route, navigation }: RootStackScreenProps<'EditarAnuncio'>) {
  const { hostData, id_usuario } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    petsAceitos: [] as string[],
    maxPets: '1',
    pesoMaximo: [] as string[],
    descricao: '',
    diaria: '',
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // Controle de Alerta
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '', isConfirmation: false, onConfirm: () => {}, onCancel: () => {} });

  const PET_OPTIONS = ['Cachorro', 'Gato', 'Pássaro', 'Silvestre'];
  const WEIGHT_OPTIONS_LABELS = ['Pequeno', 'Médio', 'Grande'];
  const MAX_PETS_PERMITTED = 15;
  const MIN_IMAGES = 1; // Pode ser menor na edição se desejar
  const MAX_IMAGES = 10;

  // Mapeamento UI -> Banco
  // --- Mapeamento UI -> Banco (Para Salvar) ---
  const PET_MAP_TO_DB: Record<string, string> = {
    'Cachorro': 'cachorro',
    'Gato': 'gato',
    'Pássaro': 'passaro',   // Sem acento no banco
    'Silvestre': 'silvestre',
    'Réptil': 'silvestre'   // Segurança: se tiver Réptil antigo, vira silvestre
  };
  
  // --- Mapeamento Banco -> UI (Para Carregar na tela) ---
  const PET_MAP_FROM_DB: Record<string, string> = {
    'cachorro': 'Cachorro',
    'gato': 'Gato',
    'passaro': 'Pássaro',    // Vindo do banco sem acento -> Mostra com acento
    'silvestre': 'Silvestre'
  };

  useEffect(() => {
    if (hostData) {
      // 1. Mapear espécies vindas do banco para a UI
      const especiesVindasDoBanco: string[] = Array.isArray(hostData.especie) ? hostData.especie : [];
      
      const petsUI = especiesVindasDoBanco.map(esp => {
        // Tenta encontrar o nome bonito, se não achar, usa o próprio valor
        return PET_MAP_FROM_DB[esp] || esp; 
      });
      // 2. Mapear peso/tamanho
      // O banco retorna string "Pequeno,Médio" ou array? Baseado no CreateAnfitriaoDTO é string separada por virgula
      let pesosUI: string[] = [];
      if (typeof hostData.tamanho_pet === 'string') {
        pesosUI = hostData.tamanho_pet.split(',').map((s: string) => s.trim());
      } else if (Array.isArray(hostData.tamanho_pet)) {
        pesosUI = hostData.tamanho_pet;
      }

      // 3. Setar Estado
      setFormData({
        petsAceitos: petsUI,
        maxPets: String(hostData.capacidade_maxima || '1'),
        pesoMaximo: pesosUI,
        descricao: hostData.descricao || '',
        diaria: hostData.preco ? String(hostData.preco).replace('.', ',') : '',
      });

      // 4. Imagens
      if (hostData.fotos_urls && Array.isArray(hostData.fotos_urls)) {
        setImageUrls(hostData.fotos_urls);
      }
    }
  }, [hostData]);

  const showAlert = (title: string, message: string, isConfirmation = false, onConfirm = () => setAlertVisible(false), onCancel = () => setAlertVisible(false)) => {
    setAlertData({ title, message, isConfirmation, onConfirm, onCancel });
    setAlertVisible(true);
  };

  // --- HANDLERS DE FORMULÁRIO ---
  const handleInputChange = (field: keyof typeof formData, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleTogglePet = (pet: string) => {
    setFormData(prev => {
      const list = prev.petsAceitos;
      return list.includes(pet) ? { ...prev, petsAceitos: list.filter(p => p !== pet) } : { ...prev, petsAceitos: [...list, pet] };
    });
  };

  const handleToggleWeight = (weight: string) => {
    setFormData(prev => {
      const list = prev.pesoMaximo;
      return list.includes(weight) ? { ...prev, pesoMaximo: list.filter(w => w !== weight) } : { ...prev, pesoMaximo: [...list, weight] };
    });
  };

  const handleMaxPetsChange = (text: string) => {
    let value = text.replace(/[^0-9]/g, '');
    if (value.length > 0) {
      let num = parseInt(value);
      if (num > MAX_PETS_PERMITTED) {
        num = MAX_PETS_PERMITTED;
        Alert.alert('Atenção', `O limite máximo de pets é ${MAX_PETS_PERMITTED}.`);
      }
      if (num < 1) num = 1;
      value = num.toString();
    }
    setFormData(prev => ({ ...prev, maxPets: value }));
  };

  // --- LÓGICA DE IMAGEM ---
  const handlePickImage = async () => {
    if (imageUrls.length >= MAX_IMAGES) {
      showAlert('Limite Atingido', `Máximo de ${MAX_IMAGES} fotos.`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Acesse as configurações para permitir acesso à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
        // Filtra para não adicionar mais do que o limite
        const newAssets = result.assets.slice(0, MAX_IMAGES - imageUrls.length);
        const newUris = newAssets.map(a => a.uri);
        setImageUrls(prev => [...prev, ...newUris]);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // --- FUNÇÃO DE UPLOAD (APENAS NOVAS) ---
  const uploadNovasFotos = async (novasUris: string[]): Promise<string[]> => {
    if (novasUris.length === 0) return [];

    const formDataUpload = new FormData();
    for (const uri of novasUris) {
      const filename = uri.split('/').pop() || `area_edit_${id_usuario}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : 'jpg';
      const type = ext === 'png' ? 'image/png' : 'image/jpeg';

      if (Platform.OS === 'web') {
        const res = await fetch(uri);
        const blob = await res.blob();
        formDataUpload.append('arquivos', new File([blob], filename, { type }));
      } else {
        (formDataUpload as any).append('arquivos', { uri, name: filename, type });
      }
    }

    // Endpoint de upload
    const response = await fetch(`http://localhost:8000/anfitrioes/${id_usuario}/fotos-area`, {
      method: 'POST',
      body: formDataUpload,
    });

    if (!response.ok) throw new Error('Falha ao enviar novas fotos');
    
    // O backend retorna { fotos_totais: [...] } mas como o endpoint atualiza o banco
    // e apaga as antigas lá, vamos pegar o retorno dele, mas manipular o update final.
    // O ideal seria o endpoint de upload APENAS retornar URLs e não tocar no banco, 
    // mas vamos contornar isso no fluxo de save.
    const data = await response.json();
    
    // O endpoint retorna fotos_totais (que agora só tem as novas pq ele sobrescreveu no update interno do python).
    // Precisamos pegar essas URLs novas geradas.
    return data.fotos_totais || [];
  };

  // --- SALVAR EDIÇÃO ---
  const handleSaveChanges = () => {
    const { petsAceitos, maxPets, pesoMaximo, descricao, diaria } = formData;

    if (petsAceitos.length === 0 || !maxPets || pesoMaximo.length === 0 || !descricao || !diaria) {
      showAlert('Erro', 'Preencha todos os campos obrigatórios.', false);
      return;
    }
    if (imageUrls.length < MIN_IMAGES) {
      showAlert('Erro', `Mínimo de ${MIN_IMAGES} foto necessária.`, false);
      return;
    }

    showAlert('Salvar Alterações', 'Deseja confirmar a edição do seu anúncio?', true, async () => {
      try {
        setIsLoading(true);
        setAlertVisible(false);

        // 1. Separar fotos antigas (http) de novas (file/content)
        const fotosAntigas = imageUrls.filter(url => url.startsWith('http'));
        const fotosNovasLocais = imageUrls.filter(url => !url.startsWith('http'));

        let urlsNovasDoServidor: string[] = [];

        // 2. Se houver novas fotos, fazer upload
        if (fotosNovasLocais.length > 0) {
           urlsNovasDoServidor = await uploadNovasFotos(fotosNovasLocais);
        }

        // 3. Combinar listas (Antigas mantidas + Novas geradas)
        // OBS: Como o endpoint de upload do python sobrescreve a coluna no banco, 
        // o PUT abaixo é CRUCIAL para restaurar as antigas junto com as novas.
        const listaFinalFotos = [...fotosAntigas, ...urlsNovasDoServidor];

        // 4. Preparar Body do PUT
        const precoNumber = parseFloat(diaria.replace(',', '.'));
        const especieDB = petsAceitos.map(label => PET_MAP_TO_DB[label]).filter(Boolean);

        const body = {
          descricao: descricao,
          capacidade_maxima: Number(maxPets),
          especie: especieDB,
          tamanho_pet: pesoMaximo.join(','),
          preco: precoNumber,
          fotos_urls: listaFinalFotos, // Aqui garantimos a lista completa
          status: 'ativo' // Ou mantém o status anterior se desejar
        };

        // 5. Enviar PUT
        const response = await fetch(`http://localhost:8000/anfitrioes/${hostData.id_anfitriao}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
           const text = await response.text();
           throw new Error(text || 'Erro ao atualizar');
        }

        const updatedData = await response.json();
        
        // 6. Sucesso
        Alert.alert('Sucesso', 'Anúncio atualizado com sucesso!', [
            { text: 'OK', onPress: () => {
                // Voltar para o Perfil Host com os novos dados
                navigation.navigate('Perfil_Host', { 
                    host: null, // Força reload ou passa dados atualizados se preferir lógica complexa
                    listingCreated: true, // Reaproveita flag de reload
                    newListingData: {
                         ...updatedData[0], // O backend costuma retornar array no update do supabase
                         name: hostData.usuarios?.nome,
                         location: `${hostData.usuarios?.cidade} - ${hostData.usuarios?.uf}`, // Recria string local
                         price: diaria,
                         petsAccepted: petsAceitos,
                         imageUri: listaFinalFotos[0]
                    }
                });
            }}
        ]);
        navigation.navigate('Perfil_Host', { 
                host: null, 
                listingCreated: true, 
                newListingData: {
                        ...updatedData[0], // Dados do anfitrião atualizados
                        // IMPORTANTE: Passamos o objeto 'usuarios' antigo de volta
                        // para que o Perfil_Host não perca o ID e a Foto
                        usuarios: hostData.usuarios, 
                        
                        name: hostData.usuarios?.nome,
                        location: `${hostData.usuarios?.cidade} - ${hostData.usuarios?.uf}`,
                        price: diaria,
                        petsAccepted: petsAceitos,
                        imageUri: listaFinalFotos[0]
                }
            });

      } catch (error: any) {
        console.error(error);
        Alert.alert('Erro', error.message || 'Falha ao salvar.');
      } finally {
        setIsLoading(false);
      }
    });
  };

  if (isLoading) {
      return (
          <View style={[registerStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={{color: '#FFF', marginTop: 10}}>Salvando alterações...</Text>
          </View>
      );
  }

  return (
    <View style={registerStyles.container}>
      <ScrollView contentContainerStyle={registerStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={registerStyles.card}>
          <View style={registerStyles.formContainer}>
            <Text style={registerStyles.title}>Editar Anúncio</Text>

            {/* QUANDO PETS ACEITA */}
            <View style={[listingStyles.groupContainer, { width: '85%' }]}>
              <Text style={listingStyles.groupTitle}>Quais Pets você aceita?</Text>
              <View style={listingStyles.optionsRow}>
                {PET_OPTIONS.map(pet => (
                  <SelectionOption
                    key={pet}
                    label={pet}
                    isSelected={formData.petsAceitos.includes(pet)}
                    onPress={() => handleTogglePet(pet)}
                  />
                ))}
              </View>
            </View>

            {/* MÁXIMO DE PETS */}
            <View style={registerStyles.inputContainer}>
              <TextInput
                style={registerStyles.input}
                value={formData.maxPets}
                onChangeText={handleMaxPetsChange}
                placeholder={`Máximo de Pets (Max ${MAX_PETS_PERMITTED})`}
                placeholderTextColor="#79b24e62"
                keyboardType="numeric"
              />
            </View>

            {/* PORTE */}
            <View style={[listingStyles.groupContainer, { width: '85%' }]}>
              <Text style={listingStyles.groupTitle}>Porte dos Pets:</Text>
              <View style={listingStyles.optionsRow}>
                {WEIGHT_OPTIONS_LABELS.map(weight => (
                  <SelectionOption
                    key={weight}
                    label={weight}
                    isSelected={formData.pesoMaximo.includes(weight)}
                    onPress={() => handleToggleWeight(weight)}
                  />
                ))}
              </View>
            </View>

            {/* DESCRIÇÃO */}
            <View style={registerStyles.inputContainer}>
              <TextInput
                style={[registerStyles.input, listingStyles.textArea]}
                value={formData.descricao}
                onChangeText={value => handleInputChange('descricao', value)}
                placeholder="Descrição detalhada..."
                placeholderTextColor="#79b24e62"
                multiline
                numberOfLines={4}
                maxLength={200}
              />
              <Text style={listingStyles.charCount}>{formData.descricao.length}/200</Text>
            </View>

            {/* DIÁRIA */}
            <View style={registerStyles.inputContainer}>
              <TextInput
                style={registerStyles.input}
                value={formData.diaria}
                onChangeText={value => handleInputChange('diaria', value.replace(/[^0-9,.]/g, '').replace('.', ','))}
                placeholder="Valor da Diária (R$)"
                placeholderTextColor="#79b24e62"
                keyboardType="numeric"
              />
            </View>

            {/* FOTOS */}
            <View style={[listingStyles.groupContainer, { width: '85%' }]}>
              <Text style={listingStyles.groupTitle}>Fotos da Área Pet</Text>
              <TouchableOpacity
                style={listingStyles.photoBox}
                onPress={handlePickImage}
                disabled={imageUrls.length >= MAX_IMAGES}
              >
                <Text style={listingStyles.textoFoto}>
                  {imageUrls.length < MAX_IMAGES ? 'Adicionar foto' : 'Máximo atingido'}
                </Text>
              </TouchableOpacity>
              <Text style={listingStyles.imageCountText}>{imageUrls.length} de {MAX_IMAGES} fotos</Text>
              
              <ScrollView horizontal style={listingStyles.imageScroll} showsHorizontalScrollIndicator={false}>
                {imageUrls.map((uri, index) => (
                  <ImagePreview
                    key={index}
                    imageUri={uri}
                    isCover={index === 0}
                    onDelete={() => handleDeleteImage(index)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* BOTÃO SALVAR */}
            <TouchableOpacity style={registerStyles.registerButton} onPress={handleSaveChanges}>
              <Text style={registerStyles.registerButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
            
             {/* BOTÃO CANCELAR (Voltar) */}
             <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom: 20}}>
              <Text style={{color: '#7AB24E', fontWeight: 'bold'}}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        isConfirmation={alertData.isConfirmation}
        onConfirm={alertData.onConfirm}
        onCancel={alertData.onCancel}
        confirmText={alertData.isConfirmation ? 'Sim' : 'OK'}
      />
    </View>
  );
}

// ... COPIAR AQUI OS ESTILOS DO ARQUIVO ORIGINAL (registerStyles, listingStyles, alertStyles)
// Para economizar espaço na resposta, use exatamente os mesmos estilos do CriarAnuncioDetalhes.tsx
const registerStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#B3D18C',
      paddingHorizontal: 12,
      paddingTop: 30,
      paddingBottom: 45,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    card: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 45,
      padding: 2,
      alignItems: 'center',
    },
    formContainer: {
      width: '100%',
      alignItems: 'center',
    },
    title: {
      color: '#7AB24E',
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 40,
      marginBottom: 30,
      marginLeft: 30,
      marginRight: 30,
    },
    inputContainer: {
      width: '100%',
      marginBottom: 18,
      alignItems: 'center',
    },
    input: {
      width: 309,
      height: 55,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: '#B3D18C',
      backgroundColor: '#FFF6E2',
      paddingHorizontal: 17,
      fontFamily: 'Inter',
      fontSize: 15,
      color: '#000',
      alignSelf: 'center',
    },
    registerButton: {
      width: 309,
      height: 55,
      borderRadius: 18,
      borderWidth: 3,
      borderColor: '#B3D18C',
      backgroundColor: '#7AB24E',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 15,
      marginBottom: 20,
    },
    registerButtonText: {
      color: '#FFF6E2',
      fontFamily: 'Inter',
      fontSize: 20,
      fontWeight: '700',
    },
  });
  
  const listingStyles = StyleSheet.create({
    groupContainer: {
      backgroundColor: '#FFF6E2',
      borderRadius: 15,
      borderWidth: 2,
      borderColor: '#B3D18C',
      padding: 15,
      marginBottom: 25,
    },
    groupTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#556A44',
      marginBottom: 10,
      textAlign: 'center',
    },
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    optionButton: {
      height: 45,
      paddingHorizontal: 15,
      backgroundColor: '#FFF6E2',
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#B3D18C',
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionButtonSelected: {
      backgroundColor: '#85B65E',
      borderColor: '#B3D18C',
      borderWidth: 3,
    },
    optionText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#596350ff',
    },
    optionTextSelected: {
      color: '#FFF6E2',
      fontWeight: '700',
    },
    textArea: {
      height: 100,
      paddingTop: 15,
      textAlignVertical: 'top',
    },
    charCount: {
      alignSelf: 'flex-end',
      marginRight: (width - 309) / 2,
      fontSize: 12,
      color: '#B3D18C',
      marginTop: 4,
    },
    photoBox: {
      width: 180,
      height: 55,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: '#7AB24E',
      backgroundColor: '#FFF6E2',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginVertical: 5,
    },
    textoFoto: {
      color: '#7AB24E',
      fontSize: 16,
      fontWeight: '700',
    },
    imageCountText: {
      fontSize: 14,
      color: '#556A44',
      marginBottom: 10,
      textAlign: 'center',
    },
    imageScroll: {
      marginTop: 10,
    },
    imagePreviewContainer: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 10,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 2,
      borderColor: '#B3D18C',
    },
    imagePreview: {
      width: '100%',
      height: '100%',
    },
    coverBadge: {
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: 'rgba(85, 106, 68, 0.8)',
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderBottomRightRadius: 8,
    },
    coverText: {
      color: '#FFF6E2',
      fontSize: 10,
      fontWeight: '700',
    },
    deleteImageButton: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: '#FF4D4D',
      borderRadius: 10,
      width: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
    },
    deleteImageText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
  });
  
  const alertStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '80%',
      backgroundColor: '#FFF6E2',
      borderRadius: 20,
      paddingVertical: 25,
      paddingHorizontal: 20,
      borderWidth: 3,
      borderColor: '#B3D18C',
      alignItems: 'center',
      elevation: 6,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#556A44',
      marginBottom: 10,
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: 16,
      color: '#556A44',
      textAlign: 'center',
      marginBottom: 20,
    },
    modalButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 10,
    },
    modalButton: {
      backgroundColor: '#85B65E',
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderWidth: 2,
      borderColor: '#B3D18C',
      flex: 1,
      marginHorizontal: 5,
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#FFF6E2',
      fontSize: 16,
      fontWeight: '700',
    },
    modalCancelButton: {
      backgroundColor: '#556A44',
    },
    modalCancelButtonText: {
      color: '#FFF6E2',
      fontSize: 16,
      fontWeight: '700',
    },
  });