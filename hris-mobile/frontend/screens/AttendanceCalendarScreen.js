import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Parse "HH:MM" threshold string → minutes since midnight (default 09:00 = 540).
function parseThreshold(value) {
  if (!value || typeof value !== 'string') return 9 * 60;
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 9 * 60;
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const mm = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return h * 60 + mm;
}

// Tentukan dayStatus dari record attendance.
// Prioritas: status DB ('Telat'/'Tepat Waktu'/'Izin'/'Sakit'/'Cuti').
// Fallback (data lama status='Aktif'): hitung client-side vs threshold.
function computeDayStatus(a, thresholdMin) {
  if (!a) return null;
  if (a.status === 'Izin' || a.status === 'Sakit' || a.status === 'Cuti') return 'izin';
  if (a.status === 'Telat') return 'telat';
  if (a.status === 'Tepat Waktu') return 'hadir';
  // Fallback untuk data lama dengan status 'Aktif'
  if (a.clock_in) {
    const d = new Date(a.clock_in);
    const clockMin = d.getHours() * 60 + d.getMinutes();
    return clockMin > thresholdMin ? 'telat' : 'hadir';
  }
  return null;
}

export default function AttendanceCalendarScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [lateThreshold, setLateThreshold] = useState(9 * 60); // default 09:00

  useEffect(() => {
    api.company.getLocation()
      .then((s) => {
        if (s && s.lateThresholdHour) setLateThreshold(parseThreshold(s.lateThresholdHour));
      })
      .catch(() => null);
  }, []);

  const fetchMonth = useCallback(async (year, month) => {
    setLoading(true);
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    try {
      const data = await api.attendance.myHistory(monthStr);
      const map = {};
      if (Array.isArray(data)) {
        for (const a of data) {
          if (a.clock_in) {
            const day = new Date(a.clock_in).getDate();
            const status = computeDayStatus(a, lateThreshold);
            if (status) map[day] = { ...a, dayStatus: status };
          }
        }
      }
      setAttendanceMap(map);
    } catch {
      setAttendanceMap({});
    } finally {
      setLoading(false);
    }
  }, [lateThreshold]);

  useEffect(() => {
    fetchMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchMonth]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const weeks = [];
    let dayCounter = 1;
    let nextMonthDay = 1;

    for (let row = 0; row < 6; row++) {
      const week = [];
      for (let col = 0; col < 7; col++) {
        const cellIndex = row * 7 + col;
        if (cellIndex < firstDay) {
          week.push({ day: daysInPrevMonth - firstDay + col + 1, dimmed: true });
        } else if (dayCounter > daysInMonth) {
          week.push({ day: nextMonthDay++, dimmed: true });
        } else {
          const day = dayCounter++;
          const att = attendanceMap[day];
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          week.push({ day, att, isToday });
        }
      }
      weeks.push(week);
      if (dayCounter > daysInMonth) break;
    }
    return weeks;
  };

  const getDayColor = (att) => {
    if (!att) return '#F3F4F6';
    switch (att.dayStatus) {
      case 'hadir': return '#D1FAE5';
      case 'telat': return '#FEF3C7';
      case 'izin': return '#DBEAFE';
      default: return '#D1FAE5';
    }
  };

  const getDayTextColor = (att) => {
    if (!att) return '#9CA3AF';
    switch (att.dayStatus) {
      case 'hadir': return '#065F46';
      case 'telat': return '#92400E';
      case 'izin': return '#1E40AF';
      default: return '#065F46';
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Hitung hari kerja (Senin-Jumat) sampai hari ini (atau seluruh bulan jika bulan lampau).
  const effectiveDay = (currentYear === today.getFullYear() && currentMonth === today.getMonth())
    ? today.getDate()
    : daysInMonth;
  let workingDays = 0;
  for (let d = 1; d <= effectiveDay; d++) {
    const dow = new Date(currentYear, currentMonth, d).getDay();
    if (dow !== 0 && dow !== 6) workingDays += 1;
  }
  const hadirCount = Object.values(attendanceMap).filter(a => a.dayStatus === 'hadir').length;
  const telatCount = Object.values(attendanceMap).filter(a => a.dayStatus === 'telat').length;
  const izinCount = Object.values(attendanceMap).filter(a => a.dayStatus === 'izin').length;
  const alphaCount = Math.max(0, workingDays - hadirCount - telatCount - izinCount);

  const stats = {
    hadir: hadirCount + telatCount,
    telat: telatCount,
    izin: izinCount,
    alpha: alphaCount,
    workingDays,
    total: daysInMonth,
  };

  const weeks = getCalendarDays();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: insets.top || 40 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kalender Kehadiran</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth}>
              <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthNames[currentMonth]} {currentYear}</Text>
            <TouchableOpacity onPress={nextMonth}>
              <Ionicons name="chevron-forward" size={24} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.statValue, { color: '#065F46' }]}>{stats.hadir}</Text>
              <Text style={[styles.statLabel, { color: '#065F46' }]}>Hadir</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.statValue, { color: '#92400E' }]}>{stats.telat}</Text>
              <Text style={[styles.statLabel, { color: '#92400E' }]}>Telat</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.statValue, { color: '#1E40AF' }]}>{stats.izin}</Text>
              <Text style={[styles.statLabel, { color: '#1E40AF' }]}>Izin</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.statValue, { color: '#991B1B' }]}>{stats.alpha}</Text>
              <Text style={[styles.statLabel, { color: '#991B1B' }]}>Alpha</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              Bulan ini: {stats.workingDays} hari kerja, {stats.hadir} hadir, {stats.telat} telat, {stats.izin} izin, {stats.alpha} alpha
            </Text>
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.dayHeaderRow}>
              {dayHeaders.map(d => <Text key={d} style={styles.dayHeaderText}>{d}</Text>)}
            </View>
            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map((cell, ci) => (
                  <View key={ci} style={styles.dayCell}>
                    <View style={[
                      styles.dayCircle,
                      cell.isToday && styles.todayCircle,
                      !cell.dimmed && { backgroundColor: getDayColor(cell.att) },
                    ]}>
                      <Text style={[
                        styles.dayText,
                        cell.dimmed && styles.dimmedText,
                        !cell.dimmed && { color: getDayTextColor(cell.att) },
                        cell.isToday && styles.todayText,
                      ]}>{cell.day}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#D1FAE5' }]} /><Text style={styles.legendText}>Hadir</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#FEF3C7' }]} /><Text style={styles.legendText}>Telat</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#DBEAFE' }]} /><Text style={styles.legendText}>Izin</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#FEE2E2' }]} /><Text style={styles.legendText}>Alpha</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#F3F4F6' }]} /><Text style={styles.legendText}>Tidak Hadir</Text></View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 20,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDEBFE', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 30 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthLabel: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 8 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 2 },
  summaryCard: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 10, marginBottom: 16 },
  summaryText: { fontSize: 12, color: '#374151', textAlign: 'center' },
  calendarCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 16 },
  dayHeaderRow: { flexDirection: 'row', marginBottom: 8 },
  dayHeaderText: { flex: 1, textAlign: 'center', fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  todayCircle: { borderWidth: 2, borderColor: '#8B5CF6' },
  dayText: { fontSize: 13, fontWeight: '600' },
  dimmedText: { color: '#D1D5DB' },
  todayText: { color: '#8B5CF6', fontWeight: 'bold' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: '#6B7280' },
});
