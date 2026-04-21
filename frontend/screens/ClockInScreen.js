import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function ClockInScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Map Background Placeholder */}
      <View style={styles.mapBackground}>
        {/* Fake Map Elements for visual appearance */}
        <Text style={[styles.mapText, { top: '15%', left: '20%', fontSize: 24, transform: [{ rotate: '-15deg' }] }]}>Jalan Veteran</Text>
        <Text style={[styles.mapText, { top: '25%', right: '15%', fontSize: 20 }]}>Masjid Istiqlal</Text>
        <Text style={[styles.mapText, { top: '50%', left: '10%' }]}>Jalan Kebon Sirih</Text>
        
        {/* Clock In Area Circles */}
        <View style={styles.radiusCircle}>
          <View style={styles.avatarCircle}>
             <View style={styles.avatarInner}>
                <Ionicons name="person" size={24} color="#8B5CF6" />
             </View>
          </View>
        </View>
      </View>

      {/* Header (Overlay on map) */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clock In Area</Text>
          {/* Spacer to center title */}
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Purple Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>You are in the clock-in area!</Text>
            <Text style={styles.bannerSubtitle}>Now you can press clock in in this area</Text>
          </View>
          <View style={styles.bannerIconContainer}>
            <Ionicons name="time" size={50} color="#FFFFFF" style={{ opacity: 0.9 }} />
            <Ionicons name="sparkles" size={16} color="#FFFFFF" style={styles.sparkle1} />
            <Ionicons name="sparkles" size={12} color="#FFFFFF" style={styles.sparkle2} />
          </View>
        </View>

        {/* My Profile Section */}
        <Text style={styles.sectionTitle}>MY PROFILE</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="happy" size={40} color="#8B5CF6" />
          </View>
          <View style={styles.profileDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>Tonald Drump</Text>
              <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={styles.verifiedIcon} />
            </View>
            <Text style={styles.profileDate}>29 September 2024</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#8B5CF6" />
              <Text style={styles.locationText}>Lat 45.43534 Long 97897.576</Text>
            </View>
          </View>
        </View>

        {/* Schedule Section */}
        <Text style={styles.sectionTitle}>SCHEDULE</Text>
        <View style={styles.scheduleContainer}>
          <View style={styles.scheduleBox}>
            <Text style={styles.scheduleLabel}>CLOCK IN</Text>
            <Text style={styles.scheduleTime}>09:00</Text>
          </View>
          <View style={styles.scheduleBox}>
            <Text style={styles.scheduleLabel}>CLOCK OUT</Text>
            <Text style={styles.scheduleTime}>05:00</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Camera')}>
          <Text style={styles.actionButtonText}>Selfie To Clock In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    position: 'absolute',
    color: '#D1D5DB',
    fontWeight: 'bold',
  },
  radiusCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: 'rgba(139, 92, 246, 0.15)', // light purple transparent
    borderWidth: 1,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80, // slightly up relative to bottom sheet
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.3)', // deeper purple ring
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  avatarInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDEBFE', // light background for avatar
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSafeArea: {
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40, // extra padding for bottom safely
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  banner: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  bannerIconContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle1: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 10,
    right: -10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#C4B5FD', // light purple base for avatar
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 6,
  },
  profileDate: {
    fontSize: 13,
    color: '#8B5CF6',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 4,
  },
  scheduleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  scheduleBox: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4, // slight gap
  },
  scheduleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  scheduleTime: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  actionButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
