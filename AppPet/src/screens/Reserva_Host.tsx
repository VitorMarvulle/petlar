// AppPet\src\screens\Reserva_Host.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
    View, Text, StyleSheet, SafeAreaView, ScrollView, 
    TouchableOpacity, Image, ActivityIndicator, Alert 
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import axios from 'axios';

// Imports dos seus tipos e services
import { ReservaService } from '../services/reservaService';
import { 
    ReservaCompleta, 
    ReservaStatus,
    STATUS_DISPLAY_MAP, 
    formatCurrency, 
    formatDate, 
    getStatusColor 
} from '../navigation/reservaTypes';

// Ajuste o IP conforme necessário
const API_BASE_URL = 'http://localhost:8000'; 

// Ícones
const ICON_AVATAR = require('../../assets/icons/user.png');
const ICON_STAR = require('../../assets/icons/star.png');
const ICON_LOGO = require('../../assets/icons/LogoBranco.png');

// --- 1. COMPONENTES VISUAIS AUXILIARES ---

const TutorMiniCard = ({ tutor }: { tutor: NonNullable<ReservaCompleta['tutor']> }) => (
    <View style={hostStyles.tutorCard}>
        <Image 
            source={tutor.foto_perfil_url ? { uri: tutor.foto_perfil_url } : ICON_AVATAR} 
            style={hostStyles.tutorAvatar} 
        />
        <View style={hostStyles.tutorInfo}>
            <Text style={hostStyles.tutorName}>{tutor.nome}</Text>
            <Text style={hostStyles.tutorLocation}>{tutor.localizacao}</Text>
        </View>
    </View>
);

const RequestDetails = ({ dataInicio, dataFim, dias, totalValue }: { dataInicio: string, dataFim: string, dias: number, totalValue: number }) => {
    // Segurança: garante que é número antes de formatar
    const safeTotal = Number(totalValue) || 0;
    
    return (
        <View style={hostStyles.detailsContainer}>
            <View style={hostStyles.dateHeader}>
                <Text style={hostStyles.dateText}>{formatDate(dataInicio)}</Text>
                <Text style={hostStyles.dateDivider}>{' - '}</Text>
                <Text style={hostStyles.dateText}>{formatDate(dataFim)}</Text>
            </View>
            <Text style={hostStyles.detailRow}>
                <Text style={hostStyles.boldDetail}>Duração:</Text> {dias} dia(s)
            </Text>
            <Text style={hostStyles.detailRow}>
                <Text style={hostStyles.boldDetail}>Total:</Text> <Text style={hostStyles.totalValue}>{formatCurrency(safeTotal)}</Text>
            </Text>
        </View>
    );
};

const StatusButton = ({ status }: { status: ReservaStatus }) => {
    const { backgroundColor, textColor } = getStatusColor(status);
    return (
        <View style={[hostStyles.statusButton, { backgroundColor }]}>
            <Text style={[hostStyles.statusButtonText, { color: textColor }]}>
                {STATUS_DISPLAY_MAP[status]}
            </Text>
        </View>
    );
};

const HostActionButtons = ({ onConfirm, onDeny, loading }: { onConfirm: () => void; onDeny: () => void, loading: boolean }) => (
    <View style={hostStyles.hostActionButtonsContainer}>
        {loading ? (
             <ActivityIndicator color="#556A44" />
        ) : (
            <>
                <TouchableOpacity style={[hostStyles.hostActionButton, hostStyles.denyButton]} onPress={onDeny}>
                    <Text style={hostStyles.hostActionButtonText}>Negar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[hostStyles.hostActionButton, hostStyles.confirmButton]} onPress={onConfirm}>
                    <Text style={hostStyles.hostActionButtonText}>Aceitar</Text>
                </TouchableOpacity>
            </>
        )}
    </View>
);

