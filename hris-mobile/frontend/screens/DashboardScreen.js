import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await api.dashboard.mobile();
      setDashboard(data);
    } catch (err) {
      console.error('Dashboard load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadDashboard(); }, [loadDashboard]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

  const clockInInfo = dashboard?.todayClockIn;
  const employeeName = user?.employeeName || user?.nik || 'Employee';
  const totalEmployees = dashboard?.totalEmployees || 0;
  const attendanceRate = dashboard?.attendanceRate || 0;
  const pendingLeave = dashboard?.pendingLeave || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="happy-outline" size={28} color="#8B5CF6" style={styles.avatarIcon} />
            </TouchableOpacity>
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{employeeName}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={styles.verifiedIcon} />
              </View>
              <Text style={styles.userRole}>{user?.role || 'Employee'}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryBanner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>My Work Summary</Text>
            <Text style={styles.bannerSubtitle}>
              {clockInInfo ? 'Sudah clock in hari ini' : 'Belum clock in hari ini'}
            </Text>
          </View>
          <Ionicons name="time" size={50} color="#FFFFFF" style={{ opacity: 0.8 }} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{totalEmployees}</Text>
            <Text style={styles.statLabel}>Karyawan</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-done" size={24} color="#10B981" />
            <Text style={styles.statValue}>{attendanceRate}%</Text>
            <Text style={styles.statLabel}>Kehadiran</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{pendingLeave}</Text>
            <Text style={styles.statLabel}>Cuti Pending</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attendance Hari Ini</Text>
          {clockInInfo ? (
            <View style={styles.attendanceRow}>
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Clock In</Text>
                <Text style={styles.attendanceValue}>
                  {clockInInfo.clock_in ? new Date(clockInInfo.clock_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </Text>
              </View>
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Clock Out</Text>
                <Text style={styles.attendanceValue}>
                  {clockInInfo.clock_out ? new Date(clockInInfo.clock_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.illustrationContainer}>
              <Ionicons name="enter-outline" size={60} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>Belum Clock In</Text>
              <Text style={styles.emptyText}>Silakan clock in untuk mencatat kehadiran Anda hari ini.</Text>
              <TouchableOpacity style={styles.clockInButton} onPress={() => navigation.navigate('ClockIn')}>
                <Text style={styles.clockInButtonText}>Clock In Sekarang</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('Attendance')}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#EDEBFE' }]}>
                <Ionicons name="calendar" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionLabel}>Kehadiran</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('Leave')}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="document-text" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.quickActionLabel}>Cuti</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('PayrollTax')}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="wallet" size={24} color="#10B981" />
              </View>
              <Text style={styles.quickActionLabel}>Gaji</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('Profile')}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="person" size={24} color="#EF4444" />
              </View>
              <Text style={styles.quickActionLabel}>Profil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EDEBFE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarIcon: {},
  userDetails: { justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginRight: 4 },
  verifiedIcon: {},
  userRole: { fontSize: 13, color: '#8B5CF6' },
  headerActions: { flexDirection: 'row' },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  summaryBanner: { backgroundColor: '#8B5CF6', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  bannerSubtitle: { color: '#EDEBFE', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  illustrationContainer: { alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 12, marginBottom: 8 },
  emptyText: { fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18 },
  attendanceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  attendanceItem: { alignItems: 'center' },
  attendanceLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  attendanceValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  clockInButton: { backgroundColor: '#8B5CF6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, marginTop: 12 },
  clockInButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionItem: { alignItems: 'center', flex: 1 },
  quickActionIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionLabel: { fontSize: 12, color: '#4B5563' },
});