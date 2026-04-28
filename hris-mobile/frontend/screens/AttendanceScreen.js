import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function AttendanceScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [attStatus, setAttStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockOutLoading, setClockOutLoading] = useState(false);
  const [isClockOutVisible, setIsClockOutVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [status, hist] = await Promise.all([
        api.attendance.myStatus(),
        api.attendance.myHistory(),
      ]);
      setAttStatus(status);
      setHistory(hist || []);
    } catch (err) {
      console.error('Attendance load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isFocused) loadData(); }, [isFocused, loadData]);

  const handleClockOut = async () => {
    setClockOutLoading(true);
    try {
      await api.attendance.clockOut(attStatus?.attendance?.id);
      setIsClockOutVisible(false);
      setIsSuccessVisible(true);
      loadData();
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Clock out gagal');
    } finally {
      setClockOutLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calcHours = (clockIn, clockOut) => {
    if (!clockIn) return '-';
    const start = new Date(clockIn);
    const end = clockOut ? new Date(clockOut) : new Date();
    const diffMs = end - start;
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} Hrs`;
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

  const hasClockedIn = attStatus?.hasClockedIn;
  const hasClockedOut = attStatus?.hasClockedOut;
  const todayAtt = attStatus?.attendance;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerBackground}>
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{hasClockedIn ? 'Sudah Clock In!' : "Let's Clock In!"}</Text>
                <Text style={styles.headerSubtitle}>{hasClockedIn ? 'Jangan lupa clock out sebelum pulang' : "Don't miss your clock in schedule"}</Text>
              </View>
              <Ionicons name="time" size={60} color="#FFFFFF" style={styles.headerImage} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Total Working Hour</Text>
          <Text style={styles.cardSubtitle}>Hari Ini</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <View style={styles.statBoxHeader}>
                <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                <Text style={styles.statBoxTitle}>Today</Text>
              </View>
              <Text style={styles.statBoxValue}>{calcHours(todayAtt?.clock_in, todayAtt?.clock_out)}</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statBoxHeader}>
                <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                <Text style={styles.statBoxTitle}>Clock In</Text>
              </View>
              <Text style={styles.statBoxValue}>{formatTime(todayAtt?.clock_in)}</Text>
            </View>
          </View>

          {hasClockedOut ? (
            <TouchableOpacity style={styles.clockedOutButtonFull} disabled={true}>
              <Text style={styles.clockedOutButtonText}>Clocked Out</Text>
            </TouchableOpacity>
          ) : hasClockedIn ? (
            <TouchableOpacity style={styles.clockOutButtonFull} onPress={() => setIsClockOutVisible(true)}>
              <Text style={styles.clockOutButtonText}>Clock Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.clockInButton} onPress={() => navigation.navigate('ClockIn')}>
              <Text style={styles.clockInButtonText}>Clock In Now</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Riwayat Kehadiran</Text>
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>Belum ada data kehadiran</Text>
            </View>
          ) : (
            history.slice(0, 10).map((item) => (
              <TouchableOpacity key={item.id} style={styles.historyCard} onPress={() => navigation.navigate('AttendanceDetails', { item })}>
                <View style={styles.historyCardHeader}>
                  <Ionicons name="calendar-outline" size={16} color="#8B5CF6" />
                  <Text style={styles.historyDate}>{formatDate(item.clock_in)}</Text>
                  <View style={[styles.statusBadge, item.status === 'Aktif' ? styles.statusActive : styles.statusLate]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.historyDetails}>
                  <View style={styles.historyBox}>
                    <Text style={styles.historyLabel}>Total Hours</Text>
                    <Text style={styles.historyValue}>{calcHours(item.clock_in, item.clock_out)}</Text>
                  </View>
                  <View style={styles.historyBox}>
                    <Text style={styles.historyLabel}>Clock In & Out</Text>
                    <Text style={styles.historyValue}>{formatTime(item.clock_in)} — {formatTime(item.clock_out)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={isClockOutVisible} onRequestClose={() => setIsClockOutVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsClockOutVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.bottomSheet}>
            <View style={styles.floatingIconContainer}>
              <View style={styles.floatingIconBox}>
                <Ionicons name="time-outline" size={40} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.modalTitle}>Confirm Clock Out</Text>
            <Text style={styles.modalSubtitle}>Once you clock out, you won't be able to edit this time.</Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleClockOut} disabled={clockOutLoading}>
              {clockOutLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnPrimaryText}>Yes, Clock Out</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setIsClockOutVisible(false)}>
              <Text style={styles.btnSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={isSuccessVisible} onRequestClose={() => setIsSuccessVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsSuccessVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.bottomSheet}>
            <View style={styles.floatingIconContainer}>
              <View style={styles.floatingIconBox}>
                <Ionicons name="checkmark-circle" size={40} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.modalTitle}>Clock Out Berhasil!</Text>
            <Text style={styles.modalSubtitle}>Anda sudah clock out. Selamat istirahat!</Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsSuccessVisible(false)}>
              <Text style={styles.btnPrimaryText}>Tutup</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  headerBackground: { paddingTop: 40, paddingBottom: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, color: '#E5E7EB' },
  headerImage: { opacity: 0.9, marginRight: 10 },
  mainCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginHorizontal: 20, marginTop: -40, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  cardSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { flex: 1, borderWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#FAFAFA', borderRadius: 12, padding: 16, marginRight: 10 },
  statBoxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statBoxTitle: { fontSize: 13, color: '#6B7280', marginLeft: 6, fontWeight: '500' },
  statBoxValue: { fontSize: 18, fontWeight: '600', color: '#111827' },
  clockInButton: { backgroundColor: '#7C3AED', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  clockInButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  clockOutButtonFull: { backgroundColor: '#2D2D2D', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  clockOutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  clockedOutButtonFull: { backgroundColor: '#C4B5FD', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  clockedOutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  historyContainer: { marginTop: 16, paddingHorizontal: 20 },
  historyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  historyCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  historyDate: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginLeft: 8, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusLate: { backgroundColor: '#FEF3C7' },
  statusText: { fontSize: 11, fontWeight: '600' },
  historyDetails: { flexDirection: 'row', borderWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#FAFAFA', borderRadius: 12, padding: 12 },
  historyBox: { flex: 1 },
  historyLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  historyValue: { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#6B7280', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(31, 41, 55, 0.7)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  floatingIconContainer: { position: 'absolute', top: -45, alignSelf: 'center', zIndex: 10, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  floatingIconBox: { width: 90, height: 90, backgroundColor: '#8B5CF6', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  modalSubtitle: { fontSize: 14, color: '#4B5563', textAlign: 'center', lineHeight: 22, marginBottom: 30, paddingHorizontal: 10 },
  btnPrimary: { backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 30, alignItems: 'center', width: '100%', marginBottom: 16 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  btnSecondary: { backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 30, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#8B5CF6' },
  btnSecondaryText: { color: '#8B5CF6', fontSize: 15, fontWeight: 'bold' },
});