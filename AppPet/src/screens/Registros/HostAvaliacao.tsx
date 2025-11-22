import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal } from 'react-native';
import type { RootStackScreenProps } from '../../navigation/types'; // Assumindo que 'types' está na mesma pasta ou caminho acessível

// --- MOCK DE DADOS E ÍCONES REAPROVEITADOS ---
// Caminho corrigido para o arquivo de imagem, subindo 3 níveis para chegar à pasta 'assets'
const ICON_AVATAR = require('../../../assets/icons/user.png'); 
const ICON_PET_THOR = { uri: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=60&h=60&fit=crop' };

const mockReservaParaAvaliacao = {
    id: 'r2',
    host: { name: 'Maria Silveira', location: 'Boqueirão', avatarUrl: ICON_AVATAR },
    dataEntrada: '01/10/2025',
    dataSaida: '02/10/2025', 
    dias: 1,
    pets: [{ id: 'p3', name: "Thor", imageUrl: ICON_PET_THOR.uri }],
};

// --- COMPONENTE PARA AVALIAÇÃO COM ESTRELAS (MOCK de Ícones) ---
interface RatingProps {
    rating: number;
    maxRating: number;
    onRate: (rate: number) => void;
}

const StarRating = ({ rating, maxRating, onRate }: RatingProps) => {
    const stars = Array.from({ length: maxRating }, (_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;
        
        // Usamos um emoji ou caractere simples para simular um ícone de estrela
        const starIcon = isFilled ? '★' : '☆'; 

        return (
            <TouchableOpacity 
                key={index} 
                onPress={() => onRate(starNumber)}
                activeOpacity={0.7}
                style={avaliacaoStyles.starButton}
            >
                <Text style={[
                    avaliacaoStyles.starIcon, 
                    isFilled ? avaliacaoStyles.starFilled : avaliacaoStyles.starEmpty
                ]}>
                    {starIcon}
                </Text>
            </TouchableOpacity>
        );
    });

    return <View style={avaliacaoStyles.starContainer}>{stars}</View>;
};

// --- NOVO COMPONENTE: ALERTA CUSTOMIZADO ---
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
    <View style={avaliacaoStyles.modalOverlay}>
      <View style={avaliacaoStyles.modalContainer}>
        <Text style={avaliacaoStyles.modalTitle}>{title}</Text>
        <Text style={avaliacaoStyles.modalMessage}>{message}</Text>

        <TouchableOpacity style={avaliacaoStyles.modalButton} onPress={onClose}>
          <Text style={avaliacaoStyles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// -------------------------------------------------------------------
// ------------------------- TELA PRINCIPAL --------------------------
// -------------------------------------------------------------------

// Adaptação da tipagem para a tela de avaliação, assumindo que ela recebe o ID da reserva
// Esta tipagem real seria definida no seu arquivo 'types.ts'
type AvaliarHospedagemProps = RootStackScreenProps<'HostAvaliacao'>;

export default function AvaliarHospedagem({ navigation, route }: AvaliarHospedagemProps) {
    // A reserva real viria de uma chamada de API usando route.params.reservaId
    const reserva = mockReservaParaAvaliacao; // Usando mock para demonstração

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    
    // --- NOVO ESTADO DO MODAL ---
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertData, setAlertData] = useState({ title: '', message: '', action: () => {} });
    
    // Função para mostrar o modal
    const showAlert = (title: string, message: string, action: () => void = () => {}) => {
        setAlertData({ title, message, action });
        setAlertVisible(true);
    };

    // Função para fechar o modal e executar a ação
    const handleAlertClose = () => {
        setAlertVisible(false);
        alertData.action();
    };
    
    // Simula o processo de envio
    const handleSubmit = async () => {
        if (rating === 0) {
            showAlert("Atenção", "Por favor, avalie o Host com pelo menos uma estrela.");
            return;
        }

        setIsLoading(true);

        // --- Simulação de Envio de Dados para a API ---
        const reviewData = {
            reservaId: reserva.id,
            hostId: 'host-123', // ID do host
            rating: rating,
            comment: comment.trim(),
            timestamp: new Date().toISOString(),
        };

        console.log("Dados de Avaliação Enviados:", reviewData);
        
        // Simulação de delay de rede
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        // ---------------------------------------------

        setIsLoading(false);
        
        showAlert(
          "Avaliação Concluída!", 
          `Obrigado por avaliar ${reserva.host.name}. Sua nota de ${rating} estrela(s) foi enviada com sucesso!`,
          () => navigation.goBack() // Ação: voltar para a tela anterior
        );
    };

    return (
        <SafeAreaView style={avaliacaoStyles.container}>
            <ScrollView contentContainerStyle={avaliacaoStyles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={avaliacaoStyles.innerContainer}>

                    <Text style={avaliacaoStyles.mainTitle}>Avalie sua Hospedagem</Text>
                    
                    {/* HOST CARD */}
                    <View style={avaliacaoStyles.hostCard}>
                        <Image source={reserva.host.avatarUrl} style={avaliacaoStyles.hostAvatar} />
                        <View style={avaliacaoStyles.hostInfo}>
                            <Text style={avaliacaoStyles.hostName}>{reserva.host.name}</Text>
                            <Text style={avaliacaoStyles.hostLocation}>Período: {reserva.dataEntrada} a {reserva.dataSaida}</Text>
                        </View>
                    </View>

                    {/* SEÇÃO DE AVALIAÇÃO */}
                    <View style={avaliacaoStyles.sectionContainer}>
                        <Text style={avaliacaoStyles.sectionTitle}>
                            Sua experiência com o Host
                        </Text>
                        
                        <Text style={avaliacaoStyles.sectionSubtitle}>
                            De 1 a 5 estrelas, como você avalia o cuidado de {reserva.host.name}?
                        </Text>
                        
                        <StarRating 
                            rating={rating}
                            maxRating={5}
                            onRate={setRating}
                        />
                        
                        {/* COMENTÁRIO */}
                        <Text style={[avaliacaoStyles.sectionTitle, { marginTop: 20 }]}>
                            Deixe seu Comentário (Opcional)
                        </Text>
                        <TextInput
                            style={avaliacaoStyles.commentInput}
                            placeholder={`Conte-nos sobre a estadia de ${reserva.pets.map(p => p.name).join(' e ')}...`}
                            placeholderTextColor="#A9A9A9"
                            multiline
                            numberOfLines={4}
                            value={comment}
                            onChangeText={setComment}
                            maxLength={500}
                        />
                         <Text style={avaliacaoStyles.charCount}>{comment.length}/500</Text>
                    </View>

                    {/* BOTÃO DE ENVIO */}
                    <TouchableOpacity
                        style={[avaliacaoStyles.submitButton, isLoading && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={isLoading || rating === 0}
                    >
                        <Text style={avaliacaoStyles.submitButtonText}>
                            {isLoading ? 'Enviando...' : 'Finalizar Avaliação'}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={avaliacaoStyles.backButton}
                        onPress={() => navigation.goBack()}
                        disabled={isLoading}
                    >
                        <Text style={avaliacaoStyles.backButtonText}>
                            Voltar
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            <CustomAlert
                visible={alertVisible}
                title={alertData.title}
                message={alertData.message}
                onClose={handleAlertClose} // Chama a função que executa a ação e fecha
            />
        </SafeAreaView>
    );
}

// -------------------------------------------------------------------
// ----------------------------- STYLES ------------------------------
// -------------------------------------------------------------------

const GREEN_DARK = '#556A44';
const GREEN_MEDIUM = '#7AB24E';
const GREEN_LIGHT = '#B3D18C';
const YELLOW_STAR = '#FFC700';
const BG_INNER = '#FFF6E2';

const avaliacaoStyles = StyleSheet.create({
    // --- Estrutura Geral (Reaproveitado da Lista) ---
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
        backgroundColor: '#FFFFFF', // Mudança para branco para contraste
        borderRadius: 40,
        paddingHorizontal: 20, 
        paddingVertical: 30,
        borderWidth: 5, // Borda verde forte
        borderColor: GREEN_LIGHT,
    },
    mainTitle: { 
        fontSize: 26, 
        fontWeight: '800', 
        color: GREEN_DARK, 
        marginBottom: 25, 
        textAlign: 'center',
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
      fontWeight: '700',
      color: '#ffffff',
    },

    // --- HOST CARD (Adaptação do Card da Lista) ---
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
        tintColor: BG_INNER,
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

    // --- SEÇÃO DE AVALIAÇÃO ---
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

    // --- ESTRELAS ---
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    starButton: {
        paddingHorizontal: 5,
        // Garante que a área de toque é grande
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

    // --- INPUT DE COMENTÁRIO ---
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

    // --- BOTÕES DE AÇÃO ---
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
        backgroundColor: '#FFF6E2',
        borderRadius: 20,
        paddingVertical: 25,
        paddingHorizontal: 20,
        borderWidth: 3,
        borderColor: GREEN_LIGHT, // Borda verde clara
        alignItems: 'center',
        elevation: 6,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: GREEN_DARK, // Verde escuro
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
        backgroundColor: GREEN_MEDIUM, // Verde médio
        borderRadius: 10,
        paddingHorizontal: 45,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: GREEN_LIGHT,
    },
    modalButtonText: {
        color: BG_INNER, // Cor de fundo do inner container
        fontSize: 18,
        fontWeight: '700',
    },
});