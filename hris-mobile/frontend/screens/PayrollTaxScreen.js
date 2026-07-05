import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { api } from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const formatCurrency = (n) => Number(n || 0).toLocaleString('id-ID');
const formatPeriod = (d) => {
  if (!d) return '-';
  try {
    const date = new Date(d);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  } catch {
    return String(d).slice(0, 7);
  }
};

export default function PayrollTaxScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.payslips.my();
      setPayslips(Array.isArray(data) ? data : []);
    } catch {
      setPayslips([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  if (loading && payslips.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Slip Gaji</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Slip Gaji</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={['#8B5CF6']} />}
      >
        {payslips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color="#EDE9FE" />
            <Text style={styles.emptyTitle}>Belum Ada Slip Gaji</Text>
            <Text style={styles.emptySubtitle}>
              Slip gaji Anda akan muncul di sini setelah HR memproses dan menerbitkan payroll untuk periode tertentu.
            </Text>
          </View>
        ) : (
          payslips.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate('PayrollDetails', { payslipId: item.id })}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.monthTitle}>{formatPeriod(item.period_month)}</Text>
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                  <Text style={styles.statusText}>Diterbitkan</Text>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Slip No</Text>
                  <Text style={styles.statValueMono} numberOfLines={1} ellipsizeMode="tail">
                    {item.slip_number || '-'}
                  </Text>
                </View>

                <View style={styles.statBoxCenter}>
                  <Text style={styles.statLabel}>Take Home</Text>
                  <Text style={styles.statValue}>Rp {formatCurrency(item.net_amount)}</Text>
                </View>

                <View style={styles.statBoxRight}>
                  <Text style={styles.statLabel}>Tgl Terbit</Text>
                  <Text style={styles.statValue}>{formatDate(item.published_at)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDEBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statBox: {
    flex: 1.2,
  },
  statBoxCenter: {
    flex: 1,
  },
  statBoxRight: {
    flex: 0.9,
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    color: '#374151',
  },
  statValueMono: {
    fontSize: 11,
    color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
