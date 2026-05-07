import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const BIO_NIK_KEY = 'hris_biometric_nik';
const BIO_PASS_KEY = 'hris_biometric_pass';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioType, setBioType] = useState(null);

  useEffect(() => {
    (async () => {
      const savedNik = await AsyncStorage.getItem('hris_saved_nik');
      if (savedNik) setNik(savedNik);
      const bioNik = await SecureStore.getItemAsync(BIO_NIK_KEY);
      if (bioNik) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const hasBiometric = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (hasBiometric && enrolled && types.length > 0) {
          setBioAvailable(true);
          setBioType(types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
            ? 'Face ID' : 'Sidik Jari');
          setNik(bioNik);
        }
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!nik || !password) {
      setError('NIK dan Password wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(nik, password);
      if (remember) {
        await AsyncStorage.setItem('hris_saved_nik', nik);
        await SecureStore.setItemAsync(BIO_NIK_KEY, nik);
        await SecureStore.setItemAsync(BIO_PASS_KEY, password);
      } else {
        await AsyncStorage.removeItem('hris_saved_nik');
        await SecureStore.deleteItemAsync(BIO_NIK_KEY);
        await SecureStore.deleteItemAsync(BIO_PASS_KEY);
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa NIK dan password.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Masuk dengan ${bioType}`,
        fallbackLabel: 'Gunakan password',
      });
      if (result.success) {
        const savedNik = await SecureStore.getItemAsync(BIO_NIK_KEY);
        const savedPass = await SecureStore.getItemAsync(BIO_PASS_KEY);
        if (savedNik && savedPass) {
          setNik(savedNik);
          setPassword(savedPass);
          setLoading(true);
          try {
            await login(savedNik, savedPass);
          } catch (err) {
            setError(err.message || 'Login gagal dengan biometrik');
          } finally {
            setLoading(false);
          }
        }
      }
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <LinearGradient colors={['#5341cd', '#6c5ce7']} style={styles.logoBox}>
              <Ionicons name="briefcase" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.title}>Curated HR</Text>
            <Text style={styles.subtitle}>Masuk ke akun Anda</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>NIK</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="id-card-outline" size={20} color="#5341cd" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan NIK"
                value={nik}
                onChangeText={setNik}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#5341cd" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#5341cd" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember(!remember)}>
            <Ionicons name={remember ? 'checkbox' : 'square-outline'} size={22} color="#5341cd" />
            <Text style={styles.rememberLabel}>Simpan login</Text>
          </TouchableOpacity>

          {bioAvailable && (
            <TouchableOpacity
              style={[styles.btnBio, loading && styles.btnDisabled]}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Ionicons
                name={bioType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
                size={22} color="#5341cd"
              />
              <Text style={styles.btnBioText}>Masuk dengan {bioType}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnPrimaryText}>Masuk</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fd' },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 30 },
  logoBox: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#191c1f' },
  subtitle: { fontSize: 14, color: '#474554', marginTop: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 16, gap: 8 },
  errorText: { color: '#EF4444', fontSize: 13, flex: 1 },
  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontSize: 12, color: '#474554', marginBottom: 8, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e4dfff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#e1e2e6' },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 15, color: '#191c1f' },
  btnPrimary: { backgroundColor: '#5341cd', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginBottom: 20, marginTop: 10, shadowColor: '#5341cd', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.5 },
  btnBio: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#5341cd', paddingVertical: 14, borderRadius: 30, marginBottom: 12, gap: 8 },
  btnBioText: { color: '#5341cd', fontSize: 15, fontWeight: 'bold' },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  rememberLabel: { fontSize: 14, color: '#474554' },
});