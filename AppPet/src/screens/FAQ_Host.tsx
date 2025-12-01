// AppPet\src\screens\FAQ_Host.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";

// Ajuste para o seu IP
const API_BASE_URL = 'https://container-service-1.7q33f42wtcfq2.us-east-1.cs.amazonlightsail.com'; 
const ICON_LOGO_BRANCO = require('../../assets/icons/LogoBranco.png');

interface FAQItem {
  id_pergunta: number;
  id_tutor: number;
  id_anfitriao: number;
  pergunta: string;
  data_envio: string;
  resposta: {
    id_resposta: number;
    resposta: string;
    data_envio: string;
  } | null;
}

type FAQHostRouteProp = RouteProp<RootStackParamList, 'FAQ_Host'>;
type FAQHostNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FAQ_Host'>;

// --- HEADER LOGO ---
const HeaderLogo = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity style={styles.headerLogoContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.logoImageWrapper}>
        <Image source={ICON_LOGO_BRANCO} style={styles.logoImage} resizeMode="contain" />
      </View>
      <Text style={styles.logoText}>PetLar</Text>
    </TouchableOpacity>
);

export default function FAQHost() {
  const navigation = useNavigation<FAQHostNavigationProp>(); 
  const route = useRoute<FAQHostRouteProp>();
  const { id_anfitriao } = route.params;

  const [questions, setQuestions] = useState<FAQItem[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/perguntas/anfitriao/${id_anfitriao}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erro ao buscar perguntas");
      }

      const data: FAQItem[] = await response.json();
      setQuestions(data);

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar as perguntas.");
    } finally {
      setLoading(false);
    }
  }, [id_anfitriao]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSendAnswer = async (id_pergunta: number) => {
    const text = responses[id_pergunta];
    if (!text || text.trim().length === 0) {
      Alert.alert("Atenção", "Escreva uma resposta antes de enviar.");
      return;
    }

    try {
      setSendingId(id_pergunta);

      const payload = {
        id_pergunta: id_pergunta,
        id_anfitriao: id_anfitriao,
        resposta: text
      };

      const response = await fetch(`${API_BASE_URL}/perguntas/respostas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar resposta");
      }

      Alert.alert("Sucesso", "Resposta enviada!");
      
      setResponses((prev) => {
        const copy = { ...prev };
        delete copy[id_pergunta];
        return copy;
      });
      fetchQuestions();

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível enviar a resposta.");
    } finally {
      setSendingId(null);
    }
  };

  const handleLogoPress = () => {
      navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <HeaderLogo onPress={handleLogoPress} />

      <View style={styles.innerContainer}>
        
        <Text style={styles.title}>Perguntas dos Tutores</Text>

        {loading ? (
           <ActivityIndicator size="large" color="#556A44" style={{ marginTop: 20 }} />
        ) : questions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma pergunta recebida ainda.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
            {questions.map((item) => (
              <View key={item.id_pergunta} style={styles.questionCard}>
                <Text style={styles.questionLabel}>Pergunta:</Text>
                <Text style={styles.questionText}>{item.pergunta}</Text>
                <Text style={styles.dateText}>
                    {new Date(item.data_envio).toLocaleDateString('pt-BR')}
                </Text>

                {!item.resposta ? (
                  <>
                    <TextInput
                      placeholder="Escreva sua resposta..."
                      placeholderTextColor="#8AA17A"
                      value={responses[item.id_pergunta] || ""}
                      onChangeText={(text) =>
                        setResponses((prev) => ({ ...prev, [item.id_pergunta]: text }))
                      }
                      style={styles.answerInput}
                      multiline
                    />

                    <TouchableOpacity
                      style={styles.sendButton}
                      onPress={() => handleSendAnswer(item.id_pergunta)}
                      disabled={sendingId === item.id_pergunta}
                    >
                      {sendingId === item.id_pergunta ? (
                         <ActivityIndicator color="#FFF" />
                      ) : (
                         <Text style={styles.sendButtonText}>Enviar Resposta</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerLabel}>Sua Resposta:</Text>
                    <Text style={styles.answerText}>{item.resposta.resposta}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B3D18C",
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 100, // Ajustado para o Header Logo
    marginBottom: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  
  // --- HEADER LOGO STYLES ---
  headerLogoContainer: {
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  logoImageWrapper: {
    width: 60,
    height: 60,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // --------------------------

  title: {
    color: "#556A44",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 25,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    color: '#888',
    fontSize: 16
  },
  questionCard: {
    backgroundColor: "#FFF6E2",
    borderColor: "#B3D18C",
    borderWidth: 2,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  questionLabel: {
    color: "#556A44",
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 2
  },
  questionText: {
    color: "#556A44",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateText: {
    color: "#8AA17A",
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 10
  },
  answerInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#B3D18C",
    borderRadius: 10,
    padding: 10,
    color: "#556A44",
    fontSize: 15,
    minHeight: 60,
    marginBottom: 10,
    textAlignVertical: 'top'
  },
  sendButton: {
    backgroundColor: "#85B65E",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  answerContainer: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#B3D18C",
  },
  answerLabel: {
    color: "#556A44",
    fontWeight: "700",
    fontSize: 14,
  },
  answerText: {
    color: "#556A44",
    fontSize: 14,
    marginTop: 2
  },
});