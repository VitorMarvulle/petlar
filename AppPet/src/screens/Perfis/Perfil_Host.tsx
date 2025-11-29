import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'; // 💡 Importamos useRoute

const { width } = Dimensions.get('window');

// --- ÍCONES REUTILIZADOS DA TELA TUTOR ---
const ICON_STAR = require('../../../assets/icons/starFilled.png');
const ICON_AVATAR = require('../../../assets/icons/user.png');
const ICON_DELETE = require('../../../assets/icons/delete.png');
const ICON_EDIT = require('../../../assets/icons/edit.png');
const ICON_LIST = require('../../../assets/icons/planilha.png');
const ICON_LOGO_BRANCO = require('../../../assets/icons/LogoBranco.png');
const ICON_BACK = require('../../../assets/icons/arrow-left.png');

// --- MOCK DE DADOS PARA DEMONSTRAÇÃO ---
const MOCK_HOST_CARD = {
    name: 'Vitor M.', // Mock Host Name
    location: 'Praia Grande, Tupi',
    rating: '4,5',
    price: '65,00',
    imageUri: 'https://api.builder.io/api/v1/image/assets/TEMP/af2836f80ee9f66f26be800dc23edbde1db69238?width=680',
    petsAccepted: ['gato', 'cachorro'],
};
// Definimos um tipo para os dados do novo anúncio
interface NewListingData {
    location: string;
    price: string;
    petsAccepted: string[];
    imageUri: string;
}

// Componente PetIconItem e PetIcons (Inalterados)
const PetIconItem = ({ petName }: { petName: string }) => {
    const icons: Record<string, any> = {
        cachorro: require('../../../assets/icons/animais/cachorro.png'),
        gato: require('../../../assets/icons/animais/gato.png'),
        pássaro: require('../../../assets/icons/animais/passaro.png'),
        réptil: require('../../../assets/icons/animais/tartaruga.png'),
    };

    const source = icons[petName.toLowerCase()];
    if (!source) return null;

    return <Image source={source} style={hostCardStyles.petIconImage} resizeMode="contain" />;
};

const PetIcons = ({ petsAccepted }: { petsAccepted: string[] }) => (
    <View style={hostCardStyles.petIconsContainer}>
        {petsAccepted.map((pet, i) => <PetIconItem key={i} petName={pet} />)}
    </View>
);

const StarIcon = () => <Image source={ICON_STAR} style={hostCardStyles.starIconImage} resizeMode="contain" />;

// Novo Componente HostCardHomeStyle (Inalterado)
const HostCardHomeStyle = ({
    name, location, rating, price, imageUri, petsAccepted, onPress
}: typeof MOCK_HOST_CARD & { onPress: () => void }) => (
    <TouchableOpacity style={hostCardStyles.hostCard} onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri: imageUri }} style={hostCardStyles.hostImage} resizeMode="cover" />
        <View style={hostCardStyles.overlay} />

        <View style={hostCardStyles.hostInfo}>
            <Text style={hostCardStyles.hostName}>{name}</Text>
            <PetIcons petsAccepted={petsAccepted} />
            <Text style={hostCardStyles.hostLocation}>{location}</Text>
        </View>

        <View style={hostCardStyles.hostDetails}>
            <View style={hostCardStyles.ratingContainer}>
                <StarIcon />
                <Text style={hostCardStyles.rating}>{rating}</Text>
            </View>
            <Text style={hostCardStyles.price}>
                <Text style={hostCardStyles.priceAmount}>R$ {price}</Text>
                <Text style={hostCardStyles.priceUnit}>/dia</Text>
            </Text>
        </View>
    </TouchableOpacity>
);

// Componente Botão de Criar Anúncio (Inalterado)
const CreateListingButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity style={styles.createButton} onPress={onPress}>
        <Text style={styles.createButtonText}>Criar Anúncio</Text>
    </TouchableOpacity>
);

// Componentes Auxiliares (Inalterados)
const UserAvatar = ({ url }: { url?: string }) => (
    <View style={styles.avatarContainer}>
        <View style={styles.avatarIcon}>
            {url ? (
                <Image source={{ uri: url }} style={{ width: '100%', height: '100%', borderRadius: 60 }} resizeMode="cover" />
            ) : (
                <Image
                    source={ICON_AVATAR}
                    style={styles.avatarImageContent}
                    resizeMode="contain"
                    tintColor="#FFF6E2"
                />
            )}
        </View>
    </View>
);

