// AppPet\src\screens\Registros\HostAvaliacao.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Modal, ActivityIndicator } from 'react-native';
import type { RootStackScreenProps } from '../../navigation/types';
import { AvaliacaoService } from '../../services/avaliacaoService';
import { ReservaService } from '../../services/reservaService';
import { ReservaCompleta } from '../../navigation/reservaTypes';

const ICON_AVATAR = require('../../../assets/icons/user.png');

interface RatingProps {
    rating: number;
    maxRating: number;
    onRate: (rate: number) => void;
}

const StarRating = ({ rating, maxRating, onRate }: RatingProps) => {
    const stars = Array.from({ length: maxRating }, (_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;
        const starIcon = isFilled ? '★' : '☆';

        return (
            <TouchableOpacity 
                key={index} 
                onPress={() => onRate(starNumber)}
                activeOpacity={0.7}
                style={styles.starButton}
            >
                <Text style={[
                    styles.starIcon, 
                    isFilled ? styles.starFilled : styles.starEmpty
                ]}>
                    {starIcon}
                </Text>
            </TouchableOpacity>
        );
    });

    return <View style={styles.starContainer}>{stars}</View>;
};

const CustomAlert = ({
  visible,
  title,
  message,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

type AvaliarHospedagemProps = RootStackScreenProps<'HostAvaliacao'>;

export default function AvaliarHospedagem({ navigation, route }: AvaliarHospedagemProps) {
    const { reservaId } = route.params;
    
    const [reserva, setReserva] = useState<ReservaCompleta | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingReserva, setIsFetchingReserva] = useState(true);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertData, setAlertData] = useState({ title: '', message: '', action: () => {} });

    // Busca os dados da reserva
    useEffect(() => {
        const fetchReserva = async () => {
            try {
                setIsFetchingReserva(true);
                
                // Ajuste conforme seu método de buscar uma reserva específica
                // Você pode precisar adicionar um método getReservaById no ReservaService
                const response = await fetch(`http://localhost:8000/reservas/${reservaId}`);
                const data = await response.json();
                
                // Transformar os dados para o formato ReservaCompleta
                // (adapte conforme a estrutura do seu backend)
                setReserva(data);
            } catch (error) {
                console.error('Erro ao buscar reserva:', error);
                showAlert(
                    "Erro", 
                    "Não foi possível carregar os dados da reserva.",
                    () => navigation.goBack()
                );
            } finally {
                setIsFetchingReserva(false);
            }
        };

        fetchReserva();
    }, [reservaId]);

    const showAlert = (title: string, message: string, action: () => void = () => {}) => {
        setAlertData({ title, message, action });
        setAlertVisible(true);
    };

    const handleAlertClose = () => {
        setAlertVisible(false);
        alertData.action();
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            showAlert("Atenção", "Por favor, avalie o Host com pelo menos uma estrela.");
            return;
        }

        if (!reserva) {
            showAlert("Erro", "Dados da reserva não disponíveis.");
            return;
        }

        setIsLoading(true);

        try {
            // Dados da avaliação
            const avaliacaoData = {
                id_reserva: parseInt(reservaId),
                id_avaliador: reserva.anfitriao.id_anfitriao, // ID do tutor (quem está avaliando)
                id_avaliado: reserva.anfitriao.id_anfitriao, // ID do host (quem está sendo avaliado)
                nota: rating,
                comentario: comment.trim() || undefined,
            };

            // Envia para o backend
            await AvaliacaoService.createAvaliacao(avaliacaoData);

            showAlert(
                "Avaliação Concluída!", 
                `Obrigado por avaliar ${reserva.anfitriao.nome}. Sua nota de ${rating} estrela(s) foi enviada com sucesso!`,
                () => navigation.goBack()
            );

        } catch (error: any) {
            console.error('Erro ao enviar avaliação:', error);
            showAlert(
                "Erro",
                error.message || "Não foi possível enviar sua avaliação. Tente novamente."
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetchingReserva) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#556A44" />
                    <Text style={styles.loadingText}>Carregando dados...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!reserva) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Reserva não encontrada</Text>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.innerContainer}>

                    <Text style={styles.mainTitle}>Avalie sua Hospedagem</Text>
                    
                    <View style={styles.hostCard}>
                        <Image 
                            source={
                                reserva.anfitriao.foto_perfil_url 
                                    ? { uri: reserva.anfitriao.foto_perfil_url }
                                    : ICON_AVATAR
                            } 
                            style={styles.hostAvatar} 
                        />
                        <View style={styles.hostInfo}>
                            <Text style={styles.hostName}>{reserva.anfitriao.nome}</Text>
                            <Text style={styles.hostLocation}>
                                Período: {reserva.data_inicio} a {reserva.data_fim}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>
                            Sua experiência com o Host
                        </Text>
                        
                        <Text style={styles.sectionSubtitle}>
                            De 1 a 5 estrelas, como você avalia o cuidado de {reserva.anfitriao.nome}?
                        </Text>
                        
                        <StarRating 
                            rating={rating}
                            maxRating={5}
                            onRate={setRating}
                        />
                        
                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                            Deixe seu Comentário (Opcional)
                        </Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder={`Conte-nos sobre a estadia...`}
                            placeholderTextColor="#A9A9A9"
                            multiline
                            numberOfLines={4}
                            value={comment}
                            onChangeText={setComment}
                            maxLength={500}
                        />
                         <Text style={styles.charCount}>{comment.length}/500</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, (isLoading || rating === 0) && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={isLoading || rating === 0}
                    >
                        <Text style={styles.submitButtonText}>
                            {isLoading ? 'Enviando...' : 'Finalizar Avaliação'}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        disabled={isLoading}
                    >
                        <Text style={styles.backButtonText}>
                            Voltar
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            <CustomAlert
                visible={alertVisible}
                title={alertData.title}
                message={alertData.message}
                onClose={handleAlertClose}
            />
        </SafeAreaView>
    );
}

