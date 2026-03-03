import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Image, Phone, MoreVertical, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';

const Chat = () => {
  const { contactNumber } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [contactNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages/thread/${encodeURIComponent(contactNumber)}`, {
        withCredentials: true
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await axios.post(`${API}/messages/send`, {
        to_number: contactNumber,
        body: newMessage
      }, {
        withCredentials: true
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      if (error.response?.status === 402) {
        toast.error('Insufficient credits. Please purchase more.');
        navigate('/purchase');
      } else {
        toast.error('Failed to send message');
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

  return (
    <div data-testid="chat-screen" className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel-light px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              data-testid="back-btn"
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-full glass-panel flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            <div>
              <h1 className="text-white font-bold">{formatContactNumber(contactNumber)}</h1>
              <p className="text-white/50 text-sm">
                {messages.length} messages
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              data-testid="call-btn"
              className="w-10 h-10 rounded-full glass-panel flex items-center justify-center"
            >
              <Phone className="w-5 h-5 text-cyan-400" />
            </button>
            <button
              data-testid="more-btn"
              className="w-10 h-10 rounded-full glass-panel flex items-center justify-center"
            >
              <MoreVertical className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-fuchsia-500/20 flex items-center justify-center mb-4">
              <Send className="w-10 h-10 text-fuchsia-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Start a conversation</h3>
            <p className="text-white/50">Send your first message below</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div
                key={msg.message_id || index}
                className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 ${
                    msg.direction === 'outbound'
                      ? 'message-bubble-sent'
                      : 'message-bubble-received'
                  }`}
                >
                  <p className="text-white">{msg.body}</p>
                  <div className={`flex items-center gap-1 mt-1 ${
                    msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-white/50 text-xs">{formatTime(msg.created_at)}</span>
                    {msg.direction === 'outbound' && (
                      msg.status === 'delivered' ? (
                        <CheckCheck className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <Check className="w-3 h-3 text-white/50" />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div className="sticky bottom-0 p-4 glass-panel-light">
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <button
            type="button"
            data-testid="attach-btn"
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center flex-shrink-0"
          >
            <Image className="w-5 h-5 text-white/70" />
          </button>
          
          <input
            data-testid="message-input"
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 gummy-input"
          />
          
          <button
            type="submit"
            data-testid="send-btn"
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 gummy-btn flex items-center justify-center flex-shrink-0 disabled:opacity-50"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
