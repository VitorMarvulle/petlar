import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, 
    Image, ScrollView, Alert, Dimensions, Modal 
} from 'react-native';
// Ajuste o caminho de importação conforme sua estrutura
import { RootStackScreenProps } from '../../navigation/types'; 
// Simulação do ImagePicker
import * as ImagePicker from 'expo-image-picker'; 

const { width } = Dimensions.get('window');

// --- ÍCONES E COMPONENTES REUTILIZADOS ---
const ICON_BACK = require('../../../assets/icons/arrow-left.png'); 
const ICON_ADD_IMAGE = require('../../../assets/icons/add.png'); 
const ICON_CHECK = require('../../../assets/icons/check.png'); 

const PetIcon = () => (
    <View style={registerStyles.logoContainer}>
      <Image
        source={require('../../../assets/icons/PETLOGO.png')}
        style={registerStyles.logoImage}
        resizeMode="contain"
      />
      <Text style={registerStyles.logoText}>Lar Doce Pet</Text>
    </View>
);

// --- Componente CustomAlert (Adaptado da tela Host) ---
const CustomAlert = ({
    visible, title, message, onConfirm, onCancel, confirmText, cancelText, isConfirmation = true,
}: {
    visible: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmText: string; cancelText?: string; isConfirmation?: boolean;
}) => (
    <Modal transparent visible={visible} animationType="fade">
      <View style={alertStyles.modalOverlay}>
        <View style={alertStyles.modalContainer}>
          <Text style={alertStyles.modalTitle}>{title}</Text>
          <Text style={alertStyles.modalMessage}>{message}</Text>
          <View style={alertStyles.modalButtonsContainer}>
            {isConfirmation && (
              <TouchableOpacity style={[alertStyles.modalButton, alertStyles.modalCancelButton]} onPress={onCancel}>
                <Text style={alertStyles.modalCancelButtonText}>{cancelText || "Cancelar"}</Text>
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

// --- Componente de Opção de Filtro (Adaptado da tela Filtros) ---
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

// --- Componente para exibição de imagens (Simulação) ---
const ImagePreview = ({ imageUri, isCover, onDelete }: { imageUri: string, isCover: boolean, onDelete: () => void }) => (
    <View style={listingStyles.imagePreviewContainer}>
        <Image 
            source={{ uri: imageUri }} 
            style={listingStyles.imagePreview} 
            resizeMode="cover" 
        />
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


// -------------------------------------------------------------------
// -------------------- TELA CRIAR ANÚNCIO HOST ----------------------
// -------------------------------------------------------------------
export default function CriarAnuncioScreen({ navigation }: RootStackScreenProps<'Criar_anuncio'>) {
    const [formData, setFormData] = useState({
        cidade: '',
        bairro: '',
        petsAceitos: [] as string[],
        maxPets: '1',
        pesoMaximo: [] as string[],
        descricao: '',
        diaria: '',
    });
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    // const [newImageUrl, setNewImageUrl] = useState(''); // Removido
    
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertData, setAlertData] = useState({ title: '', message: '', isConfirmation: false, onConfirm: () => {}, onCancel: () => {} });

    const PET_OPTIONS = ['Cachorro', 'Gato', 'Pássaro', 'Réptil'];
    
    // 💡 MODIFICAÇÃO: Opções de peso simplificadas
    const WEIGHT_OPTIONS_LABELS = ['Pequeno', 'Médio', 'Grande'];
    
    const MAX_PETS_PERMITTED = 15;
    const MIN_IMAGES = 6;
    const MAX_IMAGES = 10;
    const HOST_NAME = 'José da Silva Santos'; 

    const showAlert = (title: string, message: string, isConfirmation = false, onConfirm = () => setAlertVisible(false), onCancel = () => setAlertVisible(false)) => {
        setAlertData({ title, message, isConfirmation, onConfirm, onCancel });
        setAlertVisible(true);
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTogglePet = (pet: string) => {
        setFormData(prev => {
            const list = prev.petsAceitos;
            if (list.includes(pet)) {
                return { ...prev, petsAceitos: list.filter(p => p !== pet) };
            } else {
                return { ...prev, petsAceitos: [...list, pet] };
            }
        });
    };
    
    // 💡 MODIFICAÇÃO: Lógica para toggle do novo peso
    const handleToggleWeight = (weight: string) => {
        setFormData(prev => {
            const list = prev.pesoMaximo;
            if (list.includes(weight)) {
                return { ...prev, pesoMaximo: list.filter(w => w !== weight) };
            } else {
                return { ...prev, pesoMaximo: [...list, weight] };
            }
        });
    };

    const handlePickImage = async () => {
        if (imageUrls.length >= MAX_IMAGES) {
            showAlert('Limite Atingido', `Você pode adicionar no máximo ${MAX_IMAGES} fotos.`, false);
            return;
        }

        const mockUris = [
            'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=300&h=200&fit=crop',
            'https://api.builder.io/api/v1/image/assets/TEMP/af2836f80ee9f66f26be800dc23edbde1db69238?width=680',
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop',
            'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=300&h=200&fit=crop',
        ];
        
        // Simulação de selecionar uma nova URL (para fins de demonstração)
        const newUri = mockUris[imageUrls.length % mockUris.length] + `?v=${Date.now()}`;
        setImageUrls(prev => [...prev, newUri]);
    };

    const handleDeleteImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateListing = () => {
        const { cidade, bairro, petsAceitos, maxPets, pesoMaximo, descricao, diaria } = formData;

        if (!cidade || !bairro || petsAceitos.length === 0 || !maxPets || pesoMaximo.length === 0 || !descricao || !diaria) {
            showAlert('Erro', 'Por favor, preencha todos os campos obrigatórios.', false);
            return;
        }

        if (imageUrls.length < MIN_IMAGES) {
            showAlert('Erro', `Você precisa adicionar no mínimo ${MIN_IMAGES} fotos da área Pet.`, false);
            return;
        }

        // Validação da Diária e Max Pets (Inalterada)
        const numericDiaria = parseFloat(diaria.replace(',', '.'));
        // ... (restante da validação)

        showAlert(
            'Confirmar Anúncio', 
            'Todas as informações estão corretas? O anúncio será criado.', 
            true, 
            () => {
                // Lógica de criação estática
                console.log('Anúncio Criado Localmente:', { ...formData, imageUrls });
                
                // Navegação de volta com os novos dados
                navigation.navigate('Perfil_Host', { 
                    listingCreated: true, 
                    newListingData: {
                        location: `${formData.cidade}, ${formData.bairro}`,
                        price: formData.diaria,
                        petsAccepted: formData.petsAceitos,
                        imageUri: imageUrls[0]
                    }
                });
            },
            () => setAlertVisible(false)
        );
    };

    const handleMaxPetsChange = (text: string) => {
        // Lógica de Max Pets (Inalterada)
        let value = text.replace(/[^0-9]/g, ''); 
        if (value.length > 0) {
            let num = parseInt(value);
            if (num > MAX_PETS_PERMITTED) {
                num = MAX_PETS_PERMITTED;
                showAlert('Atenção', `O limite máximo de pets é ${MAX_PETS_PERMITTED}.`, false);
            }
            if (num < 1) {
                num = 1;
            }
            value = num.toString();
        }
        setFormData(prev => ({ ...prev, maxPets: value }));
    };

    return (
        <View style={registerStyles.container}>
            <ScrollView contentContainerStyle={registerStyles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={registerStyles.card}>
                    

                    <View style={registerStyles.formContainer}>
                        <Text style={registerStyles.title}>Crie seu Anúncio de Locação</Text>


                        {/* Cidade e Bairro */}
                        <View style={registerStyles.inputContainer}>
                            <TextInput
                                style={registerStyles.input}
                                value={formData.cidade}
                                onChangeText={(value) => handleInputChange('cidade', value)}
                                placeholder="Cidade da sua Locação"
                                placeholderTextColor="#79b24e62"
                                autoCapitalize="words"
                            />
                        </View>
                        <View style={registerStyles.inputContainer}>
                            <TextInput
                                style={registerStyles.input}
                                value={formData.bairro}
                                onChangeText={(value) => handleInputChange('bairro', value)}
                                placeholder="Bairro"
                                placeholderTextColor="#79b24e62"
                                autoCapitalize="words"
                            />
                        </View>
                        
                        {/* QUANDO PETS ACEITA */}
                        <View style={[listingStyles.groupContainer, { width: '85%' }]}>
                            <Text style={listingStyles.groupTitle}>Quais Pets você aceita?</Text>
                            <View style={listingStyles.optionsRow}>
                                {PET_OPTIONS.map((pet) => (
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
                                placeholder={`Máximo de Pets por Reserva (Max ${MAX_PETS_PERMITTED})*`}
                                placeholderTextColor="#79b24e62"
                                keyboardType="numeric"
                            />
                        </View>

                        {/* PESO MÁXIMO DE PETS 💡 MODIFICADO AQUI */}
                        <View style={[listingStyles.groupContainer, { width: '85%' }]}>
                            <Text style={listingStyles.groupTitle}>Porte dos Pets que cuida:</Text>
                            <View style={listingStyles.optionsRow}>
                                {WEIGHT_OPTIONS_LABELS.map((weight) => (
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
                                onChangeText={(value) => handleInputChange('descricao', value)}
                                placeholder="Descrição detalhada da sua locação (máx 200 caracteres)"
                                placeholderTextColor="#79b24e62"
                                multiline
                                numberOfLines={4}
                                maxLength={200}
                                autoCapitalize="sentences"
                            />
                            <Text style={listingStyles.charCount}>{formData.descricao.length}/200</Text>
                        </View>

                        {/* DIÁRIA */}
                        <View style={registerStyles.inputContainer}>
                            <TextInput
                                style={registerStyles.input}
                                value={formData.diaria}
                                onChangeText={(value) => handleInputChange('diaria', value.replace(/[^0-9,.]/g, '').replace('.', ','))}
                                placeholder="Valor da Diária (R$) (ex: 30R$)"
                                placeholderTextColor="#79b24e62"
                                keyboardType="numeric"
                            />
                        </View>

                        {/* FOTOS DA ÁREA PET 💡 MODIFICADO AQUI */}
                        <View style={[listingStyles.groupContainer, { width: '85%' }]}>
                            <Text style={listingStyles.groupTitle}>Fotos da Área Pet (Mín {MIN_IMAGES}, Máx {MAX_IMAGES})*</Text>
                            
                            {/* Botão de Adicionar Foto (Substitui o TextInput de URL) */}
                            <TouchableOpacity 
                                style={listingStyles.photoBox} 
                                onPress={handlePickImage}
                                disabled={imageUrls.length >= MAX_IMAGES}
                            >
                                <Text style={listingStyles.textoFoto}>
                                    {imageUrls.length < MAX_IMAGES ? 'Adicionar foto' : 'Máximo atingido'}
                                </Text>
                            </TouchableOpacity>

                            <Text style={listingStyles.imageCountText}>
                                {imageUrls.length} de {MAX_IMAGES} fotos adicionadas 
                            </Text>

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

                        {/* BOTÃO CRIAR ANÚNCIO */}
                        <TouchableOpacity style={registerStyles.registerButton} onPress={handleCreateListing}>
                            <Text style={registerStyles.registerButtonText}>Criar Anúncio</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </ScrollView>
            
            {/* ALERT CUSTOMIZADO */}
            <CustomAlert
                visible={alertVisible}
                title={alertData.title}
                message={alertData.message}
                isConfirmation={alertData.isConfirmation}
                onConfirm={alertData.onConfirm}
                onCancel={alertData.onCancel}
                confirmText={alertData.isConfirmation ? "Criar" : "OK"}
            />
        </View>
    );
}

// -------------------------------------------------------------------
// ----------------------------- ESTILOS -----------------------------
// -------------------------------------------------------------------

// Estilos Reutilizados da Tela de Cadastro (RegisterScreen)
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
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 25,
    },
    logoImage: {
        width: 100,
        height: 100,
        marginBottom: 3,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#7AB24E',
        fontFamily: 'Inter',
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
        marginBottom: 50,
    },
    registerButtonText: {
        color: '#FFF6E2',
        fontFamily: 'Inter',
        fontSize: 20,
        fontWeight: '700',
    },
});

// Estilos Adicionais para a Tela de Criar Anúncio
const listingStyles = StyleSheet.create({
    // --- Header e Voltar ---
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        backgroundColor: '#7AB24E',
        borderRadius: 10,
        padding: 8,
    },
    backIcon: {
        width: 25,
        height: 25,
        tintColor: '#FFF6E2',
    },
    pulledInfoText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#556A44',
        marginBottom: 5,
    },
    // --- Campos de Seleção (Grupos) ---
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
    // --- Descrição (TextArea) ---
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
    // --- Upload de Imagens (Simulação - Novo) ---
    photoBox: {
        width: 180, // Largura média
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

// Estilos do Alerta Customizado (Copiados da tela Host)
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
        backgroundColor: '#556A44', // Cor de cancelamento mais escura
    },
    modalCancelButtonText: {
        color: '#FFF6E2',
        fontSize: 16,
        fontWeight: '700',
    }
});