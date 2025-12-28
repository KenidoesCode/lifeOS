import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { startSpeechToText } from "../services/voice";

const ChatScreen = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) {
      Alert.alert("Say something", "What’s on your mind today?");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();

      Alert.alert(
        "I’ve organized this for you",
        `${data.tasks.length} things sorted`
      );

      setInput("");
    } catch {
      Alert.alert("Error", "Could not organize this right now");
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = async () => {
    try {
      setListening(true);
      const text = await startSpeechToText();
      setInput(text);
    } catch {
      Alert.alert("Voice error", "Could not hear clearly");
    } finally {
      setListening(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>LifeOS</Text>

        <TextInput
          style={styles.input}
          placeholder="What’s on your mind today?"
          placeholderTextColor="#999"
          multiline
          value={input}
          onChangeText={setInput}
        />

        <TouchableOpacity
          style={styles.voiceButton}
          onPress={handleVoice}
        >
          <Text style={styles.voiceText}>
            {listening ? "Listening…" : "Speak"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.sendText}>
            {loading ? "Organizing…" : "Organize my life"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  heading: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 24,
    color: "#111",
  },
  input: {
    fontSize: 18,
    lineHeight: 26,
    minHeight: 160,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: "#111",
  },
  voiceButton: {
    paddingVertical: 14,
    marginBottom: 12,
  },
  voiceText: {
    fontSize: 16,
    color: "#555",
  },
  sendButton: {
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 12,
  },
  sendText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default ChatScreen;
