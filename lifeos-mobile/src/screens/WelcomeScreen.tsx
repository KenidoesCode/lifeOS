import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { loginAsGuest, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const [googleRequest, googleResponse, googlePromptAsync] = 
    Google.useAuthRequest({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    });

  useEffect(() => {
    handleGoogleResponse();
  }, [googleResponse]);

  const handleGoogleResponse = async () => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      if (authentication?.accessToken) {
        setLoading(true);
        try {
          const userInfoRes = await fetch(
            'https://www.googleapis.com/userinfo/v2/me',
            { headers: { Authorization: `Bearer ${authentication.accessToken}` } }
          );
          const userInfo = await userInfoRes.json();
          await loginWithGoogle({
            googleId: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
          });
        } catch (err) {
          Alert.alert('Error', 'Google sign in failed');
        }
        setLoading(false);
      }
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await loginAsGuest();
    } catch (err) {
      Alert.alert('Error', 'Failed to continue as guest');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo area */}
      <View style={styles.topSection}>
        <Text style={styles.appName}>LifeOS</Text>
        <Text style={styles.tagline}>Your second brain.</Text>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: '#7C3AED' }]} />
          <View style={[styles.dot, { backgroundColor: '#06B6D4' }]} />
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Register' as never)}
        >
          <Text style={styles.primaryButtonText}>Get started →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.secondaryButtonText}>
            I already have an account
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => googlePromptAsync()}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGuest} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#7C3AED" />
          ) : (
            <Text style={styles.guestText}>
              Skip for now — no account needed
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our Terms & Privacy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080810',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
    appName: {
    fontSize: 48,
    fontWeight: '800',
    color: '#F8F8FF',
    letterSpacing: -2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#505070',
    marginBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomSection: {
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#F8F8FF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#A0A0C0',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    color: '#505070',
    fontSize: 13,
  },
  googleButton: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8F8FF',
  },
  googleButtonText: {
    color: '#F8F8FF',
    fontSize: 15,
    fontWeight: '500',
  },
  guestText: {
    color: '#505070',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 4,
  },
  terms: {
    color: '#505070',
    fontSize: 11,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
