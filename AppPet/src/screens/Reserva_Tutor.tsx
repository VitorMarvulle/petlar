import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import type { RootStackScreenProps } from '../navigation/types'; 

// --- ÍCONES (Reaproveitados ou Mockados) ---
const ICON_AVATAR = require('../../assets/icons/user.png'); 
const ICON_PET_NINA = { uri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=60&h=60&fit=crop' }; 
const ICON_PET_BOLINHO = { uri: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=60&h=60&fit=crop' }; 
const ICON_HOST_AVATAR = ICON_AVATAR; 

// --- MOCK DE DADOS REAPROVEITADOS ---
const PRICE_PER_DAY_BASE = 65.00; 

const mockPetsParaReserva = [
    { id: 'p1', name: "Nina", imageUrl: ICON_PET_NINA.uri },
    { id: 'p2', name: "Bolinho", imageUrl: ICON_PET_BOLINHO.uri },
];

// --- TIPAGENS PARA O STATUS ---
type ReservaStatus = 'Pendente' | 'Confirmada' | 'Negada' | 'Em Andamento' | 'Concluida';
type FilterStatus = ReservaStatus | 'Todos';

// --- MOCK DA LISTA DE RESERVAS ---
const mockReservas = [
    {
        id: 'r1',
        host: { name: 'Igor Gallo Seabra', location: 'Tupi', avatarUrl: ICON_HOST_AVATAR },
        dataEntrada: '25/11/2025',
        dataSaida: '28/11/2025', 
        dias: 3,
        pets: mockPetsParaReserva,
        status: 'Pendente' as ReservaStatus,
    },
    {
        id: 'r2',
        host: { name: 'Maria Silveira', location: 'Boqueirão', avatarUrl: ICON_HOST_AVATAR },
        dataEntrada: '01/10/2025',
        dataSaida: '02/10/2025', 
        dias: 1,
        pets: [{ id: 'p3', name: "Thor", imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=60&h=60&fit=crop' }],
        status: 'Concluida' as ReservaStatus,
    },
    {
        id: 'r3',
        host: { name: 'Pedro Alves', location: 'Guilhermina', avatarUrl: ICON_HOST_AVATAR },
        dataEntrada: '20/10/2025',
        dataSaida: '22/10/2025', 
        dias: 2,
        pets: mockPetsParaReserva,
        status: 'Confirmada' as ReservaStatus,
    },
    {
        id: 'r4',
        host: { name: 'João Carlos', location: 'Aviação', avatarUrl: ICON_HOST_AVATAR },
        dataEntrada: '10/12/2025',
        dataSaida: '11/12/2025', 
        dias: 1, 
        pets: mockPetsParaReserva,
        status: 'Negada' as ReservaStatus,
    },
    {
        id: 'r5',
        host: { name: 'Ana Souza', location: 'Caiçara', avatarUrl: ICON_HOST_AVATAR },
        dataEntrada: '05/11/2025',
        dataSaida: '07/11/2025', 
        dias: 2, 
        pets: mockPetsParaReserva,
        status: 'Em Andamento' as ReservaStatus,
    },
];

// --- COMPONENTES REUTILIZÁVEIS ---

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

// Componente para o Resumo de Preço (baseado na tela Reserva)
const PriceSummaryReserva = ({ daysCount, petsCount, pricePerDayBase }: { 
    daysCount: number; 
    petsCount: number; 
    pricePerDayBase: number; 
}) => {
    const dailyPricePerQuantity = petsCount * pricePerDayBase;
    const totalValue = daysCount * dailyPricePerQuantity;
    
    return (
        <View style={listaStyles.priceSummaryCard}>
            {/* ... (Resumo mantido igual) ... */}
            <View style={listaStyles.priceRow}>
                <Text style={listaStyles.priceLabel}>Valor Base (1 Pet) por Diária</Text>
                <Text style={listaStyles.priceValue}>{formatCurrency(pricePerDayBase)}</Text>
            </View>
            <View style={listaStyles.priceRow}>
                <Text style={listaStyles.priceLabel}>Quantidade de Pets</Text>
                <Text style={listaStyles.priceValue}>{petsCount}</Text>
            </View>
            <View style={listaStyles.priceRow}>
                <Text style={listaStyles.priceLabel}>Diárias Selecionadas</Text>
                <Text style={listaStyles.priceValue}>{daysCount} dia(s)</Text>
            </View>
            <View style={listaStyles.priceDivider} />
            <View style={[listaStyles.priceRow, listaStyles.priceRowTotal]}>
                <Text style={listaStyles.priceLabelTotal}>Total da Locação</Text>
                <Text style={listaStyles.priceValueTotal}>{formatCurrency(totalValue)}</Text>
            </View>
        </View>
    );
};

// Componente para o Botão de Status
const StatusButton = ({ status }: { status: ReservaStatus }) => {
    let backgroundColor = '#6C757D';
    let textColor = '#353535ff';

    switch (status) {
        case 'Pendente':
            backgroundColor = '#f3d111ff'; 
            break;
        case 'Confirmada':
            backgroundColor = '#7AB24E'; 
            break;
        case 'Negada':
            backgroundColor = '#d85e38ff'; 
            break;
        case 'Em Andamento':
            backgroundColor = '#007BFF'; 
            break;
        case 'Concluida':
            backgroundColor = '#e49030ff'; 
            break;
    }

    return (
        <View style={[listaStyles.statusButton, { backgroundColor }]}>
            <Text style={[listaStyles.statusButtonText, { color: textColor }]}>
                {status}
            </Text>
        </View>
    );
};

// Componente do Botão de Avaliar
const AvaliarButton = ({ navigation, reservaId }: { 
    navigation: RootStackScreenProps<'Reserva_Tutor'>['navigation']; 
    reservaId: string;
}) => (
    <TouchableOpacity
        style={listaStyles.avaliarButton}
        onPress={() => {
            console.log(`Navegando para a tela de avaliação da reserva ${reservaId}`);
            navigation.navigate('HostAvaliacao', { reservaId });
        }}
    >
        <Text style={listaStyles.avaliarButtonText}>Avaliar Host</Text>
    </TouchableOpacity>
);

// Componente Principal do Card de Reserva
const ReservaCard = ({ reserva, navigation }: { 
    reserva: typeof mockReservas[0]; 
    navigation: RootStackScreenProps<'Reserva_Tutor'>['navigation'];
}) => {
    const isConcluida = reserva.status === 'Concluida';

    return (
        <View style={listaStyles.cardContainer}>
            {/* 1. Datas de Entrada e Saída (Topo) */}
            <View style={listaStyles.dateHeader}>
                <Text style={listaStyles.dateText}>{reserva.dataEntrada}</Text>
                <Text style={listaStyles.dateDivider}>{' - '}</Text>
                <Text style={listaStyles.dateText}>{reserva.dataSaida}</Text>
            </View>

            {/* 2. Mini Card do Host (Clicável) */}
            <TouchableOpacity 
                style={listaStyles.hostCard} 
                onPress={() => console.log(`Navegando para o perfil de ${reserva.host.name}`)}
            >
                <Image source={reserva.host.avatarUrl} style={listaStyles.hostAvatar} />
                <View style={listaStyles.hostInfo}>
                    <Text style={listaStyles.hostName}>{reserva.host.name}</Text>
                    <Text style={listaStyles.hostLocation}>{reserva.host.location}</Text>
                </View>
            </TouchableOpacity>

            {/* 3. Pets Selecionados */}
            <View style={listaStyles.petsSelectedContainer}>
                <Text style={listaStyles.petsLabel}>Pets:</Text>
                {reserva.pets.map((pet) => (
                    <View key={pet.id} style={listaStyles.petAvatarWrapper}>
                        <Image source={{ uri: pet.imageUrl }} style={listaStyles.smallPetAvatar} />
                    </View>
                ))}
                {reserva.pets.length === 0 && (
                    <Text style={listaStyles.petsLabel}>Nenhum pet selecionado.</Text>
                )}
            </View>

            {/* 4. Resumo da Reserva (Calculado) */}
            <PriceSummaryReserva 
                daysCount={reserva.dias}
                petsCount={reserva.pets.length}
                pricePerDayBase={PRICE_PER_DAY_BASE} 
            />
            
            {/* 5. Botão de Status e Botão de Avaliar */}
            <View style={listaStyles.statusActionsContainer}>
                <StatusButton status={reserva.status} />
                {isConcluida && (
                    <AvaliarButton navigation={navigation} reservaId={reserva.id} />
                )}
            </View>

        </View>
    );
};

// Componente do Filtro de Status
const StatusFilterOptions = ({ 
    selectedStatus, 
    onSelectStatus 
}: { 
    selectedStatus: FilterStatus; 
    onSelectStatus: (status: FilterStatus) => void; 
}) => {
    const options: FilterStatus[] = ['Todos', 'Pendente', 'Confirmada', 'Em Andamento', 'Concluida', 'Negada'];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={listaStyles.filterScroll}>
            <View style={listaStyles.filterContainer}>
                {options.map(status => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            listaStyles.filterOptionButton,
                            selectedStatus === status && listaStyles.filterOptionSelected,
                        ]}
                        onPress={() => onSelectStatus(status)}
                    >
                        <Text style={[
                            listaStyles.filterOptionText,
                            selectedStatus === status && listaStyles.filterOptionTextSelected,
                        ]}>
                            {status === 'Em Andamento' ? 'Andamento' : status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};



// -------------------------------------------------------------------
// ------------------------- TELA PRINCIPAL --------------------------
// -------------------------------------------------------------------


export default function Reserva_Lista({ navigation }: RootStackScreenProps<'Reserva_Tutor'>) {
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<FilterStatus>('Todos');

    // Lógica de Filtro
    const filteredReservas = useMemo(() => {
        if (selectedStatusFilter === 'Todos') {
            return mockReservas;
        }
        return mockReservas.filter(reserva => reserva.status === selectedStatusFilter);
    }, [selectedStatusFilter]);

    // --- COMPONENTE DE ÍCONE DO CANTO (Reaproveitado da tela Reserva) ---
    const CornerIconClickable = () => (
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={listaStyles.cornerImageContainer}>
          <Image
            source={require('../../assets/icons/LogoBranco.png')} 
            style={listaStyles.cornerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={listaStyles.container}>
            <ScrollView contentContainerStyle={listaStyles.scrollContainer} showsVerticalScrollIndicator={false}>
                <CornerIconClickable/> 
                <Text style={listaStyles.LogoText}>Lar Doce Pet</Text>
                <View style={listaStyles.innerContainer}>

                    <Text style={listaStyles.mainTitle}>Minhas Reservas</Text>

                    {/* NOVO - FILTRO DE STATUS */}
                    <StatusFilterOptions 
                        selectedStatus={selectedStatusFilter}
                        onSelectStatus={setSelectedStatusFilter}
                    />

                    {/* Lista de Reservas Filtrada */}
                    {filteredReservas.map((reserva) => (
                        <ReservaCard 
                            key={reserva.id}
                            reserva={reserva}
                            navigation={navigation}
                        />
                    ))}

                    {filteredReservas.length === 0 && (
                        <Text style={listaStyles.noReservasText}>
                            Nenhuma reserva encontrada com o status: "{selectedStatusFilter}".
                        </Text>
                    )}

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// -------------------------------------------------------------------
// ----------------------------- STYLES ------------------------------
// -------------------------------------------------------------------

const listaStyles = StyleSheet.create({
    // --- Estrutura Geral ---
    container: {
        flex: 1,
        backgroundColor: '#B3D18C',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 45,
    },
    innerContainer: {
        flex: 1,
        marginHorizontal: 12,
        marginTop: 70,         
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        paddingHorizontal: 15, 
        paddingVertical: 10,
    },
    mainTitle: { 
        fontSize: 24, 
        fontWeight: '700', 
        color: '#556A44', 
        marginBottom: 10, // Diminuído para dar espaço ao filtro
        textAlign: 'center',
        marginTop: 40, 
    },
    
    // --- LOGO DO PET (Reaproveitado) ---
    cornerImageContainer: {
        position: 'absolute',
        top: 29, 
        right: 220, 
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
      top: 60,
      left: 165,
      fontSize: 20,
      fontWeight: 700,
      color: '#ffffff',
    },

    // --- FILTRO DE STATUS ---
    filterScroll: {
      marginTop: 10,
      marginBottom: 25,
      marginHorizontal: -5, // Para compensar o padding do innerContainer
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 5,
        paddingRight: 20,
    },
    filterOptionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#E0EFD3', // Cor suave
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#B3D18C',
        minWidth: 90,
        alignItems: 'center',
        marginRight: 8,
    },
    filterOptionSelected: {
        backgroundColor: '#7AB24E', // Verde forte
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
        color: '#FFF6E2', // Texto branco/claro
    },

    // --- Estilos do Card de Reserva ---
    cardContainer: {
        backgroundColor: '#FFF6E2', 
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#B3D18C', 
        padding: 15,
        marginBottom: 20,
    },

    // --- 1. Datas ---
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
        fontSize: 18,
        fontWeight: '700',
        color: '#556A44',
    },
    dateDivider: {
        fontSize: 18,
        fontWeight: '700',
        color: '#B3D18C',
    },

    // --- 2. Mini Card do Host (Clicável) ---
    hostCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#E0EFD3', 
        borderRadius: 10,
        marginBottom: 10,
    },
    hostAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#7AB24E',
        marginRight: 10,
        tintColor: '#FFF6E2',
    },
    hostInfo: {
        flex: 1,
    },
    hostName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#556A44',
    },
    hostLocation: {
        fontSize: 13,
        color: '#556A44',
    },

    // --- 3. Pets Selecionados (Horizontal) ---
    petsSelectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
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
        width: 40, 
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#7AB24E',
        backgroundColor: '#FFF6E2',
    },

    // --- 4. Resumo da Reserva (Reaproveitado) ---
    priceSummaryCard: {
        backgroundColor: '#fcfcfcff', 
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#B3D18C',
        padding: 10,
        marginBottom: 15,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    priceLabel: {
        fontSize: 14,
        color: '#556A44',
        fontWeight: '500',
    },
    priceValue: {
        fontSize: 14,
        color: '#556A44',
        fontWeight: '700',
    },
    priceDivider: {
        height: 1.3,
        backgroundColor: '#7AB24E',
        marginVertical: 6,
    },
    priceRowTotal: {
        marginTop: 5,
    },
    priceLabelTotal: {
        fontSize: 16,
        color: '#4d654bff',
        fontWeight: '800',
    },
    priceValueTotal: {
        fontSize: 16,
        color: '#4d654bff',
        fontWeight: '800',
    },

    // --- 5. Status e Ações (NOVO CONTAINER) ---
    statusActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    // Botão de Status (Ajustado)
    statusButton: {
        paddingVertical: 10,
        borderRadius: 17,
        alignItems: 'center',
        borderWidth: 3,
        width: 150, 
        left: 145,
        marginTop: -13,
        borderColor: '#353535ff',
        
    },
    statusButtonText: {
        fontSize: 15,
        fontWeight: '700',
    },
    // Botão de Avaliar (NOVO)
    avaliarButton: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#f7cf3fff', // Um verde sólido para ação
        borderRadius: 17,
        borderWidth: 3,
        width: 135,
        left: - 160,
        marginTop: -13,
        borderColor: '#ddab2dff',
        alignItems: 'center',
        // Ocupa o espaço restante na linha
    },
    avaliarButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#a57d17ff',
    },

    // --- Mensagem de Sem Reservas ---
    noReservasText: {
        fontSize: 18,
        color: '#556A44',
        textAlign: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
        fontStyle: 'italic',
    }
});