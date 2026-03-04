import { useState, useEffect, useCallback, useRef } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const WS_URL = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');

export const useWebSocket = (enabled = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const messageHandlersRef = useRef(new Map());

  const connect = useCallback(() => {
    if (!enabled) return;
    
    // Get token from cookie or localStorage
    const cookies = document.cookie.split(';');
    let token = '';
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'session_token') {
        token = value;
        break;
      }
    }
    
    if (!token) {
      token = localStorage.getItem('auth_token') || '';
    }

    if (!token) {
      console.log('No auth token found for WebSocket');
      return;
    }

    const wsUrl = `${WS_URL}/api/ws/chat?token=${encodeURIComponent(token)}`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        
        // Attempt to reconnect after 3 seconds (unless intentionally closed)
        if (event.code !== 1000 && event.code !== 4001) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connect();
          }, 3000);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Call registered handlers for this message type
          const handlers = messageHandlersRef.current.get(data.type) || [];
          handlers.forEach(handler => handler(data));
          
          // Call 'all' handlers
          const allHandlers = messageHandlersRef.current.get('all') || [];
          allHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, [enabled]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnecting');
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket not connected, cannot send message');
    return false;
  }, []);

  const sendChatMessage = useCallback((toNumber, body, mediaUrl = null) => {
    return sendMessage({
      type: 'message',
      to_number: toNumber,
      body,
      media_url: mediaUrl
    });
  }, [sendMessage]);

  const sendTyping = useCallback((contactNumber) => {
    return sendMessage({
      type: 'typing',
      contact_number: contactNumber
    });
  }, [sendMessage]);

  const sendStopTyping = useCallback((contactNumber) => {
    return sendMessage({
      type: 'stop_typing',
      contact_number: contactNumber
    });
  }, [sendMessage]);

  const markAsRead = useCallback((messageId) => {
    return sendMessage({
      type: 'mark_read',
      message_id: messageId
    });
  }, [sendMessage]);

  const addMessageHandler = useCallback((type, handler) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, []);
    }
    messageHandlersRef.current.get(type).push(handler);
    
    // Return cleanup function
    return () => {
      const handlers = messageHandlersRef.current.get(type) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    sendChatMessage,
    sendTyping,
    sendStopTyping,
    markAsRead,
    addMessageHandler,
    connect,
    disconnect
  };
};

export default useWebSocket;
