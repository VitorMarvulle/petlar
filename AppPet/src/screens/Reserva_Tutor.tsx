//AppPet\src\screens\Reserva_Tutor.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import type { RootStackScreenProps } from '../navigation/types'; 
import { 
    ReservaCompleta, 
    ReservaStatus, 
    FilterStatus, 
    STATUS_DISPLAY_MAP,
    formatCurrency,
    formatDate,
    getStatusColor
} from '../navigation/reservaTypes';
import { ReservaService } from '../services/reservaService';

// --- ÍCONES ---
const ICON_AVATAR = require('../../assets/icons/user.png'); 
const ICON_HOST_AVATAR = ICON_AVATAR; 

// --- COMPONENTES REUTILIZÁVEIS ---

const PriceSummaryReserva = ({ daysCount, petsCount, priceTotal }: { 
    daysCount: number; 
    petsCount: number; 
    priceTotal: number; 
}) => {
    const pricePerDay = petsCount > 0 ? priceTotal / daysCount : 0;
  
    return (
        <View style={styles.priceSummaryCard}>
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Valor por Diária</Text>
                <Text style={styles.priceValue}>{formatCurrency(pricePerDay)}</Text>
            </View>
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Quantidade de Pets</Text>
                <Text style={styles.priceValue}>{petsCount}</Text>
            </View>
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Diárias Selecionadas</Text>
                <Text style={styles.priceValue}>{daysCount} dia(s)</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={[styles.priceRow, styles.priceRowTotal]}>
                <Text style={styles.priceLabelTotal}>Total da Locação</Text>
                <Text style={styles.priceValueTotal}>{formatCurrency(priceTotal)}</Text>
            </View>
        </View>
    );
};

const StatusButton = ({ status }: { status: ReservaStatus }) => {
    const { backgroundColor, textColor } = getStatusColor(status);

    return (
        <View style={[styles.statusButton, { backgroundColor }]}>
            <Text style={[styles.statusButtonText, { color: textColor }]}>
                {STATUS_DISPLAY_MAP[status]}
            </Text>
        </View>
    );
};

const AvaliarButton = ({ navigation, reservaId }: { 
    navigation: RootStackScreenProps<'Reserva_Tutor'>['navigation']; 
    reservaId: number;
}) => (
    <TouchableOpacity
        style={styles.avaliarButton}
        onPress={() => {
            console.log(`Navegando para a tela de avaliação da reserva ${reservaId}`);
            navigation.navigate('HostAvaliacao', { reservaId: reservaId.toString() });
        }}
    >
        <Text style={styles.avaliarButtonText}>Avaliar Host</Text>
    </TouchableOpacity>
);

const ReservaCard = ({ reserva, navigation }: { 
    reserva: ReservaCompleta; 
    navigation: RootStackScreenProps<'Reserva_Tutor'>['navigation'];
}) => {
    const isConcluida = reserva.status === 'concluida';

    return (
        <View style={styles.cardContainer}>
            {/* 1. Datas de Entrada e Saída */}
            <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{formatDate(reserva.data_inicio)}</Text>
                <Text style={styles.dateDivider}>{' - '}</Text>
                <Text style={styles.dateText}>{formatDate(reserva.data_fim)}</Text>
            </View>

            {/* 2. Mini Card do Host */}
            <TouchableOpacity 
                style={styles.hostCard} 
                onPress={() => console.log(`Navegando para o perfil de ${reserva.anfitriao.nome}`)}
            >
                <Image 
                    source={
                        reserva.anfitriao.foto_perfil 
                            ? { uri: reserva.anfitriao.foto_perfil }
                            : ICON_HOST_AVATAR
                    } 
                    style={styles.hostAvatar} 
                />
                <View style={styles.hostInfo}>
                    <Text style={styles.hostName}>{reserva.anfitriao.nome}</Text>
                    <Text style={styles.hostLocation}>{reserva.anfitriao.localizacao}</Text>
                </View>
            </TouchableOpacity>

            {/* 3. Pets Selecionados */}
            <View style={styles.petsSelectedContainer}>
                <Text style={styles.petsLabel}>Pets:</Text>
                {reserva.pets.length > 0 ? (
                    reserva.pets.map((pet) => (
                        <View key={pet.id_pet} style={styles.petAvatarWrapper}>
                            <Image 
                                source={
                                    pet.fotos_urls && pet.fotos_urls.length > 0 
                                        ? { uri: pet.fotos_urls[0] } 
                                        : ICON_AVATAR
                                } 
                                style={styles.smallPetAvatar} 
                            />
                        </View>
                    ))
                ) : (
                    <Text style={styles.petsLabel}>Nenhum pet</Text>
                )}
            </View>

            {/* 4. Resumo da Reserva */}
            <PriceSummaryReserva 
                daysCount={reserva.qtd_dias}
                petsCount={reserva.pets.length}
                priceTotal={reserva.preco_total}
            />
          
            {/* 5. Botão de Status e Botão de Avaliar */}
            <View style={styles.statusActionsContainer}>
                <StatusButton status={reserva.status} />
                {isConcluida && (
                    <AvaliarButton navigation={navigation} reservaId={reserva.id_reserva} />
                )}
            </View>
        </View>
    );
};