const StarRating = ({ rating }: { rating: string }) => (
    <View style={styles.ratingContainer}>
        <Image source={ICON_STAR} style={styles.starImage} resizeMode="contain" />
        <Text style={styles.ratingText}>{rating}</Text>
    </View>
);

const ActionButton = ({ onPress, backgroundColor, iconSource, label, }: { onPress: () => void; backgroundColor: string; iconSource: any; label: string; }) => (
    <View style={styles.actionButtonWrapper}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor }]} onPress={onPress}>
            <Image source={iconSource} style={styles.actionIcon} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.actionButtonLabel}>{label}</Text>
    </View>
);

const LogoLarDocePet = () => (
    <>
        <View style={styles.cornerImageContainer}>
            <Image source={ICON_LOGO_BRANCO} style={styles.cornerImage} resizeMode="contain" />
        </View>
        <Text style={styles.LogoText}>Lar Doce Pet</Text>
    </>
);

// Componente CustomAlert (Inalterado)
const CustomAlert = ({
    visible, title, message, onConfirm, onCancel, confirmText, cancelText
}: {
    visible: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmText: string; cancelText: string;
}) => (
    <Modal transparent visible={visible} animationType="fade">
        <View style={alertStyles.modalOverlay}>
            <View style={alertStyles.modalContainer}>
                <Text style={alertStyles.modalTitle}>{title}</Text>
                <Text style={alertStyles.modalMessage}>{message}</Text>
                <View style={alertStyles.modalButtonsContainer}>
                    <TouchableOpacity style={[alertStyles.modalButton, alertStyles.modalCancelButton]} onPress={onCancel}>
                        <Text style={alertStyles.modalCancelButtonText}>{cancelText}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={alertStyles.modalButton} onPress={onConfirm}>
                        <Text style={alertStyles.modalButtonText}>{confirmText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

// --- TELA PRINCIPAL DO HOST (AGORA COM LÓGICA DE ATUALIZAÇÃO) ---
export default function PerfilHost({ navigation }: { navigation: any }) {
    const route = useRoute();
    // 💡 DEFINIMOS O TIPO DE PARÂMETROS ESPERADOS NA ROTA Perfil_Host
    const params = route.params as { listingCreated?: boolean; newListingData?: NewListingData } | undefined;

    // Estado para o anúncio: começa com o mock padrão (se tiver) ou null
    const [currentListing, setCurrentListing] = useState<typeof MOCK_HOST_CARD | null>(MOCK_HOST_CARD);
    const [alertVisible, setAlertVisible] = useState(false);

    // 💡 EFEITO PARA CAPTURAR A CRIAÇÃO DO ANÚNCIO
    useEffect(() => {
        // Se a navegação veio da tela de criação E trouxe dados
        if (params?.listingCreated && params.newListingData) {
            const newListing: typeof MOCK_HOST_CARD = {
                ...MOCK_HOST_CARD,
                // Atualiza com os dados do novo anúncio
                location: params.newListingData.location,
                price: params.newListingData.price.replace(',', '.'), // Assume que a diária virá em string '0,00'
                petsAccepted: params.newListingData.petsAccepted,
                imageUri: params.newListingData.imageUri,
                // Mantemos o nome/rating mockados
            };
            setCurrentListing(newListing);

            // Limpa o parâmetro para evitar que o useEffect rode novamente
            navigation.setParams({ listingCreated: undefined, newListingData: undefined });
        }
    }, [params?.listingCreated, params?.newListingData]);


    const handleViewRequests = () => {
        console.log('Navegar para Reserva_Host');
        navigation.navigate('Reserva_Host');
    };
    const handleEditListing = () => {
        console.log('Navegar para Editar Locação');
        // navigation.navigate('EditarLocacao');
    };

    // Lógica de Exclusão (Atualiza currentListing para null)
    const handleDeleteListing = () => {
        setAlertVisible(true);
    };

    const confirmDeleteListing = () => {
        setAlertVisible(false);
        setCurrentListing(null);
        console.log('Anúncio excluído localmente.');
    };

    const cancelDeleteListing = () => {
        setAlertVisible(false);
    };

    const handleCreateListing = () => {
        console.log('Navegar para Criar Anúncio');
        // Usamos o nome correto da rota
        navigation.navigate('Criar_anuncio');
    };

    // Criando o objeto MOCK_LISTING baseado no currentListing para a navegação de detalhes
    const getListingDetails = () => {
        if (!currentListing) return null;
        return {
            imageUrl: currentListing.imageUri,
            address: currentListing.location,
            price: `R$ ${currentListing.price} / diária`,
            capacity: 'Até 3 pets (Pequeno/Médio)', // Mock
            specifications: 'Casa com grande quintal gramado e piscina. Aceitamos cães e gatos...', // Mock
            available: true,
        };
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerButtons}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Image source={ICON_BACK} style={styles.headerIcon} resizeMode="contain" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.headerButton}>
                    <Text style={styles.logoutText}>Sair</Text>
                </TouchableOpacity>
            </View>
            <LogoLarDocePet />
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}>
                <View style={styles.innerContainer}>
                    <View style={styles.profileSection}>
                        <UserAvatar url={`https://avatar.iran.liara.run/public?username=123`} />
                        <View style={styles.profileInfo}>
                            <Text>Bem vindo(a), Host</Text>
                            <Text style={styles.greeting}>José da Silva Santos</Text>
                        </View>
                        <View style={styles.profileRating}>
                            <StarRating rating="4,8" />
                        </View>
                    </View>

                    {/* SEÇÃO ANÚNCIO DE LOCAÇÃO - RENDERIZAÇÃO CONDICIONAL */}
                    <View style={styles.listingSection}>
                        <Text style={styles.sectionTitle}>Seu Anúncio de Locação</Text>

                        {currentListing ? (
                            <>
                                {/* CARD DE LOCAÇÃO */}
                                <HostCardHomeStyle
                                    {...currentListing}
                                    onPress={() => navigation.navigate('Card_Host', { listing: getListingDetails() })}
                                />

                                {/* BOTÕES DE AÇÃO */}
                                <View style={styles.actionButtonsContainerHost}>
                                    <ActionButton
                                        onPress={handleDeleteListing}
                                        backgroundColor="#556A44"
                                        iconSource={ICON_DELETE}
                                        label="Excluir"
                                    />
                                    <ActionButton
                                        onPress={handleEditListing}
                                        backgroundColor="#A6C57F"
                                        iconSource={ICON_EDIT}
                                        label="Editar"
                                    />
                                </View>
                            </>
                        ) : (
                            // CONTEÚDO QUANDO NÃO HÁ ANÚNCIO
                            <View style={styles.noListingContainer}>
                                <Text style={styles.noListingText}>Você ainda não possui um anúncio de locação</Text>
                                <CreateListingButton onPress={handleCreateListing} />
                            </View>
                        )}
                    </View>

                    <View style={styles.requestsButtonWrapper}>
                        <TouchableOpacity style={styles.requestsButton} onPress={handleViewRequests}>
                            <Image source={ICON_LIST} style={styles.requestsIcon} tintColor="#FFFFFF" resizeMode="contain" />
                            <Text style={styles.requestsButtonText}>Ver Solicitações de Reserva</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Como funciona?</Text>
                </View>
            </ScrollView>

            <CustomAlert
                visible={alertVisible}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir permanentemente o seu anúncio de locação? Esta ação não pode ser desfeita."
                onConfirm={confirmDeleteListing}
                onCancel={cancelDeleteListing}
                confirmText="Excluir"
                cancelText="Cancelar"
            />
        </SafeAreaView>
    );
}

