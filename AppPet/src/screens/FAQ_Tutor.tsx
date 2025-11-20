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

export default function FAQ() {
  const [newQuestion, setNewQuestion] = useState("");
  const [questions, setQuestions] = useState([
    {
      id: "1",
      question: "O host aceita gatos filhotes?",
      answer: null, // ainda sem resposta
    },
    {
      id: "2",
      question: "O host passeia com o pet quantas vezes por dia?",
      answer: "Normalmente 2x ao dia.",
    },
  ]);

  const handleSendQuestion = () => {
    if (newQuestion.trim().length === 0) return;

    const newItem = {
      id: Date.now().toString(),
      question: newQuestion,
      answer: null,
    };

    setQuestions([newItem, ...questions]);
    setNewQuestion("");
  };

  return (
    <SafeAreaView style={styles.container}>
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
          />

          <TouchableOpacity style={styles.sendButton} onPress={handleSendQuestion}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
          {questions.map((item) => (
            <View key={item.id} style={styles.questionCard}>
              <Text style={styles.questionText}>{item.question}</Text>

              {!item.answer ? (
                <Text style={styles.waitingText}>Aguardando resposta do host...</Text>
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
    marginTop: 30,
    marginBottom: 4,
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
  },
});
