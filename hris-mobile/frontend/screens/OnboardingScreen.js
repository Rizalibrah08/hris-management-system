import React, { useState, useRef, useCallback } from 'react';
import {
    StyleSheet, Text, View, Image, TouchableOpacity, FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
    { id: 0, title: 'Welcome to Workmate!', subtitle: 'Make Smart Decisions! Set clear timelines...', image: require('../assets/ob1.png') },
    { id: 1, title: 'Manage Stress Effectively', subtitle: 'Stay Balanced! Track your workload...', image: require('../assets/ob1.png') },
    { id: 2, title: 'Plan for Success', subtitle: 'Your Journey Starts Here! Earn achievement badges...', image: require('../assets/ob1.png') },
    { id: 3, title: 'Navigate Your Work Journey\nEfficient & Easy', subtitle: 'Increase your work management...', image: require('../assets/ob1.png') },
];

export default function OnboardingScreen({ navigation }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const goTo = (index) => {
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    const isLastSlide = currentIndex === slides.length - 1;

    const renderSlide = ({ item }) => (
        <View style={styles.slide}>
            <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
        </View>
    );

    return (
        <LinearGradient colors={['#5341cd', '#e4dfff', '#f8f9fd']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <FlatList
                    ref={flatListRef}
                    data={slides}
                    renderItem={renderSlide}
                    keyExtractor={(item) => String(item.id)}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    getItemLayout={(_, index) => ({
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                    })}
                />

                <View style={styles.controls}>
                    <View style={styles.paginationContainer}>
                        {slides.map((_, index) => (
                            <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
                        ))}
                    </View>

                    <View style={styles.buttonContainer}>
                        {isLastSlide ? (
                            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.btnPrimaryText}>Masuk dengan NIK</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.btnPrimary} onPress={() => goTo(currentIndex + 1)}>
                                    <Text style={styles.btnPrimaryText}>Next</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnSecondary} onPress={() => goTo(slides.length - 1)}>
                                    <Text style={styles.btnSecondaryText}>Skip</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    slide: { width: SCREEN_WIDTH, flex: 1 },
    imageContainer: { flex: 1.2, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    image: { marginTop: 150, width: '150%', height: '150%' },
    contentContainer: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 12 },
    subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 16, lineHeight: 22 },
    controls: { paddingHorizontal: 24, paddingBottom: 40 },
    paginationContainer: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 40 },
    dot: { height: 6, width: 20, backgroundColor: '#E5E7EB', borderRadius: 3 },
    activeDot: { backgroundColor: '#5341cd', width: 24 },
    buttonContainer: { width: '100%', gap: 16 },
    btnPrimary: { backgroundColor: '#5341cd', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
    btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    btnSecondary: { backgroundColor: 'transparent', paddingVertical: 16, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: '#5341cd' },
    btnSecondaryText: { color: '#5341cd', fontSize: 16, fontWeight: '600' },
});
