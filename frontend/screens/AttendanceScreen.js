import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AttendanceScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [isClockOutVisible, setIsClockOutVisible] = useState(false);
  const [isClockOutSuccessVisible, setIsClockOutSuccessVisible] = useState(false);
  const clockState = route.params?.clockState || 'not_clocked_in';
  const baseHistoryData = [
    { id: 1, date: '27 September 2024', totalHours: '08:00:00 hrs', clockInOut: '09:00 AM — 05:00 PM' },
    { id: 2, date: '26 September 2024', totalHours: '08:00:00 hrs', clockInOut: '09:00 AM — 05:00 PM' },
    { id: 3, date: '25 September 2024', totalHours: '08:00:00 hrs', clockInOut: '09:00 AM — 05:00 PM' },
  ];

  const historyData = clockState === 'clocked_out' 
    ? [{ id: 0, date: '28 September 2024', totalHours: '08:00:00 hrs', clockInOut: '09:00 AM — 05:00 PM' }, ...baseHistoryData]
    : baseHistoryData;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section with Purple Background */}
        <LinearGradient 
          colors={['#7C3AED', '#8B5CF6']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }}
          style={styles.headerBackground}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Let's Clock-In!</Text>
                <Text style={styles.headerSubtitle}>Don't miss your clock in schedule</Text>
              </View>
              {/* Using icon to represent the clock with wings */}
              <Ionicons name="time" size={60} color="#FFFFFF" style={styles.headerImage} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Total Working Hour</Text>
          <Text style={styles.cardSubtitle}>Paid Period 1 Sept 2024 - 30 Sept 2024</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <View style={styles.statBoxHeader}>
                <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                <Text style={styles.statBoxTitle}>Today</Text>
              </View>
              <Text style={styles.statBoxValue}>
                {clockState === 'clocked_in' ? "04:10 Hrs" : clockState === 'clocked_out' ? "08:00 Hrs" : "00:00 Hrs"}
              </Text>
            </View>
            
            <View style={styles.statBox}>
              <View style={styles.statBoxHeader}>
                <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                <Text style={styles.statBoxTitle}>This Pay Period</Text>
              </View>
              <Text style={styles.statBoxValue}>32:00 Hrs</Text>
            </View>
          </View>

          {clockState === 'clocked_in' ? (
            <TouchableOpacity 
              style={styles.clockOutButtonFull}
              onPress={() => setIsClockOutVisible(true)}
            >
              <Text style={styles.clockOutButtonText}>Clock Out</Text>
            </TouchableOpacity>
          ) : clockState === 'clocked_out' ? (
            <TouchableOpacity 
              style={styles.clockedOutButtonFull}
              disabled={true}
            >
              <Text style={styles.clockedOutButtonText}>Clocked Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.clockInButton}
              onPress={() => navigation.navigate('ClockIn')}
            >
              <Text style={styles.clockInButtonText}>Clock In Now</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* History List */}
        <View style={styles.historyContainer}>
          {historyData.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.historyCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AttendanceDetails', { item })}
            >
              <View style={styles.historyCardHeader}>
                <Ionicons name="calendar-outline" size={16} color="#8B5CF6" />
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
              
              <View style={styles.historyDetails}>
                <View style={styles.historyBox}>
                  <Text style={styles.historyLabel}>Total Hours</Text>
                  <Text style={styles.historyValue}>{item.totalHours}</Text>
                </View>
                <View style={styles.historyBox}>
                  <Text style={styles.historyLabel}>Clock in & Out</Text>
                  <Text style={styles.historyValue}>{item.clockInOut}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Clock Out Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isClockOutVisible}
        onRequestClose={() => setIsClockOutVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setIsClockOutVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.bottomSheet}>
            {/* Floating Icon */}
            <View style={styles.floatingIconContainer}>
              <View style={styles.floatingIconBox}>
                <Ionicons name="time-outline" size={40} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.modalTitle}>Confirm Clockout</Text>
            <Text style={styles.modalSubtitle}>
              Once you clock out, you won't be able to edit this time. Please double-check your hours before proceeding.
            </Text>

            {/* Modal Stats */}
            <View style={styles.modalStatsContainer}>
              <View style={styles.modalStatBox}>
                <View style={styles.modalStatBoxHeader}>
                  <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.modalStatBoxTitle}>Today</Text>
                </View>
                <Text style={styles.modalStatBoxValue}>08:00:00 Hrs</Text>
              </View>
              <View style={styles.modalStatBox}>
                <View style={styles.modalStatBoxHeader}>
                  <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.modalStatBoxTitle}>Overtime</Text>
                </View>
                <Text style={styles.modalStatBoxValue}>00:00:00 Hrs</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.btnPrimary}
              onPress={() => {
                setIsClockOutVisible(false);
                setIsClockOutSuccessVisible(true);
              }}
            >
              <Text style={styles.btnPrimaryText}>Yes, Clock Out</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnSecondary}
              onPress={() => setIsClockOutVisible(false)}
            >
              <Text style={styles.btnSecondaryText}>No, Let me check</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Clock Out Success Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isClockOutSuccessVisible}
        onRequestClose={() => setIsClockOutSuccessVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setIsClockOutSuccessVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.bottomSheet}>
            {/* Floating Icon */}
            <View style={styles.floatingIconContainer}>
              <View style={styles.floatingIconBox}>
                <Ionicons name="time-outline" size={40} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.modalTitle}>Clockout Successful!</Text>
            <Text style={styles.modalSubtitle}>
              You've officially clocked out for the day. Thank you for your hard work! Time to relax and enjoy your break.
            </Text>

            <TouchableOpacity 
              style={styles.btnPrimary}
              onPress={() => {
                setIsClockOutSuccessVisible(false);
                navigation.setParams({ clockState: 'clocked_out' });
              }}
            >
              <Text style={styles.btnPrimaryText}>Close Message</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBackground: {
    paddingTop: 40,
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  headerImage: {
    opacity: 0.9,
    marginRight: 10,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
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
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginRight: 10,
  },
  statBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statBoxTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  clockInButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  clockInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  historyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  historyDetails: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
  },
  historyBox: {
    flex: 1,
  },
  historyLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  historyValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
  },
  clockOutButtonFull: {
    backgroundColor: '#2D2D2D',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  clockOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clockedOutButtonFull: {
    backgroundColor: '#C4B5FD',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  clockedOutButtonText: {
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
  modalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  modalStatBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 5,
  },
  modalStatBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalStatBoxTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  modalStatBoxValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  btnPrimary: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  btnSecondaryText: {
    color: '#8B5CF6',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
