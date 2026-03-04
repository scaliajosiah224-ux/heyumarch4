// Splash Screen with Animated Logo
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={['#1A0529', '#0D0415', '#0D0415']}
      style={styles.container}
    >
      {/* Background Blobs */}
      <View style={styles.blobContainer}>
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
      </View>

      {/* Glow Effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={['#D946EF', '#8B5CF6']}
          style={styles.logoGradient}
        >
          <Ionicons name="call" size={48} color="white" />
        </LinearGradient>
      </Animated.View>

      {/* Brand Name */}
      <Animated.View style={{ opacity: textOpacity }}>
        <Text style={styles.brandName}>GummyText</Text>
        <Text style={styles.tagline}>Your Second Number</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blobContainer: {
    position: 'absolute',
    width: width,
    height: height,
  },
  blob: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.3,
  },
  blob1: {
    width: 300,
    height: 300,
    backgroundColor: '#D946EF',
    top: -100,
    left: -100,
    transform: [{ scale: 1.5 }],
  },
  blob2: {
    width: 250,
    height: 250,
    backgroundColor: '#06B6D4',
    bottom: -50,
    right: -50,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#D946EF',
    opacity: 0.2,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D946EF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
});
