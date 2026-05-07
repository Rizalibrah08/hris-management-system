import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export default function PersonalDataScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user, refreshUser } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUpdateVisible, setIsUpdateVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.employees.me();
      setEmployee(data);
      setPhone(data?.phone || data?.phone_number || '');
      setEmail(data?.email || '');
    } catch {
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) fetchEmployee();
  }, [isFocused, fetchEmployee]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await api.employees.updateMe({ phone, email });
      await refreshUser();
      await fetchEmployee();
      setIsUpdateVisible(false);
      setTimeout(() => setIsSuccessVisible(true), 300);
    } catch {
      setIsUpdateVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const employeeName = employee?.name || user?.employeeName || user?.nik || '-';
  const nameParts = employeeName.split(' ');
  const firstName = nameParts[0] || '-';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';
  const department = employee?.department || '-';
  const position = employee?.position || '-';
  const displayEmail = employee?.email || user?.email || '-';
  const displayPhone = employee?.phone || user?.phone || '-';
  const contractEnd = employee?.contract_end || '-';
  const avatarUri = employee?.photoUrl || employee?.photo_url || employee?.photo || user?.photoUrl || user?.photo;

  const DropdownInput = ({ label, value, iconName }) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={iconName} size={20} color="#8B5CF6" style={styles.inputIcon} />
        <Text style={styles.inputTextValue}>{value}</Text>
        <Ionicons name="chevron-down-outline" size={20} color="#8B5CF6" />
      </View>
    </View>
  );

  if (loading && !employee) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Data</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Personal Data</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Card 1: My Personal Data */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Personal Data</Text>
            <Text style={styles.cardSubtitle}>Details about my personal data</Text>
            
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: '#C4B5FD', zIndex: -1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 }]}>
                    <Ionicons name="person" size={50} color="#FFFFFF" />
                  </View>
                )}
                <View style={[StyleSheet.absoluteFill, avatarUri ? null : { backgroundColor: '#C4B5FD', zIndex: -1 }]} />
                <TouchableOpacity
                  style={styles.uploadIconBadge}
                  onPress={async () => {
                    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!perm.granted) {
                      Alert.alert('Izin Diperlukan', 'Izinkan akses ke galeri untuk upload foto profil.');
                      return;
                    }
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ['images'],
                      allowsEditing: true,
                      aspect: [1, 1],
                      quality: 0.8,
                    });
                    if (!result.canceled && result.assets[0]) {
                      try {
                        await api.employees.uploadPhoto(result.assets[0].uri);
                        await refreshUser();
                        await fetchEmployee();
                        Alert.alert('Berhasil', 'Foto profil berhasil diupload.');
                      } catch (err) {
                        Alert.alert('Gagal', err.message || 'Upload foto gagal.');
                      }
                    }
                  }}
                >
                  <Ionicons name="sync" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.uploadTitle}>Upload Photo</Text>
              <Text style={styles.uploadSubtitle}>Format .jpeg .png minimal{'\n'}800x800px maks 5MB</Text>
            </View>

            {/* Name fields (read-only) */}
            <DropdownInput label="First Name" value={firstName} iconName="person-outline" />
            <DropdownInput label="Last Name" value={lastName} iconName="person-outline" />
            <DropdownInput label="Position" value={position} iconName="hardware-chip-outline" />
            <DropdownInput label="Department" value={department} iconName="business-outline" />
          </View>

          {/* Card 2: Contact & Contract */}
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.cardTitle}>Contact & Contract</Text>
            <Text style={styles.cardSubtitle}>Editable contact info and contract details</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                <TextInput 
                  style={styles.textInput} 
                  value={email} 
                  onChangeText={setEmail}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                <TextInput 
                  style={styles.textInput} 
                  value={phone} 
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <DropdownInput label="Contract End Date" value={formatDate(contractEnd)} iconName="calendar-outline" />
          </View>

        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => setIsUpdateVisible(true)}
            disabled={saving}
          >
            <Text style={styles.updateButtonText}>{saving ? 'Saving...' : 'Update'}</Text>
          </TouchableOpacity>
        </View>

        {/* Update Confirmation Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isUpdateVisible}
          onRequestClose={() => setIsUpdateVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPressOut={() => setIsUpdateVisible(false)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.bottomSheet}>
              <View style={styles.floatingIconContainer}>
                <View style={styles.floatingIconBox}>
                  <Ionicons name="person" size={40} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.modalTitle}>Update Profile</Text>
              <Text style={styles.modalSubtitle}>
                Are you sure you want to update your profile? This will help us improve your experience and provide personalized features.
              </Text>

              <TouchableOpacity 
                style={styles.btnPrimary}
                onPress={handleUpdate}
                disabled={saving}
              >
                <Text style={styles.btnPrimaryText}>{saving ? 'Saving...' : 'Yes, Update Profile'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btnSecondary}
                onPress={() => setIsUpdateVisible(false)}
              >
                <Text style={styles.btnSecondaryText}>No, Let me check</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

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
            onPressOut={() => {
              setIsSuccessVisible(false);
              navigation.goBack();
            }}
          >
            <TouchableOpacity activeOpacity={1} style={styles.bottomSheet}>
              <View style={styles.floatingIconContainer}>
                <View style={styles.floatingIconBox}>
                  <Ionicons name="checkmark-circle" size={40} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.modalTitle}>Profile Updated!</Text>
              <Text style={styles.modalSubtitle}>
                Your profile has been successfully updated. We're excited to see you take this step!
              </Text>

              <TouchableOpacity 
                style={styles.btnPrimary}
                onPress={() => {
                  setIsSuccessVisible(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.btnPrimaryText}>View My Profile</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

      </KeyboardAvoidingView>
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
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDEBFE',
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
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  uploadIconBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  inputTextValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0,
    backgroundColor: '#F3F4F6',
  },
  updateButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  updateButtonText: {
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
  btnPrimary: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});