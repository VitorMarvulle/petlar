import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
// Certifique-se de que '@react-navigation/native' está instalado e configurado
import { useNavigation } from '@react-navigation/native';

// --- TIPAGENS PARA O STATUS ---
type ReservaStatus = 'Pendente' | 'Confirmada' | 'Negada' | 'Em Andamento' | 'Concluida';
type FilterStatus = ReservaStatus | 'Todos';

// --- ÍCONES REUTILIZADOS ---
const ICON_AVATAR = require('../../assets/icons/user.png'); 
const ICON_LOGO_BRANCO = require('../../assets/icons/LogoBranco.png'); 
const ICON_CONFIRM = require('../../assets/icons/check.png'); 
const ICON_DENY = require('../../assets/icons/delete.png'); 
// Ícone para Avaliação (mockado ou ajuste real)
const ICON_STAR = require('../../assets/icons/star.png'); 


// --- MOCK DE DADOS PARA DEMONSTRAÇÃO (AGORA COM STATUS) ---
const MOCK_REQUEST_BASE = {
    tutor: { name: 'Ellen Rodrigues Magueta', location: 'Aviação', avatarUrl: ICON_AVATAR }, 
    dataEntrada: '01/12/2025',
    dataSaida: '05/12/2025', 
    dias: 4,
    pets: [
        { id: 'p1', name: "Nina", imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=60&h=60&fit=crop' },
        { id: 'p2', name: "Bolinho", imageUrl: 'https://images.unsplash-com/photo-1592194996308-7b43878e84a6?w=60&h=60&fit=crop' },
    ],
    totalValue: 'R$ 600,00', 
};

// Nova lista de MOCK com diferentes status
const MOCK_REQUESTS_WITH_STATUS: (typeof MOCK_REQUEST_BASE & { id: string; status: ReservaStatus; })[] = [
    { ...MOCK_REQUEST_BASE, id: 'req1', status: 'Pendente' },
    { ...MOCK_REQUEST_BASE, id: 'req2', status: 'Confirmada', tutor: { name: 'Carlos Pereira', location: 'Tupi', avatarUrl: ICON_AVATAR }, dias: 2, totalValue: 'R$ 300,00' },
    { ...MOCK_REQUEST_BASE, id: 'req3', status: 'Em Andamento', tutor: { name: 'Ana Souza', location: 'Caiçara', avatarUrl: ICON_AVATAR }, dias: 2, totalValue: 'R$ 300,00' },
    { ...MOCK_REQUEST_BASE, id: 'req4', status: 'Concluida', tutor: { name: 'João Carlos', location: 'Guilhermina', avatarUrl: ICON_AVATAR }, dias: 5, totalValue: 'R$ 750,00' },
    { ...MOCK_REQUEST_BASE, id: 'req5', status: 'Negada', tutor: { name: 'Pedro Alves', location: 'Aviação', avatarUrl: ICON_AVATAR }, dias: 1, totalValue: 'R$ 150,00' },
];


// --- COMPONENTE DE CABEÇALHO ---



// --- COMPONENTES DO CARD DE SOLICITAÇÃO (Adaptados) ---

const TutorMiniCard = ({ name, location, avatarUrl }: { name: string; location: string; avatarUrl: any }) => (
    <View style={hostStyles.tutorCard}>
        <Image source={avatarUrl} style={hostStyles.tutorAvatar} tintColor="#FFF6E2" />
        <View style={hostStyles.tutorInfo}>
            <Text style={hostStyles.tutorName}>Tutor(a): {name}</Text>
            <Text style={hostStyles.tutorLocation}>{location}</Text>
        </View>
    </View>
);

const PetsInRequest = ({ pets }: { pets: typeof MOCK_REQUEST_BASE.pets }) => (
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

const RequestDetails = ({ dataEntrada, dataSaida, dias, totalValue }: typeof MOCK_REQUEST_BASE) => (
    
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

// Componente para o Botão de Status (Reaproveitado/Adaptado do Tutor)
const StatusButton = ({ status }: { status: ReservaStatus }) => {
    let backgroundColor = '#6C757D';
    let textColor = '#353535ff';

    switch (status) {
        case 'Pendente':
            backgroundColor = '#b8b8b8ff';
            break;
        case 'Confirmada':
            backgroundColor = '#85bb5cff'; // Verde
            break;
        case 'Negada':
            backgroundColor = '#cb6e52ff'; // Vermelho
            break;
        case 'Em Andamento':
            backgroundColor = '#496d92ff'; // Azul
            textColor = '#FFF6E2';
            break;
        case 'Concluida':
            backgroundColor = '#e09f26ff'; // Laranja
            break;
    }

    return (
        <View style={[hostStyles.statusButton, { backgroundColor }]}>
            <Text style={[hostStyles.statusButtonText, { color: textColor }]}>
                {status}
            </Text>
        </View>
    );
};

// NOVO Componente do Botão de Avaliar para o Host (para o Tutor!)
const AvaliarTutorButton = ({ requestId, navigation }: { requestId: string; navigation: RootStackScreenProps<'Reserva_Tutor'>['navigation']; }) => (
    <TouchableOpacity
        style={hostStyles.avaliarButton}
        onPress={() => {
            console.log(`Navegando para a tela de avaliação do Tutor da reserva ${requestId}`);
            // Simular navegação para a tela de avaliação do Tutor, se existir
            navigation.navigate('TutorAvaliacao', { reservaId: requestId }); 
        }}
    >
        <Image source={ICON_STAR} style={hostStyles.avaliarIcon} tintColor="#a57d17ff" />
        <Text style={hostStyles.avaliarButtonText}>Avaliar Tutor</Text>
    </TouchableOpacity>
);

// Componente para Ações do Host (Confirmar/Negar - SÓ para status Pendente)
const HostActionButtons = ({ onConfirm, onDeny }: { onConfirm: () => void; onDeny: () => void }) => (
    <View style={hostStyles.hostActionButtonsContainer}>
        <TouchableOpacity style={[hostStyles.hostActionButton, hostStyles.denyButton]} onPress={onDeny}>
            <Text style={hostStyles.hostActionButtonText}>Negar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[hostStyles.hostActionButton, hostStyles.confirmButton]} onPress={onConfirm}>
            <Text style={hostStyles.hostActionButtonText}>Aceitar</Text>
        </TouchableOpacity>
    </View>
);

// NOVO Card de Reserva com base no Status
const RequestCard = ({ 
    request, 
    onConfirm, 
    onDeny, 
    navigation 
}: { 
    request: typeof MOCK_REQUESTS_WITH_STATUS[0]; 
    onConfirm: () => void; 
    onDeny: () => void;
    navigation: ReturnType<typeof useNavigation>;
}) => {
    const isPendente = request.status === 'Pendente';
    const isConcluida = request.status === 'Concluida';

    return (
        <View style={hostStyles.cardContainer}>
            <TutorMiniCard 
                name={request.tutor.name} 
                location={request.tutor.location} 
                avatarUrl={request.tutor.avatarUrl} 
            />
            <RequestDetails {...request} />
            <PetsInRequest pets={request.pets} />
            
            <View style={hostStyles.statusAndActionsWrapper}>
                <StatusButton status={request.status} />

                {isPendente && (
                    <HostActionButtons onConfirm={onConfirm} onDeny={onDeny} />
                )}
                
                {isConcluida && (
                    <AvaliarTutorButton requestId={request.id} navigation={navigation} />
                )}
            </View>
        </View>
    );
};

// Componente do Filtro de Status (Copiado do Reserva_Tutor)
const StatusFilterOptions = ({ 
    selectedStatus, 
    onSelectStatus 
}: { 
    selectedStatus: FilterStatus; 
    onSelectStatus: (status: FilterStatus) => void; 
}) => {
    const options: FilterStatus[] = ['Todos', 'Pendente', 'Confirmada', 'Em Andamento', 'Concluida', 'Negada'];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={listStyles.filterScroll}>
            <View style={listStyles.filterContainer}>
                {options.map(status => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            listStyles.filterOptionButton,
                            selectedStatus === status && listStyles.filterOptionSelected,
                        ]}
                        onPress={() => onSelectStatus(status)}
                    >
                        <Text style={[
                            listStyles.filterOptionText,
                            selectedStatus === status && listStyles.filterOptionTextSelected,
                        ]}>
                            {status === 'Em Andamento' ? 'Andamento' : status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};


// --- TELA LISTA DE SOLICITAÇÕES (REVISADA) ---
export default function ListaSolicitacoes() {
    const navigation = useNavigation();
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<FilterStatus>('Todos');

    // Lógica de Filtro
    const filteredRequests = useMemo(() => {
        if (selectedStatusFilter === 'Todos') {
            return MOCK_REQUESTS_WITH_STATUS;
        }
        return MOCK_REQUESTS_WITH_STATUS.filter(request => request.status === selectedStatusFilter);
    }, [selectedStatusFilter]);

    const handleConfirmRequest = (requestId) => {
        console.log(`Solicitação ${requestId} CONFIRMADA (Ação Front-end)`);
        // Aqui você faria a chamada à API e atualizaria a lista
    };

    const handleDenyRequest = (requestId) => {
        console.log(`Solicitação ${requestId} NEGADA (Ação Front-end)`);
        // Aqui você faria a chamada à API e atualizaria a lista
    };

    return (
        <SafeAreaView style={listStyles.container}>

            <ScrollView
                contentContainerStyle={listStyles.scrollContentArea}
                showsVerticalScrollIndicator={false}>
                
                <View style={listStyles.innerContainer}>
                    <Text style={listStyles.mainTitle}>Minhas Reservas</Text>
                    <Text style={listStyles.sectionSubtitle}>Gerencie suas solicitações de Hospedagem</Text>

                    {/* FILTRO DE STATUS (Copiado do Tutor) */}
                    <StatusFilterOptions 
                        selectedStatus={selectedStatusFilter}
                        onSelectStatus={setSelectedStatusFilter}
                    />

                    {/* Lista de Reservas Filtrada */}
                    {filteredRequests.length > 0 ? (
                        filteredRequests.map((request) => (
                            <RequestCard 
                                key={request.id}
                                request={request}
                                onConfirm={() => handleConfirmRequest(request.id)}
                                onDeny={() => handleDenyRequest(request.id)}
                                navigation={navigation}
                            />
                        ))
                    ) : (
                        <Text style={listStyles.noRequestsText}>Nenhuma reserva encontrada com o status: "{selectedStatusFilter}". 😔</Text>
                    )}
                </View>
                
            </ScrollView>
        </SafeAreaView>
    );
}


// --- ESTILOS GERAIS DA LISTA (Adaptados para Host) ---
const listStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B3D18C',
    },
    scrollContentArea: {
        flexGrow: 1,
        paddingBottom: 40,
    }, 
    innerContainer: {
        marginHorizontal: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 49,
        paddingHorizontal: 20,
        paddingVertical: 30,
        marginTop: 40, 
        marginBottom: 20,
    },
    mainTitle: {
        fontSize: 24, 
        fontWeight: '700', 
        color: '#556A44', 
        textAlign: 'center',
        marginTop: 5, 
        marginBottom: 5, 
    },
    sectionSubtitle: { 
        fontSize: 15, 
        fontWeight: '500', 
        color: '#556A44',
        fontFamily: 'Inter',
        marginBottom: 20,
        textAlign: 'center',
    },
    noRequestsText: {
        fontSize: 16,
        color: '#556A44',
        textAlign: 'center',
        paddingVertical: 20,
        fontStyle: 'italic',
    },

    // --- ESTILOS DO FILTRO (Copiado do Tutor) ---
    filterScroll: {
        marginTop: 5,
        marginBottom: 25,
        marginHorizontal: -5,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 5,
        paddingRight: 20,
    },
    filterOptionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#E0EFD3', 
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#B3D18C',
        minWidth: 90,
        alignItems: 'center',
        marginRight: 8,
    },
    filterOptionSelected: {
        backgroundColor: '#7AB24E', 
        borderColor: '#556A44',
    },
    filterOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#556A44',
        minWidth: 'auto',
        textAlign: 'center',
    },
    filterOptionTextSelected: {
        color: '#FFF6E2', 
    },
});


