import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Layar yang sudah kita buat
import OnboardingScreen from './screens/OnboardingScreen';
import SignUpScreen from './screens/SignUpScreen';

// Inisialisasi Stack
const Stack = createNativeStackNavigator();

export default function App() {
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

      </Stack.Navigator>
    </NavigationContainer>
  );
}