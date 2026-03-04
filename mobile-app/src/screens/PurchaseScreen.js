// Purchase Screen Placeholder
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function PurchaseScreen({ navigation }) {
  return (
    <LinearGradient colors={['#1A0529', '#0D0415']} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Ionicons name="wallet" size={64} color="#F59E0B" />
        <Text style={styles.title}>Get Credits</Text>
        <Text style={styles.subtitle}>Purchase credits to make calls and send texts</Text>
        
        <View style={styles.packages}>
          {[
            { name: 'Starter', credits: 50, price: '$4.99' },
            { name: 'Popular', credits: 150, price: '$9.99' },
            { name: 'Pro', credits: 500, price: '$24.99' },
          ].map((pkg, i) => (
            <TouchableOpacity key={i} style={[styles.package, i === 1 && styles.packagePopular]}>
              {i === 1 && <Text style={styles.popularBadge}>POPULAR</Text>}
              <Text style={styles.packageName}>{pkg.name}</Text>
              <Text style={styles.packageCredits}>{pkg.credits} credits</Text>
              <Text style={styles.packagePrice}>{pkg.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  backButton: { marginLeft: 24 },
  content: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 40 },
  title: { color: 'white', fontSize: 28, fontWeight: '900', marginTop: 24 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 8, marginBottom: 32 },
  packages: { width: '100%', gap: 12 },
  package: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  packagePopular: { borderColor: '#F59E0B' },
  popularBadge: { position: 'absolute', top: -10, right: 16, backgroundColor: '#F59E0B', color: 'white', fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  packageName: { color: 'white', fontSize: 18, fontWeight: '700' },
  packageCredits: { color: '#F59E0B', fontSize: 14, marginTop: 4 },
  packagePrice: { color: 'white', fontSize: 24, fontWeight: '900', marginTop: 8 },
});
