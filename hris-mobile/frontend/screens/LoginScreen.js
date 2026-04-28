import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!nik || !password) {
      setError('NIK dan Password wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(nik, password);
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa NIK dan password.');
    } finally {
      setLoading(false);
    }
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
            <View style={styles.logoBox}>
              <Ionicons name="briefcase" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Work Mate</Text>
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
              <Ionicons name="id-card-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
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
              <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          </View>

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

          <View style={styles.footerTextContainer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.footerTextLink}>Daftar di sini</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 30 },
  logoBox: { width: 60, height: 60, backgroundColor: '#8B5CF6', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 16, gap: 8 },
  errorText: { color: '#EF4444', fontSize: 13, flex: 1 },
  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontSize: 12, color: '#4B5563', marginBottom: 8, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF' },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 15, color: '#111827' },
  btnPrimary: { backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginBottom: 20, marginTop: 10 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.5 },
  footerTextContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { color: '#4B5563', fontSize: 13 },
  footerTextLink: { color: '#8B5CF6', fontSize: 13, fontWeight: 'bold' },
});