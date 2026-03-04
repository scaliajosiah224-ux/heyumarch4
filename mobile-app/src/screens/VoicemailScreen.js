// Placeholder screens for mobile app
// These are simplified versions - expand as needed

// VoicemailScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function VoicemailScreen() {
  return (
    <LinearGradient colors={['#1A0529', '#0D0415']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voicemail</Text>
      </View>
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons name="recording-outline" size={48} color="#8B5CF6" />
        </View>
        <Text style={styles.emptyTitle}>No voicemails</Text>
        <Text style={styles.emptySubtitle}>Missed calls will leave voicemails here</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 24, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '900', color: 'white' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 100 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(139, 92, 246, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
});
