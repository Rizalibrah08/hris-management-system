import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AttendanceScreen() {
  const historyData = [
    { id: 1, date: '27 September 2024', totalHours: '08:00:00 hrs', clockInOut: '09:00 AM — 05:00 PM' },
    { id: 2, date: '26 September 2024', totalHours: '08:00:00 hrs', clockInOut: '09:00 AM — 05:00 PM' },
    { id: 3, date: '25 September 2024', totalHours: '08:00:00 hrs', clockInOut: '09:00 AM — 05:00 PM' },
  ];

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
              <Text style={styles.statBoxValue}>00:00 Hrs</Text>
            </View>
            
            <View style={styles.statBox}>
              <View style={styles.statBoxHeader}>
                <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                <Text style={styles.statBoxTitle}>This Pay Period</Text>
              </View>
              <Text style={styles.statBoxValue}>32:00 Hrs</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.clockInButton}>
            <Text style={styles.clockInButtonText}>Clock In Now</Text>
          </TouchableOpacity>
        </View>

        {/* History List */}
        <View style={styles.historyContainer}>
          {historyData.map((item) => (
            <View key={item.id} style={styles.historyCard}>
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
            </View>
          ))}
        </View>

      </ScrollView>
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
});
