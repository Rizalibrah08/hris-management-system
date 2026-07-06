import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function LeaveScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Pending');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaves = useCallback(async () => {
    try {
      const data = await api.leave.myList();
      setLeaves(data || []);
    } catch (err) {
      console.error('Leave load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (isFocused) loadLeaves(); }, [isFocused, loadLeaves]);

  const tabs = ['Pending', 'Approved', 'Rejected'];
  const filtered = leaves.filter((l) => {
    if (activeTab === 'Pending') return l.status === 'Pending';
    if (activeTab === 'Approved') return l.status === 'Approved';
    return l.status === 'Rejected';
  });

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const dayCount = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e - s) / 86400000) + 1;
  };

  const statusColor = (status) => {
    if (status === 'Pending') return '#F59E0B';
    if (status === 'Approved') return '#10B981';
    return '#EF4444';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#8B5CF6" /></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadLeaves(); }} colors={['#7C3AED']} />}
      >
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerBackground}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Leave Summary</Text>
                <Text style={styles.headerSubtitle}>Kelola cuti Anda</Text>
              </View>
              <Ionicons name="airplane" size={60} color="rgba(255,255,255,0.2)" style={styles.headerImage} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Total Leave</Text>
          <Text style={styles.cardSubtitle}>Statistik cuti Anda</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <View style={styles.statBoxHeader}>
                <View style={[styles.dotIndicator, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statBoxTitle}>Disetujui</Text>
              </View>
              <Text style={styles.statBoxValue}>{leaves.filter(l => l.status === 'Approved').length}</Text>
            </View>
            <View style={[styles.statBox, { marginRight: 0 }]}>
              <View style={styles.statBoxHeader}>
                <View style={[styles.dotIndicator, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.statBoxTitle}>Pending</Text>
              </View>
              <Text style={styles.statBoxValue}>{pendingCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab} style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]} onPress={() => setActiveTab(tab)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                {tab === 'Pending' && pendingCount > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{pendingCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentArea}>
          {filtered.length === 0 ? (
            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Leave {activeTab}</Text>
              <View style={styles.emptyStateContainer}>
                <Ionicons name="briefcase-outline" size={60} color="#EDE9FE" />
                <Text style={styles.emptyStateTitle}>Tidak ada cuti {activeTab.toLowerCase()}</Text>
                <Text style={styles.emptyStateDesc}>{activeTab === 'Pending' ? 'Klik "Submit Leave" untuk mengajukan cuti' : 'Belum ada data'}</Text>
              </View>
            </View>
          ) : (
            filtered.map((item) => (
              <View key={item.id} style={styles.recordCard}>
                <View style={styles.recordDateRow}>
                  <Ionicons name="receipt-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.recordDateText}>{formatDate(item.start_date)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.recordDetailsBox}>
                  <View style={styles.recordDetailsRow}>
                    <View style={styles.recordColumn}>
                      <Text style={styles.recordLabel}>Tanggal</Text>
                      <Text style={styles.recordValue}>{formatDate(item.start_date)} - {formatDate(item.end_date)}</Text>
                    </View>
                    <View style={styles.recordColumn}>
                      <Text style={styles.recordLabel}>Durasi</Text>
                      <Text style={styles.recordValue}>{dayCount(item.start_date, item.end_date)} Hari</Text>
                    </View>
                  </View>
                  {item.reason ? <Text style={styles.recordReason} numberOfLines={2}>{item.reason}</Text> : null}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.navigate('SubmitLeave')}>
          <Text style={styles.submitBtnText}>Submit Leave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 20 },
  headerBackground: { paddingBottom: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, position: 'relative' },
  headerTextContainer: { flex: 1, zIndex: 2 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, color: '#E5E7EB' },
  headerImage: { position: 'absolute', right: 20, top: 5, transform: [{ rotate: '15deg' }] },
  mainCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginHorizontal: 20, marginTop: -40, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4, marginBottom: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { flex: 1, borderWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#FAFAFA', borderRadius: 10, padding: 12, marginRight: 8 },
  statBoxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dotIndicator: { width: 6, height: 6, borderRadius: 3 },
  statBoxTitle: { fontSize: 11, color: '#4B5563', marginLeft: 4, fontWeight: '600' },
  statBoxValue: { fontSize: 18, color: '#111827', fontWeight: '500' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 25, marginHorizontal: 20, marginTop: 20, padding: 5 },
  tabButton: { flex: 1, paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  tabButtonActive: { backgroundColor: '#8B5CF6' },
  tabText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF' },
  badgeContainer: { backgroundColor: '#EF4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  contentArea: { marginTop: 20, marginHorizontal: 20 },
  contentCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, minHeight: 200 },
  contentTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyStateTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  emptyStateDesc: { fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18 },
  recordCard: { marginBottom: 16 },
  recordDateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  recordDateText: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginLeft: 8, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600' },
  recordDetailsBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  recordDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  recordColumn: { flex: 1 },
  recordLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  recordValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  recordReason: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  footer: { backgroundColor: '#F3F4F6', paddingHorizontal: 20, paddingTop: 10 },
  submitBtn: { backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginBottom: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});