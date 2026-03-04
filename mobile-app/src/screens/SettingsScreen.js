// Settings Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../App';

export default function SettingsScreen({ navigation }) {
  const { user, logout, hasPin, setHasPin } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout }
    ]);
  };

  const togglePin = () => {
    if (hasPin) {
      // Remove PIN logic
      setHasPin(false);
    } else {
      // Navigate to PIN setup
      navigation.navigate('PinLock', { setup: true });
    }
  };

  return (
    <LinearGradient colors={['#1A0529', '#0D0415']} style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.profileCard}>
            <LinearGradient colors={['#D946EF', '#8B5CF6']} style={styles.avatar}>
              {user?.picture ? (
                <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase()}</Text>
              ) : (
                <Ionicons name="person" size={32} color="white" />
              )}
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <Ionicons name="lock-closed" size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text style={styles.settingLabel}>PIN Lock</Text>
                <Text style={styles.settingDesc}>{hasPin ? 'Enabled' : 'Protect your app with a PIN'}</Text>
              </View>
            </View>
            <Switch
              value={hasPin}
              onValueChange={togglePin}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#D946EF' }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('Purchase')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Ionicons name="card" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.settingLabel}>Buy Credits</Text>
                <Text style={styles.settingDesc}>Current: {user?.credits} credits</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 24, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: 'white' },
  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12, fontWeight: '600', letterSpacing: 1 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  avatar: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 24, fontWeight: '900' },
  profileInfo: { marginLeft: 16 },
  profileName: { color: 'white', fontSize: 18, fontWeight: '700' },
  profileEmail: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingLabel: { color: 'white', fontSize: 16, fontWeight: '600' },
  settingDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 24, marginBottom: 40, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, padding: 16, gap: 8 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});
