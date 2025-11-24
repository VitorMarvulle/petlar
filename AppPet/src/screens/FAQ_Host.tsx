import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

// TIPAGEM DO ITEM DO FAQ
interface FAQItem {
  id: string;
  question: string;
  answer: string | null;
}

export default function FAQHost() {
  const [questions, setQuestions] = useState<FAQItem[]>([
    {
      id: "1",
      question: "O host aceita gatos filhotes?",
      answer: null,
    },
    {
      id: "2",
      question: "O host passeia com o pet quantas vezes por dia?",
      answer: "Normalmente 2x ao dia.",
    },
  ]);

  const [responses, setResponses] = useState<Record<string, string>>({});

  const handleSendAnswer = (id: string) => {
    if (!responses[id] || responses[id].trim().length === 0) return;

    const updated = questions.map((q) =>
      q.id === id ? { ...q, answer: responses[id] } : q
    );

    setQuestions(updated);

    setResponses((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Responder Perguntas</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
          {questions.map((item) => (
            <View key={item.id} style={styles.questionCard}>
              <Text style={styles.questionText}>{item.question}</Text>

              {!item.answer ? (
                <>
                  <TextInput
                    placeholder="Escreva sua resposta..."
                    placeholderTextColor="#8AA17A"
                    value={responses[item.id] || ""}
                    onChangeText={(text) =>
                      setResponses((prev) => ({ ...prev, [item.id]: text }))
                    }
                    style={styles.answerInput}
                    multiline
                  />

                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => handleSendAnswer(item.id)}
                  >
                    <Text style={styles.sendButtonText}>Enviar Resposta</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerLabel}>Resposta:</Text>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
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
    marginTop: 35,
    marginBottom: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 25,
  },

  title: {
    color: "#556A44",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 25,
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
    marginBottom: 8,
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
  },
});
