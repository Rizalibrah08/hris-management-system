import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Image, ScrollView, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AttendanceDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [isExportVisible, setIsExportVisible] = useState(false);
  
  // Data dummy, bisa diganti dengan route.params nantinya
  const item = route.params?.item || {
    date: '27 September 2024',
    totalHours: '08:00:00 hrs',
    clockInOut: '09:00 AM — 05:00 PM',
    break: '01:00:00 hrs',
    breakInOut: '12:00 AM — 01:00 PM',
    photoUri: 'https://randomuser.me/api/portraits/men/32.jpg'
  };

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
            <Text style={styles.cardDate}>{item.date}</Text>
          </View>
          
          <View style={styles.cardBody}>
            {/* Photo Section */}
            <Text style={styles.sectionTitle}>Selfie Clock In</Text>
            <View style={styles.photoContainer}>
              <Image source={{ uri: item.photoUri }} style={styles.photo} resizeMode="cover" />
              <View style={styles.overlayInfo}>
                <Text style={styles.overlayText}>Lat : 45.43534</Text>
                <Text style={styles.overlayText}>Long : 97897.576</Text>
                <Text style={styles.overlayText}>11/10/24 09:00AM GMT +07:00</Text>
              </View>
            </View>

            {/* Notes Section */}
            <Text style={styles.sectionTitle}>Clock-In Notes</Text>
            <Text style={styles.notesText}>—</Text>
            
            <View style={styles.divider} />

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Hours</Text>
                <Text style={styles.statValue}>{item.totalHours}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Clock in & Out</Text>
                <Text style={styles.statValue}>{item.clockInOut}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Break</Text>
                <Text style={styles.statValue}>{item.break}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Take A Break & Back To Work</Text>
                <Text style={styles.statValue}>{item.breakInOut}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={() => setIsExportVisible(true)}
        >
          <Text style={styles.exportButtonText}>Export As PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Export Success Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isExportVisible}
        onRequestClose={() => setIsExportVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            {/* Floating Icon */}
            <View style={styles.floatingIconContainer}>
              <View style={styles.floatingIconBox}>
                <Ionicons name="download-outline" size={40} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.modalTitle}>Export As PDF Successful!</Text>
            <Text style={styles.modalSubtitle}>
              Your clock-in data has been exported as a PDF. You can now download it.
            </Text>

            <TouchableOpacity 
              style={styles.btnPrimary}
              onPress={() => {
                setIsExportVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.btnPrimaryText}>Close Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    paddingTop: 40, // Increased to avoid status bar
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDEBFE', // Very light purple
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
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30, // for bottom safe area
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
