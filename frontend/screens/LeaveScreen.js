import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function LeaveScreen() {
  const [activeTab, setActiveTab] = useState('Review');
  const navigation = useNavigation();
  const route = useRoute();
  
  // Use route parameter or fallback to false (for early development visualization, change as needed)
  const hasNewLeave = route.params?.newLeaveAdded || false;

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
                <Text style={styles.headerTitle}>Leave Summary</Text>
                <Text style={styles.headerSubtitle}>Submit Leave</Text>
              </View>
              {/* Using airplane to simulate travel/luggage decoration */}
              <Ionicons name="airplane" size={60} color="rgba(255,255,255,0.2)" style={styles.headerImage} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Total Leave Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Total Leave</Text>
          <Text style={styles.cardSubtitle}>Period 1 Jan 2026 - 30 Dec 2026</Text>
          
          <View style={styles.statsContainer}>
            {/* Available Box */}
            <View style={styles.statBox}>
              <View style={styles.statBoxHeader}>
                <View style={[styles.dotIndicator, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statBoxTitle}>Available</Text>
              </View>
              <Text style={styles.statBoxValue}>20</Text>
            </View>
            
            {/* Leave Used Box */}
            <View style={[styles.statBox, { marginRight: 0 }]}>
              <View style={styles.statBoxHeader}>
                <View style={[styles.dotIndicator, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.statBoxTitle}>Leave Used</Text>
              </View>
              <Text style={styles.statBoxValue}>2</Text>
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
                {tab === 'Review' && hasNewLeave && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>1</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Area */}
        {activeTab === 'Review' && (
          hasNewLeave ? (
            <View style={styles.recordCard}>
              <View style={styles.recordDateRow}>
                <Ionicons name="star-outline" size={20} color="#8B5CF6" />
                <Text style={styles.recordDateText}>10 November 2024</Text>
              </View>
              <View style={styles.recordDetailsBox}>
                <View style={[styles.recordDetailsRow, { marginBottom: 0 }]}>
                  <View style={styles.recordColumn}>
                    <Text style={styles.recordLabel}>Leave Date</Text>
                    <Text style={styles.recordValue}>11 Nov - 13 Nov</Text>
                  </View>
                  <View style={styles.recordColumn}>
                    <Text style={styles.recordLabel}>Total Leave</Text>
                    <Text style={styles.recordValue}>2 Days</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Leave Submitted</Text>
              <Text style={styles.contentSubtitle}>Leave information</Text>
              
              <View style={styles.emptyStateContainer}>
                <Ionicons name="briefcase-outline" size={80} color="#EDE9FE" style={styles.emptyStateIcon} />
                <Text style={styles.emptyStateTitle}>No Leave Submitted!</Text>
                <Text style={styles.emptyStateDesc}>
                  Ready to catch some fresh air? Click "Submit Leave" and take that well-deserved break!
                </Text>
              </View>
            </View>
          )
        )}

        {activeTab === 'Approved' && (
          <View style={styles.recordCard}>
            <View style={styles.recordDateRow}>
              <Ionicons name="receipt-outline" size={20} color="#8B5CF6" />
              <Text style={styles.recordDateText}>18 September 2026</Text>
            </View>
            <View style={styles.recordDetailsBox}>
              <View style={styles.recordDetailsRow}>
                <View style={styles.recordColumn}>
                  <Text style={styles.recordLabel}>Leave Date</Text>
                  <Text style={styles.recordValue}>20 Sept - 22 Sept</Text>
                </View>
                <View style={styles.recordColumn}>
                  <Text style={styles.recordLabel}>Total Leave</Text>
                  <Text style={styles.recordValue}>2 Days</Text>
                </View>
              </View>
              <View style={styles.recordFooter}>
                <View style={styles.recordStatus}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.recordStatusText}>Approved at 19 Sept 2026</Text>
                </View>
                <View style={styles.recordApprover}>
                  <Text style={styles.recordApproverBy}>By</Text>
                  <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.approverAvatar} />
                  <Text style={styles.recordApproverName}>Elaine</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'Rejected' && (
          <View style={styles.recordCard}>
            <View style={styles.recordDateRow}>
              <Ionicons name="receipt-outline" size={20} color="#8B5CF6" />
              <Text style={styles.recordDateText}>21 September 2026</Text>
            </View>
            <View style={styles.recordDetailsBox}>
              <View style={styles.recordDetailsRow}>
                <View style={styles.recordColumn}>
                  <Text style={styles.recordLabel}>Leave Date</Text>
                  <Text style={styles.recordValue}>10 Nov - 17 Nov</Text>
                </View>
                <View style={styles.recordColumn}>
                  <Text style={styles.recordLabel}>Total Leave</Text>
                  <Text style={styles.recordValue}>7 Days</Text>
                </View>
              </View>
              <View style={styles.recordFooter}>
                <View style={styles.recordStatus}>
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                  <Text style={[styles.recordStatusText, { color: '#EF4444' }]}>Rejected at 22 Sept 2026</Text>
                </View>
                <View style={styles.recordApprover}>
                  <Text style={styles.recordApproverBy}>By</Text>
                  <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.approverAvatar} />
                  <Text style={styles.recordApproverName}>Elaine</Text>
                </View>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Persistent Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitBtn}
          onPress={() => navigation.navigate('SubmitLeave')}
        >
          <Text style={styles.submitBtnText}>Submit Leave</Text>
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
  badgeContainer: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  recordCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  recordDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordDateText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  recordDetailsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  recordDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  recordColumn: {
    flex: 1,
  },
  recordLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  recordStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordStatusText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
    fontWeight: '500',
  },
  recordApprover: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordApproverBy: {
    fontSize: 12,
    color: '#111827',
    marginRight: 6,
  },  
  approverAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  recordApproverName: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
  },
});
