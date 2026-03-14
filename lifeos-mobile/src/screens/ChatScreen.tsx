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
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { startSpeechToText } from "../services/voice";

const ChatScreen = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) {
      Alert.alert("Say something", "What's on your mind today?");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending to AI:", input);
      const res = await fetch("http://10.0.2.2:5000/api/ai/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      console.log("AI response status:", res.status);
      const data = await res.json();

      Alert.alert(
        "I've organized this for you",
        `${data.tasks.length} things sorted`
      );

      setInput("");
    } catch (err) {
      console.log("AI error:", err.message);
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.heading}>LifeOS</Text>
            <Text style={styles.subtitle}>What's on your mind?</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="What's on your mind today?"
            placeholderTextColor="#555555"
            multiline
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleVoice}
            disabled={listening}
          >
            <Text style={styles.voiceIcon}>🎤</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.sendText}>Organize my life</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  wrapper: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  heading: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F0F0F0",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888888",
    fontWeight: "400",
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    backgroundColor: "#1A1A1A",
    borderColor: "#2A2A2A",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    color: "#F0F0F0",
    textAlignVertical: "top",
  },
  voiceButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1A1A1A",
    borderColor: "#2A2A2A",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  voiceIcon: {
    fontSize: 24,
    color: "#7C5CFC",
  },
  sendButton: {
    backgroundColor: "#7C5CFC",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChatScreen;
