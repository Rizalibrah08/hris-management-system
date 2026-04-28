import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Platform, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TaskScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HEADER SECTION */}
        <View style={styles.headerBackground}>
          <View style={{ flex: 1 }}>
            <View style={styles.headerContent}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Challanges Awaiting</Text>
                <Text style={styles.headerSubtitle}>Let's tackle your to do list</Text>
              </View>
              <View style={styles.headerIllustration}>
                <Ionicons name="clipboard" size={50} color="#FFFFFF" style={{ transform: [{ rotate: '15deg' }] }} />
                <Ionicons name="star" size={12} color="#FBBF24" style={{ position: 'absolute', top: 0, left: -10 }} />
                <Ionicons name="star" size={16} color="#FBBF24" style={{ position: 'absolute', bottom: 5, right: -10 }} />
              </View>
            </View>
          </View>
        </View>
        
        {/* SUMMARY CARD */}
        <View style={[styles.card, { marginTop: -40 }]}>
          <Text style={styles.cardTitle}>Summary of Your Work</Text>
          <Text style={styles.cardSubtitle}>Your current task progress</Text>
          
          <View style={styles.summaryBoxContainer}>
            <View style={styles.summaryBox}>
              <View style={styles.summaryBoxHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="code-slash" size={12} color="#8B5CF6" />
                </View>
                <Text style={styles.summaryBoxLabel}>To Do</Text>
              </View>
              <Text style={styles.summaryBoxValue}>0</Text>
            </View>
            
            <View style={styles.summaryBox}>
              <View style={styles.summaryBoxHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="pie-chart" size={12} color="#F97316" />
                </View>
                <Text style={styles.summaryBoxLabel}>In Progress</Text>
              </View>
              <Text style={styles.summaryBoxValue}>0</Text>
            </View>
            
            <View style={styles.summaryBox}>
              <View style={styles.summaryBoxHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                </View>
                <Text style={styles.summaryBoxLabel}>Done</Text>
              </View>
              <Text style={styles.summaryBoxValue}>0</Text>
            </View>
          </View>
        </View>

        {/* BURNOUT STATS */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BurnoutStats')} activeOpacity={0.8}>
          <View style={styles.burnoutHeaderRow}>
            <Text style={styles.cardTitle}>Burnout Stats</Text>
            <View style={styles.badgeGood}>
              <Text style={styles.badgeGoodText}>Good</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>You've maintain your task at the right pace! keep it up!</Text>
          
          <View style={styles.progressContainer}>
            <Ionicons name="happy" size={32} color="#10B981" />
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '30%' }]} />
            </View>
          </View>
        </TouchableOpacity>

        {/* FILTER TABS */}
        <View style={styles.filterContainer}>
          {['All', 'In Progress', 'Finish'].map((filter) => (
            <TouchableOpacity 
              key={filter}
              style={[styles.filterBtn, activeFilter === filter && styles.filterBtnActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterBtnText, activeFilter === filter && styles.filterBtnTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TODAY TASK - EMPTY STATE */}
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 40, marginBottom: 80 }]}>
          <Text style={[styles.cardTitle, { alignSelf: 'flex-start' }]}>Today Task</Text>
          <Text style={[styles.cardSubtitle, { alignSelf: 'flex-start', marginBottom: 20 }]}>The tasks assigned to you for today</Text>
          
          {/* Empty Illustration */}
          <View style={styles.emptyIllustration}>
            <Ionicons name="document-text-outline" size={60} color="#E5E7EB" style={{ position: 'absolute', transform: [{ rotate: '-15deg' }], left: -25 }} />
            <Ionicons name="document-text-outline" size={60} color="#E5E7EB" style={{ position: 'absolute', transform: [{ rotate: '15deg' }], right: -25 }} />
            <Ionicons name="document-text" size={70} color="#E8D4FF" />
          </View>
          
          <Text style={styles.emptyTitle}>No Tasks Assigned</Text>
          <Text style={styles.emptySubtitle}>
            It looks like you don't have any tasks assigned to you right now. Don't worry, this space will be updated as new tasks become available.
          </Text>
        </View>

      </ScrollView>

      {/* CREATE TASK BUTTON */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.btnCreate}>
          <Text style={styles.btnCreateText}>Create Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerBackground: {
    backgroundColor: '#8B5CF6',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  headerIllustration: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
  summaryBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    width: '31%',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  summaryBoxLabel: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  summaryBoxValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  burnoutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeGood: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeGoodText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginLeft: 12,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 4,
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 26,
  },
  filterBtnActive: {
    backgroundColor: '#8B5CF6',
  },
  filterBtnText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginTop: 20,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  btnCreate: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnCreateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
