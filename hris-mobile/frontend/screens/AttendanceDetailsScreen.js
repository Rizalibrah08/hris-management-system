import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Modal, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-';
const formatDuration = (start, end) => {
  if (!start) return '-';
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const diffMs = e - s;
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} hrs`;
};

// Parse "lat,lng" string → {lat, lng} atau null.
function parseGps(gps) {
  if (!gps || typeof gps !== 'string') return null;
  const [latStr, lngStr] = gps.split(',').map(s => s.trim());
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

export default function AttendanceDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const item = route.params?.item;

  useEffect(() => {
    if (isFocused && item?.id) {
      setLoading(true);
      api.attendance.myHistory()
        .then((data) => {
          const found = Array.isArray(data)
            ? data.find((a) => a.id === item.id)
            : item;
          setDetail(found || item);
        })
        .catch(() => setDetail(item))
        .finally(() => setLoading(false));
    } else {
      setDetail(item);
    }
  }, [isFocused, item]);

  const displayItem = detail || item || {};

  const dateLabel = formatDate(displayItem.date || displayItem.clock_in);
  const totalHours = formatDuration(displayItem.clock_in, displayItem.clock_out);
  const clockInOut = displayItem.clock_in
    ? `${formatTime(displayItem.clock_in)} — ${displayItem.clock_out ? formatTime(displayItem.clock_out) : 'Now'}`
    : '-';
  const gpsLocation = displayItem.gps_location || '-';
  const gpsCoords = useMemo(() => parseGps(displayItem.gps_location), [displayItem.gps_location]);

  const miniMapHtml = useMemo(() => {
    if (!gpsCoords) return '';
    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body { padding: 0; margin: 0; width: 100%; height: 100%; background-color: #F8F9FA; }
    #map { width: 100%; height: 100%; }
    .pin-marker { background-color: #8B5CF6; border-radius: 50%; width: 18px; height: 18px; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${gpsCoords.lat}, ${gpsCoords.lng}], 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var pin = L.divIcon({ className: 'pin-marker', iconSize: [18, 18], iconAnchor: [9, 9] });
    L.marker([${gpsCoords.lat}, ${gpsCoords.lng}], { icon: pin }).addTo(map).bindPopup("Lokasi Clock In");
  </script>
</body>
</html>`;
  }, [gpsCoords]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Details</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.cardWrapper}>
          {/* Main Card Header (Date) */}
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={16} color="#8B5CF6" />
            <Text style={styles.cardDate}>{dateLabel}</Text>
          </View>
          
          <View style={styles.cardBody}>
            {/* Photo Section */}
            <Text style={styles.sectionTitle}>Selfie Clock In</Text>
            <View style={styles.photoContainer}>
              {displayItem.selfie ? (
                <Image source={{ uri: displayItem.selfie }} style={styles.photo} resizeMode="cover" />
              ) : (
                <View style={[styles.photo, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="camera-outline" size={60} color="#D1D5DB" />
                </View>
              )}
              <View style={styles.overlayInfo}>
                <Text style={styles.overlayText}>{gpsLocation}</Text>
                <Text style={styles.overlayText}>
                  {displayItem.clock_in
                    ? new Date(displayItem.clock_in).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) + ' GMT +07:00'
                    : '-'}
                </Text>
              </View>
            </View>

            {/* Notes Section */}
            <Text style={styles.sectionTitle}>Clock-In Notes</Text>
            <Text style={styles.notesText}>{displayItem.notes || '—'}</Text>
            
            <View style={styles.divider} />

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Hours</Text>
                <Text style={styles.statValue}>{totalHours}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Clock in & Out</Text>
                <Text style={styles.statValue}>{clockInOut}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={styles.statValue}>{displayItem.status || '-'}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>GPS Location</Text>
                <Text style={styles.statValue}>{gpsLocation}</Text>
              </View>
            </View>

            {gpsCoords ? (
              <View style={styles.miniMapContainer}>
                <Text style={styles.sectionTitle}>Lokasi Clock In</Text>
                <View style={styles.miniMap}>
                  <WebView
                    style={{ flex: 1, backgroundColor: '#F8F9FA' }}
                    originWhitelist={['*']}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    source={{ html: miniMapHtml }}
                    scrollEnabled={false}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={async () => {
            if (!displayItem) return;
            const d = displayItem;
            const html = `<html><body style="font-family:sans-serif;padding:20px">
              <h2>Detail Kehadiran</h2>
              <p><strong>Nama:</strong> ${user?.employeeName || d.employee_name || '-'}</p>
              <p><strong>Tanggal:</strong> ${formatDate(d.clock_in)}</p>
              <p><strong>Jam Masuk:</strong> ${formatTime(d.clock_in)}</p>
              <p><strong>Jam Keluar:</strong> ${formatTime(d.clock_out)}</p>
              <p><strong>Total Jam:</strong> ${formatDuration(d.clock_in, d.clock_out)}</p>
              <p><strong>Status:</strong> ${d.status || '-'}</p>
              <p><strong>Catatan:</strong> ${d.notes || '-'}</p>
            </body></html>`;
            try {
              const { base64 } = await Print.printToFileAsync({ html, base64: true });
              const fileName = `kehadiran_${Date.now()}.pdf`;
              const destUri = FileSystem.documentDirectory + fileName;
              await FileSystem.writeAsStringAsync(destUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
              });
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(destUri, {
                  mimeType: 'application/pdf',
                  dialogTitle: 'Ekspor Detail Kehadiran',
                  UTI: 'com.adobe.pdf',
                });
              }
            } catch (err) {
              Alert.alert('Gagal', err.message || 'Tidak dapat mengekspor PDF');
            }
          }}
        >
          <Text style={styles.exportButtonText}>Ekspor PDF</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
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
    paddingBottom: 20,
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  cardBody: {
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  photoContainer: {
    width: '100%',
    height: 350,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  overlayInfo: {
    position: 'absolute',
    bottom: 20,
    left: 16,
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  notesText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  miniMapContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  miniMap: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
    backgroundColor: '#F9FAFB',
  },
  exportButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  exportButtonText: {
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
  btnPrimary: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});