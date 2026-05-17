import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://192.168.29.235:5000';

const ChatScreen = () => {
  const { token, user } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  
  const firstName = user?.name?.split(' ')[0] || '';

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/ai/memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ text: input })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Alert.alert(
          "Organised",
          `${data.tasks?.length || 0} things sorted`,
          [{ text: 'OK' }]
        );
        setInput('');
      } else {
        Alert.alert('Error', 'Could not organise this right now');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not organise this right now');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>
              Hi{firstName ? `, ${firstName}` : ''}
            </Text>
            <Text style={styles.title}>What's on your mind?</Text>
          </View>

          <View style={styles.centerSection}>
            {/* Input */}
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                placeholder="Dump your thoughts here..."
                placeholderTextColor="#444"
                value={input}
                onChangeText={setInput}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Organize button */}
            <TouchableOpacity
              style={[styles.organizeButton, loading && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.organizeButtonText}>Organize my life</Text>
              )}
            </TouchableOpacity>

            {/* Mic button */}
            <View style={styles.micRow}>
              <TouchableOpacity style={styles.micButton}>
                <Text style={{ fontSize: 24 }}>🎤</Text>
              </TouchableOpacity>
              <Text style={styles.micHint}>tap mic on keyboard to speak</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: { marginBottom: 32 },
  greeting: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 8,
    fontWeight: '500',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  inputCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222222',
    minHeight: 160,
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 130,
  },
  organizeButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  organizeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  micRow: {
    alignItems: 'center',
    gap: 8,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micText: { color: '#666', fontSize: 12 },
  micHint: { color: '#333', fontSize: 11 },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
  },
  });

export default ChatScreen;