// --- 2. COMPONENTE REQUEST CARD (O QUE ESTAVA FALTANDO) ---
const RequestCard = ({ 
    reserva, 
    onAction, 
    navigation 
}: { 
    reserva: ReservaCompleta; 
    onAction: (id: number, status: 'confirmada' | 'negada') => void;
    navigation: any;
}) => {
    const [actionLoading, setActionLoading] = useState(false);
    
    const isPendente = reserva.status === 'pendente';
    const isConcluida = reserva.status === 'concluida';
    
    // Fallback caso tutor venha undefined (segurança)
    const tutor = reserva.tutor || { nome: 'Usuário', localizacao: 'Local não informado', id_usuario: 0, foto_perfil_url: undefined };

    const handleAction = async (status: 'confirmada' | 'negada') => {
        setActionLoading(true);
        await onAction(reserva.id_reserva, status);
        setActionLoading(false);
    };

    return (
        <View style={hostStyles.cardContainer}>
            <TutorMiniCard tutor={tutor} />
            
            <RequestDetails 
                dataInicio={reserva.data_inicio} 
                dataFim={reserva.data_fim} 
                dias={reserva.dias} 
                totalValue={reserva.valor_total_reserva} 
            />
            
            <View style={hostStyles.petsSelectedContainer}>
                <Text style={hostStyles.petsLabel}>Pets:</Text>
                {reserva.pets.map((pet, index) => (
                    <View key={index} style={hostStyles.petAvatarWrapper}>
                        <Image 
                            source={pet.fotos_urls?.[0] ? { uri: pet.fotos_urls[0] } : ICON_AVATAR} 
                            style={hostStyles.smallPetAvatar} 
                        />
                        <Text style={hostStyles.petNameSmall}>{pet.nome}</Text>
                    </View>
                ))}
            </View>
            
            <View style={hostStyles.statusAndActionsWrapper}>
                <StatusButton status={reserva.status} />

                {isPendente && (
                    <HostActionButtons 
                        loading={actionLoading}
                        onConfirm={() => handleAction('confirmada')} 
                        onDeny={() => handleAction('negada')} 
                    />
                )}
                
                {isConcluida && !reserva.ja_avaliado_tutor && (
                    <TouchableOpacity 
                        style={hostStyles.avaliarButton}
                        onPress={() => navigation.navigate('TutorAvaliacao', { reservaId: String(reserva.id_reserva) })}
                    >
                        <Image source={ICON_STAR} style={hostStyles.avaliarIcon} />
                        <Text style={hostStyles.avaliarButtonText}>Avaliar Tutor</Text>
                    </TouchableOpacity>
                )}
                {isConcluida && reserva.ja_avaliado_tutor && (
                     <Text style={{color:'#7AB24E', fontWeight:'bold', fontSize: 12}}>✓ Tutor avaliado</Text>
                )}
            </View>
        </View>
    );
};

