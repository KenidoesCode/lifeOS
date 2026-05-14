import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const BASE_URL = 'http://192.168.29.235:5000';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOTP, setDevOTP] = useState('');

  const handleSendOTP = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.otp) {
          // Dev mode - show OTP
          setDevOTP(data.otp);
          Alert.alert(
            'Dev Mode OTP',
            `Your OTP is: ${data.otp}\n(Email not configured)`,
            [{ text: 'OK', onPress: () => setStep(2) }]
          );
        } else {
          Alert.alert('OTP Sent', 'Check your email for the OTP');
          setStep(2);
        }
      } else {
        Alert.alert('Error', data.error);
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server');
    }
    setLoading(false);
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          '✅ Password Reset',
          'Your password has been reset. Please sign in.',
          [{ text: 'Sign In', onPress: () => navigation.navigate('Login' as never) }]
        );
      } else {
        Alert.alert('Error', data.error);
      }
    } catch {
      Alert.alert('Error', 'Could not reset password');
    }
    setLoading(false);
  };

  const steps = ['Email', 'OTP', 'New Password'];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <View style={styles.stepItem}>
                  <View style={[
                    styles.stepCircle,
                    step > i + 1 && styles.stepDone,
                    step === i + 1 && styles.stepActive,
                  ]}>
                    <Text style={[
                      styles.stepNumber,
                      (step >= i + 1) && styles.stepNumberActive
                    ]}>
                      {step > i + 1 ? 'Done' : i + 1}
                    </Text>
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    step === i + 1 && styles.stepLabelActive
                  ]}>{s}</Text>
                </View>
                {i < 2 && <View style={styles.stepLine} />}
              </React.Fragment>
            ))}
          </View>

          <Text style={styles.title}>
            {step === 1 ? 'Forgot Password' :
             step === 2 ? 'Enter OTP' : 'New Password'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 ? 'Enter your email to receive an OTP' :
             step === 2 ? 'Enter the 6-digit OTP from your email' :
             'Create your new password'}
          </Text>

          {step === 1 && (
            <View style={styles.form}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#505070"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#F8F8FF" /> :
                  <Text style={styles.primaryButtonText}>Send OTP</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.form}>
              <Text style={styles.label}>6-DIGIT OTP</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                placeholderTextColor="#505070"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleVerifyOTP}
              >
                <Text style={styles.primaryButtonText}>Verify OTP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendOTP}
                style={styles.resendButton}
              >
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.form}>
              <Text style={styles.label}>NEW PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Min 6 characters"
                placeholderTextColor="#505070"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <Text style={[styles.label, { marginTop: 16 }]}>
                CONFIRM PASSWORD
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat new password"
                placeholderTextColor="#505070"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#F8F8FF" /> :
                  <Text style={styles.primaryButtonText}>Reset Password</Text>}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  content: { flexGrow: 1, padding: 24, paddingTop: 20 },
  backButton: { marginBottom: 32 },
  backText: { color: '#A0A0C0', fontSize: 28 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepItem: { alignItems: 'center', gap: 6 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  stepDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  stepNumber: { color: '#505070', fontSize: 13, fontWeight: '700' },
  stepNumberActive: { color: '#F8F8FF' },
  stepLabel: { color: '#505070', fontSize: 11 },
  stepLabelActive: { color: '#7C3AED' },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 28, fontWeight: '800', color: '#F8F8FF',
    letterSpacing: -0.5, marginBottom: 6,
  },
  subtitle: { color: '#A0A0C0', fontSize: 14, marginBottom: 32 },
  form: { gap: 0 },
  label: {
    color: '#505070', fontSize: 11, fontWeight: '700',
    letterSpacing: 1, marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, padding: 16,
    color: '#F8F8FF', fontSize: 15, marginBottom: 8,
  },
  otpInput: {
    fontSize: 28, fontWeight: '700',
    letterSpacing: 8, textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#7C3AED', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 24,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: '#F8F8FF', fontSize: 15, fontWeight: '700' },
  resendButton: { padding: 16, alignItems: 'center' },
  resendText: { color: '#7C3AED', fontSize: 14 },
});

export default ForgotPasswordScreen;
