import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Image, Phone, MoreVertical, Check, CheckCheck, 
  Wifi, WifiOff, Smile, Mic, X, Play, Pause, Video
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';
import useWebSocket from '../hooks/useWebSocket';
import { useAchievements } from '../components/AchievementProvider';

// Reaction emojis
const REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥'];

const Chat = () => {
  const { contactNumber } = useParams();
  const navigate = useNavigate();
  const { triggerAchievement, checkMessageCount } = useAchievements();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showReactions, setShowReactions] = useState(null); // message_id of message showing reactions
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  
  // WebSocket connection
  const {
    isConnected,
    sendChatMessage,
    sendTyping,
    sendStopTyping,
    markAsRead,
    addMessageHandler
  } = useWebSocket(true);

  // Handle incoming WebSocket messages
  useEffect(() => {
    const handleMessageSent = (data) => {
      if (data.message && data.message.to_number === contactNumber) {
        setMessages(prev => {
          const exists = prev.some(m => m.message_id === data.message.message_id);
          if (exists) return prev;
          const newMessages = [...prev, data.message];
          const outboundCount = newMessages.filter(m => m.direction === 'outbound').length;
          checkMessageCount(outboundCount);
          return newMessages;
        });
        setSending(false);
      }
    };

    const handleTyping = (data) => {
      if (data.contact_number === contactNumber) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleError = (data) => {
      if (data.error_code === 'insufficient_credits') {
        toast.error('Insufficient credits. Please purchase more.');
        navigate('/purchase');
      } else if (data.message) {
        toast.error(data.message);
      }
      setSending(false);
    };

    const cleanup1 = addMessageHandler('message_sent', handleMessageSent);
    const cleanup2 = addMessageHandler('typing', handleTyping);
    const cleanup3 = addMessageHandler('error', handleError);

    return () => {
      cleanup1();
      cleanup2();
      cleanup3();
    };
  }, [addMessageHandler, contactNumber, navigate, checkMessageCount]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = useCallback((e) => {
    setNewMessage(e.target.value);
    
    if (isConnected && e.target.value) {
      sendTyping(contactNumber);
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      const timeout = setTimeout(() => {
        sendStopTyping(contactNumber);
      }, 2000);
      setTypingTimeout(timeout);
    }
  }, [isConnected, contactNumber, sendTyping, sendStopTyping, typingTimeout]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages/thread/${encodeURIComponent(contactNumber)}`, {
        withCredentials: true
      });
      setMessages(response.data.messages);
      
      response.data.messages
        .filter(m => m.direction === 'inbound' && !m.is_read)
        .forEach(m => markAsRead(m.message_id));
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

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    if (isConnected) {
      const sent = sendChatMessage(contactNumber, messageText);
      if (sent) {
        const optimisticMessage = {
          message_id: `temp_${Date.now()}`,
          from_number: 'You',
          to_number: contactNumber,
          body: messageText,
          direction: 'outbound',
          status: 'sending',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMessage]);
        sendStopTyping(contactNumber);
        return;
      }
    }

    try {
      const response = await axios.post(`${API}/messages/send`, {
        to_number: contactNumber,
        body: messageText
      }, {
        withCredentials: true
      });

      setMessages(prev => {
        const filtered = prev.filter(m => !m.message_id.startsWith('temp_'));
        return [...filtered, response.data];
      });
    } catch (error) {
      if (error.response?.status === 402) {
        toast.error('Insufficient credits. Please purchase more.');
        navigate('/purchase');
      } else {
        toast.error('Failed to send message');
      }
      setMessages(prev => prev.filter(m => !m.message_id.startsWith('temp_')));
    } finally {
      setSending(false);
    }
  };

  // Add reaction to message
  const addReaction = async (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.message_id === messageId) {
        const reactions = msg.reactions || [];
        const existingIndex = reactions.findIndex(r => r.emoji === emoji);
        if (existingIndex >= 0) {
          // Remove if already reacted with same emoji
          return { ...msg, reactions: reactions.filter((_, i) => i !== existingIndex) };
        } else {
          // Add new reaction
          return { ...msg, reactions: [...reactions, { emoji, user: 'me' }] };
        }
      }
      return msg;
    }));
    setShowReactions(null);

    // Save reaction to backend
    try {
      await axios.post(`${API}/messages/${messageId}/react`, { emoji }, { withCredentials: true });
    } catch (error) {
      console.error('Failed to save reaction:', error);
    }
  };

  // Handle file attachment
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File too large. Max 10MB allowed.');
      return;
    }

    setShowAttachMenu(false);
    setSending(true);

    // Create optimistic message with media
    const optimisticMessage = {
      message_id: `temp_${Date.now()}`,
      from_number: 'You',
      to_number: contactNumber,
      body: file.type.startsWith('image/') ? '📷 Photo' : file.type.startsWith('video/') ? '🎬 Video' : '📎 File',
      media_url: URL.createObjectURL(file),
      media_type: file.type,
      direction: 'outbound',
      status: 'sending',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('to_number', contactNumber);

      const response = await axios.post(`${API}/messages/send-media`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessages(prev => {
        const filtered = prev.filter(m => !m.message_id.startsWith('temp_'));
        return [...filtered, response.data];
      });
    } catch (error) {
      toast.error('Failed to send media');
      setMessages(prev => prev.filter(m => !m.message_id.startsWith('temp_')));
    } finally {
      setSending(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        // Send voice message
        setSending(true);
        const optimisticMessage = {
          message_id: `temp_${Date.now()}`,
          from_number: 'You',
          to_number: contactNumber,
          body: `🎤 Voice message (${recordingTime}s)`,
          media_url: URL.createObjectURL(blob),
          media_type: 'audio/webm',
          direction: 'outbound',
          status: 'sending',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMessage]);
        
        // In production, upload to backend
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.message_id === optimisticMessage.message_id 
              ? { ...m, status: 'sent' } 
              : m
          ));
          setSending(false);
        }, 1000);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
    clearInterval(recordingIntervalRef.current);
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

  const getStatusIcon = (msg) => {
    if (msg.status === 'sending') {
      return <div className="w-3 h-3 border border-white/50 border-t-transparent rounded-full animate-spin" />;
    }
    if (msg.status === 'delivered' || msg.status === 'read') {
      return <CheckCheck className="w-3 h-3 text-cyan-400" />;
    }
    return <Check className="w-3 h-3 text-white/50" />;
  };

  // Render media content
  const renderMedia = (msg) => {
    if (!msg.media_url) return null;

    if (msg.media_type?.startsWith('image/')) {
      return (
        <img 
          src={msg.media_url} 
          alt="Shared media" 
          className="max-w-full rounded-xl mb-2 cursor-pointer hover:opacity-90"
          onClick={() => window.open(msg.media_url, '_blank')}
        />
      );
    }

    if (msg.media_type?.startsWith('video/')) {
      return (
        <video 
          src={msg.media_url} 
          controls 
          className="max-w-full rounded-xl mb-2"
        />
      );
    }

    if (msg.media_type?.startsWith('audio/')) {
      return (
        <audio 
          src={msg.media_url} 
          controls 
          className="w-full mb-2"
        />
      );
    }

    return null;
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
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold">{formatContactNumber(contactNumber)}</h1>
                {isConnected ? (
                  <Wifi className="w-3 h-3 text-green-400" title="Real-time connected" />
                ) : (
                  <WifiOff className="w-3 h-3 text-white/30" title="Offline mode" />
                )}
              </div>
              <p className="text-white/50 text-sm">
                {isTyping ? (
                  <span className="text-fuchsia-400 animate-pulse">typing...</span>
                ) : (
                  `${messages.length} messages`
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              data-testid="video-call-btn"
              onClick={() => toast.info('Video calling coming soon!')}
              className="w-10 h-10 rounded-full glass-panel flex items-center justify-center"
            >
              <Video className="w-5 h-5 text-fuchsia-400" />
            </button>
            <button
              data-testid="call-btn"
              onClick={() => toast.info('Voice calling coming soon!')}
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
                  className={`relative max-w-[80%] px-4 py-3 ${
                    msg.direction === 'outbound'
                      ? 'message-bubble-sent'
                      : 'message-bubble-received'
                  } ${msg.status === 'sending' ? 'opacity-70' : ''}`}
                  onDoubleClick={() => setShowReactions(msg.message_id)}
                >
                  {/* Media content */}
                  {renderMedia(msg)}
                  
                  <p className="text-white">{msg.body}</p>
                  
                  {/* Reactions display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {msg.reactions.map((reaction, i) => (
                        <span 
                          key={i}
                          className="text-sm bg-white/10 rounded-full px-2 py-0.5"
                        >
                          {reaction.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className={`flex items-center gap-1 mt-1 ${
                    msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-white/50 text-xs">{formatTime(msg.created_at)}</span>
                    {msg.direction === 'outbound' && getStatusIcon(msg)}
                  </div>

                  {/* Reaction picker */}
                  {showReactions === msg.message_id && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e0b2b] rounded-full px-2 py-1 flex gap-1 shadow-xl border border-white/10 animate-pop-in z-10">
                      {REACTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(msg.message_id, emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:scale-125 transition-transform text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowReactions(null)}
                        className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="message-bubble-received px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Attachment menu */}
      {showAttachMenu && (
        <div className="absolute bottom-20 left-4 right-4 glass-panel p-4 grid grid-cols-4 gap-4 animate-slide-up z-20">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
              <Image className="w-6 h-6 text-fuchsia-400" />
            </div>
            <span className="text-white/70 text-xs">Photo</span>
          </button>
          <button
            onClick={() => toast.info('GIF support coming soon!')}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <span className="text-cyan-400 font-bold text-sm">GIF</span>
            </div>
            <span className="text-white/70 text-xs">GIF</span>
          </button>
          <button
            onClick={() => {
              setShowAttachMenu(false);
              startRecording();
            }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Mic className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-white/70 text-xs">Voice</span>
          </button>
          <button
            onClick={() => toast.info('Video coming soon!')}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Video className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-white/70 text-xs">Video</span>
          </button>
        </div>
      )}

      {/* Recording UI */}
      {isRecording && (
        <div className="sticky bottom-0 p-4 glass-panel-light">
          <div className="flex items-center gap-4">
            <button
              onClick={cancelRecording}
              className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>
            <div className="flex-1 flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white font-medium">Recording... {recordingTime}s</span>
            </div>
            <button
              onClick={stopRecording}
              className="w-12 h-12 gummy-btn flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      {!isRecording && (
        <div className="sticky bottom-0 p-4 glass-panel-light">
          <form onSubmit={sendMessage} className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              className="hidden"
            />
            
            <button
              type="button"
              data-testid="attach-btn"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="w-10 h-10 rounded-full glass-panel flex items-center justify-center flex-shrink-0"
            >
              <Image className="w-5 h-5 text-white/70" />
            </button>
            
            <input
              ref={inputRef}
              data-testid="message-input"
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={handleInputChange}
              className="flex-1 gummy-input"
            />

            {/* Voice message button */}
            {!newMessage.trim() && (
              <button
                type="button"
                onClick={startRecording}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center flex-shrink-0"
              >
                <Mic className="w-5 h-5 text-fuchsia-400" />
              </button>
            )}
            
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
      )}
    </div>
  );
};

export default Chat;