// Filtro Horizontal
const StatusFilterOptions = ({ selectedStatus, onSelectStatus }: { selectedStatus: string, onSelectStatus: (s: string) => void }) => {
    const options = [
        { value: 'todos', label: 'Todos' },
        { value: 'pendente', label: 'Pendente' },
        { value: 'confirmada', label: 'Confirmada' },
        { value: 'em_andamento', label: 'Andamento' },
        { value: 'concluida', label: 'Concluída' },
        { value: 'negada', label: 'Negada' },
    ];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={hostStyles.filterScroll}>
            <View style={hostStyles.filterContainer}>
                {options.map(opt => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[hostStyles.filterOptionButton, selectedStatus === opt.value && hostStyles.filterOptionSelected]}
                        onPress={() => onSelectStatus(opt.value)}
                    >
                        <Text style={[hostStyles.filterOptionText, selectedStatus === opt.value && hostStyles.filterOptionTextSelected]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

// --- 3. TELA PRINCIPAL (Reserva_Host) ---
export default function Reserva_Host() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    
    // Pega usuario da navegação
    const usuarioLogado = route.params?.usuario;

    const [reservas, setReservas] = useState<ReservaCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('todos');
    const [idAnfitriao, setIdAnfitriao] = useState<number | null>(null);

    // 1. Efeito para buscar o ID do Anfitrião
    useEffect(() => {
        let isMounted = true;

        const getIdAnfitriao = async () => {
            if (!usuarioLogado || !usuarioLogado.id_usuario) {
                console.warn("Usuário não identificado na tela de reservas.");
                if (isMounted) setLoading(false);
                return;
            }

            try {
                // Busca TODOS anfitriões (backend Python não filtra na rota base)
                const response = await axios.get(`${API_BASE_URL}/anfitrioes`);
                
                // Encontra o anfitrião vinculado ao ID do usuário logado
                const meuAnfitriao = response.data.find((a: any) => 
                    a.usuarios && a.usuarios.id_usuario === usuarioLogado.id_usuario
                );

                if (isMounted) {
                    if (meuAnfitriao) {
                        console.log("Anfitrião encontrado ID:", meuAnfitriao.id_anfitriao);
                        setIdAnfitriao(meuAnfitriao.id_anfitriao);
                        // Não setamos loading(false) aqui, pois o fetchReservas vai rodar em seguida
                    } else {
                        console.warn('Perfil de anfitrião não encontrado para este usuário.');
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar ID do anfitrião:', error);
                if (isMounted) setLoading(false);
            }
        };

        getIdAnfitriao();

        return () => { isMounted = false; };
    }, [usuarioLogado]);

    // 2. Busca Reservas quando tiver o ID do Anfitrião
    const fetchReservas = useCallback(async () => {
        if (!idAnfitriao) return;
        
        setLoading(true);
        try {
            console.log("Buscando reservas para anfitrião:", idAnfitriao);
            const data = await ReservaService.getReservasByHostCompleta(idAnfitriao);
            
            // Ordenação: Pendentes primeiro, depois data mais recente
            const sorted = data.sort((a, b) => {
                if (a.status === 'pendente' && b.status !== 'pendente') return -1;
                if (a.status !== 'pendente' && b.status === 'pendente') return 1;
                return new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime();
            });
            
            setReservas(sorted);
        } catch (e) {
            console.error("Erro no fetchReservas:", e);
            Alert.alert('Erro', 'Não foi possível carregar as solicitações.');
        } finally {
            setLoading(false);
        }
    }, [idAnfitriao]);

    // Dispara a busca quando o idAnfitriao é setado ou a tela ganha foco
    useFocusEffect(
        useCallback(() => {
            if (idAnfitriao) {
                fetchReservas();
            }
        }, [idAnfitriao, fetchReservas])
    );

    // Lógica para Aceitar/Negar
    const handleUpdateStatus = async (id_reserva: number, novoStatus: 'confirmada' | 'negada') => {
        try {
            await ReservaService.updateStatusReserva(id_reserva, novoStatus);
            
            // Atualiza lista localmente para feedback instantâneo
            setReservas(prev => prev.map(r => 
                r.id_reserva === id_reserva ? { ...r, status: novoStatus } : r
            ));
            
            Alert.alert('Sucesso', `Reserva ${novoStatus === 'confirmada' ? 'confirmada' : 'negada'}!`);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao atualizar status.');
        }
    };

    // Lógica de Filtro
    const filteredReservas = useMemo(() => {
        if (selectedStatus === 'todos') return reservas;
        return reservas.filter(r => r.status === selectedStatus);
    }, [reservas, selectedStatus]);

    return (
        <SafeAreaView style={hostStyles.container}>
            <ScrollView contentContainerStyle={hostStyles.scrollContentArea} showsVerticalScrollIndicator={false}>
                
                {/* Header Simples */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={hostStyles.cornerImageContainer}>
                    <Image source={ICON_LOGO} style={hostStyles.cornerImage} resizeMode="contain" />
                </TouchableOpacity>
                <Text style={hostStyles.LogoText}>Lar Doce Pet</Text>
                
                <View style={hostStyles.innerContainer}>
                    <Text style={hostStyles.mainTitle}>Solicitações</Text>
                    <Text style={hostStyles.sectionSubtitle}>Gerencie os pedidos de hospedagem</Text>

                    <StatusFilterOptions selectedStatus={selectedStatus} onSelectStatus={setSelectedStatus} />
                    
                    {loading ? (
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#556A44" />
                            <Text style={{ marginTop: 10, color: '#556A44' }}>Carregando reservas...</Text>
                        </View>
                    ) : filteredReservas.length > 0 ? (
                        filteredReservas.map(reserva => (
                            <RequestCard 
                                key={reserva.id_reserva} 
                                reserva={reserva} 
                                onAction={handleUpdateStatus}
                                navigation={navigation}
                            />
                        ))
                    ) : (
                        <Text style={hostStyles.noRequestsText}>
                             {idAnfitriao ? "Nenhuma solicitação encontrada." : "Perfil de anfitrião não identificado."}
                        </Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- 4. ESTILOS ---
const hostStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#B3D18C' },
    scrollContentArea: { flexGrow: 1, paddingBottom: 40 },
    innerContainer: { marginHorizontal: 12, backgroundColor: '#FFFFFF', borderRadius: 49, paddingHorizontal: 20, paddingVertical: 30, marginTop: 70, minHeight: 600 },
    mainTitle: { fontSize: 24, fontWeight: '700', color: '#556A44', textAlign: 'center', marginTop: 10 },
    sectionSubtitle: { fontSize: 14, color: '#556A44', textAlign: 'center', marginBottom: 20 },
    
    // Header
    cornerImageContainer: { position: 'absolute', top: 29, right: 220, width: 60, height: 60, zIndex: 10 },
    cornerImage: { width: '100%', height: '100%' },
    LogoText: { top: 60, left: 165, fontSize: 20, fontWeight: '700', color: '#ffffff', position: 'absolute', zIndex: 5 },

    // Filtros
    filterScroll: { marginBottom: 20, height: 50 },
    filterContainer: { flexDirection: 'row', paddingHorizontal: 5 },
    filterOptionButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#E0EFD3', borderRadius: 20, borderWidth: 1, borderColor: '#B3D18C', marginRight: 8, height: 38 },
    filterOptionSelected: { backgroundColor: '#7AB24E', borderColor: '#556A44' },
    filterOptionText: { fontSize: 14, fontWeight: '600', color: '#556A44' },
    filterOptionTextSelected: { color: '#FFF6E2' },

    // Card
    cardContainer: { backgroundColor: '#FFF6E2', borderRadius: 15, borderWidth: 2, borderColor: '#7AB24E', padding: 15, marginBottom: 20 },
    tutorCard: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#E0EFD3', borderRadius: 10, marginBottom: 15 },
    tutorAvatar: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#7AB24E', marginRight: 10 },
    tutorInfo: { flex: 1 },
    tutorName: { fontSize: 16, fontWeight: '700', color: '#556A44' },
    tutorLocation: { fontSize: 13, color: '#556A44' },

    detailsContainer: { marginBottom: 10 },
    dateHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#B3D18C', paddingBottom: 5 },
    dateText: { fontSize: 15, fontWeight: '700', color: '#4d654bff' },
    dateDivider: { fontSize: 16, fontWeight: '700', color: '#B3D18C', marginHorizontal: 10 },
    detailRow: { fontSize: 14, color: '#556A44', marginBottom: 3 },
    boldDetail: { fontWeight: 'bold' },
    totalValue: { fontSize: 15, fontWeight: '900', color: '#4d654bff' },

    petsSelectedContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, flexWrap: 'wrap' },
    petsLabel: { fontSize: 14, fontWeight: '700', color: '#556A44', marginRight: 10 },
    petAvatarWrapper: { marginRight: 8, alignItems: 'center' },
    smallPetAvatar: { width: 35, height: 35, borderRadius: 17.5, borderWidth: 2, borderColor: '#7AB24E' },
    petNameSmall: { fontSize: 10, color: '#556A44' },

    statusAndActionsWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#B3D18C', paddingTop: 15, marginTop: 5 },
    statusButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 15, alignItems: 'center', minWidth: 100 },
    statusButtonText: { fontSize: 13, fontWeight: '700' },

    hostActionButtonsContainer: { flexDirection: 'row', gap: 10 },
    hostActionButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15 },
    denyButton: { backgroundColor: '#d85e38ff' },
    confirmButton: { backgroundColor: '#7AB24E' },
    hostActionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

    avaliarButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#f7cf3fff', borderRadius: 15, borderWidth: 1, borderColor: '#ddab2dff' },
    avaliarIcon: { width: 14, height: 14, marginRight: 5, tintColor: '#a57d17ff' },
    avaliarButtonText: { fontSize: 13, fontWeight: '700', color: '#a57d17ff' },
    
    noRequestsText: { textAlign: 'center', marginTop: 30, color: '#888', fontStyle: 'italic' }
});