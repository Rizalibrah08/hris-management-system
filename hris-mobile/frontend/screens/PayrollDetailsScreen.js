import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { api } from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const formatCurrency = (n) => Number(n || 0).toLocaleString('id-ID');
const formatPeriod = (d) => {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  } catch {
    return String(d).slice(0, 7);
  }
};

export default function PayrollDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);

  const payslipId = route.params?.payslipId;

  const fetchData = useCallback(async () => {
    if (!payslipId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setNotFound(false);
      const data = await api.payslips.detail(payslipId);
      setPayslip(data);
    } catch (err) {
      if (err.status === 404 || err.message?.includes('tidak ditemukan')) {
        setNotFound(true);
      } else {
        setNotFound(true);
      }
      setPayslip(null);
    } finally {
      setLoading(false);
    }
  }, [payslipId]);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  const getEarnings = () => (Array.isArray(payslip?.components) ? payslip.components.filter(c => c.component_type === 'earning') : []);
  const getDeductions = () => (Array.isArray(payslip?.components) ? payslip.components.filter(c => c.component_type === 'deduction') : []);
  const earnings = getEarnings();
  const deductions = getDeductions();
  const grossSalary = Number(payslip?.gross_amount || 0);
  const netSalary = Number(payslip?.net_amount || 0);
  const deductionTotal = Number(payslip?.deduction_amount || 0);

  const handleSavePdf = async () => {
    if (!payslip) return;
    setSavingPdf(true);
    try {
      const data = await api.payslips.pdf(payslip.id);
      const companyName = data.companyName || 'PT HRIS Indonesia';
      const companyAddress = data.companyAddress || '';
      const slipNumber = data.slip_number || '-';
      const period = formatPeriod(data.period_month);
      const publishedAt = formatDate(data.published_at);
      const employeeName = data.employee_name || '-';
      const department = data.department || '-';
      const position = data.position || '-';
      const nik = data.nik || '-';

      const earningsRows = (data.components || [])
        .filter(c => c.component_type === 'earning')
        .map(c => `<tr><td style="padding:6px 0">${c.component_name_snapshot || c.name || '-'}</td><td style="text-align:right;color:#16A34A;padding:6px 0">+ Rp ${formatCurrency(c.amount)}</td></tr>`)
        .join('');
      const deductionRows = (data.components || [])
        .filter(c => c.component_type === 'deduction')
        .map(c => `<tr><td style="padding:6px 0">${c.component_name_snapshot || c.name || '-'}</td><td style="text-align:right;color:#EF4444;padding:6px 0">- Rp ${formatCurrency(Math.abs(c.amount))}</td></tr>`)
        .join('');

      const html = `<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; color: #111827; }
  .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #8B5CF6; padding-bottom: 16px; }
  .company { font-size: 18px; font-weight: bold; }
  .company-addr { font-size: 12px; color: #6B7280; margin-top: 4px; }
  .slip-title { font-size: 16px; font-weight: bold; margin-top: 12px; }
  .meta { display: flex; justify-content: space-between; font-size: 12px; margin-top: 8px; color: #4B5563; }
  .info { margin: 16px 0; font-size: 13px; }
  .info-row { display: flex; padding: 4px 0; }
  .info-label { width: 130px; color: #6B7280; }
  .info-value { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 8px 0; }
  .section-title { font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 4px; color: #4B5563; }
  .total { display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #E5E7EB; margin-top: 12px; font-size: 16px; font-weight: bold; }
  .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 12px; }
</style></head>
<body>
  <div class="header">
    <div class="company">${companyName}</div>
    ${companyAddress ? `<div class="company-addr">${companyAddress}</div>` : ''}
    <div class="slip-title">SLIP GAJI</div>
    <div class="meta">
      <span>No: ${slipNumber}</span>
      <span>Periode: ${period}</span>
      <span>Tgl Terbit: ${publishedAt}</span>
    </div>
  </div>
  <div class="info">
    <div class="info-row"><div class="info-label">Nama</div><div class="info-value">${employeeName}</div></div>
    <div class="info-row"><div class="info-label">NIK</div><div class="info-value">${nik}</div></div>
    <div class="info-row"><div class="info-label">Departemen</div><div class="info-value">${department}</div></div>
    <div class="info-row"><div class="info-label">Jabatan</div><div class="info-value">${position}</div></div>
  </div>
  ${earningsRows ? `<div class="section-title">Pendapatan</div><table>${earningsRows}</table>` : ''}
  ${deductionRows ? `<div class="section-title">Potongan</div><table>${deductionRows}</table>` : ''}
  <div class="total">
    <span>Take Home Pay</span>
    <span>Rp ${formatCurrency(Number(data.net_amount || 0))}</span>
  </div>
  <div class="footer">
    Slip gaji ini dicetak secara digital pada ${new Date().toLocaleString('id-ID')}.<br/>
    Simpan sebagai bukti resmi penerimaan gaji.
  </div>
</body>
</html>`;

      const { base64 } = await Print.printToFileAsync({ html, base64: true });
      const fileName = `slip_gaji_${period.replace(/\s/g, '_')}_${Date.now()}.pdf`;
      const destUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(destUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(destUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Slip Gaji ${period}`,
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Tidak dapat mengunduh PDF slip gaji');
    } finally {
      setSavingPdf(false);
    }
  };

  if (loading && !payslip) {
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

  if (notFound || !payslip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Slip Gaji</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={80} color="#EDE9FE" />
          <Text style={styles.emptyTitle}>Slip Tidak Ditemukan</Text>
          <Text style={styles.emptySubtitle}>
            Slip mungkin telah dihapus atau belum diterbitkan oleh HR.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
              <Ionicons name="refresh" size={16} color="#8B5CF6" />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton2} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>Kembali</Text>
            </TouchableOpacity>
          </View>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Slip Header Card */}
        <View style={styles.card}>
          <View style={styles.slipHeaderRow}>
            <View>
              <Text style={styles.periodLabel}>{formatPeriod(payslip.period_month)}</Text>
              <Text style={styles.slipNumber}>{payslip.slip_number}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
              <Text style={styles.statusText}>Diterbitkan</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <View style={styles.statBoxHeader}>
                <Ionicons name="cash-outline" size={14} color="#9CA3AF" />
                <Text style={styles.statBoxTitle}>Gross</Text>
              </View>
              <Text style={styles.statBoxValue}>Rp {formatCurrency(grossSalary)}</Text>
            </View>

            <View style={[styles.statBox, { marginRight: 0, marginLeft: 8 }]}>
              <View style={styles.statBoxHeader}>
                <Ionicons name="wallet-outline" size={14} color="#9CA3AF" />
                <Text style={styles.statBoxTitle}>Take Home</Text>
              </View>
              <Text style={styles.statBoxValue}>Rp {formatCurrency(netSalary)}</Text>
            </View>
          </View>
        </View>

        {/* Employee Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Karyawan</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama</Text>
            <Text style={styles.infoValue}>{payslip.employee_name || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Departemen</Text>
            <Text style={styles.infoValue}>{payslip.department || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jabatan</Text>
            <Text style={styles.infoValue}>{payslip.position || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tgl Terbit</Text>
            <Text style={styles.infoValue}>{formatDate(payslip.published_at)}</Text>
          </View>
        </View>

        {/* Earnings Card */}
        {earnings.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pendapatan</Text>
            <View style={styles.divider} />
            {earnings.map((e, i) => (
              <View key={`e-${i}`} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{e.component_name_snapshot || e.name || 'Earning'}</Text>
                <Text style={[styles.detailValue, { color: '#10B981' }]}>+ Rp {formatCurrency(e.amount)}</Text>
              </View>
            ))}
            <View style={[styles.detailRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}>
              <Text style={styles.subtotalLabel}>Total Pendapatan</Text>
              <Text style={styles.subtotalValue}>Rp {formatCurrency(grossSalary)}</Text>
            </View>
          </View>
        )}

        {/* Deductions Card */}
        {deductions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Potongan</Text>
            <View style={styles.divider} />
            {deductions.map((d, i) => (
              <View key={`d-${i}`} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{d.component_name_snapshot || d.name || 'Deduction'}</Text>
                <Text style={[styles.detailValue, { color: '#EF4444' }]}>- Rp {formatCurrency(Math.abs(d.amount))}</Text>
              </View>
            ))}
            <View style={[styles.detailRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}>
              <Text style={styles.subtotalLabel}>Total Potongan</Text>
              <Text style={styles.subtotalValue}>Rp {formatCurrency(deductionTotal)}</Text>
            </View>
          </View>
        )}

        {/* Net Total Card */}
        <View style={[styles.card, styles.netCard]}>
          <Text style={styles.netLabel}>Take Home Pay</Text>
          <Text style={styles.netValue}>Rp {formatCurrency(netSalary)}</Text>
        </View>

      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, savingPdf && styles.saveButtonDisabled]}
          onPress={handleSavePdf}
          disabled={savingPdf}
        >
          {savingPdf ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="download" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Unduh PDF Slip</Text>
            </>
          )}
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
  slipHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  slipNumber: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  infoLabel: {
    width: 120,
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtotalLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  subtotalValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  netCard: {
    backgroundColor: '#8B5CF6',
  },
  netLabel: {
    fontSize: 14,
    color: '#EDE9FE',
    fontWeight: '600',
  },
  netValue: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEBFE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  backButton2: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
});
