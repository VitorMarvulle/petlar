// // petlar/AppPet/src/screens/Registros/Criar_anuncio.tsx
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   ScrollView,
//   Alert,
//   Dimensions,
//   Modal,
//   Platform,
// } from 'react-native';
// import { RootStackScreenProps } from '../../navigation/types';
// import * as ImagePicker from 'expo-image-picker';

// const { width } = Dimensions.get('window');

// // --- ÍCONES E COMPONENTES REUTILIZADOS ---
// const ICON_BACK = require('../../../assets/icons/arrow-left.png');
// const ICON_ADD_IMAGE = require('../../../assets/icons/add.png');
// const ICON_CHECK = require('../../../assets/icons/check.png');

// const PetIcon = () => (
//   <View style={registerStyles.logoContainer}>
//     <Image
//       source={require('../../../assets/icons/PETLOGO.png')}
//       style={registerStyles.logoImage}
//       resizeMode="contain"
//     />
//     <Text style={registerStyles.logoText}>Lar Doce Pet</Text>
//   </View>
// );

// // --- Componente CustomAlert (Adaptado da tela Host) ---
// const CustomAlert = ({
//   visible,
//   title,
//   message,
//   onConfirm,
//   onCancel,
//   confirmText,
//   cancelText,
//   isConfirmation = true,
// }: {
//   visible: boolean;
//   title: string;
//   message: string;
//   onConfirm: () => void;
//   onCancel: () => void;
//   confirmText: string;
//   cancelText?: string;
//   isConfirmation?: boolean;
// }) => (
//   <Modal transparent visible={visible} animationType="fade">
//     <View style={alertStyles.modalOverlay}>
//       <View style={alertStyles.modalContainer}>
//         <Text style={alertStyles.modalTitle}>{title}</Text>
//         <Text style={alertStyles.modalMessage}>{message}</Text>
//         <View style={alertStyles.modalButtonsContainer}>
//           {isConfirmation && (
//             <TouchableOpacity
//               style={[alertStyles.modalButton, alertStyles.modalCancelButton]}
//               onPress={onCancel}
//             >
//               <Text style={alertStyles.modalCancelButtonText}>
//                 {cancelText || 'Cancelar'}
//               </Text>
//             </TouchableOpacity>
//           )}
//           <TouchableOpacity style={alertStyles.modalButton} onPress={onConfirm}>
//             <Text style={alertStyles.modalButtonText}>{confirmText}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   </Modal>
// );

// // --- Componente de Opção de Filtro (Adaptado da tela Filtros) ---
// interface SelectionOptionProps {
//   label: string;
//   isSelected: boolean;
//   onPress: () => void;
// }

// const SelectionOption = ({ label, isSelected, onPress }: SelectionOptionProps) => (
//   <TouchableOpacity
//     style={[
//       listingStyles.optionButton,
//       isSelected && listingStyles.optionButtonSelected,
//     ]}
//     onPress={onPress}
//     activeOpacity={0.7}
//   >
//     <Text
//       style={[
//         listingStyles.optionText,
//         isSelected && listingStyles.optionTextSelected,
//       ]}
//     >
//       {label}
//     </Text>
//   </TouchableOpacity>
// );

// // --- Componente para exibição de imagens (Área Pet) ---
// const ImagePreview = ({
//   imageUri,
//   isCover,
//   onDelete,
// }: {
//   imageUri: string;
//   isCover: boolean;
//   onDelete: () => void;
// }) => (
//   <View style={listingStyles.imagePreviewContainer}>
//     <Image
//       source={{ uri: imageUri }}
//       style={listingStyles.imagePreview}
//       resizeMode="cover"
//     />
//     {isCover && (
//       <View style={listingStyles.coverBadge}>
//         <Text style={listingStyles.coverText}>Capa</Text>
//       </View>
//     )}
//     <TouchableOpacity style={listingStyles.deleteImageButton} onPress={onDelete}>
//       <Text style={listingStyles.deleteImageText}>X</Text>
//     </TouchableOpacity>
//   </View>
// );

