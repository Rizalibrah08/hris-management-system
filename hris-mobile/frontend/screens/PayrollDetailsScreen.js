import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const formatCurrency = (n) => Number(n || 0).toLocaleString('id-ID');

export default function PayrollDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(false);

  const runItem = route.params?.item || {};
  const runId = runItem.id;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (runId) {
        const res = await api.payroll.myRunDetail(runId);
        const item = res?.items?.[0] || {};
        const run = res?.run || {};
        const components = res?.components || [];
        setSalary({ ...item, components, period_month: run.period_month });
      } else {
        const data = await api.payroll.mySalary();
        setSalary(data || runItem);
      }
    } catch {
      setSalary(runItem);
    } finally {
      setLoading(false);
    }
  }, [runId, runItem]);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  const data = salary || runItem || {};

  const periodLabel = formatDate(data.period_month || data.created_at);
  const baseSalary = Number(data.base_salary || data.salary || 0);
  const grossSalary = Number(data.gross_amount || data.gross || data.gross_salary || 0);
  const netSalary = Number(data.net_amount || data.net || data.take_home || 0);
  const getGross = () => grossSalary;

  const getComponents = () => {
    const earnings = [];
    const deductions = [];
    if (Array.isArray(data.components)) {
      data.components.forEach((c) => {
        const t = c.component_type || c.type;
        if (t === 'earning') {
          earnings.push(c);
        } else if (t === 'deduction') {
          deductions.push(c);
        }
      });
    }
    return { earnings, deductions };
  };

  const { earnings, deductions } = getComponents();

  if (loading && !salary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payroll and Tax</Text>
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
        <Text style={styles.headerTitle}>Payroll and Tax</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Total Working Hour Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Working Hour</Text>
          <Text style={styles.cardSubtitle}>Periode {periodLabel}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <View style={styles.statBoxHeader}>
                <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                <Text style={styles.statBoxTitle}>Gross</Text>
              </View>
              <Text style={styles.statBoxValue}>Rp {formatCurrency(getGross())}</Text>
            </View>
            
            <View style={[styles.statBox, { marginRight: 0, marginLeft: 8 }]}>
              <View style={styles.statBoxHeader}>
                <Ionicons name="wallet-outline" size={14} color="#9CA3AF" />
                <Text style={styles.statBoxTitle}>Net Pay</Text>
              </View>
              <Text style={styles.statBoxValue}>Rp {formatCurrency(netSalary)}</Text>
            </View>
          </View>
        </View>

        {/* Payroll Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payroll Details</Text>
          <Text style={styles.cardSubtitle}>Details about payroll</Text>
          
          <View style={styles.divider} />

          {earnings.map((e, i) => (
            <View key={`e-${i}`} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{e.component_name_snapshot || e.name || 'Earning'}</Text>
              <Text style={[styles.detailValue, { color: '#10B981' }]}>Rp {formatCurrency(e.amount)}+</Text>
            </View>
          ))}

          {deductions.map((d, i) => (
            <View key={`d-${i}`} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{d.component_name_snapshot || d.name || 'Deduction'}</Text>
              <Text style={[styles.detailValue, { color: '#EF4444' }]}>Rp {formatCurrency(Math.abs(d.amount))}-</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Salary</Text>
            <Text style={styles.totalValue}>Rp {formatCurrency(netSalary)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={async () => {
            const earningsRows = data.components
              ? data.components.filter(c => c.component_type === 'earning' || c.type === 'earning')
                  .map(c => `<tr><td>${c.component_name_snapshot || c.name || '-'}</td><td style="color:green">+Rp ${formatCurrency(c.amount)}</td></tr>`).join('')
              : '';
            const deductionRows = data.components
              ? data.components.filter(c => c.component_type === 'deduction' || c.type === 'deduction')
                  .map(c => `<tr><td>${c.component_name_snapshot || c.name || '-'}</td><td style="color:red">-Rp ${formatCurrency(c.amount)}</td></tr>`).join('')
              : '';
            const html = `<html><body style="font-family:sans-serif;padding:20px">
              <h2>Slip Gaji</h2>
              <p><strong>Periode:</strong> ${periodLabel}</p>
              <p><strong>Gaji Pokok:</strong> Rp ${formatCurrency(baseSalary)}</p>
              ${earningsRows ? `<h4>Pendapatan</h4><table style="width:100%">${earningsRows}</table>` : ''}
              ${deductionRows ? `<h4>Potongan</h4><table style="width:100%">${deductionRows}</table>` : ''}
              <h3>Total: Rp ${formatCurrency(netSalary)}</h3>
            </body></html>`;
            try {
              const { uri } = await Print.printToFileAsync({ html });
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
              }
            } catch {}
          }}
        >
          <Text style={styles.saveButtonText}>Simpan PDF</Text>
        </TouchableOpacity>
      </View>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
  },
  statBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statBoxTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  statBoxValue: {
    fontSize: 18,
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.7)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  floatingIconContainer: {
    position: 'absolute',
    top: -45,
    alignSelf: 'center',
    zIndex: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  floatingIconBox: {
    width: 90,
    height: 90,
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  btnClose: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  btnCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});