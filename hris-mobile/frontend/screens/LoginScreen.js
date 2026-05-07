import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Modal,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { getServerUrl, setServerUrl } from '../services/api';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);
  const [serverModal, setServerModal] = useState(false);
  const [serverUrl, setServerUrlState] = useState('');
  const [serverInput, setServerInput] = useState('');
  const [serverSaving, setServerSaving] = useState(false);
  const [serverMsg, setServerMsg] = useState('');

  useEffect(() => {
    (async () => {
      const savedNik = await AsyncStorage.getItem('hris_saved_nik');
      if (savedNik) setNik(savedNik);
      const url = await getServerUrl();
      setServerUrlState(url);
      setServerInput(url);
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
      } else {
        await AsyncStorage.removeItem('hris_saved_nik');
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa NIK dan password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServer = async () => {
    setServerSaving(true);
    setServerMsg('');
    const trimmed = serverInput.trim();
    if (!trimmed) {
      await setServerUrl(null);
      const url = await getServerUrl();
      setServerUrlState(url);
      setServerInput(url);
      setServerMsg('URL direset ke auto-detect');
    } else if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setServerMsg('URL harus diawali http:// atau https://');
    } else {
      await setServerUrl(trimmed);
      setServerUrlState(trimmed);
      setServerInput(trimmed);
      setServerMsg('URL server disimpan');
    }
    setServerSaving(false);
  };

  const isCustomUrl = serverUrl && !serverUrl.includes(':5000') || serverUrl && serverUrl.startsWith('https://');

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

          <TouchableOpacity style={styles.serverRow} onPress={() => setServerModal(true)}>
            <Ionicons name="server-outline" size={14} color="#9CA3AF" />
            <Text style={styles.serverLabel} numberOfLines={1}>
              {isCustomUrl ? serverUrl : 'Auto-detect (LAN)'}
            </Text>
            <Ionicons name="settings-outline" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={serverModal} transparent animationType="fade" onRequestClose={() => setServerModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setServerModal(false)}>
          <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
            <Text style={styles.modalTitle}>Pengaturan Server</Text>
            <Text style={styles.modalHint}>
              Gunakan ngrok jika HP & PC beda WiFi:{'\n'}
              <Text style={styles.modalCode}>ngrok http 5000</Text>
              {'\n'}Lalu salin URL https://xxxx.ngrok.io ke sini.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="https://xxxx.ngrok-free.app"
              value={serverInput}
              onChangeText={setServerInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            {serverMsg ? (
              <Text style={[styles.modalMsg, serverMsg.includes('disimpan') ? styles.modalMsgOk : {}]}>{serverMsg}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnReset} onPress={handleSaveServer} disabled={serverSaving}>
                <Text style={styles.modalBtnText}>{serverInput.trim() ? 'Simpan URL' : 'Reset ke Auto'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnClose} onPress={() => setServerModal(false)}>
                <Text style={styles.modalBtnCloseText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  rememberLabel: { fontSize: 14, color: '#474554' },
  serverRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  serverLabel: { fontSize: 11, color: '#9CA3AF', maxWidth: '80%' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 24 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#191c1f', marginBottom: 12 },
  modalHint: { fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 20 },
  modalCode: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#5341cd', fontWeight: '600' },
  modalInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#191c1f', marginBottom: 8 },
  modalMsg: { fontSize: 12, color: '#EF4444', marginBottom: 8 },
  modalMsgOk: { color: '#10B981' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalBtnReset: { flex: 1, backgroundColor: '#5341cd', paddingVertical: 12, borderRadius: 24, alignItems: 'center' },
  modalBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  modalBtnClose: { flex: 1, paddingVertical: 12, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB' },
  modalBtnCloseText: { color: '#6B7280', fontSize: 14 },
});
