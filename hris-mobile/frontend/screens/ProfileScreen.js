import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const data = await api.employees.me();
      setProfile(data);
    } catch (err) {
      console.error('Profile load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </View>
    );
  }

  const employeeName = profile?.name || user?.employeeName || user?.nik || 'Employee';
  const department = profile?.department || '-';
  const position = profile?.position || '-';
  const email = profile?.email || user?.email || '-';
  const phone = profile?.phone || user?.phone || '-';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      <View style={styles.headerBackground}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.bodyContainer}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBox}>
              <Ionicons name="person" size={48} color="#8B5CF6" />
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{employeeName}</Text>
              <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={styles.verifiedIcon} />
            </View>
            <Text style={styles.userRole}>{position}</Text>
            <Text style={styles.userDepartment}>{department}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONTACT</Text>
            <View style={styles.cardInfo}>
              <View style={styles.itemRow}>
                <Ionicons name="mail" size={20} color="#8B5CF6" style={styles.itemIcon} />
                <Text style={styles.itemText}>{email}</Text>
              </View>
              <View style={[styles.itemRow, { marginBottom: 0 }]}>
                <Ionicons name="call" size={20} color="#8B5CF6" style={styles.itemIcon} />
                <Text style={styles.itemText}>{phone}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EMPLOYMENT</Text>
            <View style={styles.cardInfo}>
              <View style={styles.itemRow}>
                <Ionicons name="business" size={20} color="#8B5CF6" style={styles.itemIcon} />
                <Text style={styles.itemText}>{department}</Text>
              </View>
              <View style={styles.itemRow}>
                <Ionicons name="briefcase" size={20} color="#8B5CF6" style={styles.itemIcon} />
                <Text style={styles.itemText}>{position}</Text>
              </View>
              {profile?.contract_end && (
                <View style={[styles.itemRow, { marginBottom: 0 }]}>
                  <Ionicons name="calendar" size={20} color="#8B5CF6" style={styles.itemIcon} />
                  <Text style={styles.itemText}>Kontrak s/d {new Date(profile.contract_end).toLocaleDateString('id-ID')}</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBackground: { backgroundColor: '#8B5CF6', paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  logoutButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  bodyContainer: { paddingHorizontal: 20, paddingTop: 10 },
  avatarWrapper: { alignItems: 'center', marginBottom: 24 },
  avatarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EDEBFE', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginRight: 6 },
  verifiedIcon: {},
  userRole: { fontSize: 14, color: '#8B5CF6', fontWeight: '500' },
  userDepartment: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 10, letterSpacing: 1 },
  cardInfo: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  itemIcon: { marginRight: 12 },
  itemText: { fontSize: 14, color: '#374151' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', paddingVertical: 14, borderRadius: 12, marginTop: 10, gap: 8 },
  logoutBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});