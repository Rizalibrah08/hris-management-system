import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer, CommonActions, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
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
import NotificationScreen from './screens/NotificationScreen';
import AttendanceCalendarScreen from './screens/AttendanceCalendarScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useAuth()
  const isEmployee = user?.role === 'Employee'

  const tabs = [
    { name: 'Home', component: DashboardScreen, iconFocused: 'home', iconOutline: 'home-outline' },
    { name: 'Attendance', component: AttendanceScreen, iconFocused: 'calendar', iconOutline: 'calendar-outline' },
    { name: 'Payroll', component: PayrollTaxScreen, iconFocused: 'wallet', iconOutline: 'wallet-outline' },
    { name: 'Leave', component: LeaveScreen, iconFocused: 'layers', iconOutline: 'layers-outline' },
    { name: 'Profile', component: ProfileScreen, iconFocused: 'person', iconOutline: 'person-outline' },
  ]

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopWidth: 0,
          minHeight: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const tab = tabs.find(t => t.name === route.name)
          const iconName = focused ? tab?.iconFocused : tab?.iconOutline
          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={24} color={focused ? '#FFFFFF' : '#A3A3A3'} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
      })}
    >
      {tabs.filter(t => !t.hide).map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const navigationRef = useRef(null);

  useEffect(() => {
    if (!loading && navigationRef.current) {
      if (user) {
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        );
      } else {
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          })
        );
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Memulihkan sesi...</Text>
      </View>
    );
  }

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#1E1E1E',
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={MyTheme}>
      <Stack.Navigator initialRouteName={user ? 'Main' : 'Onboarding'}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="ClockIn" component={ClockInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SubmitClockIn" component={SubmitClockInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AttendanceDetails" component={AttendanceDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PayrollTax" component={PayrollTaxScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PayrollDetails" component={PayrollDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PersonalData" component={PersonalDataScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SubmitLeave" component={SubmitLeaveScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AttendanceCalendar" component={AttendanceCalendarScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60000 } } });

export default function App() {
  useEffect(() => {
    Platform.OS === 'android' && NavigationBar.setVisibilityAsync("hidden");
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
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