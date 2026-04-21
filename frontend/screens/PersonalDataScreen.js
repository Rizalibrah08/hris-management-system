import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Image, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PersonalDataScreen() {
  const navigation = useNavigation();

  // Dummy state
  const [firstName, setFirstName] = useState('Tonald');
  const [lastName, setLastName] = useState('Drump');
  const [fullAddress, setFullAddress] = useState('Jl Mampang Prapatan XIV No 7A, Jakarta Selatan 12790');
  const [isUpdateVisible, setIsUpdateVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  // Reusable input component for drop-down style inputs
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
                {/* Fallback image if needed, using a colored block for the mockup matching */}
                <Image 
                  source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} // Placeholder
                  style={styles.avatarImage} 
                />
                {/* Simulated cartoon avatar color block since we don't have the exact asset */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#C4B5FD', zIndex: -1 }]} />
                
                {/* Upload Icon */}
                <TouchableOpacity style={styles.uploadIconBadge}>
                  <Ionicons name="sync" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.uploadTitle}>Upload Photo</Text>
              <Text style={styles.uploadSubtitle}>Format should be in .jpeg .png atleast{'\n'}800x800px and less than 5MB</Text>
            </View>

            {/* Inputs */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>First Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                <TextInput 
                  style={styles.textInput} 
                  value={firstName} 
                  onChangeText={setFirstName} 
                  placeholder="First Name" 
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                <TextInput 
                  style={styles.textInput} 
                  value={lastName} 
                  onChangeText={setLastName} 
                  placeholder="Last Name" 
                />
              </View>
            </View>

            <DropdownInput label="Date of Birth" value="10 December 1997" iconName="calendar-outline" />
            <DropdownInput label="Position" value="Junior Full Stack Developer" iconName="hardware-chip-outline" />
          </View>

          {/* Card 2: Address */}
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.cardTitle}>Address</Text>
            <Text style={styles.cardSubtitle}>Your current domicile</Text>

            <DropdownInput label="Country" value="Indonesia" iconName="checkmark-circle-outline" />
            <DropdownInput label="State" value="DKI Jakarta" iconName="checkmark-circle-outline" />
            <DropdownInput label="City" value="Jakarta Selatan" iconName="checkmark-circle-outline" />

            {/* Full Address */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Full Address</Text>
              <TextInput 
                style={styles.textAreaContainer} 
                multiline={true}
                numberOfLines={4}
                value={fullAddress}
                onChangeText={setFullAddress}
                textAlignVertical="top"
              />
            </View>
          </View>

        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => setIsUpdateVisible(true)}
          >
            <Text style={styles.updateButtonText}>Update</Text>
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
              {/* Floating Icon */}
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
                onPress={() => {
                  setIsUpdateVisible(false);
                  setTimeout(() => {
                    setIsSuccessVisible(true);
                  }, 300); // Slight delay for smoother transition
                }}
              >
                <Text style={styles.btnPrimaryText}>Yes, Update Profile</Text>
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
              {/* Floating Icon */}
              <View style={styles.floatingIconContainer}>
                <View style={styles.floatingIconBox}>
                  <Ionicons name="person" size={40} color="#FFFFFF" />
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
    backgroundColor: '#F3F4F6', // Light gray background matching the image
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
    paddingBottom: 110, // make space for footer button
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
    overflow: 'hidden', // hides overlay if image exceeds
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20, // same as wrapper
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
    zIndex: 10, // over the image
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
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 16,
    height: 110,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0, // Dihapus total agar menempel sepenuhnya ke bibir layar
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
