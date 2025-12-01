import React, { useState, useEffect } from "react";
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
  Keyboard,
  Image,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";

// URL base da API
const API_BASE_URL = 'http://localhost:8000'; 
const ICON_LOGO_BRANCO = require('../../assets/icons/LogoBranco.png');

// Tipos baseados na resposta da API
interface RespostaAPI {
  id_resposta: number;
  resposta: string;
}

interface PerguntaAPI {
  id_pergunta: number;
  id_tutor: number;
  id_anfitriao: number;
  pergunta: string;
  data_envio: string;
  resposta?: RespostaAPI | null;
}

type FAQRouteProp = RouteProp<RootStackParamList, "FAQ_Tutor">;

// --- HEADER LOGO ---
const HeaderLogo = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity style={styles.headerLogoContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.logoImageWrapper}>
        <Image source={ICON_LOGO_BRANCO} style={styles.logoImage} resizeMode="contain" />
      </View>
      <Text style={styles.logoText}>PetLar</Text>
    </TouchableOpacity>
);

export default function FAQ() {
  const route = useRoute<FAQRouteProp>();
  const navigation = useNavigation();
  const { id_anfitriao, id_tutor } = route.params;

  const [newQuestion, setNewQuestion] = useState("");
  const [questions, setQuestions] = useState<PerguntaAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Buscar perguntas ao carregar a tela
  useEffect(() => {
    fetchQuestions();
  }, [id_anfitriao]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/perguntas/anfitriao/${id_anfitriao}`);
      
      if (!response.ok) {
        throw new Error("Falha ao buscar perguntas");
      }

      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Erro ao carregar perguntas:", error);
      Alert.alert("Erro", "Não foi possível carregar as perguntas.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuestion = async () => {
    if (newQuestion.trim().length === 0) return;

    try {
      setSending(true);
      
      const payload = {
        id_tutor: id_tutor,
        id_anfitriao: id_anfitriao,
        pergunta: newQuestion,
      };

      const response = await fetch(`${API_BASE_URL}/perguntas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar pergunta");
      }

      const novaPerguntaCriada = await response.json();
      setQuestions([...questions, { ...novaPerguntaCriada, resposta: null }]);
      
      setNewQuestion("");
      Keyboard.dismiss();
    } catch (error) {
      console.error("Erro ao enviar:", error);
      Alert.alert("Erro", "Falha ao enviar sua pergunta. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  const handleLogoPress = () => {
      navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#556A44" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <HeaderLogo onPress={handleLogoPress} />

      <View style={styles.innerContainer}>
        <Text style={styles.title}>Perguntas Frequentes</Text>

        {/* Campo de pergunta */}
        <View style={styles.inputContainer}>
          <TextInput
            value={newQuestion}
            onChangeText={setNewQuestion}
            placeholder="Envie uma pergunta ao host..."
            placeholderTextColor="#8AA17A"
            style={styles.input}
            multiline
          />

          <TouchableOpacity 
            style={[styles.sendButton, sending && { opacity: 0.7 }]} 
            onPress={handleSendQuestion}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.sendButtonText}>Enviar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
          {questions.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma pergunta encontrada. Seja o primeiro!</Text>
          ) : (
            questions.map((item) => (
              <View key={item.id_pergunta} style={styles.questionCard}>
                <Text style={styles.questionText}>{item.pergunta}</Text>

                {/* Verifica se item.resposta existe e se tem conteúdo dentro */}
                {!item.resposta ? (
                  <Text style={styles.waitingText}>Aguardando resposta do host...</Text>
                ) : (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerLabel}>Resposta:</Text>
                    <Text style={styles.answerText}>{item.resposta.resposta}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
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
    marginBottom: 4,
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
  inputContainer: {
    backgroundColor: "#FFF6E2",
    borderWidth: 2,
    borderColor: "#B3D18C",
    borderRadius: 14,
    padding: 10,
  },
  input: {
    color: "#556A44",
    fontSize: 16,
    marginBottom: 10,
    maxHeight: 80,
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
  questionCard: {
    backgroundColor: "#FFF6E2",
    borderColor: "#B3D18C",
    borderWidth: 2,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  questionText: {
    color: "#556A44",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  waitingText: {
    color: "#8AA17A",
    fontSize: 14,
    fontStyle: "italic",
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
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#556A44',
    marginTop: 20,
    fontStyle: 'italic',
  }
});