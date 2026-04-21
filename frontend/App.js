import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Layar yang sudah kita buat
import OnboardingScreen from './screens/OnboardingScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import ClockInScreen from './screens/ClockInScreen';
import CameraScreen from './screens/CameraScreen';
import SubmitClockInScreen from './screens/SubmitClockInScreen';
import AttendanceDetailsScreen from './screens/AttendanceDetailsScreen';

// Dummy screen for other tabs
const DummyScreen = () => <View style={{ flex: 1, backgroundColor: '#F3F4F6' }} />

// Inisialisasi Stack & Tab
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Notices') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'layers' : 'layers-outline';
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={24} color={focused ? '#FFFFFF' : '#A3A3A3'} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Calendar" component={AttendanceScreen} />
      <Tab.Screen name="Tasks" component={DummyScreen} />
      <Tab.Screen name="Notices" component={DummyScreen} />
      <Tab.Screen name="More" component={DummyScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        
        {/* Daftarkan halaman Onboarding */}
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen} 
          options={{ headerShown: false }} // Sembunyikan header bawaan
        />
        
        {/* Daftarkan halaman Sign Up */}
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen} 
          options={{ headerShown: false }} // Sembunyikan header bawaan
        />

        {/* Daftarkan halaman Main / Dashboard yang berisi Tab Menu */}
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        {/* Daftarkan halaman Clock In Area */}
        <Stack.Screen
          name="ClockIn"
          component={ClockInScreen}
          options={{ headerShown: false }}
        />

        {/* Daftarkan halaman Kamera */}
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ headerShown: false }}
        />

        {/* Daftarkan halaman Submit Clock In */}
        <Stack.Screen
          name="SubmitClockIn"
          component={SubmitClockInScreen}
          options={{ headerShown: false }}
        />

        {/* Daftarkan halaman Attendance Details */}
        <Stack.Screen
          name="AttendanceDetails"
          component={AttendanceDetailsScreen}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    width: 20,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginTop: 4,
    position: 'absolute',
    bottom: -10,
  }
});