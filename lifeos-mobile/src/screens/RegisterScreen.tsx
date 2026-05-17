import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { user, register, login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const guestId = user?.isGuest ? user._id : null;
      await register(name.trim(), email.trim(), password, guestId);
      // Auto login after registration
      await login(email.trim(), password);
      // Navigation happens automatically via AuthContext
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Please try again');
    }
    setLoading(false);
  };

  const Field = ({ 
    label, value, onChange, placeholder, secure, error, extra 
  }: any) => (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor="#505070"
          value={value}
          onChangeText={(t) => { onChange(t); setErrors({}); }}
          secureTextEntry={secure && !showPassword}
          autoCapitalize={label === 'NAME' ? 'words' : 'none'}
          autoCorrect={false}
        />
        {extra}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            {user?.isGuest 
              ? 'Save your data — create a free account' 
              : 'Start organizing your life'}
          </Text>

          <View style={styles.form}>
            <Field
              label="NAME"
              value={name}
              onChange={setName}
              placeholder="Your full name"
              error={errors.name}
            />
            <Field
              label="EMAIL"
              value={email}
              onChange={setEmail}
              placeholder="your@email.com"
              error={errors.email}
            />
            <Field
              label="PASSWORD"
              value={password}
              onChange={setPassword}
              placeholder="Min 6 characters"
              secure
              error={errors.password}
              extra={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              }
            />
            <Field
              label="CONFIRM PASSWORD"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat password"
              secure
              error={errors.confirmPassword}
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#F8F8FF" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login' as never)}
              >
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  content: { flexGrow: 1, padding: 24, paddingTop: 20 },
  backButton: { marginBottom: 40 },
  backText: { color: '#A0A0C0', fontSize: 28 },
  title: {
    fontSize: 32, fontWeight: '800', color: '#F8F8FF',
    letterSpacing: -0.5, marginBottom: 6,
  },
  subtitle: { color: '#A0A0C0', fontSize: 15, marginBottom: 32 },
  form: { gap: 4 },
  label: {
    color: '#505070', fontSize: 11, fontWeight: '700',
    letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  inputWrapper: { position: 'relative' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, padding: 16,
    color: '#F8F8FF', fontSize: 15,
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  eyeButton: { position: 'absolute', right: 16, top: 16 },
  primaryButton: {
    backgroundColor: '#7C3AED', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 32,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: '#F8F8FF', fontSize: 15, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { color: '#A0A0C0', fontSize: 14 },
  loginLink: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
});

export default RegisterScreen;
