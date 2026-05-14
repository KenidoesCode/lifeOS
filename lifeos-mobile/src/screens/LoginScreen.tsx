import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert("Login Failed", err.message || "Invalid credentials");
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Welcome");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.form}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="your@email.com"
              placeholderTextColor="#505070"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors({}); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <View style={styles.passwordRow}>
              <Text style={styles.label}>PASSWORD</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, errors.password && styles.inputError]}
                placeholder="Min 6 characters"
                placeholderTextColor="#505070"
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors({}); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#F8F8FF" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080810" },
  content: { flexGrow: 1, padding: 24, paddingTop: 20 },
  backButton: { marginBottom: 40 },
  backText: { color: "#A0A0C0", fontSize: 16 },
  title: {
    fontSize: 32, fontWeight: "800", color: "#F8F8FF",
    letterSpacing: -0.5, marginBottom: 6,
  },
  subtitle: { color: "#A0A0C0", fontSize: 15, marginBottom: 40 },
  form: { gap: 0 },
  label: {
    color: "#505070", fontSize: 11, fontWeight: "700",
    letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12, padding: 16, color: "#F8F8FF", fontSize: 15,
  },
  inputError: { borderColor: "#EF4444" },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },
  passwordRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 16, marginBottom: 8,
  },
  forgotText: { color: "#7C3AED", fontSize: 13 },
  passwordContainer: { flexDirection: "row", alignItems: "center" },
  passwordInput: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12, padding: 16, color: "#F8F8FF", fontSize: 15,
  },
  eyeButton: { position: "absolute", right: 16 },
  eyeText: { color: "#7C3AED", fontSize: 13 },
  primaryButton: {
    backgroundColor: "#7C3AED", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 32,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: "#F8F8FF", fontSize: 15, fontWeight: "700" },
  signupRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  signupText: { color: "#A0A0C0", fontSize: 14 },
  signupLink: { color: "#7C3AED", fontSize: 14, fontWeight: "600" },
});

export default LoginScreen;