const GREEN_DARK = '#556A44';
const GREEN_MEDIUM = '#7AB24E';
const GREEN_LIGHT = '#B3D18C';
const YELLOW_STAR = '#FFC700';
const BG_INNER = '#FFF6E2';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: GREEN_LIGHT,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 45,
    },
    innerContainer: {
        flex: 1,
        marginHorizontal: 12,
        marginTop: 25,       
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        paddingHorizontal: 20, 
        paddingVertical: 30,
        borderWidth: 5,
        borderColor: GREEN_LIGHT,
    },
    mainTitle: { 
        fontSize: 26, 
        fontWeight: '800', 
        color: GREEN_DARK, 
        marginBottom: 25, 
        textAlign: 'center',
    },
    hostCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: BG_INNER, 
        borderRadius: 15,
        borderWidth: 2,
        borderColor: GREEN_MEDIUM,
        marginBottom: 15,
    },
    hostAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: GREEN_MEDIUM,
        marginRight: 15,
    },
    hostInfo: {
        flex: 1,
    },
    hostName: {
        fontSize: 18,
        fontWeight: '700',
        color: GREEN_DARK,
    },
    hostLocation: {
        fontSize: 14,
        color: GREEN_DARK,
        marginTop: 4,
    },
    sectionContainer: {
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: GREEN_DARK,
        marginBottom: 10,
        textAlign: 'center',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: GREEN_DARK,
        textAlign: 'center',
        marginBottom: 15,
    },
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    starButton: {
        paddingHorizontal: 5,
    },
    starIcon: {
        fontSize: 45,
    },
    starFilled: {
        color: YELLOW_STAR,
    },
    starEmpty: {
        color: '#D0D0D0',
    },
    commentInput: {
        height: 120,
        borderColor: GREEN_LIGHT,
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        textAlignVertical: 'top',
        fontSize: 15,
        color: GREEN_DARK,
        backgroundColor: BG_INNER,
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        color: GREEN_DARK,
        marginTop: 5,
        marginBottom: 15,
    },
    submitButton: {
        backgroundColor: GREEN_MEDIUM, 
        paddingVertical: 15,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: GREEN_DARK,
        alignItems: 'center',
        marginTop: - 10,
        shadowColor: GREEN_DARK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    backButton: {
        marginTop: 15,
        alignItems: 'center',
        paddingVertical: 10,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: GREEN_MEDIUM,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: BG_INNER,
        borderRadius: 20,
        paddingVertical: 25,
        paddingHorizontal: 20,
        borderWidth: 3,
        borderColor: GREEN_LIGHT,
        alignItems: 'center',
        elevation: 6,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: GREEN_DARK,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        color: GREEN_DARK,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: GREEN_MEDIUM,
        borderRadius: 10,
        paddingHorizontal: 45,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: GREEN_LIGHT,
    },
    modalButtonText: {
        color: BG_INNER,
        fontSize: 18,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: GREEN_DARK,
    },
    errorText: {
        fontSize: 16,
        color: '#d85e38ff',
        textAlign: 'center',
        marginBottom: 20,
    },
});