import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="happy-outline" size={28} color="#8B5CF6" style={styles.avatarIcon} />
            </TouchableOpacity>
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>Rizal Ibrahim</Text>
                <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={styles.verifiedIcon} />
              </View>
              <Text style={styles.userEmail}>rizal@work.com</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#8B5CF6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* My Work Summary Banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>My Work Summary</Text>
            <Text style={styles.bannerSubtitle}>Today task & presence activity</Text>
          </View>
          {/* We use an icon instead of the camera image placeholder for now */}
          <Ionicons name="videocam" size={60} color="#FFFFFF" style={styles.bannerImage} />
        </View>

        {/* Today Meeting Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today Meeting</Text>
          <Text style={styles.cardSubtitle}>Your schedule for the day</Text>
          
          <View style={styles.illustrationContainer}>
             <View style={styles.gridContainer}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <View key={item} style={styles.gridBox}>
                    <Ionicons name="person" size={24} color="#D1D5DB" />
                  </View>
                ))}
             </View>
             <Text style={styles.emptyTitle}>No Meeting Available</Text>
             <Text style={styles.emptyText}>
               It looks like you don't have any meetings scheduled at the moment. This space will be updated as new meetings are added!
             </Text>
          </View>
        </View>

        {/* Today Task Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today Task</Text>
          <Text style={styles.cardSubtitle}>The tasks assigned to you for today</Text>
          
          <View style={styles.illustrationContainer}>
             <View style={styles.tasksIllustration}>
               <Ionicons name="document-text-outline" size={60} color="#E5E7EB" style={{ position: 'absolute', left: 10, top: 10, transform: [{ rotate: '-10deg' }] }} />
               <Ionicons name="document-text" size={70} color="#E5E7EB" style={{ position: 'absolute', right: 10, top: 5, transform: [{ rotate: '10deg' }] }} />
               <Ionicons name="document-text" size={80} color="#EDEBFE" />
             </View>
             <Text style={styles.emptyTitle}>No Tasks Assigned</Text>
             <Text style={styles.emptyText}>
               It looks like you don't have any tasks assigned to you right now. Don't worry, this space will be updated as new tasks become available.
             </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light background exactly like the design
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 40, // Increased to avoid status bar overlap
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDEBFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarIcon: {
    // slightly moved up or just centered
  },
  userDetails: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 4,
  },
  verifiedIcon: {
    //
  },
  userEmail: {
    fontSize: 13,
    color: '#8B5CF6',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryBanner: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#EDEBFE',
    fontSize: 13,
  },
  bannerImage: {
    opacity: 0.8,
    transform: [{ rotate: '-10deg' }],
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  illustrationContainer: {
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 160,
    justifyContent: 'center',
    marginBottom: 20,
  },
  gridBox: {
    width: 45,
    height: 50,
    backgroundColor: '#F3F4F6',
    margin: 3,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 100,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