// --- ESTILOS REUTILIZADOS E REVISADOS ---
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
        // Ajustado o marginTop para compensar o Logo que flutua por cima
        marginTop: 100,
        marginBottom: 20,
        position: 'relative',
    },

    // --- LOGO DO PET (COPIADO DA TELA FAVORITOS) ---
    cornerImageContainer: {
        position: 'absolute',
        top: 29,
        left: '50%',
        marginLeft: -85,
        width: 60,
        height: 60,
        zIndex: 10,
    },
    cornerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    LogoText: {
        position: 'absolute',
        top: 60,
        left: '50%',
        marginLeft: -25, // Ajuste para centralizar o texto "Lar Doce Pet"
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        zIndex: 10,
    },

    // ESTILOS DE IMAGEM E ÍCONES
    avatarImageContent: {
        width: '50%',
        height: '50%',
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
    requestsIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },

    // SEÇÃO PERFIL DO HOST
    profileSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 5,
        marginLeft: -6,
        marginBottom: 30,
    },
    avatarContainer: {
        marginRight: 15,
        zIndex: 10,
        left: 8,
        marginTop: -3,
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
        paddingTop: 24,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 17,
        fontWeight: '700',
        color: '#556A44',
        fontFamily: 'Inter',
        marginBottom: 5,
    },

    profileRating: {
        marginTop: 40,
        zIndex: 10,
        right: 7,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
        marginRight: -5,
    },
    ratingText: {
        fontSize: 13,
        color: '#556A44',
        fontFamily: 'Inter',
        fontWeight: '700',
    },

    // --- SEÇÃO LOCAÇÃO (REVISADA) ---
    listingSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#556A44',
        fontFamily: 'Inter',
        marginTop: 5,
        marginBottom: 20,
    },

    // ESTILOS PARA QUANDO NÃO HÁ ANÚNCIO (NOVO)
    noListingContainer: {
        alignItems: 'center',
        backgroundColor: '#FFF6E2',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#B3D18C',
        paddingVertical: 40,
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    noListingText: {
        fontSize: 16,
        color: '#556A44',
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: '#85B65E',
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderWidth: 2,
        borderColor: '#B3D18C',
    },
    createButtonText: {
        color: '#FFF6E2',
        fontSize: 16,
        fontWeight: '700',
    },

    // SEÇÃO BOTÕES DE AÇÃO (Host - 2 botões)
    actionButtonsContainerHost: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
        marginBottom: 20,
        paddingHorizontal: 40,
    },
    actionButtonWrapper: {
        alignItems: 'center',
        width: 80,
        marginBottom: -80,
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

    // --- NOVO BOTÃO DE NAVEGAÇÃO PARA SOLICITAÇÕES ---
    requestsButtonWrapper: {
        alignItems: 'center',
        marginTop: 90, // Espaçamento após a seção de locação
        marginBottom: 20,
    },
    requestsButton: {
        flexDirection: 'row',
        backgroundColor: '#4d654bff', // Cor de destaque para o botão
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    requestsButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Inter',
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
    headerButtons: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 20,
    },
    headerButton: {
        padding: 5,
    },
    headerIcon: {
        width: 25,
        height: 25,
        tintColor: '#FFFFFF',
    },
    logoutText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'Inter',
    },
});


