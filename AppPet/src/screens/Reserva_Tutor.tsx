// petlar\AppPet\src\screens\Reserva_Tutor.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { 
    View, Text, StyleSheet, SafeAreaView, ScrollView, 
    TouchableOpacity, Image, ActivityIndicator, Alert 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
    // Calcula o valor base por pet/dia (reverso)
    const pricePerPetPerDay = (daysCount > 0 && petsCount > 0) 
        ? (priceTotal / daysCount / petsCount)
        : 0;
  
    return (
        <View style={styles.priceSummaryCard}>
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Valor Base (1 Pet/Dia)</Text>
                <Text style={styles.priceValue}>{formatCurrency(pricePerPetPerDay)}</Text>
            </View>
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Quantidade de Pets</Text>
                <Text style={styles.priceValue}>{petsCount}</Text>
            </View>
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Diárias</Text>
                <Text style={styles.priceValue}>{daysCount} dia{daysCount !== 1 ? 's' : ''}</Text>
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
            // Navega para a tela de avaliação
            navigation.navigate('HostAvaliacao', { reservaId: String(reservaId) }); 
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
    const podeAvaliar = isConcluida && !reserva.ja_avaliado_host;

    return (
        <View style={styles.cardContainer}>
            {/* 1. Datas de Entrada e Saída - CORRIGIDO */}
            <View style={styles.dateHeader}>
                <View style={styles.dateBlock}>
                    <Text style={styles.dateLabel}>Check-in</Text>
                    <Text style={styles.dateText}>{formatDate(reserva.data_inicio)}</Text>
                </View>
                
                <View style={styles.dateDividerContainer}>
                    <View style={styles.dateLine} />
                    <Text style={styles.daysCount}>{reserva.dias} dia{reserva.dias !== 1 ? 's' : ''}</Text>
                    <View style={styles.dateLine} />
                </View>
                
                <View style={styles.dateBlock}>
                    <Text style={styles.dateLabel}>Check-out</Text>
                    <Text style={styles.dateText}>{formatDate(reserva.data_fim)}</Text>
                </View>
            </View>

            {/* 2. Mini Card do Host */}
            <TouchableOpacity 
                style={styles.hostCard} 
                onPress={() => {
                     console.log('Ver perfil do host:', reserva.anfitriao.nome);
                }}
            >
                <Image 
                    source={
                        reserva.anfitriao.foto_perfil_url 
                            ? { uri: reserva.anfitriao.foto_perfil_url }
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
                            <Text style={styles.petName}>{pet.nome}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ fontStyle: 'italic', color: '#556A44' }}>Pet não identificado</Text>
                )}
            </View>

            {/* 4. Resumo da Reserva */}
            <PriceSummaryReserva 
                daysCount={reserva.dias} 
                petsCount={reserva.pets.length} 
                priceTotal={reserva.valor_total_reserva} 
            />
          
            {/* Botão de Status e Botão de Avaliar */}
            <View style={styles.statusActionsContainer}>
                <StatusButton status={reserva.status} />
                {podeAvaliar && (
                    <AvaliarButton navigation={navigation} reservaId={reserva.id_reserva} />
                )}
            </View>

            {/* Indicador de "Já avaliado" (opcional) */}
            {isConcluida && reserva.ja_avaliado_host && (
                <View style={styles.avaliadoIndicator}>
                    <Text style={styles.avaliadoText}>✓ Hospedagem avaliada</Text>
                </View>
            )}
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

    const usuario = route.params?.usuario;
    const id_tutor = usuario?.id_usuario;

    const fetchReservas = async () => {
        if (!id_tutor) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const reservasData = await ReservaService.getReservasByTutor(id_tutor);
            
            // Ordena por data (mais recente primeiro)
            const reservasOrdenadas = reservasData.sort((a, b) => 
                new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()
            );

            setReservas(reservasOrdenadas);

        } catch (err: any) {
            console.error('[Reserva_Tutor] Erro:', err);
            setError(err.message || 'Erro ao carregar reservas.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchReservas();
        }, [id_tutor])
    );

    const filteredReservas = useMemo(() => {
        if (selectedStatusFilter === 'todos') {
            return reservas;
        }
        return reservas.filter(reserva => reserva.status === selectedStatusFilter);
    }, [reservas, selectedStatusFilter]);

    const CornerIconClickable = () => (
        <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.cornerImageContainer}
        >
            <Image
                source={require('../../assets/icons/LogoBranco.png')} 
                style={styles.cornerImage}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );

    if (loading && reservas.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#556A44" />
                    <Text style={styles.loadingText}>Buscando suas reservas...</Text>
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

                    <StatusFilterOptions 
                        selectedStatus={selectedStatusFilter}
                        onSelectStatus={setSelectedStatusFilter}
                    />

                    {filteredReservas.map((reserva) => (
                        <ReservaCard 
                            key={reserva.id_reserva}
                            reserva={reserva}
                            navigation={navigation}
                        />
                    ))}

                    {filteredReservas.length === 0 && !error && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.noReservasText}>
                                {selectedStatusFilter === 'todos' 
                                    ? 'Você ainda não possui reservas.' 
                                    : `Nenhuma reserva "${STATUS_DISPLAY_MAP[selectedStatusFilter as ReservaStatus]}".`
                                }
                            </Text>
                        </View>
                    )}

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
        minHeight: 500,
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
        position: 'absolute',
        zIndex: 5,
    },
    filterScroll: {
        marginTop: 10,
        marginBottom: 25,
        marginHorizontal: -5,
        height: 50,
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
        height: 38,
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
    // --- ESTILOS DE DATA CORRIGIDOS ---
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#B3D18C',
    },
    dateBlock: {
        alignItems: 'center',
        flex: 1,
    },
    dateLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#7AB24E',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#556A44',
    },
    dateDividerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    dateLine: {
        width: 40,
        height: 1,
        backgroundColor: '#B3D18C',
    },
    daysCount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7AB24E',
        marginVertical: 4,
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
        flexWrap: 'wrap',
    },
    petsLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#556A44',
        marginRight: 10,
    },
    petAvatarWrapper: {
        marginRight: 12,
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
    petName: {
        fontSize: 10,
        fontWeight: '600',
        color: '#556A44',
        marginTop: 2,
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
    avaliadoIndicator: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#d4edda',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#7AB24E',
        alignItems: 'center',
    },
    avaliadoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#556A44',
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