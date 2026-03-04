// Messages Screen - Conversation List
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../App';
import { messagesAPI, phoneAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function MessagesScreen({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [primaryNumber, setPrimaryNumber] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      fetchPrimaryNumber();
    }, [])
  );

  const fetchPrimaryNumber = async () => {
    try {
      const response = await phoneAPI.getUserNumbers();
      const primary = response.data.find(n => n.is_primary);
      setPrimaryNumber(primary);
    } catch (error) {
      console.log('Error fetching primary number:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.log('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const formatContactNumber = (number) => {
    if (!number) return 'Unknown';
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return number;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleStartConversation = () => {
    if (!newNumber.trim()) return;
    
    let formattedNumber = newNumber.replace(/\D/g, '');
    if (formattedNumber.length === 10) {
      formattedNumber = '+1' + formattedNumber;
    } else if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }
    
    setShowNewMessage(false);
    setNewNumber('');
    navigation.navigate('Chat', { contactNumber: formattedNumber });
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Chat', { contactNumber: item.contact_number })}
    >
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.contact_number) }]}>
        <Text style={styles.avatarText}>
          {item.contact_number?.slice(-2) || '??'}
        </Text>
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.contactName} numberOfLines={1}>
            {formatContactNumber(item.contact_number)}
          </Text>
          <Text style={styles.timestamp}>
            {formatTime(item.last_message?.created_at)}
          </Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message?.direction === 'outbound' && 'You: '}
          {item.last_message?.body}
        </Text>
      </View>
      
      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const getAvatarColor = (number) => {
    const colors = ['#D946EF', '#06B6D4', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'];
    const index = number ? number.charCodeAt(number.length - 1) % colors.length : 0;
    return colors[index];
  };

  return (
    <LinearGradient colors={['#1A0529', '#0D0415']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerLabel}>Messages</Text>
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

      {/* New Message Button */}
      <TouchableOpacity
        style={styles.newMessageButton}
        onPress={() => setShowNewMessage(true)}
      >
        <LinearGradient
          colors={['rgba(217, 70, 239, 0.2)', 'rgba(139, 92, 246, 0.2)']}
          style={styles.newMessageGradient}
        >
          <View style={styles.newMessageIcon}>
            <Ionicons name="add" size={24} color="#D946EF" />
          </View>
          <Text style={styles.newMessageText}>New Message</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.contact_number}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D946EF"
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubbles-outline" size={48} color="#D946EF" />
              </View>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>Start a conversation with someone</Text>
            </View>
          )
        }
      />

      {/* New Message Modal */}
      <Modal
        visible={showNewMessage}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Message</Text>
            
            <View style={styles.modalInput}>
              <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.4)" />
              <TextInput
                style={styles.modalInputField}
                placeholder="Enter phone number..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newNumber}
                onChangeText={setNewNumber}
                keyboardType="phone-pad"
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowNewMessage(false);
                  setNewNumber('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalStartButton}
                onPress={handleStartConversation}
              >
                <LinearGradient
                  colors={['#D946EF', '#8B5CF6']}
                  style={styles.modalStartGradient}
                >
                  <Text style={styles.modalStartText}>Start Chat</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
  },
  headerNumber: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
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
  newMessageButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  newMessageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 70, 239, 0.3)',
    gap: 12,
  },
  newMessageIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 70, 239, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newMessageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  lastMessage: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  unreadBadge: {
    backgroundColor: '#D946EF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(217, 70, 239, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1E0B2B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalInputField: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalCancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalStartButton: {
    flex: 1,
  },
  modalStartGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalStartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
