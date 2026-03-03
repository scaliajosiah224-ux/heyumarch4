import React, { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import axios from 'axios';
import { API } from '../App';

const CallsTab = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await axios.get(`${API}/calls`, {
        withCredentials: true
      });
      setCalls(response.data);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
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

  const formatDuration = (seconds) => {
    if (seconds === 0) return 'No answer';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const getCallIcon = (call) => {
    if (call.status === 'missed') {
      return { Icon: PhoneMissed, color: 'text-red-400' };
    }
    if (call.direction === 'inbound') {
      return { Icon: PhoneIncoming, color: 'text-cyan-400' };
    }
    return { Icon: PhoneOutgoing, color: 'text-green-400' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="calls-tab">
      {calls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
            <Phone className="w-10 h-10 text-cyan-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No calls yet</h3>
          <p className="text-white/50">Your call history will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {calls.map((call) => {
            const { Icon, color } = getCallIcon(call);
            const contactNumber = call.direction === 'outbound' ? call.to_number : call.from_number;
            
            return (
              <button
                key={call.call_id}
                data-testid={`call-${call.call_id}`}
                className="w-full glass-panel p-4 flex items-center gap-4 hover:border-cyan-500/30 transition-all text-left"
              >
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">
                    {formatContactNumber(contactNumber)}
                  </p>
                  <p className="text-white/50 text-sm">
                    {call.direction === 'outbound' ? 'Outgoing' : 'Incoming'} • {formatDuration(call.duration)}
                  </p>
                </div>
                <span className="text-white/40 text-sm flex-shrink-0">
                  {formatTime(call.created_at)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CallsTab;
