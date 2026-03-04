// PIN Lock Screen Placeholder
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../App';

export default function PinLockScreen({ route }) {
  const { verifyPin } = useAuth();
  const isSetup = route?.params?.setup;

  // Auto-verify for now (implement full PIN logic)
  React.useEffect(() => {
    if (!isSetup) {
      setTimeout(() => verifyPin(), 100);
    }
  }, []);

  return (
    <LinearGradient colors={['#1A0529', '#0D0415']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={48} color="white" />
        </View>
        <Text style={styles.title}>{isSetup ? 'Set PIN' : 'Enter PIN'}</Text>
        <View style={styles.dots}>
          {[0,1,2,3].map(i => <View key={i} style={styles.dot} />)}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  lockIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(217, 70, 239, 0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 32 },
  dots: { flexDirection: 'row', gap: 16 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' },
});
