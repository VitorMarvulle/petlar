import React from 'react';
// CORREÇÃO: Adicionando Dimensions para calcular a largura do card da Home
import {View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions} from 'react-native';
// Certifique-se de que '@react-navigation/native' está instalado e configurado
import {useNavigation} from '@react-navigation/native';

// CONSTANTE NECESSÁRIA PARA O ESTILO DO CARD
const { width } = Dimensions.get('window');

// --- ÍCONES REUTILIZADOS DA TELA TUTOR ---
const ICON_STAR = require('../../../assets/icons/starFilled.png'); 
const ICON_AVATAR = require('../../../assets/icons/user.png'); 
const ICON_DELETE = require('../../../assets/icons/delete.png'); 
const ICON_EDIT = require('../../../assets/icons/edit.png'); 

// --- ÍCONES NOVOS PARA AÇÕES ---
const ICON_CONFIRM = require('../../../assets/icons/check.png'); 
const ICON_DENY = require('../../../assets/icons/delete.png'); 

// --- MOCK DE DADOS PARA DEMONSTRAÇÃO ---
const MOCK_HOST_CARD = {
    name: 'Vitor M.', // Mock Host Name
    location: 'Praia Grande, Tupi',
    rating: '4,5',
    price: '65,00', // Preço deve ser string sem R$ / dia
    imageUri: 'https://api.builder.io/api/v1/image/assets/TEMP/af2836f80ee9f66f26be800dc23edbde1db69238?width=680', // Usando a imagem do MOCK_LISTING, mas com W/H adequados.
    petsAccepted: ['gato', 'cachorro'], 
};

// MOCK_LISTING É NECESSÁRIO APENAS SE FOR PASSAR DETALHES NA NAVEGAÇÃO. MANTENDO UMA VERSÃO SIMPLES:
const MOCK_LISTING = {
    imageUrl: MOCK_HOST_CARD.imageUri, // Usando a mesma imagem
    address: 'R. Alameda dos Cães Felizes, 123 - Boqueirão',
    price: `R$ ${MOCK_HOST_CARD.price} / diária`,
    capacity: 'Até 3 pets (Pequeno/Médio)',
    specifications: 'Casa com grande quintal gramado e piscina. Aceitamos cães e gatos. Monitoramento 24h e passeio diário. Exigimos carteira de vacinação em dia.',
    available: true,
};


