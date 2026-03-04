// Dialer Screen with 3D Gummy Keypad
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../App';
import { phoneAPI, callsAPI } from '../services/api';

const { width } = Dimensions.get('window');
const KEYPAD_SIZE = (width - 100) / 3;

const keys = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' },
  { digit: '0', letters: '+' },
  { digit: '#', letters: '' },
];

export default function DialerScreen({ navigation }) {
  const { user } = useAuth();
  const [number, setNumber] = useState('');
  const [primaryNumber, setPrimaryNumber] = useState(null);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    fetchPrimaryNumber();
  }, []);

  const fetchPrimaryNumber = async () => {
    try {
      const response = await phoneAPI.getUserNumbers();
      const primary = response.data.find(n => n.is_primary);
      setPrimaryNumber(primary);
      
      if (!response.data.length) {
        navigation.navigate('NumberSelection');
      }
    } catch (error) {
      console.log('Error fetching numbers:', error);
    }
  };

  const handleKeyPress = async (digit) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNumber(prev => prev + digit);
  };

  const handleDelete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNumber(prev => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (!number || calling) return;
    
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCalling(true);
    
    try {
      let formattedNumber = number.replace(/\D/g, '');
      if (formattedNumber.length === 10) {
        formattedNumber = '+1' + formattedNumber;
      } else if (!formattedNumber.startsWith('+')) {
        formattedNumber = '+' + formattedNumber;
      }
      
      await callsAPI.initiate(formattedNumber);
      // In a real app, this would open the WebRTC call UI
    } catch (error) {
      console.log('Call error:', error);
    } finally {
      setCalling(false);
    }
  };

  const formatDisplay = (num) => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  return (
    <LinearGradient colors={['#1A0529', '#0D0415']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerLabel}>Your Number</Text>
            <Text style={styles.headerNumber}>
              {primaryNumber?.friendly_name || 'No number'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.creditsButton}
            onPress={() => navigation.navigate('Purchase')}
          >
            <Ionicons name="wallet-outline" size={16} color="#F59E0B" />
            <Text style={styles.creditsText}>{user?.credits || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Display */}
      <View style={styles.display}>
        <Text style={styles.displayText}>
          {number ? formatDisplay(number) : 'Enter number'}
        </Text>
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {keys.map((key, index) => (
          <TouchableOpacity
            key={key.digit}
            style={styles.keyButton}
            onPress={() => handleKeyPress(key.digit)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#3d1a52', '#2a0f3a']}
              style={styles.keyGradient}
            >
              <Text style={styles.keyDigit}>{key.digit}</Text>
              {key.letters && <Text style={styles.keyLetters}>{key.letters}</Text>}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {/* Message Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          disabled={!number}
          onPress={() => {
            let formattedNumber = number.replace(/\D/g, '');
            if (formattedNumber.length === 10) formattedNumber = '+1' + formattedNumber;
            navigation.navigate('Chat', { contactNumber: formattedNumber });
          }}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#06B6D4" />
        </TouchableOpacity>

        {/* Call Button */}
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCall}
          disabled={!number || calling}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.callButtonGradient}
          >
            {calling ? (
              <Ionicons name="pulse" size={32} color="white" />
            ) : (
              <Ionicons name="call" size={32} color="white" />
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleDelete}
          disabled={!number}
        >
          <Ionicons name="backspace-outline" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  headerNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  creditsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  creditsText: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  display: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
  },
  displayText: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 2,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  keyButton: {
    width: KEYPAD_SIZE,
    height: KEYPAD_SIZE,
  },
  keyGradient: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    // 3D effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  keyDigit: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  keyLetters: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    gap: 30,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  callButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
});
