import React from 'react';
import {
    StyleSheet, Text, View, ImageBackground, TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingScreen({ navigation }) {
    return (
        <View style={styles.wrapper}>
            <StatusBar hidden />
            <ImageBackground 
                source={require('../assets/halaman-login.png')} 
                style={styles.container}
                resizeMode="cover"
            >
                <View style={styles.content}>
                    <View style={styles.spacer} />
                    <View style={styles.controls}>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.btnPrimaryText}>Masuk dengan NIK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { 
        flex: 1,
        backgroundColor: '#8B5CF6',
    },
    container: { 
        flex: 1,
        width: '100%',
        height: '100%',
    },
    content: { 
        flex: 1,
        justifyContent: 'flex-end',
    },
    spacer: {
        flex: 1,
    },
    controls: { 
        paddingHorizontal: 24,
        paddingBottom: 30,  // 👈 UBAH INI untuk jarak dari bawah
        backgroundColor: 'transparent',
    },
    buttonContainer: { width: '100%' },
    btnPrimary: { 
        backgroundColor: '#5341cd', 
        paddingVertical: 16, 
        borderRadius: 30, 
        alignItems: 'center',
    },
    btnPrimaryText: { 
        color: '#FFFFFF', 
        fontSize: 16, 
        fontWeight: '600',
    },
});
