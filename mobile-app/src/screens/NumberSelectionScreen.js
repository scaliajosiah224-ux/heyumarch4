// NumberSelection Screen Placeholder
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function NumberSelectionScreen({ navigation }) {
  return (
    <LinearGradient colors={['#1A0529', '#0D0415']} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Ionicons name="call" size={64} color="#D946EF" />
        <Text style={styles.title}>Select Your Number</Text>
        <Text style={styles.subtitle}>Choose an area code to see available numbers</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  backButton: { marginLeft: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: 'white', fontSize: 24, fontWeight: '900', marginTop: 24 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 8, textAlign: 'center' },
});
