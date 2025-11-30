// AppPet\src\screens\Perfil_Host.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://localhost:8000'; // Ajuste o IP conforme necessário

// --- ÍCONES (Mantidos) ---
const ICON_STAR = require('../../../assets/icons/starFilled.png');
const ICON_AVATAR = require('../../../assets/icons/user.png');
const ICON_DELETE = require('../../../assets/icons/delete.png');
const ICON_EDIT = require('../../../assets/icons/edit.png');
const ICON_LIST = require('../../../assets/icons/planilha.png');
const ICON_LOGO_BRANCO = require('../../../assets/icons/LogoBranco.png');
const ICON_BACK = require('../../../assets/icons/arrow-left.png');

// --- INTERFACES ---
interface RatingResponse {
    id_usuario: number;
    media: number;
    total_avaliacoes: number;
}

// Interface para os dados vindos da Home (Simplificado)
interface HostDataParam {
    id_anfitriao?: number;
    name: string;
    location: string;
    price: string;
    imageUri: string;
    petsAccepted: string[];
    rating?: string; // vindo da Home
    rawData?: any;   // Objeto completo do backend vindo da Home
}

// --- COMPONENTES VISUAIS (Mantidos com ajustes leves) ---
const PetIconItem = ({ petName }: { petName: string }) => {
    const icons: Record<string, any> = {
        cachorro: require('../../../assets/icons/animais/cachorro.png'),
        gato: require('../../../assets/icons/animais/gato.png'),
        passaro: require('../../../assets/icons/animais/passaro.png'),
        tartaruga: require('../../../assets/icons/animais/tartaruga.png'),
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

// Card estilizado para a tela de Perfil
const HostCardHomeStyle = ({
    name, location, rating, price, imageUri, petsAccepted, onPress
}: HostDataParam & { onPress: () => void }) => (
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

const CreateListingButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity style={styles.createButton} onPress={onPress}>
        <Text style={styles.createButtonText}>Criar Anúncio</Text>
    </TouchableOpacity>
);

// Avatar Dinâmico
const UserAvatar = ({ url }: { url?: string }) => (
    <View style={styles.avatarContainer}>
        <View style={styles.avatarIcon}>
            {url && url.startsWith('http') ? (
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

// --- TELA PRINCIPAL DO HOST ---
export default function PerfilHost({ navigation }: { navigation: any }) {
    const route = useRoute();
    // Recebe 'host' da Home ou dados de novo anúncio
    const params = route.params as { 
        host?: HostDataParam; 
        listingCreated?: boolean; 
        newListingData?: any 
    } | undefined;

    // Se veio da Home, usamos o objeto host. 
    const initialListing = params?.host || null;

    const [currentListing, setCurrentListing] = useState<HostDataParam | null>(initialListing);
    const [ratingData, setRatingData] = useState<RatingResponse | null>(null);
    const [loadingRating, setLoadingRating] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);

    // --- BUSCAR MÉDIA DE AVALIAÇÕES ---
    const fetchRating = useCallback(async () => {
        // Precisamos do ID do usuário (não do anfitrião) para buscar a média
        // O ID do usuário geralmente está dentro de rawData.usuarios.id_usuario
        const userId = currentListing?.rawData?.usuarios?.id_usuario;

        if (!userId) {
            console.log("ID do usuário não encontrado para buscar avaliações");
            return;
        }

        try {
            setLoadingRating(true);
            const response = await fetch(`${API_BASE_URL}/avaliacoes/media/${userId}`);
            
            if (response.ok) {
                const data = await response.json();
                setRatingData(data);
            }
        } catch (error) {
            console.error("Erro ao buscar avaliações:", error);
        } finally {
            setLoadingRating(false);
        }
    }, [currentListing]);

    useEffect(() => {
        fetchRating();
    }, [fetchRating]);

    // --- EFEITO PARA CAPTURAR NOVO ANÚNCIO (Mantido da sua lógica) ---
    useEffect(() => {
        if (params?.listingCreated && params.newListingData) {
            const newListing: HostDataParam = {
                name: params.newListingData.name || 'Você',
                location: params.newListingData.location,
                price: params.newListingData.price.replace(',', '.'), 
                petsAccepted: params.newListingData.petsAccepted,
                imageUri: params.newListingData.imageUri,
                rating: 'Novo', // Anúncio novo não tem nota ainda
                rawData: { usuarios: { nome: 'Você', id_usuario: 0 } } // Mock temporário
            };
            setCurrentListing(newListing);
            navigation.setParams({ listingCreated: undefined, newListingData: undefined });
        }
    }, [params?.listingCreated, params?.newListingData]);


    // Handlers
    const handleViewRequests = () => navigation.navigate('Reserva_Host');
    const handleEditListing = () => console.log('Navegar para Editar Locação');
    const handleCreateListing = () => navigation.navigate('Criar_anuncio');
    
    const handleDeleteListing = () => setAlertVisible(true);
    const confirmDeleteListing = () => {
        setAlertVisible(false);
        setCurrentListing(null);
        // Aqui você chamaria a API DELETE /anfitrioes/{id}
    };
    const cancelDeleteListing = () => setAlertVisible(false);

    // Preparar dados para navegação de detalhes
    const getListingDetails = () => {
        if (!currentListing) return null;
        return {
            ...currentListing,
            imageUrl: currentListing.imageUri,
            address: currentListing.location,
            price: `R$ ${currentListing.price} / diária`,
            capacity: 'Consulte detalhes',
            available: true,
        };
    };

    // Dados de exibição do Perfil
    const profileName = currentListing?.name || currentListing?.rawData?.usuarios?.nome || "Host";
    const profileImage = currentListing?.rawData?.usuarios?.foto_perfil_url;

    // Renderização da Avaliação
    const renderRating = () => {
        if (loadingRating) return <ActivityIndicator size="small" color="#556A44" />;
        
        if (!ratingData || ratingData.total_avaliacoes === 0) {
            return (
                <View style={styles.ratingContainer}>
                    <Text style={styles.noRatingText}>Ainda sem avaliações</Text>
                </View>
            );
        }

        return (
            <View style={styles.ratingContainer}>
                <Image source={ICON_STAR} style={styles.starImage} resizeMode="contain" />
                <Text style={styles.ratingText}>{ratingData.media.toFixed(1).replace('.', ',')}</Text>
                <Text style={styles.ratingCountText}> ({ratingData.total_avaliacoes})</Text>
            </View>
        );
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
            
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.innerContainer}>
                    
                    {/* SEÇÃO DE PERFIL */}
                    <View style={styles.profileSection}>
                        <UserAvatar url={profileImage} />
                        <View style={styles.profileInfo}>
                            <Text>Bem vindo(a), Host</Text>
                            <Text style={styles.greeting}>{profileName}</Text>
                        </View>
                        <View style={styles.profileRating}>
                            {renderRating()}
                        </View>
                    </View>

                    {/* SEÇÃO ANÚNCIO DE LOCAÇÃO */}
                    <View style={styles.listingSection}>
                        <Text style={styles.sectionTitle}>Seu Anúncio de Locação</Text>

                        {currentListing ? (
                            <>
                                <HostCardHomeStyle
                                    {...currentListing}
                                    // Atualiza a nota visualmente no card se tivermos dados reais
                                    rating={ratingData?.media ? ratingData.media.toFixed(1).replace('.', ',') : (currentListing.rating || "Novo")}
                                    onPress={() => navigation.navigate('Card_Host', { host: currentListing })}
                                />

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
                message="Tem certeza que deseja excluir seu anúncio? Esta ação é irreversível."
                onConfirm={confirmDeleteListing}
                onCancel={cancelDeleteListing}
                confirmText="Excluir"
                cancelText="Cancelar"
            />
        </SafeAreaView>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#B3D18C' },
    scrollContainer: { flexGrow: 1 },
    innerContainer: {
        flex: 1, margin: 12, backgroundColor: '#FFFFFF', borderRadius: 49,
        paddingHorizontal: 20, paddingVertical: 20, marginTop: 100, marginBottom: 20,
    },
    // Header e Logo
    cornerImageContainer: { position: 'absolute', top: 29, left: '50%', marginLeft: -85, width: 60, height: 60, zIndex: 10 },
    cornerImage: { width: '100%', height: '100%', resizeMode: 'contain' },
    LogoText: { position: 'absolute', top: 60, left: '50%', marginLeft: -25, fontSize: 20, fontWeight: '700', color: '#ffffff', zIndex: 10 },
    headerButtons: { position: 'absolute', top: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 20 },
    headerButton: { padding: 5 },
    headerIcon: { width: 25, height: 25, tintColor: '#FFFFFF' },
    logoutText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, fontFamily: 'Inter' },
    
    // Perfil
    profileSection: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 5, marginLeft: -6, marginBottom: 30 },
    avatarContainer: { marginRight: 15, zIndex: 10, left: 8, marginTop: -3 },
    avatarIcon: { width: 90, height: 90, backgroundColor: '#7AB24E', borderRadius: 60, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatarImageContent: { width: '50%', height: '50%' },
    profileInfo: { flex: 1, paddingTop: 24, marginBottom: 20 },
    greeting: { fontSize: 17, fontWeight: '700', color: '#556A44', fontFamily: 'Inter', marginBottom: 5 },
    
    // Avaliação no Perfil
    profileRating: { marginTop: 40, zIndex: 10, right: 7 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 3, marginRight: -5 },
    starImage: { width: 22, height: 22, marginRight: 4, zIndex: 10 },
    ratingText: { fontSize: 13, color: '#556A44', fontFamily: 'Inter', fontWeight: '700' },
    ratingCountText: { fontSize: 11, color: '#888', fontFamily: 'Inter' },
    noRatingText: { fontSize: 12, color: '#888', fontStyle: 'italic' },

    // Seção Anúncio
    listingSection: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#556A44', fontFamily: 'Inter', marginTop: 5, marginBottom: 20 },
    
    // Sem Anúncio
    noListingContainer: { alignItems: 'center', backgroundColor: '#FFF6E2', borderRadius: 15, borderWidth: 2, borderColor: '#B3D18C', paddingVertical: 40, paddingHorizontal: 20, marginBottom: 15 },
    noListingText: { fontSize: 16, color: '#556A44', fontWeight: '500', textAlign: 'center', marginBottom: 20 },
    createButton: { backgroundColor: '#85B65E', borderRadius: 15, paddingVertical: 12, paddingHorizontal: 30, borderWidth: 2, borderColor: '#B3D18C' },
    createButtonText: { color: '#FFF6E2', fontSize: 16, fontWeight: '700' },

    // Botões de Ação
    actionButtonsContainerHost: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15, marginBottom: 20, paddingHorizontal: 40 },
    actionButtonWrapper: { alignItems: 'center', width: 80, marginBottom: -80 },
    actionButton: { width: 80, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 5, elevation: 4 },
    actionIcon: { width: 20, height: 20, tintColor: '#FFFFFF' },
    actionButtonLabel: { fontSize: 13, fontWeight: '800', color: '#556A44', fontFamily: 'Inter', marginTop: 2 },

    // Botão Solicitações
    requestsButtonWrapper: { alignItems: 'center', marginTop: 90, marginBottom: 20 },
    requestsButton: { flexDirection: 'row', backgroundColor: '#4d654bff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5 },
    requestsIcon: { width: 20, height: 20, marginRight: 10 },
    requestsButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', fontFamily: 'Inter' },

    // Footer
    footer: { alignItems: 'center', paddingVertical: 15 },
    footerText: { fontSize: 17, fontWeight: '700', color: '#556A44', fontFamily: 'Inter', bottom: 20, marginBottom: 10 },
});

// Estilos do Host Card (Mantidos iguais à Home)
const hostCardStyles = StyleSheet.create({
    hostCard: { width: width - (12 * 2 + 20 * 2), height: 172, borderRadius: 15, borderWidth: 2, borderColor: '#B3D18C', backgroundColor: '#FFF6E2', marginBottom: 15, overflow: 'hidden', position: 'relative', alignSelf: 'center' },
    hostImage: { width: '100%', height: '150%', position: 'absolute', top: -40 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.37)', borderRadius: 14 },
    hostInfo: { position: 'absolute', top: 15, left: 16, flexDirection: 'row', alignItems: 'center' },
    hostName: { color: '#FFF', fontSize: 15, fontWeight: '700', fontFamily: 'Inter', marginRight: 8 },
    hostLocation: { color: '#FFF', fontSize: 13, fontFamily: 'Inter', position: 'absolute', top: 24, left: 0 },
    hostDetails: { position: 'absolute', bottom: 15, right: 16, alignItems: 'flex-end' },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    rating: { color: '#FFF', fontSize: 13, fontFamily: 'Inter' },
    price: { color: '#FFF', fontSize: 15, fontFamily: 'Inter' },
    priceAmount: { fontWeight: '700' },
    priceUnit: { fontWeight: '400' },
    starIconImage: { width: 15, height: 15, marginRight: 4, tintColor: '#FFFFFF' },
    petIconsContainer: { flexDirection: 'row', gap: 4 },
    petIconImage: { width: 25, height: 25 },
});

// Estilos do Alert
const alertStyles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '80%', backgroundColor: '#FFF6E2', borderRadius: 20, paddingVertical: 25, paddingHorizontal: 20, borderWidth: 3, borderColor: '#B3D18C', alignItems: 'center', elevation: 6 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#556A44', marginBottom: 10, textAlign: 'center' },
    modalMessage: { fontSize: 16, color: '#556A44', textAlign: 'center', marginBottom: 20 },
    modalButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 },
    modalButton: { backgroundColor: '#85B65E', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 2, borderColor: '#B3D18C', flex: 1, marginHorizontal: 5, alignItems: 'center' },
    modalButtonText: { color: '#FFF6E2', fontSize: 16, fontWeight: '700' },
    modalCancelButton: { backgroundColor: '#556A44' },
    modalCancelButtonText: { color: '#FFF6E2', fontSize: 16, fontWeight: '700' }
});