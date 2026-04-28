import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BurnoutStatsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Burnout Stats</Text>
        <View style={{ width: 40 }} />{/* Placeholder for balance */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* BURNOUT STATS */}
        <View style={styles.card}>
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
        </View>

        {/* WORKING LEVEL (Bar Chart) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Working Level</Text>
          <Text style={styles.cardSubtitle}>Your story point so far</Text>
          
          <View style={styles.chartContainer}>
            {/* Y Axis Grid */}
            <View style={styles.yAxisContainer}>
              {[120, 110, 100, 90, 80].map((val) => (
                <View key={val} style={styles.yAxisRow}>
                  <Text style={styles.yAxisText}>{val}</Text>
                  <View style={styles.gridLine} />
                </View>
              ))}
            </View>
            
            {/* Bar Chart Data */}
            <View style={styles.barsWrapper}>
              {/* Sprint 1 */}
              <View style={styles.barColumn}>
                <View style={[styles.bar, { height: '35%', backgroundColor: '#E5E7EB' }]} />
                <Text style={styles.barLabel}>Sprint 1</Text>
              </View>
              {/* Sprint 2 */}
              <View style={styles.barColumn}>
                <View style={[styles.bar, { height: '50%', backgroundColor: '#E5E7EB' }]} />
                <Text style={styles.barLabel}>Sprint 2</Text>
              </View>
              {/* Sprint 3 */}
              <View style={styles.barColumn}>
                <View style={[styles.bar, { height: '35%', backgroundColor: '#E5E7EB' }]} />
                <Text style={styles.barLabel}>Sprint 3</Text>
              </View>
              {/* Sprint 4 (Active) */}
              <View style={styles.barColumn}>
                <Text style={styles.activeBarValue}>113</Text>
                <View style={[styles.bar, { height: '80%', backgroundColor: '#8B5CF6' }]} />
                <Text style={[styles.barLabel, styles.barLabelActive]}>Sprint 4</Text>
              </View>
              {/* Sprint 5 */}
              <View style={styles.barColumn}>
                <View style={[styles.bar, { height: '70%', backgroundColor: '#E5E7EB' }]} />
                <Text style={styles.barLabel}>Sprint 5</Text>
              </View>
            </View>
          </View>
        </View>

        {/* WORKING PERIOD (Line Chart) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Working Period</Text>
          <Text style={styles.cardSubtitle}>Average your working period</Text>
          
          <View style={[styles.chartContainer, { height: 200 }]}>
            {/* Y Axis Grid */}
            <View style={styles.yAxisContainer}>
              {[60, 50, 40, 30, 20].map((val) => (
                <View key={val} style={styles.yAxisRow}>
                  <Text style={styles.yAxisText}>{val} hrs</Text>
                  <View style={styles.gridLine} />
                </View>
              ))}
            </View>
            
            {/* Line Chart Area Representation */}
            <View style={styles.barsWrapper}>
              {/* Pseudo Area Gradient */}
              <View style={styles.areaChartBackground}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.0)']}
                  style={styles.areaGradient}
                />
                {/* Connecting Lines (Simulated using absolute position for the specific data points: 40, 40, 40, 46, 40) */}
                <View style={[styles.lineSegment, { left: '10%', top: '48%', width: '20%' }]} />
                <View style={[styles.lineSegment, { left: '30%', top: '48%', width: '20%' }]} />
                <View style={[styles.lineSegment, { left: '50%', top: '40%', width: '20%', transform: [{ rotate: '-25deg' }] }]} />
                <View style={[styles.lineSegment, { left: '70%', top: '40%', width: '20%', transform: [{ rotate: '25deg' }] }]} />
                
                {/* Dots */}
                <View style={[styles.chartDot, { left: '10%', top: '48%' }]} />
                <View style={[styles.chartDot, { left: '30%', top: '48%' }]} />
                <View style={[styles.chartDot, { left: '50%', top: '48%' }]} />
                <View style={[styles.chartDot, { left: '70%', top: '32%', borderColor: '#8B5CF6' }]} />
                <View style={[styles.chartDot, { left: '90%', top: '48%' }]} />

                {/* Active Value label */}
                <Text style={[styles.activeBarValue, { position: 'absolute', left: '64%', top: '22%' }]}>46 hrs</Text>
              </View>

              {/* X Axis Labels */}
              <View style={[styles.barColumn, { justifyContent: 'flex-end' }]}>
                <Text style={styles.barLabel}>May</Text>
              </View>
              <View style={[styles.barColumn, { justifyContent: 'flex-end' }]}>
                <Text style={styles.barLabel}>Jun</Text>
              </View>
              <View style={[styles.barColumn, { justifyContent: 'flex-end' }]}>
                <Text style={styles.barLabel}>Jul</Text>
              </View>
              <View style={[styles.barColumn, { justifyContent: 'flex-end' }]}>
                <Text style={[styles.barLabel, styles.barLabelActive]}>Aug</Text>
              </View>
              <View style={[styles.barColumn, { justifyContent: 'flex-end' }]}>
                <Text style={styles.barLabel}>Sept</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
  burnoutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeGood: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
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
  chartContainer: {
    height: 220,
    position: 'relative',
    marginTop: 10,
  },
  yAxisContainer: {
    position: 'absolute',
    top: 0,
    bottom: 30, // Leave space for X axis labels
    left: 0,
    right: 0,
    justifyContent: 'space-between',
  },
  yAxisRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxisText: {
    width: 40,
    fontSize: 10,
    color: '#6B7280',
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 1,
  },
  barsWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 40, // Match yAxisText width
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    position: 'relative',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 8,
  },
  barLabelActive: {
    color: '#111827',
    fontWeight: 'bold',
  },
  activeBarValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  areaChartBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 30, // above X axis labels
    height: '60%', // only fill lower half
  },
  areaGradient: {
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: 'rgba(139, 92, 246, 0.4)',
    borderTopLeftRadius: 50, // simple trick to slope it
    borderTopRightRadius: 50,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#C4B5FD',
    zIndex: 1,
  },
  chartDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C4B5FD',
    marginLeft: -4,
    marginTop: -4,
    zIndex: 2,
  }
});
