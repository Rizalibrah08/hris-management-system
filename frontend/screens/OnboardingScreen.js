import React, { useState, useRef } from 'react';
import {
    StyleSheet, Text, View, Image, TouchableOpacity,
    Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// === DATA SLIDES ===
const slides = [
    { id: 0, title: 'Welcome to Workmate!', subtitle: 'Make Smart Decisions! Set clear timelines...', image: require('../assets/ob1.png') },
    { id: 1, title: 'Manage Stress Effectively', subtitle: 'Stay Balanced! Track your workload...', image: require('../assets/ob1.png') },
    { id: 2, title: 'Plan for Success', subtitle: 'Your Journey Starts Here! Earn achievement badges...', image: require('../assets/ob1.png') },
    { id: 3, title: 'Navigate Your Work Journey\nEfficient & Easy', subtitle: 'Increase your work management...', image: require('../assets/ob1.png') }
];

export default function OnboardingScreen({ navigation }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);

    const [showPassword, setShowPassword] = useState(false);
    const [isRemembered, setIsRemembered] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const codeInputs = useRef([]);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const newPasswordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const handleNext = () => { if (currentIndex < slides.length - 1) setCurrentIndex(currentIndex + 1); };
    const handleSkip = () => { setCurrentIndex(slides.length - 1); };

    const currentSlide = slides[currentIndex];
    const isLastSlide = currentIndex === slides.length - 1;

    return (
        <>
            <LinearGradient colors={['#8B5CF6', '#F4EBFF', '#FFFFFF']} style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.imageContainer}>
                        <Image source={currentSlide.image} style={styles.image} resizeMode="contain" />
                    </View>

                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>{currentSlide.title}</Text>
                        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>

                        <View style={styles.paginationContainer}>
                            {slides.map((_, index) => (
                                <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
                            ))}
                        </View>

                        <View style={styles.buttonContainer}>
                            {isLastSlide ? (
                                <>
                                    <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsModalVisible(true)}>
                                        <Text style={styles.btnPrimaryText}>Sign In</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('SignUp')}>
                                        <Text style={styles.btnSecondaryText}>Sign Up</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity style={styles.btnPrimary} onPress={handleNext}>
                                        <Text style={styles.btnPrimaryText}>Next</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnSecondary} onPress={handleSkip}>
                                        <Text style={styles.btnSecondaryText}>Skip</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* === MODAL SIGN IN === */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ flex: 1 }}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setIsModalVisible(false)}
                    >
                        <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContent}
                                keyboardShouldPersistTaps="handled"
                            >
                                <Text style={styles.modalTitle}>Sign In</Text>
                                <Text style={styles.modalSubtitle}>Sign in to my account</Text>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="mail-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                                        <TextInput style={styles.textInput} placeholder="My Email" keyboardType="email-address" />
                                    </View>
                                </View>

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
                                            <Ionicons
                                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                                size={20}
                                                color="#8B5CF6"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.formOptions}>
                                    <TouchableOpacity
                                        style={styles.checkboxContainer}
                                        onPress={() => setIsRemembered(!isRemembered)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.checkbox, isRemembered && styles.checkboxActive]}>
                                            {isRemembered && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                                        </View>
                                        <Text style={styles.rememberText}>Remember Me</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => {
                                        setIsModalVisible(false);
                                        setIsForgotModalVisible(true);
                                    }}>
                                        <Text style={styles.forgotText}>Forgot Password</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity 
                                    style={styles.btnPrimary}
                                    onPress={() => {
                                        setIsModalVisible(false);
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: 'Main' }],
                                        });
                                    }}
                                >
                                    <Text style={styles.btnPrimaryText}>Sign In</Text>
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <TouchableOpacity style={[styles.btnSecondaryAlternatif, { marginBottom: 16 }]}>
                                    <Ionicons name="person-outline" size={18} color="#8B5CF6" style={{ marginRight: 8 }} />
                                    <Text style={styles.btnSecondaryText}>Sign in With Employee ID</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.btnSecondaryAlternatif}>
                                    <Ionicons name="call-outline" size={18} color="#8B5CF6" style={{ marginRight: 8 }} />
                                    <Text style={styles.btnSecondaryText}>Sign in With Phone</Text>
                                </TouchableOpacity>

                                <View style={styles.footerTextContainer}>
                                    <Text style={styles.footerText}>Don't have an account? </Text>
                                    <TouchableOpacity onPress={() => {
                                        setIsModalVisible(false); // Tutup modal Sign In dulu
                                        navigation.navigate('SignUp'); // Pindah ke halaman SignUp
                                    }}>
                                        <Text style={styles.footerTextLink}>Sign Up Here</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

            {/* === MODAL FORGOT PASSWORD === */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isForgotModalVisible}
                onRequestClose={() => {
                    setIsForgotModalVisible(false);
                    setForgotStep(1);
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ flex: 1 }}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => {
                            setIsForgotModalVisible(false);
                            setForgotStep(1);
                        }}
                    >
                        <View style={[styles.bottomSheet, { marginTop: 60, overflow: 'visible' }]} onStartShouldSetResponder={() => true}>
                            <View style={styles.forgotIconContainer}>
                                <Ionicons name="lock-closed" size={36} color="#FFFFFF" />
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={[styles.scrollContent, { paddingTop: 60 }]}
                                keyboardShouldPersistTaps="handled"
                            >
                                {forgotStep === 1 ? (
                                    <>
                                        <Text style={styles.modalTitle}>Forgot Password</Text>
                                        <Text style={[styles.modalSubtitle, { paddingHorizontal: 10 }]}>
                                            Reset password code will be sent to your email to reset your password.
                                        </Text>

                                        <View style={[styles.inputWrapper, { marginBottom: 30 }]}>
                                            <Text style={styles.inputLabel}>Email</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="mail-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.textInput}
                                                    placeholder="Tonald@work.com"
                                                    keyboardType="email-address"
                                                    value={forgotEmail}
                                                    onChangeText={setForgotEmail}
                                                />
                                            </View>
                                        </View>

                                        <TouchableOpacity 
                                            style={[styles.btnPrimary, !forgotEmail && { opacity: 0.5 }]}
                                            disabled={!forgotEmail}
                                            onPress={() => {
                                                setForgotStep(2);
                                            }}
                                        >
                                            <Text style={styles.btnPrimaryText}>Send Verification Code</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : forgotStep === 2 ? (
                                    <>
                                        <Text style={styles.modalTitle}>Forgot Password</Text>
                                        <Text style={[styles.modalSubtitle, { paddingHorizontal: 0, textAlign: 'left', marginBottom: 20 }]}>
                                            A reset code has been sent to <Text style={{fontWeight: 'bold', color: '#111827'}}>{forgotEmail || 'Tonald@work.com'}</Text>, check your email to continue the password reset process.
                                        </Text>

                                        <View style={styles.otpContainer}>
                                            {verificationCode.map((digit, index) => (
                                                <TextInput
                                                    key={index}
                                                    ref={(el) => (codeInputs.current[index] = el)}
                                                    style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                                                    keyboardType="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChangeText={(text) => {
                                                        let newCode = [...verificationCode];
                                                        newCode[index] = text;
                                                        setVerificationCode(newCode);
                                                        
                                                        // Move to next input if there's a value
                                                        if (text && index < 5) {
                                                            codeInputs.current[index + 1].focus();
                                                        }
                                                    }}
                                                    onKeyPress={({ nativeEvent }) => {
                                                        if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                                                            codeInputs.current[index - 1].focus();
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </View>

                                        <View style={styles.resendContainer}>
                                            <Text style={styles.resendText}>Haven't received the verification code? </Text>
                                            <TouchableOpacity>
                                                <Text style={styles.resendLink}>Resend it.</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity 
                                            style={[styles.btnPrimary, verificationCode.join('').length < 6 && { opacity: 0.5 }]}
                                            disabled={verificationCode.join('').length < 6}
                                            onPress={() => {
                                                setForgotStep(3);
                                            }}
                                        >
                                            <Text style={styles.btnPrimaryText}>Submit</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : forgotStep === 3 ? (
                                    <>
                                        <Text style={styles.modalTitle}>Set a New Password</Text>
                                        <Text style={[styles.modalSubtitle, { paddingHorizontal: 0, textAlign: 'left', marginBottom: 20 }]}>
                                            Please set a new password to secure your Work Mate account.
                                        </Text>

                                        <View style={styles.inputWrapper}>
                                            <Text style={styles.inputLabel}>Password</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                                                <TextInput
                                                    ref={newPasswordRef}
                                                    style={styles.textInput}
                                                    placeholder="Input Password"
                                                    secureTextEntry={!showNewPassword}
                                                    value={newPassword}
                                                    onChangeText={setNewPassword}
                                                />
                                                <TouchableOpacity onPress={() => {
                                                    setShowNewPassword(!showNewPassword);
                                                    setTimeout(() => newPasswordRef.current?.focus(), 100);
                                                }}>
                                                    <Ionicons name={showNewPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#8B5CF6" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View style={[styles.inputWrapper, { marginBottom: 30 }]}>
                                            <Text style={styles.inputLabel}>Confirm Password</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
                                                <TextInput
                                                    ref={confirmPasswordRef}
                                                    style={styles.textInput}
                                                    placeholder="Re Enter Your Password"
                                                    secureTextEntry={!showConfirmPassword}
                                                    value={confirmPassword}
                                                    onChangeText={setConfirmPassword}
                                                />
                                                <TouchableOpacity onPress={() => {
                                                    setShowConfirmPassword(!showConfirmPassword);
                                                    setTimeout(() => confirmPasswordRef.current?.focus(), 100);
                                                }}>
                                                    <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#8B5CF6" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <TouchableOpacity 
                                            style={[styles.btnPrimary, (!newPassword || !confirmPassword || newPassword !== confirmPassword) && { opacity: 0.5 }]}
                                            disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                                            onPress={() => {
                                                setForgotStep(4);
                                            }}
                                        >
                                            <Text style={styles.btnPrimaryText}>Submit</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={[styles.modalTitle, { marginTop: 10 }]}>Password Has Been Created</Text>
                                        <Text style={[styles.modalSubtitle, { paddingHorizontal: 10, marginTop: 15, marginBottom: 40 }]}>
                                            To log in to your account, click the Sign in button and enter your email along with your new password.
                                        </Text>

                                        <TouchableOpacity 
                                            style={styles.btnPrimary}
                                            onPress={() => {
                                                setIsForgotModalVisible(false);
                                                setForgotStep(1);
                                                setVerificationCode(['', '', '', '', '', '']);
                                                setNewPassword('');
                                                setConfirmPassword('');
                                                setForgotEmail('');
                                                // Reset and open sign in modal
                                                setTimeout(() => setIsModalVisible(true), 300);
                                            }}
                                        >
                                            <Text style={styles.btnPrimaryText}>Sign In</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

// === AREA STYLING ===
const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    imageContainer: { flex: 1.2, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    image: { marginTop: 300, width: '180%', height: '180%' },
    contentContainer: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 40 },
    title: { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 12 },
    subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
    paginationContainer: { flexDirection: 'row', gap: 8, marginBottom: 40 },
    dot: { height: 6, width: 20, backgroundColor: '#E5E7EB', borderRadius: 3 },
    activeDot: { backgroundColor: '#8B5CF6', width: 24 },
    buttonContainer: { width: '100%', gap: 16 },
    btnPrimary: { backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
    btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    btnSecondary: { backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#8B5CF6' },
    btnSecondaryText: { color: '#8B5CF6', fontSize: 16, fontWeight: '600' },

    forgotIconContainer: {
        position: 'absolute',
        top: -40,
        alignSelf: 'center',
        width: 80,
        height: 80,
        backgroundColor: '#8B5CF6',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
        zIndex: 10,
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
        width: '100%',
        maxHeight: '85%',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
    },
    modalTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
    modalSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 30, marginTop: 5 },
    inputWrapper: { marginBottom: 16 },
    inputLabel: { fontSize: 12, color: '#4B5563', marginBottom: 8, fontWeight: '500' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
    inputIcon: { marginRight: 12 },
    textInput: { flex: 1, fontSize: 16, color: '#111827', paddingRight: 10 },

    formOptions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#8B5CF6',
        borderRadius: 6,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    checkboxActive: {
        backgroundColor: '#8B5CF6',
    },
    rememberText: { color: '#111827', fontSize: 14 },
    forgotText: { color: '#8B5CF6', fontSize: 14, fontWeight: '500' },

    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    dividerText: { marginHorizontal: 16, color: '#9CA3AF', fontSize: 12 },
    btnSecondaryAlternatif: { backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#8B5CF6', flexDirection: 'row', justifyContent: 'center' },
    footerTextContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: '#4B5563', fontSize: 13 },
    footerTextLink: { color: '#8B5CF6', fontSize: 13, fontWeight: 'bold' },

    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingHorizontal: 0
    },
    otpInput: {
        width: 48,
        height: 56,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '500',
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },
    otpInputFilled: {
        borderColor: '#8B5CF6',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 30,
    },
    resendText: {
        fontSize: 13,
        color: '#4B5563',
    },
    resendLink: {
        fontSize: 13,
        color: '#8B5CF6',
        fontWeight: 'bold',
    },
});