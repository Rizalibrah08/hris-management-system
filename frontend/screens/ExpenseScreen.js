import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ExpenseScreen() {
  const [activeTab, setActiveTab] = useState('Review');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <LinearGradient 
          colors={['#7C3AED', '#8B5CF6']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }}
          style={styles.headerBackground}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Expense Summary</Text>
                <Text style={styles.headerSubtitle}>Claim your expenses here.</Text>
              </View>
              {/* Using a card icon to represent the top-right decoration */}
              <Ionicons name="card" size={60} color="rgba(255,255,255,0.2)" style={styles.headerImage} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Total Expense Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Total Expense</Text>
          <Text style={styles.cardSubtitle}>Period 1 Jan 2024 - 30 Dec 2024</Text>
          
          <View style={styles.statsContainer}>
            {/* Total Box */}
            <View style={styles.statBox}>
              <View style={styles.statBoxHeader}>
                <Ionicons name="ticket" size={12} color="#8B5CF6" />
                <Text style={styles.statBoxTitle}>Total</Text>
              </View>
              <Text style={styles.statBoxValue}>$0</Text>
            </View>
            
            {/* Review Box */}
            <View style={styles.statBox}>
              <View style={styles.statBoxHeader}>
                <View style={[styles.dotIndicator, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.statBoxTitle}>Review</Text>
              </View>
              <Text style={styles.statBoxValue}>$0</Text>
            </View>

            {/* Approved Box */}
            <View style={[styles.statBox, { marginRight: 0 }]}>
              <View style={styles.statBoxHeader}>
                <View style={[styles.dotIndicator, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statBoxTitle}>Approved</Text>
              </View>
              <Text style={styles.statBoxValue}>$0</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['Review', 'Approved', 'Rejected'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Area */}
        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>Expense</Text>
          <Text style={styles.contentSubtitle}>Expense submitted</Text>
          
          <View style={styles.emptyStateContainer}>
            <Ionicons name="document-text" size={80} color="#EDE9FE" style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>No Expense Submitted</Text>
            <Text style={styles.emptyStateDesc}>
              It looks like you don't have any expense submitted. Don't worry, this space will be updated as new expense submitted.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Persistent Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Submit Expense</Text>
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
  scrollContent: {
    paddingBottom: 110, // accommodate bottom button
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
    position: 'relative',
  },
  headerTextContainer: {
    flex: 1,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  headerImage: {
    position: 'absolute',
    right: 20,
    top: 5,
    transform: [{ rotate: '15deg' }],
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 12,
    marginRight: 8,
  },
  statBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statBoxTitle: {
    fontSize: 11,
    color: '#4B5563',
    marginLeft: 4,
    fontWeight: '600',
  },
  statBoxValue: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    minHeight: 250,
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  contentSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
