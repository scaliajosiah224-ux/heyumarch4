import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Search, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import useWebSocket from '../hooks/useWebSocket';

const MessagesTab = ({ primaryNumber }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newNumber, setNewNumber] = useState('');

  // WebSocket connection for real-time updates
  const { isConnected, addMessageHandler } = useWebSocket(true);

  // Handle incoming messages to update conversation list
  useEffect(() => {
    const handleNewMessage = (data) => {
      if (data.message) {
        // Refresh conversations when a new message is sent/received
        fetchConversations();
      }
    };

    const cleanup = addMessageHandler('message_sent', handleNewMessage);
    return cleanup;
  }, [addMessageHandler]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API}/messages/conversations`, {
        withCredentials: true
      });
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = () => {
    if (newNumber.trim()) {
      // Format number
      let formattedNumber = newNumber.replace(/\D/g, '');
      if (formattedNumber.length === 10) {
        formattedNumber = '+1' + formattedNumber;
      } else if (!formattedNumber.startsWith('+')) {
        formattedNumber = '+' + formattedNumber;
      }
      navigate(`/chat/${encodeURIComponent(formattedNumber)}`);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="messages-tab">
      {/* Connection Status */}
      <div className="flex items-center justify-end mb-2">
        {isConnected ? (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <Wifi className="w-3 h-3" />
            <span>Real-time</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-white/30">
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </div>
        )}
      </div>

      {/* New Message Button */}
      <button
        data-testid="new-message-btn"
        onClick={() => setShowNewMessage(true)}
        className="w-full glass-panel p-4 mb-4 flex items-center gap-3 hover:border-fuchsia-500/50 transition-all"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <span className="text-white font-medium">New Message</span>
      </button>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-fuchsia-500/20 flex items-center justify-center mb-4">
            <MessageSquare className="w-10 h-10 text-fuchsia-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No messages yet</h3>
          <p className="text-white/50">Start a conversation with someone</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.contact_number}
              data-testid={`conversation-${conv.contact_number}`}
              onClick={() => navigate(`/chat/${encodeURIComponent(conv.contact_number)}`)}
              className="w-full glass-panel p-4 flex items-center gap-4 hover:border-fuchsia-500/30 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">
                  {conv.contact_number?.slice(-2) || '??'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-semibold truncate">
                    {formatContactNumber(conv.contact_number)}
                  </p>
                  <span className="text-white/40 text-xs flex-shrink-0 ml-2">
                    {formatTime(conv.last_message?.created_at)}
                  </span>
                </div>
                <p className="text-white/50 text-sm truncate">
                  {conv.last_message?.direction === 'outbound' && 'You: '}
                  {conv.last_message?.body}
                </p>
              </div>
              {conv.unread_count > 0 && (
                <div className="w-6 h-6 rounded-full bg-fuchsia-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{conv.unread_count}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div data-testid="new-message-modal" className="glass-panel p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-4">New Message</h3>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                data-testid="new-message-number"
                type="tel"
                placeholder="Enter phone number..."
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="w-full gummy-input pl-12"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                data-testid="cancel-new-message"
                onClick={() => {
                  setShowNewMessage(false);
                  setNewNumber('');
                }}
                className="flex-1 gummy-btn-secondary py-3"
              >
                Cancel
              </button>
              <button
                data-testid="start-conversation"
                onClick={handleStartConversation}
                disabled={!newNumber.trim()}
                className="flex-1 gummy-btn py-3 disabled:opacity-50"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesTab;