// --- ESTILOS PARA OS CARDS DE SOLICITAÇÃO (Adaptados) ---
const hostStyles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#FFF6E2', 
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#7AB24E', 
        padding: 15,
        marginBottom: 20,
    },

    // Mini Card Tutor
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
    
    // Detalhes
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

    // Pets
    petsSelectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        marginTop: 0,
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

    // Status e Ações
    statusAndActionsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#B3D18C',
        paddingTop: 15,
    },
    
    // Botão de Status (Novo layout)
    statusButton: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 0,
        borderColor: '#556A44',
        width: '45%', // Ocupa uma parte
        elevation: 1,
    },
    statusButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },

    // Ações Pendentes
    hostActionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '50%', // Ocupa o restante
    },
    hostActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 15,
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
        width: 16,
        height: 16,
        marginRight: 5,
        tintColor: '#FFFFFF',
    },
    hostActionButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Botão de Avaliar (Host avalia Tutor - Status Concluida)
    avaliarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#f7cf3fff', 
        borderRadius: 17,
        borderWidth: 2,
        borderColor: '#ddab2dff',
        width: '50%', // Ocupa o restante
        elevation: 3,
    },
    avaliarIcon: {
        width: 18,
        height: 18,
        marginRight: 5,
    },
    avaliarButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#a57d17ff',
    },
});