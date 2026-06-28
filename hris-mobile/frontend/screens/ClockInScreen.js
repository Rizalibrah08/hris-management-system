import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

// Default office location (contoh: Jakarta)
const OFFICE_LAT = -6.2088;
const OFFICE_LNG = 106.8456;
const OFFICE_RADIUS = 500; // meter

const OFFICE_LOCATION = {
  latitude: OFFICE_LAT,
  longitude: OFFICE_LNG,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function ClockInScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [distance, setDistance] = useState(null);

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

  const getLocation = useCallback(async () => {
    try {
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
      if (permStatus !== 'granted') {
        setErrorMsg('Izin lokasi ditolak');
        Alert.alert('Izin Lokasi Diperlukan', 'Aplikasi membutuhkan akses lokasi untuk absensi GPS.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);
      setErrorMsg(null);

      // Hitung jarak ke kantor (meter)
      const dist = haversineDistance(coords.latitude, coords.longitude, OFFICE_LAT, OFFICE_LNG);
      setDistance(Math.round(dist));
    } catch (err) {
      setErrorMsg('Gagal mendapatkan lokasi');
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchStatus();
      getLocation();
    }
  }, [isFocused, fetchStatus, getLocation]);

  const employeeName = user?.employeeName || user?.nik || '-';
  const today = formatDate(new Date().toISOString());
  const hasClockedIn = status?.hasClockedIn;
  const hasClockedOut = status?.hasClockedOut;
  const todayAtt = status?.attendance;
  const isClockedIn = hasClockedIn && !hasClockedOut;

  const gpsString = location ? `${location.latitude}, ${location.longitude}` : null;
  const isInRange = distance !== null && distance <= OFFICE_RADIUS;

  const handleClockInPress = () => {
    if (hasClockedOut) {
      navigation.navigate('Attendance');
    } else if (isClockedIn) {
      navigation.navigate('Camera', { action: 'clockout', attendanceId: todayAtt?.id, gps: gpsString });
    } else {
      navigation.navigate('Camera', { action: 'clockin', gps: gpsString });
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Area */}
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={true}
            followsUserLocation={true}
          >
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title="Posisi Anda"
              pinColor="#8B5CF6"
            />
            <Marker
              coordinate={{ latitude: OFFICE_LAT, longitude: OFFICE_LNG }}
              title="Kantor"
              pinColor="#EF4444"
            />
            <Circle
              center={{ latitude: OFFICE_LAT, longitude: OFFICE_LNG }}
              radius={OFFICE_RADIUS}
              strokeColor="rgba(239, 68, 68, 0.6)"
              fillColor="rgba(239, 68, 68, 0.1)"
            />
          </MapView>
        ) : (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.mapLoadingText}>Mengambil lokasi GPS...</Text>
            {errorMsg && (
              <TouchableOpacity style={styles.retryButton} onPress={getLocation}>
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
        {/* GPS Status Banner */}
        {location && (
          <View style={[styles.gpsBanner, isInRange ? styles.gpsIn : styles.gpsOut]}>
            <Ionicons
              name={isInRange ? "checkmark-circle" : "location-outline"}
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <View style={styles.gpsBannerText}>
              <Text style={styles.gpsBannerTitle}>
                {isInRange ? "Anda berada di area kantor" : "Anda di luar area kantor"}
              </Text>
              <Text style={styles.gpsBannerSubtitle}>
                {distance !== null ? `Jarak ke kantor: ~${distance}m` : 'Menghitung jarak...'} · {gpsString}
              </Text>
            </View>
          </View>
        )}

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
          <TouchableOpacity style={styles.actionButton} onPress={handleClockInPress}>
            <Text style={styles.actionButtonText}>
              {hasClockedOut ? 'View Attendance' : isClockedIn ? 'Selfie To Clock Out' : 'Selfie To Clock In'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  map: { width: '100%', height: '100%' },
  mapLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  mapLoadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  retryButton: { marginTop: 12, backgroundColor: '#8B5CF6', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  retryButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  headerSafeArea: { zIndex: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10, maxHeight: '65%' },
  gpsBanner: { borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
  gpsIn: { backgroundColor: '#16A34A' },
  gpsOut: { backgroundColor: '#EF4444' },
  gpsBannerText: { flex: 1 },
  gpsBannerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  gpsBannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  banner: { backgroundColor: '#7C3AED', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  bannerSubtitle: { color: '#E5E7EB', fontSize: 13 },
  bannerIconContainer: { position: 'relative', width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#4B5563', marginBottom: 12 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 16, padding: 16, marginBottom: 24 },
  profileAvatar: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#C4B5FD', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  profileDetails: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  profileName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginRight: 6 },
  profileDate: { fontSize: 13, color: '#8B5CF6' },
  scheduleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  scheduleBox: { flex: 1, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  scheduleLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 8, letterSpacing: 0.5 },
  scheduleTime: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  actionButton: { backgroundColor: '#7C3AED', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});