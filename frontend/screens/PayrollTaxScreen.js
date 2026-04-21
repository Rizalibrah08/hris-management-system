import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PayrollTaxScreen() {
  const navigation = useNavigation();

  const payrollData = [
    { id: '1', month: 'September 2024', hours: '40:00:00 hrs', received: '$800', paidOn: '30 Sept 2024' },
    { id: '2', month: 'August 2024', hours: '40:00:00 hrs', received: '$800', paidOn: '30 Aug 2024' },
    { id: '3', month: 'July 2024', hours: '40:00:00 hrs', received: '$800', paidOn: '30 Jul 2024' },
    { id: '4', month: 'June 2024', hours: '40:00:00 hrs', received: '$800', paidOn: '30 Jun 2024' },
    { id: '5', month: 'May 2024', hours: '40:00:00 hrs', received: '$800', paidOn: '30 May 2024' },
    { id: '6', month: 'April 2024', hours: '40:00:00 hrs', received: '$800', paidOn: '30 Apr 2024' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payroll and Tax</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {payrollData.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => navigation.navigate('PayrollDetails', { item })}
            activeOpacity={0.7}
          >
            <Text style={styles.monthTitle}>{item.month}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Hours</Text>
                <Text style={styles.statValue}>{item.hours}</Text>
              </View>
              
              <View style={styles.statBoxCenter}>
                <Text style={styles.statLabel}>Received</Text>
                <Text style={styles.statValue}>{item.received}</Text>
              </View>
              
              <View style={styles.statBoxRight}>
                <Text style={styles.statLabel}>Paid On</Text>
                <Text style={styles.statValue}>{item.paidOn}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Lighter gray background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,  // Kept consistent with earlier screens' safe offsets
    paddingBottom: 20,
    backgroundColor: '#FFFFFF', // Header should have white background
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDEBFE', // Soft purple background for the button
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
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statBox: {
    flex: 1.2,
  },
  statBoxCenter: {
    flex: 0.8,
  },
  statBoxRight: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    color: '#374151',
  },
});