// --- ESTILOS DO HOST CARD (REUTILIZADOS) ---
const hostCardStyles = StyleSheet.create({
    // === Host Card ===
    hostCard: {
        // CORREÇÃO: Usando a constante 'width' corretamente
        width: width - (12 * 2 + 20 * 2), // Largura total menos margens (12*2 do container) e padding (20*2 do innerContainer)
        height: 172,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#B3D18C',
        backgroundColor: '#FFF6E2',
        marginBottom: 15,
        overflow: 'hidden',
        position: 'relative',
        alignSelf: 'center',
    },
    hostImage: {
        width: '100%',
        height: '150%',
        position: 'absolute',
        top: -40
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.37)',
        borderRadius: 14
    },

    hostInfo: {
        position: 'absolute',
        top: 15,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    hostName: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Inter',
        marginRight: 8
    },
    hostLocation: {
        color: '#FFF',
        fontSize: 13,
        fontFamily: 'Inter',
        position: 'absolute',
        top: 24,
        left: 0
    },

    hostDetails: {
        position: 'absolute',
        bottom: 15,
        right: 16,
        alignItems: 'flex-end'
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
    },
    rating: {
        color: '#FFF',
        fontSize: 13,
        fontFamily: 'Inter'
    },
    price: {
        color: '#FFF',
        fontSize: 15,
        fontFamily: 'Inter'
    },
    priceAmount: {
        fontWeight: '700'
    },
    priceUnit: {
        fontWeight: '400'
    },
    starIconImage: {
        width: 15,
        height: 15,
        marginRight: 4,
        tintColor: '#FFFFFF'
    },

    // === Ícones dos Pets ===
    petIconsContainer: {
        flexDirection: 'row',
        gap: 4
    },
    petIconImage: {
        width: 25,
        height: 25
    },
});

// --- ESTILOS DO ALERTA CUSTOMIZADO (Copiado e Adaptado) ---
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