import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import ClockInScreen from './screens/ClockInScreen';
import CameraScreen from './screens/CameraScreen';
import SubmitClockInScreen from './screens/SubmitClockInScreen';
import AttendanceDetailsScreen from './screens/AttendanceDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import PayrollTaxScreen from './screens/PayrollTaxScreen';
import PayrollDetailsScreen from './screens/PayrollDetailsScreen';
import PersonalDataScreen from './screens/PersonalDataScreen';
import LeaveScreen from './screens/LeaveScreen';
import SubmitLeaveScreen from './screens/SubmitLeaveScreen';

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
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Attendance') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Payroll') iconName = focused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'Leave') iconName = focused ? 'layers' : 'layers-outline';
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
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Payroll" component={PayrollTaxScreen} />
      <Tab.Screen name="Leave" component={LeaveScreen} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Main' : 'Onboarding'}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="ClockIn" component={ClockInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SubmitClockIn" component={SubmitClockInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AttendanceDetails" component={AttendanceDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PayrollTax" component={PayrollTaxScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PayrollDetails" component={PayrollDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PersonalData" component={PersonalDataScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SubmitLeave" component={SubmitLeaveScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    Platform.OS === 'android' && NavigationBar.setVisibilityAsync("hidden");
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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
  },
});