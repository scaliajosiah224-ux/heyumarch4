// Chat Screen - Individual Conversation
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { messagesAPI } from '../services/api';

export default function ChatScreen({ route, navigation }) {
  const { contactNumber } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [contactNumber]);

  const fetchMessages = async () => {
    try {
      const response = await messagesAPI.getThread(contactNumber);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.log('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);
    
    try {
      const response = await messagesAPI.send(contactNumber, newMessage);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      if (error.response?.status === 402) {
        Alert.alert('Insufficient Credits', 'Please purchase more credits to send messages.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Buy Credits', onPress: () => navigation.navigate('Purchase') }
        ]);
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatContactNumber = (number) => {
    if (!number) return 'Unknown';
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return number;
  };

  const renderMessage = ({ item }) => {
    const isOutbound = item.direction === 'outbound';
    
    return (
      <View style={[styles.messageRow, isOutbound ? styles.messageRowRight : styles.messageRowLeft]}>
        <View style={[styles.messageBubble, isOutbound ? styles.messageBubbleSent : styles.messageBubbleReceived]}>
          {isOutbound ? (
            <LinearGradient
              colors={['#D946EF', '#8B5CF6']}
              style={styles.messageBubbleGradient}
            >
              <Text style={styles.messageText}>{item.body}</Text>
              <View style={styles.messageFooter}>
                <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
                <Ionicons 
                  name={item.status === 'delivered' ? 'checkmark-done' : 'checkmark'} 
                  size={14} 
                  color={item.status === 'delivered' ? '#06B6D4' : 'rgba(255,255,255,0.5)'}
                />
              </View>
            </LinearGradient>
          ) : (
            <>
              <Text style={styles.messageText}>{item.body}</Text>
              <Text style={[styles.messageTime, { textAlign: 'left' }]}>{formatTime(item.created_at)}</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#1A0529', '#0D0415']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{formatContactNumber(contactNumber)}</Text>
          <Text style={styles.headerSubtitle}>{messages.length} messages</Text>
        </View>
        
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={24} color="#06B6D4" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.messagesContainer}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.message_id || index.toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyState}>
                <Ionicons name="send-outline" size={40} color="#D946EF" />
                <Text style={styles.emptyText}>Start a conversation</Text>
              </View>
            )
          }
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="image-outline" size={24} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1600}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <LinearGradient
              colors={newMessage.trim() ? ['#D946EF', '#8B5CF6'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)']}
              style={styles.sendButtonGradient}
            >
              {sending ? (
                <Ionicons name="hourglass-outline" size={20} color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(26, 5, 41, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 12,
  },
  messageRowLeft: {
    alignItems: 'flex-start',
  },
  messageRowRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  messageBubbleSent: {
    borderBottomRightRadius: 4,
  },
  messageBubbleReceived: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderBottomLeftRadius: 4,
  },
  messageBubbleGradient: {
    padding: 12,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(26, 5, 41, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
