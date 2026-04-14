import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  return (
    // Membungkus layar dengan gradasi ungu ke putih
    <LinearGradient
      colors={['#8B5CF6', '#F4EBFF', '#FFFFFF']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* AREA ATAS: Tempat Ilustrasi Kartu */}
        <View style={styles.imageContainer}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>
            (Nanti Gambar Ilustrasi Ditaruh Di Sini)
          </Text>
        </View>

        {/* AREA BAWAH: Konten Teks & Tombol */}
        <View style={styles.contentContainer}>
          
          {/* Judul & Subjudul */}
          <Text style={styles.title}>Welcome to Workmate!</Text>
          <Text style={styles.subtitle}>
            Make Smart Decisions! Set clear timelines for projects and celebrate your achievements!
          </Text>
          
          {/* Pagination (Titik-titik indikator halaman) */}
          <View style={styles.paginationContainer}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          {/* Area Tombol */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Next</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.btnSecondary}>
              <Text style={styles.btnSecondaryText}>Skip</Text>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// === AREA STYLING (CSS ala React Native) ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  imageContainer: {
    flex: 1.2, // Porsi layar untuk gambar lebih besar
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'flex-end', // Mendorong konten ke bawah
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  paginationContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    height: 6,
    width: 20, // Bentuk awal kapsul
    backgroundColor: '#E5E7EB', // Abu-abu terang
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#6D28D9', // Ungu gelap untuk yang aktif
    width: 24, // Sedikit lebih panjang
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  btnPrimary: {
    backgroundColor: '#6D28D9',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6D28D9',
  },
  btnSecondaryText: {
    color: '#6D28D9',
    fontSize: 16,
    fontWeight: '600',
  }
});