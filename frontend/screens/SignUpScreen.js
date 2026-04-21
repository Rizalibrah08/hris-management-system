import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isTnCModalVisible, setIsTnCModalVisible] = useState(false);
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    // Move to previous input on backspace if current is empty
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
               {/* Gunakan ikon placeholder yang mirip dengan logomu, atau ganti dengan Image */}
              <Text style={styles.logoText}>M</Text>
            </View>
            <Text style={styles.title}>Work Mate</Text>
            <Text style={styles.subtitle}>Register Using Your Credentials</Text>
          </View>

          {/* Form Email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="Enter Your Email" keyboardType="email-address" />
            </View>
          </View>

          {/* Form Phone Number dengan Prefix */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.prefixContainer}>
                <Text style={styles.prefixText}>INA</Text>
                <Ionicons name="chevron-down-outline" size={16} color="#8B5CF6" />
              </TouchableOpacity>
              <TextInput style={styles.textInput} placeholder="+62 0000 0000 0000" keyboardType="phone-pad" />
            </View>
          </View>

          {/* Form Company ID */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Company ID</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput style={styles.textInput} placeholder="Enter Company ID" />
            </View>
          </View>

          {/* Form Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput 
                style={styles.textInput} 
                placeholder="My Password" 
                secureTextEntry={!showPassword} 
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Confirm Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput 
                style={styles.textInput} 
                placeholder="Confirm My Password" 
                secureTextEntry={!showConfirmPassword} 
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms and Conditions Checkbox */}
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, isAgreed && styles.checkboxActive]} 
              onPress={() => {
                if (!isAgreed) setIsTnCModalVisible(true);
                else setIsAgreed(false);
              }}
            >
              {isAgreed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree with{' '}
              <Text style={styles.linkText} onPress={() => setIsTnCModalVisible(true)}>terms & conditions</Text>{' '}
              and{' '}
              <Text style={styles.linkText} onPress={() => setIsTnCModalVisible(true)}>privacy policy</Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity 
            style={[styles.btnPrimary, !isAgreed && styles.btnPrimaryDisabled]}
            disabled={!isAgreed}
            onPress={() => setIsVerificationVisible(true)}
          >
            <Text style={styles.btnPrimaryText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Footer Back to Sign In */}
          <View style={styles.footerTextContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerTextLink}>Sign in here</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Terms & Conditions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTnCModalVisible}
        onRequestClose={() => setIsTnCModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsTnCModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.bottomSheet}>
            <Text style={styles.modalTitleCentered}>Terms & Conditions and{'\n'}Privacy Policy</Text>
            
            <ScrollView style={styles.tncScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.tncContentText}>
                <Text style={{fontWeight: 'bold'}}>Terms and Conditions:{'\n'}</Text>
                Acceptance: By using the Re-Dus app, you agree to comply with all applicable terms and conditions.{'\n\n'}
                Usage: This app is for personal use only and may not be used for commercial purposes without permission.{'\n\n'}
                Account: You are responsible for the security of your account and all activities that occur within it.{'\n\n'}
                Content: You must not upload content that violates copyright, privacy, or applicable laws.{'\n\n'}
                Changes: We reserve the right to change the terms and conditions at any time and will notify you of these changes through the app or via email.{'\n\n'}
                <Text style={{fontWeight: 'bold'}}>Privacy Policy:{'\n'}</Text>
                Data Collection: We collect personal data such as name, email, and location to process transactions and improve our services.{'\n\n'}
                Data Usage: Your data is used for internal purposes such as account management, usage analysis, and service offerings.{'\n\n'}
                Security: We protect your data with appropriate security measures to prevent unauthorized access.{'\n\n'}
                Data Sharing: We do not share your personal data with third parties without your consent, except as required by law.{'\n\n'}
                Your Rights: You can access, update, or delete your personal data at any time through the app settings or by contacting us.
              </Text>
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.btnPrimary} 
                onPress={() => { setIsAgreed(true); setIsTnCModalVisible(false); }}
              >
                <Text style={styles.btnPrimaryText}>I Agree</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.btnSecondary} 
                onPress={() => { setIsAgreed(false); setIsTnCModalVisible(false); }}
              >
                <Text style={styles.btnSecondaryText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal Email Verification */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVerificationVisible}
        onRequestClose={() => setIsVerificationVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsVerificationVisible(false)}>
            {/* Wrap the bottom sheet in a clickable container that does nothing to stop event propagation */}
            <TouchableOpacity activeOpacity={1} style={styles.verificationBottomSheet}>
              
              {/* The floating envelope icon */}
              <View style={styles.floatingIconContainer}>
                 <View style={styles.floatingIconBox}>
                   <Ionicons name="mail" size={40} color="#FFFFFF" />
                   {/* The red dot */}
                   <View style={styles.notificationDot} />
                 </View>
              </View>

              <Text style={styles.modalTitleCentered}>Email Verification Sent!</Text>
              <Text style={styles.verificationSubtitle}>
                A verification code will be sent to the email{'\n'}Hello@work.com for your account verification process.
              </Text>

              {/* OTP Inputs */}
              <View style={styles.otpContainer}>
                 {otp.map((digit, i) => (
                   <TextInput 
                     key={i} 
                     ref={ref => inputRefs.current[i] = ref}
                     style={styles.otpInput} 
                     maxLength={1} 
                     keyboardType="number-pad" 
                     placeholder="0" 
                     placeholderTextColor="#E5E7EB" 
                     value={digit}
                     onChangeText={(text) => handleOtpChange(text, i)}
                     onKeyPress={(e) => handleOtpKeyPress(e, i)}
                   />
                 ))}
              </View>

              <Text style={styles.resendText}>
                Haven't received the verification code? <Text style={styles.resendLink}>Resend it.</Text>
              </Text>

              <TouchableOpacity style={styles.btnPrimary} onPress={() => {
                setIsVerificationVisible(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
              }}>
                <Text style={styles.btnPrimaryText}>Submit</Text>
              </TouchableOpacity>

            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' }, // Warna background sedikit abu-abu
  scrollContent: { paddingHorizontal: 24, paddingVertical: 40 },
  
  header: { alignItems: 'center', marginBottom: 30 },
  logoBox: { width: 60, height: 60, backgroundColor: '#8B5CF6', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontSize: 12, color: '#4B5563', marginBottom: 8, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF' },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 15, color: '#111827' },

  prefixContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 12, borderRightWidth: 1, borderRightColor: '#D1D5DB', paddingRight: 10 },
  prefixText: { fontSize: 15, fontWeight: '600', color: '#111827', marginRight: 4 },

  termsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 10, paddingRight: 20 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#8B5CF6', borderRadius: 6, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#8B5CF6' },
  termsText: { fontSize: 13, color: '#111827', lineHeight: 20 },
  linkText: { color: '#8B5CF6', fontWeight: '500' },

  btnPrimary: { backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginBottom: 20 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  btnPrimaryDisabled: { opacity: 0.5 },

  btnSecondary: { backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#8B5CF6', marginTop: -8, marginBottom: 20 },
  btnSecondaryText: { color: '#8B5CF6', fontSize: 16, fontWeight: 'bold' },

  footerTextContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: -10, marginBottom: 20 },
  footerText: { color: '#4B5563', fontSize: 13 },
  footerTextLink: { color: '#8B5CF6', fontSize: 13, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(31, 41, 55, 0.7)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, width: '100%', height: '85%', paddingHorizontal: 24, paddingTop: 30, paddingBottom: 20 },
  modalTitleCentered: { fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 20 },
  tncScroll: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 20 },
  tncContentText: { fontSize: 13, color: '#334155', lineHeight: 20 },
  modalButtonContainer: { width: '100%' },

  // Verification Modal Styles
  verificationBottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, width: '100%', paddingHorizontal: 24, paddingBottom: 40, paddingTop: 60, position: 'absolute', bottom: 0 },
  floatingIconContainer: { position: 'absolute', top: -45, alignSelf: 'center', zIndex: 10, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  floatingIconBox: { width: 90, height: 90, backgroundColor: '#8B5CF6', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  notificationDot: { position: 'absolute', top: 22, right: 20, width: 12, height: 12, backgroundColor: '#EF4444', borderRadius: 6, borderWidth: 2, borderColor: '#8B5CF6' },
  
  verificationSubtitle: { fontSize: 13, color: '#4B5563', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  otpInput: { width: 45, height: 55, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, textAlign: 'center', fontSize: 24, color: '#111827', backgroundColor: '#FFFFFF' },
  
  resendText: { fontSize: 13, color: '#4B5563', textAlign: 'center', marginBottom: 24 },
  resendLink: { color: '#8B5CF6', fontWeight: 'bold' }
});