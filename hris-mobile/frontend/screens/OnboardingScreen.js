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
    const [showPassword, setShowPassword] = useState(false);

    const handleNext = () => { if (currentIndex < slides.length - 1) setCurrentIndex(currentIndex + 1); };
    const handleSkip = () => { setCurrentIndex(slides.length - 1); };

    const currentSlide = slides[currentIndex];
    const isLastSlide = currentIndex === slides.length - 1;

    return (
        <>
            <LinearGradient colors={['#5341cd', '#e4dfff', '#f8f9fd']} style={styles.container}>
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
                                    <TouchableOpacity style={styles.btnSecondary} onPress={() => { setIsModalVisible(false); navigation.navigate('Login'); }}>
                                        <Text style={styles.btnSecondaryText}>Login with NIK</Text>
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

                                <TouchableOpacity 
                                    style={styles.btnPrimary}
                                    onPress={() => {
                                        setIsModalVisible(false);
                                        navigation.navigate('Login');
                                    }}
                                >
                                    <Text style={styles.btnPrimaryText}>Sign In</Text>
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <TouchableOpacity style={[styles.btnSecondaryAlternatif, { marginBottom: 16 }]} onPress={() => { setIsModalVisible(false); navigation.navigate('Login'); }}>
                                    <Ionicons name="person-outline" size={18} color="#8B5CF6" style={{ marginRight: 8 }} />
                                    <Text style={styles.btnSecondaryText}>Sign in With Employee ID</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.btnSecondaryAlternatif} onPress={() => { setIsModalVisible(false); navigation.navigate('Login'); }}>
                                    <Ionicons name="call-outline" size={18} color="#8B5CF6" style={{ marginRight: 8 }} />
                                    <Text style={styles.btnSecondaryText}>Sign in With Phone</Text>
                                </TouchableOpacity>

                                <View style={styles.footerTextContainer}>
                                    <Text style={styles.footerText}>HR Management System </Text>
                                    <Text style={styles.footerTextLink}>Curated HR</Text>
                                </View>
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
    activeDot: { backgroundColor: '#5341cd', width: 24 },
    buttonContainer: { width: '100%', gap: 16 },
    btnPrimary: { backgroundColor: '#5341cd', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
    btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    btnSecondary: { backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#5341cd' },
    btnSecondaryText: { color: '#5341cd', fontSize: 16, fontWeight: '600' },

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

    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    dividerText: { marginHorizontal: 16, color: '#9CA3AF', fontSize: 12 },
    btnSecondaryAlternatif: { backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#5341cd', flexDirection: 'row', justifyContent: 'center' },
    footerTextContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: '#4B5563', fontSize: 13 },
    footerTextLink: { color: '#5341cd', fontSize: 13, fontWeight: 'bold' },
});