// Componente PetIconItem e PetIcons (Copiados da Home)
const PetIconItem = ({ petName }: { petName: string }) => {
    const icons: Record<string, any> = {
        cachorro: require('../../../assets/icons/animais/cachorro.png'), // Corrija o caminho do asset
        gato: require('../../../assets/icons/animais/gato.png'),      // Corrija o caminho do asset
        // Adicione outros pets se necessário
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

// Ícone de Estrela (Copiado da Home)
const StarIcon = () => <Image source={ICON_STAR} style={hostCardStyles.starIconImage} resizeMode="contain" />;

// Novo Componente HostCardHomeStyle
const HostCardHomeStyle = ({ 
    name, 
    location, 
    rating, 
    price, 
    imageUri, 
    petsAccepted, 
    onPress 
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

// Adaptação dos dados de reserva para usar o Tutor como solicitante
const MOCK_REQUEST = {
    id: 'req1',
    tutor: { name: 'Ellen Rodrigues Magueta', location: 'Aviação', avatarUrl: ICON_AVATAR }, // Agora é o Tutor solicitando
    dataEntrada: '01/12/2025',
    dataSaida: '05/12/2025', 
    dias: 4,
    pets: [
        { id: 'p1', name: "Nina", imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=60&h=60&fit=crop' },
        { id: 'p2', name: "Bolinho", imageUrl: 'https://images.unsplash-com/photo-1592194996308-7b43878e84a6?w=60&h=60&fit=crop' },
    ],
    totalValue: 'R$ 600,00', 
};
const MOCK_REQUESTS = [MOCK_REQUEST, {...MOCK_REQUEST, id: 'req2', tutor: { name: 'Carlos Pereira', location: 'Tupi', avatarUrl: ICON_AVATAR }, dias: 2, totalValue: 'R$ 300,00'}];


// --- COMPONENTES REUTILIZADOS DA TELA TUTOR ---

const UserAvatar = () => (
    <View style={styles.avatarContainer}>
      <View style={styles.avatarIcon}>
        <Image
          source={ICON_AVATAR} 
          style={styles.avatarImageContent}
          resizeMode="contain"
          tintColor="#FFF6E2"
        />
      </View>
    </View>
);

// O componente StarRating original (para o perfil) continua usando estilos 'styles'
const StarRating = ({rating}: {rating: string}) => (
    <View style={styles.ratingContainer}>
      <Image source={ICON_STAR} style={styles.starImage} resizeMode="contain" />
      <Text style={styles.ratingText}>{rating}</Text>
    </View>
);

// REMOVIDO: O ListingCard original não é mais necessário, pois foi substituído por HostCardHomeStyle

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

// --- COMPONENTES DO CARD DE SOLICITAÇÃO (REAPROVEITADOS) ---
const TutorMiniCard = ({ name, location, avatarUrl }: { name: string; location: string; avatarUrl: any }) => (
    <View style={hostStyles.tutorCard}>
        <Image source={avatarUrl} style={hostStyles.tutorAvatar} tintColor="#FFF6E2" />
        <View style={hostStyles.tutorInfo}>
            <Text style={hostStyles.tutorName}>{name}</Text>
            <Text style={hostStyles.tutorLocation}>{location}</Text>
        </View>
    </View>
);

const PetsInRequest = ({ pets }: { pets: typeof MOCK_REQUEST.pets }) => (
    <View style={hostStyles.petsSelectedContainer}>
        <Text style={hostStyles.petsLabel}>Pets Solicitados:</Text>
        {pets.map((pet, index) => (
            <View key={index} style={hostStyles.petAvatarWrapper}>
                <Image source={{ uri: pet.imageUrl }} style={hostStyles.smallPetAvatar} />
            </View>
        ))}
        {pets.length === 0 && (
            <Text style={hostStyles.petsLabel}>Nenhum pet informado.</Text>
        )}
    </View>
);

const RequestDetails = ({ dataEntrada, dataSaida, dias, totalValue }: typeof MOCK_REQUEST) => (
    <View style={hostStyles.detailsContainer}>
        <View style={hostStyles.dateHeader}>
            <Text style={hostStyles.dateText}>{dataEntrada}</Text>
            <Text style={hostStyles.dateDivider}>{' - '}</Text>
            <Text style={hostStyles.dateText}>{dataSaida}</Text>
        </View>
        <Text style={hostStyles.detailRow}>
            <Text style={hostStyles.boldDetail}>Diárias:</Text> {dias} dia(s)
        </Text>
        <Text style={hostStyles.detailRow}>
            <Text style={hostStyles.boldDetail}>Valor Total:</Text> <Text style={hostStyles.totalValue}>{totalValue}</Text>
        </Text>
    </View>
);

const HostActionButtons = ({ onConfirm, onDeny }: { onConfirm: () => void; onDeny: () => void }) => (
    <View style={hostStyles.hostActionButtonsContainer}>
        <TouchableOpacity style={[hostStyles.hostActionButton, hostStyles.denyButton]} onPress={onDeny}>
            <Image source={ICON_DENY} style={hostStyles.hostActionIcon} tintColor="#fff" resizeMode="contain" />
            <Text style={hostStyles.hostActionButtonText}>Negar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[hostStyles.hostActionButton, hostStyles.confirmButton]} onPress={onConfirm}>
            <Image source={ICON_CONFIRM} style={hostStyles.hostActionIcon} tintColor="#fff" resizeMode="contain" />
            <Text style={hostStyles.hostActionButtonText}>Confirmar</Text>
        </TouchableOpacity>
    </View>
);

const RequestCard = ({ request, onConfirm, onDeny }: { request: typeof MOCK_REQUEST; onConfirm: () => void; onDeny: () => void }) => (
    <View style={hostStyles.cardContainer}>
        <TutorMiniCard 
            name={request.tutor.name} 
            location={request.tutor.location} 
            avatarUrl={request.tutor.avatarUrl} 
        />
        <RequestDetails {...request} />
        <PetsInRequest pets={request.pets} />
        <HostActionButtons onConfirm={onConfirm} onDeny={onDeny} />
    </View>
);


// --- TELA PRINCIPAL DO HOST ---
export default function PerfilHost({navigation}) {
    
    const handleEditListing = () => {
        console.log('Navegar para Editar Locação');
        navigation.navigate('EditarLocacao');};

    const handleDeleteListing = () => {
        console.log('Solicitar Exclusão da Locação');
        navigation.navigate('ExcluirLocacao');}; 


    const handleConfirmRequest = (requestId) => {
        console.log(`Solicitação ${requestId} CONFIRMADA (Ação Front-end)`);
    };

    const handleDenyRequest = (requestId) => {
        console.log(`Solicitação ${requestId} NEGADA (Ação Front-end)`);
    };


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

                    {/* SEÇÃO PERFIL DO HOST */}
                    <View style={styles.profileSection}>
                        <UserAvatar />
                        <View style={styles.profileInfo}>
                            <Text>Bem vindo(a), Host</Text> 
                            <Text style={styles.greeting}>José da Silva Santos</Text> 
                        </View>
                        <View style={styles.profileRating}>
                            <StarRating rating="4,8" />
                        </View>

                    </View>

                    {/* SEÇÃO ANÚNCIO DE LOCAÇÃO */}
                    <View style={styles.listingSection}>
                        <Text style={styles.sectionTitle}>Seu Anúncio de Locação</Text>

                        {/* CARD DE LOCAÇÃO - AGORA COM ESTILO DA HOME */}
                        <HostCardHomeStyle 
                            {...MOCK_HOST_CARD} 
                            onPress={() => navigation.navigate('Card_Host', { listing: MOCK_LISTING })} 
                        />
                        
                        {/* BOTÕES DE AÇÃO (2 APENAS) */}
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
                    </View>

                    {/* SEÇÃO: SOLICITAÇÕES DE RESERVA */}
                    <View style={styles.requestsSection}>
                        <Text style={styles.sectionTitle}>Solicitações de Reserva (Pendentes)</Text>

                        {MOCK_REQUESTS.length > 0 ? (
                            MOCK_REQUESTS.map((request) => (
                                <RequestCard 
                                    key={request.id}
                                    request={request}
                                    onConfirm={() => handleConfirmRequest(request.id)}
                                    onDeny={() => handleDenyRequest(request.id)}
                                />
                            ))
                        ) : (
                            <Text style={styles.noRequestsText}>Nenhuma solicitação de reserva pendente no momento. 🎉</Text>
                        )}

                    </View>
                </View>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Como funciona?</Text>
                  </View>


            </ScrollView>
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
        marginTop: 32,
        marginBottom: 20,
        position: 'relative',
    },

    //LOGO DO PET
    cornerImageContainer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: -68,
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

    // SEÇÃO PERFIL DO HOST
    profileSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 15,
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
        marginTop: -10,
        marginBottom: 20,
    },
    // O ListingCard original foi substituído, mas mantive os estilos não utilizados abaixo
    // para não quebrar outras referências que possam existir.
    listingCard: {
        flexDirection: 'row',
        backgroundColor: '#c8d3b7ff', 
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        elevation: 2,
    },
    listingImageContainer: {
        width: 130,
        height: 180, 
        borderRadius: 6,
        overflow: 'hidden',
        marginRight: 10,
    },
    listingImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    listingDetails: {
        flex: 1,
        paddingTop: 5,
    },
    listingTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#4d654bff',
        fontFamily: 'Inter',
        marginBottom: 8,
    },
    listingDetailText: {
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

    // --- SEÇÃO SOLICITAÇÕES ---
    requestsSection: {
        marginTop: 30,
        marginBottom: 20,
    },
    noRequestsText: {
        fontSize: 16,
        color: '#556A44',
        textAlign: 'center',
        paddingVertical: 20,
        fontStyle: 'italic',
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
});


// --- ESTILOS PARA OS CARDS DE SOLICITAÇÃO ---
const hostStyles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#FFF6E2', 
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#7AB24E', 
        padding: 15,
        marginBottom: 20,
    },

    tutorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#E0EFD3', 
        borderRadius: 10,
        marginBottom: 15,
    },
    tutorAvatar: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: '#7AB24E',
        marginRight: 10,
    },
    tutorInfo: {
        flex: 1,
    },
    tutorName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#556A44',
    },
    tutorLocation: {
        fontSize: 13,
        color: '#556A44',
    },

    detailsContainer: {
        paddingVertical: 5,
        marginBottom: 10,
    },
    dateHeader: { 
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#B3D18C',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4d654bff',
    },
    dateDivider: {
        fontSize: 16,
        fontWeight: '700',
        color: '#B3D18C',
    },
    detailRow: {
        fontSize: 14,
        color: '#556A44',
        marginBottom: 5,
    },
    boldDetail: {
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 15,
        fontWeight: '900',
        color: '#4d654bff',
    },

    petsSelectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
        paddingHorizontal: 5,
    },
    petsLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#556A44',
        marginRight: 10,
    },
    petAvatarWrapper: {
        marginRight: 8,
        alignItems: 'center',
    },
    smallPetAvatar: {
        width: 35, 
        height: 35,
        borderRadius: 17.5,
        borderWidth: 2,
        borderColor: '#7AB24E',
        backgroundColor: '#FFF6E2',
    },

    hostActionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#B3D18C',
        paddingTop: 15,
    },
    hostActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 20,
        width: '45%',
        elevation: 3,
    },
    denyButton: {
        backgroundColor: '#d85e38ff', 
    },
    confirmButton: {
        backgroundColor: '#7AB24E', 
    },
    hostActionIcon: {
        width: 18,
        height: 18,
        marginRight: 8,
        tintColor: '#FFFFFF',
    },
    hostActionButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

// --- ESTILOS DO HOST CARD (CRIADO E CORRIGIDO) ---
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