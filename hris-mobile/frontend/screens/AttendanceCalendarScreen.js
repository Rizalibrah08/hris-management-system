import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function AttendanceCalendarScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);

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
            const hour = new Date(a.clock_in).getHours();
            let status = 'hadir';
            if (hour >= 9) status = 'telat';
            if (a.status === 'Izin' || a.status === 'Sakit') status = 'izin';
            map[day] = { ...a, dayStatus: status };
          }
        }
      }
      setAttendanceMap(map);
    } catch {
      setAttendanceMap({});
    } finally {
      setLoading(false);
    }
  }, []);

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

  const stats = {
    hadir: Object.values(attendanceMap).filter(a => a.dayStatus === 'hadir' || a.dayStatus === 'telat').length,
    telat: Object.values(attendanceMap).filter(a => a.dayStatus === 'telat').length,
    izin: Object.values(attendanceMap).filter(a => a.dayStatus === 'izin').length,
    total: new Date(currentYear, currentMonth + 1, 0).getDate(),
  };

  const weeks = getCalendarDays();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
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
    paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20,
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
