import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export default function ClockInScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.attendance.myStatus();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) fetchStatus();
  }, [isFocused, fetchStatus]);

  const employeeName = user?.employeeName || user?.nik || '-';
  const today = formatDate(new Date().toISOString());
  const hasClockedIn = status?.hasClockedIn;
  const hasClockedOut = status?.hasClockedOut;
  const todayAtt = status?.attendance;
  const isClockedIn = hasClockedIn && !hasClockedOut;

  return (
    <View style={styles.container}>
      <View style={styles.mapBackground}>
        <View style={styles.radiusCircle}>
          <View style={styles.avatarCircle}>
            <View style={styles.avatarInner}>
              <Ionicons name="person" size={24} color="#8B5CF6" />
            </View>
          </View>
        </View>
      </View>

      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clock In Area</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <View style={styles.bottomSheet}>
        <View style={styles.banner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>
              {hasClockedOut ? 'You have clocked out!' : isClockedIn ? 'You are already clocked in!' : 'You are in the clock-in area!'}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {hasClockedOut ? 'Your attendance for today has been recorded' : isClockedIn ? 'You can press clock out if you are done' : 'Now you can press clock in in this area'}
            </Text>
          </View>
          <View style={styles.bannerIconContainer}>
            <Ionicons name="time" size={50} color="#FFFFFF" style={{ opacity: 0.9 }} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>MY PROFILE</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="happy" size={40} color="#8B5CF6" />
          </View>
          <View style={styles.profileDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{employeeName}</Text>
              <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={styles.verifiedIcon} />
            </View>
            <Text style={styles.profileDate}>{today}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>SCHEDULE</Text>
        <View style={styles.scheduleContainer}>
          <View style={styles.scheduleBox}>
            <Text style={styles.scheduleLabel}>CLOCK IN</Text>
            <Text style={styles.scheduleTime}>
              {todayAtt?.clock_in ? new Date(todayAtt.clock_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '09:00'}
            </Text>
          </View>
          <View style={styles.scheduleBox}>
            <Text style={styles.scheduleLabel}>CLOCK OUT</Text>
            <Text style={styles.scheduleTime}>
              {todayAtt?.clock_out ? new Date(todayAtt.clock_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '05:00'}
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#7C3AED" style={{ marginVertical: 16 }} />
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (hasClockedOut) {
                navigation.navigate('Attendance');
              } else if (isClockedIn) {
                navigation.navigate('Camera', { action: 'clockout', attendanceId: todayAtt?.id });
              } else {
                navigation.navigate('Camera', { action: 'clockin' });
              }
            }}
          >
            <Text style={styles.actionButtonText}>
              {hasClockedOut ? 'View Attendance' : isClockedIn ? 'Selfie To Clock Out' : 'Selfie To Clock In'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  mapBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center' },
  radiusCircle: {
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1, borderColor: '#8B5CF6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 80,
  },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#8B5CF6',
  },
  avatarInner: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EDEBFE', alignItems: 'center', justifyContent: 'center',
  },
  headerSafeArea: { zIndex: 10 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  bottomSheet: {
    position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10,
  },
  banner: {
    backgroundColor: '#7C3AED', borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', marginBottom: 24, overflow: 'hidden',
  },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  bannerSubtitle: { color: '#E5E7EB', fontSize: 13 },
  bannerIconContainer: { position: 'relative', width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#4B5563', marginBottom: 12 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA',
    borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 16, padding: 16, marginBottom: 24,
  },
  profileAvatar: {
    width: 64, height: 64, borderRadius: 16, backgroundColor: '#C4B5FD',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  profileDetails: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  profileName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginRight: 6 },
  profileDate: { fontSize: 13, color: '#8B5CF6' },
  scheduleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  scheduleBox: {
    flex: 1, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#F3F4F6',
    borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 4,
  },
  scheduleLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 8, letterSpacing: 0.5 },
  scheduleTime: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  actionButton: { backgroundColor: '#7C3AED', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