const StatusFilterOptions = ({ 
    selectedStatus, 
    onSelectStatus 
}: { 
    selectedStatus: FilterStatus; 
    onSelectStatus: (status: FilterStatus) => void; 
}) => {
    const options: { value: FilterStatus; label: string }[] = [
        { value: 'todos', label: 'Todos' },
        { value: 'pendente', label: 'Pendente' },
        { value: 'confirmada', label: 'Confirmada' },
        { value: 'em_andamento', label: 'Andamento' },
        { value: 'concluida', label: 'Concluída' },
        { value: 'negada', label: 'Negada' },
        { value: 'cancelada', label: 'Cancelada' },
    ];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterContainer}>
                {options.map(option => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.filterOptionButton,
                            selectedStatus === option.value && styles.filterOptionSelected,
                        ]}
                        onPress={() => onSelectStatus(option.value)}
                    >
                        <Text style={[
                            styles.filterOptionText,
                            selectedStatus === option.value && styles.filterOptionTextSelected,
                        ]}>
                            {option.label}
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

export default function Reserva_Tutor({ navigation, route }: RootStackScreenProps<'Reserva_Tutor'>) {
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<FilterStatus>('todos');
    const [reservas, setReservas] = useState<ReservaCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pega o id_usuario da navegação (vindo da Home)
    const usuario = route.params?.usuario;
    const id_tutor = usuario?.id_usuario;

    // Buscar reservas do tutor
    useEffect(() => {
        if (!id_tutor) {
            setError('ID do tutor não encontrado. Por favor, faça login novamente.');
            setLoading(false);
            return;
        }

        fetchReservas();
    }, [id_tutor]);

    const fetchReservas = async () => {
        if (!id_tutor) return;

        try {
            setLoading(true);
            setError(null);

            console.log(`[Reserva_Tutor] Buscando reservas do tutor ${id_tutor}...`);
            
            const reservasData = await ReservaService.getReservasByTutor(id_tutor);
            
            console.log(`[Reserva_Tutor] ${reservasData.length} reservas carregadas`);
            setReservas(reservasData);

        } catch (err: any) {
            console.error('[Reserva_Tutor] Erro ao buscar reservas:', err);
            const errorMessage = err.message || 'Erro ao carregar reservas';
            setError(errorMessage);
            
            Alert.alert(
                'Erro ao Carregar Reservas', 
                errorMessage + '\n\nVerifique se o backend está rodando e se o IP está correto.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    // Lógica de Filtro
    const filteredReservas = useMemo(() => {
        if (selectedStatusFilter === 'todos') {
            return reservas;
        }
        return reservas.filter(reserva => reserva.status === selectedStatusFilter);
    }, [reservas, selectedStatusFilter]);

    const CornerIconClickable = () => (
        <TouchableOpacity 
            onPress={() => {
                if (usuario) {
                    navigation.navigate('Home', { usuario });
                } else {
                    navigation.navigate('Login');
                }
            }} 
            style={styles.cornerImageContainer}
        >
            <Image
                source={require('../../assets/icons/LogoBranco.png')} 
                style={styles.cornerImage}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );

    // Renderização condicional - Loading
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#556A44" />
                    <Text style={styles.loadingText}>Carregando reservas...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <CornerIconClickable/> 
                <Text style={styles.LogoText}>Lar Doce Pet</Text>
                <View style={styles.innerContainer}>

                    <Text style={styles.mainTitle}>Minhas Reservas</Text>

                    {/* Filtro de Status */}
                    <StatusFilterOptions 
                        selectedStatus={selectedStatusFilter}
                        onSelectStatus={setSelectedStatusFilter}
                    />

                    {/* Lista de Reservas Filtrada */}
                    {filteredReservas.map((reserva) => (
                        <ReservaCard 
                            key={reserva.id_reserva}
                            reserva={reserva}
                            navigation={navigation}
                        />
                    ))}

                    {/* Mensagem quando não há reservas */}
                    {filteredReservas.length === 0 && !error && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.noReservasText}>
                                {selectedStatusFilter === 'todos' 
                                    ? 'Você ainda não possui reservas.' 
                                    : `Nenhuma reserva com o status: "${STATUS_DISPLAY_MAP[selectedStatusFilter as ReservaStatus]}".`
                                }
                            </Text>
                        </View>
                    )}

                    {/* Mensagem de erro com botão de retry */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity 
                                style={styles.retryButton}
                                onPress={fetchReservas}
                            >
                                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// -------------------------------------------------------------------
// ----------------------------- STYLES ------------------------------
// -------------------------------------------------------------------

const styles = StyleSheet.create({
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
        marginBottom: 10,
        textAlign: 'center',
        marginTop: 40, 
    },
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
        fontWeight: '700',
        color: '#ffffff',
    },
    filterScroll: {
        marginTop: 10,
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
        textAlign: 'center',
    },
    filterOptionTextSelected: {
        color: '#FFF6E2',
    },
    cardContainer: {
        backgroundColor: '#FFF6E2', 
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#B3D18C', 
        padding: 15,
        marginBottom: 20,
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
        fontSize: 18,
        fontWeight: '700',
        color: '#556A44',
    },
    dateDivider: {
        fontSize: 18,
        fontWeight: '700',
        color: '#B3D18C',
    },
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
    statusActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
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
    avaliarButton: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#f7cf3fff',
        borderRadius: 17,
        borderWidth: 3,
        width: 135,
        left: -160,
        marginTop: -13,
        borderColor: '#ddab2dff',
        alignItems: 'center',
    },
    avaliarButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#a57d17ff',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
    noReservasText: {
        fontSize: 18,
        color: '#556A44',
        textAlign: 'center',
        fontStyle: 'italic',
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
    },
    errorContainer: {
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#d85e38ff',
        textAlign: 'center',
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: '#7AB24E',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    retryButtonText: {
        color: '#FFF6E2',
        fontSize: 16,
        fontWeight: '700',
    },
});