// GummyText Mobile App - Main Entry Point
import React, { useEffect, useState, createContext, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';

// Screens
import SplashScreenComponent from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import NumberSelectionScreen from './src/screens/NumberSelectionScreen';
import DialerScreen from './src/screens/DialerScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ChatScreen from './src/screens/ChatScreen';
import VoicemailScreen from './src/screens/VoicemailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PinLockScreen from './src/screens/PinLockScreen';
import PurchaseScreen from './src/screens/PurchaseScreen';

// API Service
import { api, setAuthToken } from './src/services/api';

// Keep splash screen visible while we load
SplashScreen.preventAutoHideAsync();

// Custom Theme
const GummyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#D946EF',
    background: '#0D0415',
    card: '#1A0529',
    text: '#FFFFFF',
    border: 'rgba(255,255,255,0.1)',
    notification: '#D946EF',
  },
};

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Navigation Stacks
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator (Dashboard)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dialer') {
            iconName = focused ? 'keypad' : 'keypad-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Voicemail') {
            iconName = focused ? 'recording' : 'recording-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#D946EF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarStyle: {
          backgroundColor: 'rgba(13, 4, 21, 0.95)',
          borderTopColor: 'rgba(255,255,255,0.1)',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dialer" component={DialerScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Voicemail" component={VoicemailScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Main App Stack
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="NumberSelection" component={NumberSelectionScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="PinLock" component={PinLockScreen} />
      <Stack.Screen name="Purchase" component={PurchaseScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [hasPin, setHasPin] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);

  useEffect(() => {
    // Hide splash after animation
    const timer = setTimeout(() => {
      setShowSplash(false);
      SplashScreen.hideAsync();
    }, 2500);

    checkAuth();
    return () => clearTimeout(timer);
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        setAuthToken(token);
        const response = await api.get('/auth/me');
        setUser(response.data);
        
        // Check PIN status
        const pinResponse = await api.get('/auth/pin/status');
        setHasPin(pinResponse.data.has_pin);
        setPinVerified(!pinResponse.data.has_pin);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await SecureStore.deleteItemAsync('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData, token) => {
    setUser(userData);
    if (token) {
      await SecureStore.setItemAsync('auth_token', token);
      setAuthToken(token);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Logout error:', error);
    }
    await SecureStore.deleteItemAsync('auth_token');
    setUser(null);
    setHasPin(false);
    setPinVerified(true);
  };

  const verifyPin = () => {
    setPinVerified(true);
  };

  const updateCredits = (newCredits) => {
    setUser(prev => prev ? { ...prev, credits: newCredits } : null);
  };

  if (showSplash) {
    return <SplashScreenComponent />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0415' }}>
        <ActivityIndicator size="large" color="#D946EF" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      checkAuth, 
      hasPin, 
      setHasPin,
      pinVerified, 
      verifyPin,
      updateCredits 
    }}>
      <NavigationContainer theme={GummyTheme}>
        <StatusBar style="light" />
        {!user ? (
          <AuthStack />
        ) : hasPin && !pinVerified ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PinLock" component={PinLockScreen} />
          </Stack.Navigator>
        ) : (
          <AppStack />
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
