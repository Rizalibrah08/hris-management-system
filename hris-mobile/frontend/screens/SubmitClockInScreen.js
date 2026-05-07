import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Image, TextInput, ScrollView, Dimensions, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const { width } = Dimensions.get('window');

export default function SubmitClockInScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const photoUri = route.params?.photoUri || '';
  const action = route.params?.action || 'clockin';
  const attendanceId = route.params?.attendanceId;
  const isClockOut = action === 'clockout';
  
  const [notes, setNotes] = useState('');
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const currentTime = now.toLocaleString('id-ID', { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' });

  const handleSubmit = async () => {
    if (isClockOut) {
      if (!attendanceId) {
        Alert.alert('Error', 'Attendance ID tidak ditemukan');
        return;
      }
      setLoading(true);
      try {
        await api.attendance.clockOut(attendanceId);
        setIsSuccessVisible(true);
      } catch (err) {
        Alert.alert('Gagal', err.message || 'Clock out gagal');
      } finally {
        setLoading(false);
      }
    } else {
      if (!user?.employeeId) {
        Alert.alert('Error', 'Data karyawan tidak ditemukan');
        return;
      }
      setLoading(true);
      try {
        const compressed = await ImageManipulator.manipulateAsync(
          photoUri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
        );
        await api.attendance.clockIn(user.employeeId, null, compressed.uri);
        setIsSuccessVisible(true);
      } catch (err) {
        Alert.alert('Gagal', err.message || 'Clock in gagal');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isClockOut ? 'Selfie To Clock Out' : 'Selfie To Clock In'}</Text>
          {/* Spacer */}
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Card */}
          <View style={styles.card}>
            {/* Photo Container */}
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
              
              {/* Overlay Info */}
              <View style={styles.overlayInfo}>
                <Text style={styles.overlayText}>{currentTime}</Text>
              </View>

              {/* Retake Button */}
              <TouchableOpacity 
                style={styles.retakeButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="sync" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.retakeText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
            
            {/* Notes Section */}
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Clock In Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Clock-in Notes"
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>{isClockOut ? 'Clock Out' : 'Clock In'}</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSuccessVisible}
        onRequestClose={() => setIsSuccessVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setIsSuccessVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.bottomSheet}>
            {/* Floating Icon */}
            <View style={styles.floatingIconContainer}>
              <View style={styles.floatingIconBox}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.modalTitle}>{isClockOut ? 'Clock-Out Successful!' : 'Clock-In Successful!'}</Text>
            <Text style={styles.modalSubtitle}>
              {isClockOut ? "You've clocked out successfully. Have a great rest of your day!" : "You're all set! Your clock-in was successful. Head over to your dashboard to see your assigned tasks."}
            </Text>

            <TouchableOpacity 
              style={styles.btnPrimary}
              onPress={() => {
                setIsSuccessVisible(false);
                navigation.navigate('Main', {
                  screen: 'Attendance',
                  params: { clockState: isClockOut ? 'clocked_out' : 'clocked_in' }
                });
              }}
            >
              <Text style={styles.btnPrimaryText}>{isClockOut ? 'Go To Attendance' : 'Go To Clock In Page'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  photoContainer: {
    width: '100%',
    height: 400,
    borderRadius: 16,
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
    bottom: 80, // slightly above the retake button
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
  retakeButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  retakeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  notesSection: {
    marginTop: 10,
  },
  notesLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    height: 100,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30, // for bottom safe area
    paddingTop: 10,
    backgroundColor: '#F9FAFB',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitButtonText: {
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
    borderRadius: 24, // slightly squarish rounded box like the design
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
});