// // -------------------------------------------------------------------
// // -------------------- TELA CRIAR ANÚNCIO HOST ----------------------
// // -------------------------------------------------------------------
// export default function CriarAnuncioScreen({
//   route,
//   navigation,
// }: RootStackScreenProps<'Criar_anuncio'>) {
//   const { id_usuario } = route.params;

//   // Campos de anúncio (sem cidade/bairro)
//   const [formData, setFormData] = useState({
//     petsAceitos: [] as string[],
//     maxPets: '1',
//     pesoMaximo: [] as string[],
//     descricao: '',
//     diaria: '',
//   });

//   // Foto de perfil (baseada em InfoAdc)
//   const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
//   const [fotoPerfilFile, setFotoPerfilFile] = useState<File | null>(null); // WEB

//   // Fotos da área do anfitrião
//   const [imageUrls, setImageUrls] = useState<string[]>([]);

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertData, setAlertData] = useState({
//     title: '',
//     message: '',
//     isConfirmation: false,
//     onConfirm: () => {},
//     onCancel: () => {},
//   });

//   const PET_OPTIONS = ['Cachorro', 'Gato', 'Pássaro', 'Réptil'];
//   const WEIGHT_OPTIONS_LABELS = ['Pequeno', 'Médio', 'Grande'];

//   const MAX_PETS_PERMITTED = 15;
//   const MIN_IMAGES = 6;
//   const MAX_IMAGES = 10;

//   const showAlert = (
//     title: string,
//     message: string,
//     isConfirmation = false,
//     onConfirm = () => setAlertVisible(false),
//     onCancel = () => setAlertVisible(false)
//   ) => {
//     setAlertData({ title, message, isConfirmation, onConfirm, onCancel });
//     setAlertVisible(true);
//   };

//   const handleInputChange = (field: keyof typeof formData, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleTogglePet = (pet: string) => {
//     setFormData(prev => {
//       const list = prev.petsAceitos;
//       if (list.includes(pet)) {
//         return { ...prev, petsAceitos: list.filter(p => p !== pet) };
//       } else {
//         return { ...prev, petsAceitos: [...list, pet] };
//       }
//     });
//   };

//   const handleToggleWeight = (weight: string) => {
//     setFormData(prev => {
//       const list = prev.pesoMaximo;
//       if (list.includes(weight)) {
//         return { ...prev, pesoMaximo: list.filter(w => w !== weight) };
//       } else {
//         return { ...prev, pesoMaximo: [...list, weight] };
//       }
//     });
//   };

//   // 1) Foto de Perfil do Host (mesma lógica de InfoAdc)
//   const pickProfilePhoto = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert(
//         'Permissão necessária',
//         'Permissão para acessar a galeria é necessária!'
//       );
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: false,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       const asset = result.assets[0];
//       setFotoPerfil(asset.uri);

//       if (Platform.OS === 'web') {
//         try {
//           const response = await fetch(asset.uri);
//           const blob = await response.blob();

//           const filename = (asset as any).fileName ?? `perfil_${id_usuario}.jpg`;
//           const file = new File([blob], filename, {
//             type: blob.type || 'image/jpeg',
//           });

//           setFotoPerfilFile(file);
//         } catch (err) {
//           console.error('Erro ao converter imagem para File no web:', err);
//           Alert.alert('Erro', 'Não foi possível preparar a imagem no navegador.');
//         }
//       }
//     }
//   };

//   // 2) Upload foto de perfil (usa rota /usuarios/{id}/foto-perfil)
//   const uploadFotoPerfil = async () => {
//     if (!fotoPerfil) return null;

//     try {
//       const formDataUpload = new FormData();

//       const filenameFromUri =
//         fotoPerfil.split('/').pop() || `perfil_${id_usuario}.jpg`;
//       const match = /\.(\w+)$/.exec(filenameFromUri);
//       const ext = match ? match[1] : 'jpg';
//       const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

//       if (Platform.OS === 'web') {
//         if (!fotoPerfilFile) {
//           console.warn(
//             'fotoPerfilFile está nulo no web; usando fallback simples.'
//           );
//           (formDataUpload as any).append('arquivo', {
//             uri: fotoPerfil,
//             name: filenameFromUri,
//             type: mimeType,
//           });
//         } else {
//           formDataUpload.append('arquivo', fotoPerfilFile);
//         }
//       } else {
//         (formDataUpload as any).append('arquivo', {
//           uri: fotoPerfil,
//           name: filenameFromUri,
//           type: mimeType,
//         });
//       }

//       const response = await fetch(
//         `http://localhost:8000/usuarios/${id_usuario}/foto-perfil`,
//         {
//           method: 'POST',
//           body: formDataUpload,
//         }
//       );

//       const text = await response.text();
//       let data: any = null;
//       try {
//         data = JSON.parse(text);
//       } catch {
//         data = { raw: text };
//       }

//       console.log('Resposta upload foto perfil:', response.status, data);

//       if (!response.ok) {
//         console.log('Erro upload foto:', data);
//         throw new Error(
//           (data && (data.detail || data.message)) ||
//             'Erro ao enviar foto de perfil'
//         );
//       }

//       const url = data.foto_perfil_url;
//       console.log('Foto de perfil atualizada:', url);
//       return url;
//     } catch (error) {
//       console.error('Erro ao fazer upload da foto de perfil:', error);
//       Alert.alert('Erro', 'Não foi possível enviar a foto de perfil.');
//       return null;
//     }
//   };

//   // 3) Fotos da área do anfitrião (para bucket area_anfitriao)
//   const handlePickImage = async () => {
//     if (imageUrls.length >= MAX_IMAGES) {
//       showAlert(
//         'Limite Atingido',
//         `Você pode adicionar no máximo ${MAX_IMAGES} fotos.`,
//         false
//       );
//       return;
//     }

//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert(
//         'Permissão necessária',
//         'Permissão para acessar a galeria é necessária!'
//       );
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: false,
//       quality: 0.8,
//     });

//     if (!result.canceled) {
//       const asset = result.assets[0];
//       setImageUrls(prev => [...prev, asset.uri]);
//     }
//   };

//   const handleDeleteImage = (index: number) => {
//     setImageUrls(prev => prev.filter((_, i) => i !== index));
//   };

//   // Envia cada foto da área para /anfitrioes/{id}/fotos-area (recomendado implementar no backend)
//   const uploadFotosArea = async (): Promise<string[]> => {
//     if (imageUrls.length === 0) return [];

//     const urls: string[] = [];

//     for (const uri of imageUrls) {
//       const filenameFromUri = uri.split('/').pop() || `area_${id_usuario}.jpg`;
//       const match = /\.(\w+)$/.exec(filenameFromUri);
//       const ext = match ? match[1] : 'jpg';
//       const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

//       const file: any =
//         Platform.OS === 'web'
//           ? // No web, seria melhor converter em File via fetch+blob, semelhante à foto de perfil
//             {
//               uri,
//               name: filenameFromUri,
//               type: mimeType,
//             }
//           : {
//               uri,
//               name: filenameFromUri,
//               type: mimeType,
//             };

//     const uploadFotosArea = async (): Promise<string[]> => {
//     if (imageUrls.length === 0) return [];

//     const formDataUpload = new FormData();

//     for (const uri of imageUrls) {
//         const filenameFromUri = uri.split('/').pop() || `area_${id_usuario}.jpg`;
//         const match = /\.(\w+)$/.exec(filenameFromUri);
//         const ext = match ? match[1] : 'jpg';
//         const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

//         const file: any =
//         Platform.OS === 'web'
//             ? {
//                 uri,
//                 name: filenameFromUri,
//                 type: mimeType,
//             }
//             : {
//                 uri,
//                 name: filenameFromUri,
//                 type: mimeType,
//             };

//         // IMPORTANTE: o nome do campo precisa ser o mesmo do backend: "arquivos"
//         formDataUpload.append('arquivos', file);
//     }

//     const response = await fetch(
//         `http://localhost:8000/anfitrioes/${id_usuario}/fotos-area`,
//         {
//         method: 'POST',
//         body: formDataUpload,
//         }
//     );

//     const text = await response.text();
//     let data: any = null;
//     try {
//         data = JSON.parse(text);
//     } catch {
//         data = { raw: text };
//     }

//     console.log('Resposta upload fotos área:', response.status, data);

//     if (!response.ok) {
//         console.log('Erro upload fotos área:', data);
//         throw new Error(
//         (data && (data.detail || data.message)) || 'Erro ao enviar fotos da área'
//         );
//     }

//     // backend retorna { fotos_novas, fotos_totais }
//     return data.fotos_totais ?? data.fotos_novas ?? [];
//     };
    
//   // 4) Criação do anfitrião (usa AnfitriaoCreate)
//   const createAnfitriao = async (fotosAreaUrls: string[]) => {
//     const precoNumber = parseFloat(formData.diaria.replace(',', '.'));

//     const body = {
//       id_anfitriao: id_usuario, // id do anfitrião EXATAMENTE igual ao do usuário
//       descricao: formData.descricao,
//       capacidade_maxima: Number(formData.maxPets),
//       especie: formData.petsAceitos,
//       tamanho_pet: formData.pesoMaximo.join(','), // ou outra convenção
//       preco: precoNumber,
//       status: 'pendente',
//       fotos_urls: fotosAreaUrls,
//     };

//     const response = await fetch('http://localhost:8000/anfitrioes', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//       },
//       body: JSON.stringify(body),
//     });

//     const text = await response.text();
//     let data: any = null;
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = { raw: text };
//     }

//     console.log('Resposta criação anfitrião:', response.status, data);

//     if (!response.ok) {
//       throw new Error(
//         (data && (data.detail || data.message)) ||
//           'Erro ao criar anfitrião'
//       );
//     }

//     // Supabase costuma retornar um array com o registro criado
//     return data;
//   };

//   // 5) Validações e fluxo de criação do anúncio
//   const handleCreateListing = () => {
//     const { petsAceitos, maxPets, pesoMaximo, descricao, diaria } = formData;

//     if (!fotoPerfil) {
//       showAlert('Erro', 'Adicione uma foto de perfil.', false);
//       return;
//     }

//     if (
//       petsAceitos.length === 0 ||
//       !maxPets ||
//       pesoMaximo.length === 0 ||
//       !descricao ||
//       !diaria
//     ) {
//       showAlert(
//         'Erro',
//         'Por favor, preencha todos os campos obrigatórios.',
//         false
//       );
//       return;
//     }

//     if (imageUrls.length < MIN_IMAGES) {
//       showAlert(
//         'Erro',
//         `Você precisa adicionar no mínimo ${MIN_IMAGES} fotos da área Pet.`,
//         false
//       );
//       return;
//     }

//     const numericDiaria = parseFloat(diaria.replace(',', '.'));
//     if (isNaN(numericDiaria) || numericDiaria <= 0) {
//       showAlert('Erro', 'Informe um valor de diária válido.', false);
//       return;
//     }

//     showAlert(
//       'Confirmar Anúncio',
//       'Todas as informações estão corretas? O anúncio será criado.',
//       true,
//       async () => {
//         try {
//           // 1) Upload foto de perfil
//           const fotoPerfilUrl = await uploadFotoPerfil();
//           if (!fotoPerfilUrl) {
//             throw new Error('Falha ao salvar foto de perfil.');
//           }

//           // 2) Upload fotos da área para bucket area_anfitriao
//           const fotosAreaUrls = await uploadFotosArea();

//           // 3) Criar registro do anfitrião
//           const anfitriaoCriado = await createAnfitriao(fotosAreaUrls);

//           console.log('Anúncio/Anfitrião Criado:', anfitriaoCriado);

//           setAlertVisible(false);

//           // 4) Navegação para Perfil_Host (ajuste HostCardProps conforme sua tipagem)
//           navigation.navigate('Perfil_Host', {
//             host: {
//               id_anfitriao: id_usuario,
//               // Os campos abaixo dependem de como está o HostCardProps e da resposta real
//               nome: '', // você pode buscar nome do usuário se tiver no contexto
//               foto_perfil_url: fotoPerfilUrl,
//               localizacao: '', // você removeu cidade/bairro; se tiver outro campo, use aqui
//               preco: numericDiaria,
//               petsAceitos,
//               imageUri: fotosAreaUrls[0], // capa
//             } as any,
//           });
//         } catch (error: any) {
//           console.error(error);
//           showAlert(
//             'Erro',
//             error.message || 'Erro ao criar anúncio.',
//             false
//           );
//         }
//       },
//       () => setAlertVisible(false)
//     );
//   };

//   const handleMaxPetsChange = (text: string) => {
//     let value = text.replace(/[^0-9]/g, '');
//     if (value.length > 0) {
//       let num = parseInt(value);
//       if (num > MAX_PETS_PERMITTED) {
//         num = MAX_PETS_PERMITTED;
//         showAlert(
//           'Atenção',
//           `O limite máximo de pets é ${MAX_PETS_PERMITTED}.`,
//           false
//         );
//       }
//       if (num < 1) {
//         num = 1;
//       }
//       value = num.toString();
//     }
//     setFormData(prev => ({ ...prev, maxPets: value }));
//   };

//   return (
//     <View style={registerStyles.container}>
//       <ScrollView
//         contentContainerStyle={registerStyles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={registerStyles.card}>
//           <View style={registerStyles.formContainer}>
//             <Text style={registerStyles.title}>Crie seu Anúncio de Locação</Text>

//             {/* FOTO DE PERFIL DO HOST */}
//             <View style={[listingStyles.groupContainer, { width: '85%' }]}>
//               <Text style={listingStyles.groupTitle}>Foto de Perfil</Text>

//               <TouchableOpacity
//                 style={listingStyles.photoBox}
//                 onPress={pickProfilePhoto}
//               >
//                 {fotoPerfil ? (
//                   <Image
//                     source={{ uri: fotoPerfil }}
//                     style={{
//                       width: 100,
//                       height: 100,
//                       borderRadius: 50,
//                       borderWidth: 2,
//                       borderColor: '#7AB24E',
//                     }}
//                   />
//                 ) : (
//                   <Text style={listingStyles.textoFoto}>
//                     Adicionar foto de perfil
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>

//             {/* QUANDO PETS ACEITA */}
//             <View style={[listingStyles.groupContainer, { width: '85%' }]}>
//               <Text style={listingStyles.groupTitle}>
//                 Quais Pets você aceita?
//               </Text>
//               <View style={listingStyles.optionsRow}>
//                 {PET_OPTIONS.map(pet => (
//                   <SelectionOption
//                     key={pet}
//                     label={pet}
//                     isSelected={formData.petsAceitos.includes(pet)}
//                     onPress={() => handleTogglePet(pet)}
//                   />
//                 ))}
//               </View>
//             </View>

//             {/* MÁXIMO DE PETS */}
//             <View style={registerStyles.inputContainer}>
//               <TextInput
//                 style={registerStyles.input}
//                 value={formData.maxPets}
//                 onChangeText={handleMaxPetsChange}
//                 placeholder={`Máximo de Pets por Reserva (Max ${MAX_PETS_PERMITTED})*`}
//                 placeholderTextColor="#79b24e62"
//                 keyboardType="numeric"
//               />
//             </View>

//             {/* PORTE DOS PETS */}
//             <View style={[listingStyles.groupContainer, { width: '85%' }]}>
//               <Text style={listingStyles.groupTitle}>
//                 Porte dos Pets que cuida:
//               </Text>
//               <View style={listingStyles.optionsRow}>
//                 {WEIGHT_OPTIONS_LABELS.map(weight => (
//                   <SelectionOption
//                     key={weight}
//                     label={weight}
//                     isSelected={formData.pesoMaximo.includes(weight)}
//                     onPress={() => handleToggleWeight(weight)}
//                   />
//                 ))}
//               </View>
//             </View>

//             {/* DESCRIÇÃO */}
//             <View style={registerStyles.inputContainer}>
//               <TextInput
//                 style={[registerStyles.input, listingStyles.textArea]}
//                 value={formData.descricao}
//                 onChangeText={value =>
//                   handleInputChange('descricao', value)
//                 }
//                 placeholder="Descrição detalhada da sua locação (máx 200 caracteres)"
//                 placeholderTextColor="#79b24e62"
//                 multiline
//                 numberOfLines={4}
//                 maxLength={200}
//                 autoCapitalize="sentences"
//               />
//               <Text style={listingStyles.charCount}>
//                 {formData.descricao.length}/200
//               </Text>
//             </View>

//             {/* DIÁRIA */}
//             <View style={registerStyles.inputContainer}>
//               <TextInput
//                 style={registerStyles.input}
//                 value={formData.diaria}
//                 onChangeText={value =>
//                   handleInputChange(
//                     'diaria',
//                     value.replace(/[^0-9,.]/g, '').replace('.', ',')
//                   )
//                 }
//                 placeholder="Valor da Diária (R$) (ex: 30,00)"
//                 placeholderTextColor="#79b24e62"
//                 keyboardType="numeric"
//               />
//             </View>

//             {/* FOTOS DA ÁREA PET */}
//             <View style={[listingStyles.groupContainer, { width: '85%' }]}>
//               <Text style={listingStyles.groupTitle}>
//                 Fotos da Área Pet (Mín {MIN_IMAGES}, Máx {MAX_IMAGES})*
//               </Text>

//               <TouchableOpacity
//                 style={listingStyles.photoBox}
//                 onPress={handlePickImage}
//                 disabled={imageUrls.length >= MAX_IMAGES}
//               >
//                 <Text style={listingStyles.textoFoto}>
//                   {imageUrls.length < MAX_IMAGES
//                     ? 'Adicionar foto da área'
//                     : 'Máximo atingido'}
//                 </Text>
//               </TouchableOpacity>

//               <Text style={listingStyles.imageCountText}>
//                 {imageUrls.length} de {MAX_IMAGES} fotos adicionadas
//               </Text>

//               <ScrollView
//                 horizontal
//                 style={listingStyles.imageScroll}
//                 showsHorizontalScrollIndicator={false}
//               >
//                 {imageUrls.map((uri, index) => (
//                   <ImagePreview
//                     key={index}
//                     imageUri={uri}
//                     isCover={index === 0}
//                     onDelete={() => handleDeleteImage(index)}
//                   />
//                 ))}
//               </ScrollView>
//             </View>

//             {/* BOTÃO CRIAR ANÚNCIO */}
//             <TouchableOpacity
//               style={registerStyles.registerButton}
//               onPress={handleCreateListing}
//             >
//               <Text style={registerStyles.registerButtonText}>
//                 Criar Anúncio
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>

//       {/* ALERT CUSTOMIZADO */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertData.title}
//         message={alertData.message}
//         isConfirmation={alertData.isConfirmation}
//         onConfirm={alertData.onConfirm}
//         onCancel={alertData.onCancel}
//         confirmText={alertData.isConfirmation ? 'Criar' : 'OK'}
//       />
//     </View>
//   );
// }

// // -------------------------------------------------------------------
// // ----------------------------- ESTILOS -----------------------------
// // -------------------------------------------------------------------

// const registerStyles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#B3D18C',
//     paddingHorizontal: 12,
//     paddingTop: 30,
//     paddingBottom: 45,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//   },
//   card: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 45,
//     padding: 2,
//     alignItems: 'center',
//   },
//   logoContainer: {
//     alignItems: 'center',
//     marginTop: 60,
//     marginBottom: 25,
//   },
//   logoImage: {
//     width: 100,
//     height: 100,
//     marginBottom: 3,
//   },
//   logoText: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#7AB24E',
//     fontFamily: 'Inter',
//   },
//   formContainer: {
//     width: '100%',
//     alignItems: 'center',
//   },
//   title: {
//     color: '#7AB24E',
//     fontFamily: 'Inter',
//     fontSize: 24,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginTop: 40,
//     marginBottom: 30,
//     marginLeft: 30,
//     marginRight: 30,
//   },
//   inputContainer: {
//     width: '100%',
//     marginBottom: 18,
//     alignItems: 'center',
//   },
//   input: {
//     width: 309,
//     height: 55,
//     borderRadius: 18,
//     borderWidth: 2,
//     borderColor: '#B3D18C',
//     backgroundColor: '#FFF6E2',
//     paddingHorizontal: 17,
//     fontFamily: 'Inter',
//     fontSize: 15,
//     color: '#000',
//     alignSelf: 'center',
//   },
//   registerButton: {
//     width: 309,
//     height: 55,
//     borderRadius: 18,
//     borderWidth: 3,
//     borderColor: '#B3D18C',
//     backgroundColor: '#7AB24E',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: 15,
//     marginBottom: 50,
//   },
//   registerButtonText: {
//     color: '#FFF6E2',
//     fontFamily: 'Inter',
//     fontSize: 20,
//     fontWeight: '700',
//   },
// });

// const listingStyles = StyleSheet.create({
//   backButton: {
//     position: 'absolute',
//     top: 20,
//     left: 20,
//     zIndex: 10,
//     backgroundColor: '#7AB24E',
//     borderRadius: 10,
//     padding: 8,
//   },
//   backIcon: {
//     width: 25,
//     height: 25,
//     tintColor: '#FFF6E2',
//   },
//   pulledInfoText: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#556A44',
//     marginBottom: 5,
//   },
//   groupContainer: {
//     backgroundColor: '#FFF6E2',
//     borderRadius: 15,
//     borderWidth: 2,
//     borderColor: '#B3D18C',
//     padding: 15,
//     marginBottom: 25,
//   },
//   groupTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#556A44',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   optionsRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   optionButton: {
//     height: 45,
//     paddingHorizontal: 15,
//     backgroundColor: '#FFF6E2',
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: '#B3D18C',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   optionButtonSelected: {
//     backgroundColor: '#85B65E',
//     borderColor: '#B3D18C',
//     borderWidth: 3,
//   },
//   optionText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#596350ff',
//   },
//   optionTextSelected: {
//     color: '#FFF6E2',
//     fontWeight: '700',
//   },
//   textArea: {
//     height: 100,
//     paddingTop: 15,
//     textAlignVertical: 'top',
//   },
//   charCount: {
//     alignSelf: 'flex-end',
//     marginRight: (width - 309) / 2,
//     fontSize: 12,
//     color: '#B3D18C',
//     marginTop: 4,
//   },
//   photoBox: {
//     width: 180,
//     height: 55,
//     borderRadius: 18,
//     borderWidth: 2,
//     borderColor: '#7AB24E',
//     backgroundColor: '#FFF6E2',
//     justifyContent: 'center',
//     alignItems: 'center',
//     alignSelf: 'center',
//     marginVertical: 5,
//   },
//   textoFoto: {
//     color: '#7AB24E',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   imageCountText: {
//     fontSize: 14,
//     color: '#556A44',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   imageScroll: {
//     marginTop: 10,
//   },
//   imagePreviewContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//     marginRight: 10,
//     overflow: 'hidden',
//     position: 'relative',
//     borderWidth: 2,
//     borderColor: '#B3D18C',
//   },
//   imagePreview: {
//     width: '100%',
//     height: '100%',
//   },
//   coverBadge: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     backgroundColor: 'rgba(85, 106, 68, 0.8)',
//     paddingHorizontal: 5,
//     paddingVertical: 2,
//     borderBottomRightRadius: 8,
//   },
//   coverText: {
//     color: '#FFF6E2',
//     fontSize: 10,
//     fontWeight: '700',
//   },
//   deleteImageButton: {
//     position: 'absolute',
//     top: 2,
//     right: 2,
//     backgroundColor: '#FF4D4D',
//     borderRadius: 10,
//     width: 18,
//     height: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 2,
//   },
//   deleteImageText: {
//     color: '#FFF',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
// });

// const alertStyles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: '80%',
//     backgroundColor: '#FFF6E2',
//     borderRadius: 20,
//     paddingVertical: 25,
//     paddingHorizontal: 20,
//     borderWidth: 3,
//     borderColor: '#B3D18C',
//     alignItems: 'center',
//     elevation: 6,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#556A44',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   modalMessage: {
//     fontSize: 16,
//     color: '#556A44',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   modalButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     paddingHorizontal: 10,
//   },
//   modalButton: {
//     backgroundColor: '#85B65E',
//     borderRadius: 10,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderWidth: 2,
//     borderColor: '#B3D18C',
//     flex: 1,
//     marginHorizontal: 5,
//     alignItems: 'center',
//   },
//   modalButtonText: {
//     color: '#FFF6E2',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   modalCancelButton: {
//     backgroundColor: '#556A44',
//   },
//   modalCancelButtonText: {
//     color: '#FFF6E2',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   });
