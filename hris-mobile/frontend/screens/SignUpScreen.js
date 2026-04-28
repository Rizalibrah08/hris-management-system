import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function SignUpScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !nik || !password) {
      Alert.alert('Error', 'Nama, NIK, dan Password wajib diisi');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password dan konfirmasi password tidak sama');
      return;
    }
    if (!isAgreed) {
      Alert.alert('Error', 'Anda harus menyetujui terms & conditions');
      return;
    }
    setLoading(true);
    try {
      await register({ name, nik, email: email || null, phone: phone || null, password });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      Alert.alert('Registrasi Gagal', err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Ionicons name="briefcase" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Work Mate</Text>
            <Text style={styles.subtitle}>Daftar Akun Baru</Text>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="Masukkan nama lengkap" value={name} onChangeText={setName} />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>NIK</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="id-card-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="Nomor Induk Karyawan" value={nik} onChangeText={setNik} autoCapitalize="none" />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email (opsional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>No. HP (opsional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="+62..." keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="Buat password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Konfirmasi Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="Ulangi password" secureTextEntry={!showPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
            </View>
          </View>

          <View style={styles.termsContainer}>
            <TouchableOpacity style={[styles.checkbox, isAgreed && styles.checkboxActive]} onPress={() => setIsAgreed(!isAgreed)}>
              {isAgreed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </TouchableOpacity>
            <Text style={styles.termsText}>Saya menyetujui <Text style={styles.linkText}>Terms & Conditions</Text></Text>
          </View>

          <TouchableOpacity style={[styles.btnPrimary, (!isAgreed || loading) && styles.btnDisabled]} onPress={handleRegister} disabled={!isAgreed || loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnPrimaryText}>Daftar</Text>}
          </TouchableOpacity>

          <View style={styles.footerTextContainer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerTextLink}>Masuk di sini</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 30 },
  header: { alignItems: 'center', marginBottom: 24 },
  logoBox: { width: 60, height: 60, backgroundColor: '#8B5CF6', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  inputWrapper: { marginBottom: 14 },
  inputLabel: { fontSize: 12, color: '#4B5563', marginBottom: 8, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF' },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 15, color: '#111827' },
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 6 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#8B5CF6', borderRadius: 6, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#8B5CF6' },
  termsText: { fontSize: 13, color: '#111827' },
  linkText: { color: '#8B5CF6', fontWeight: '500' },
  btnPrimary: { backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginBottom: 16 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.5 },
  footerTextContainer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#4B5563', fontSize: 13 },
  footerTextLink: { color: '#8B5CF6', fontSize: 13, fontWeight: 'bold' },
});