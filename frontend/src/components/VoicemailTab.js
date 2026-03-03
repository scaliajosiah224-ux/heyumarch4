import React, { useState, useEffect } from 'react';
import { Voicemail, Play, Pause, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';

const VoicemailTab = () => {
  const [voicemails, setVoicemails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    fetchVoicemails();
  }, []);

  const fetchVoicemails = async () => {
    try {
      const response = await axios.get(`${API}/voicemails`, {
        withCredentials: true
      });
      setVoicemails(response.data);
    } catch (error) {
      console.error('Error fetching voicemails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (voicemailId) => {
    if (playing === voicemailId) {
      setPlaying(null);
      // In real app, would pause audio
    } else {
      setPlaying(voicemailId);
      // Mark as read
      try {
        await axios.put(`${API}/voicemails/${voicemailId}/read`, {}, {
          withCredentials: true
        });
        setVoicemails(voicemails.map(vm => 
          vm.voicemail_id === voicemailId ? { ...vm, is_read: true } : vm
        ));
      } catch (error) {
        console.error('Error marking voicemail:', error);
      }
    }
  };

  const handleDelete = async (voicemailId) => {
    try {
      await axios.delete(`${API}/voicemails/${voicemailId}`, {
        withCredentials: true
      });
      setVoicemails(voicemails.filter(vm => vm.voicemail_id !== voicemailId));
      toast.success('Voicemail deleted');
    } catch (error) {
      toast.error('Failed to delete voicemail');
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
    <div data-testid="voicemail-tab">
      {voicemails.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
            <Voicemail className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No voicemails</h3>
          <p className="text-white/50">Missed calls will leave voicemails here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {voicemails.map((vm) => (
            <div
              key={vm.voicemail_id}
              data-testid={`voicemail-${vm.voicemail_id}`}
              className={`glass-panel p-4 transition-all ${
                !vm.is_read ? 'border-purple-500/30' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  data-testid={`play-${vm.voicemail_id}`}
                  onClick={() => handlePlay(vm.voicemail_id)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    playing === vm.voicemail_id
                      ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600'
                      : 'bg-purple-500/20 hover:bg-purple-500/30'
                  }`}
                >
                  {playing === vm.voicemail_id ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-purple-400 ml-0.5" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-semibold">
                      {formatContactNumber(vm.from_number)}
                    </p>
                    <span className="text-white/40 text-xs">
                      {formatTime(vm.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/50 text-sm">{formatDuration(vm.duration)}</span>
                    {!vm.is_read && (
                      <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  
                  {vm.transcription && (
                    <p className="text-white/60 text-sm italic">
                      "{vm.transcription}"
                    </p>
                  )}
                </div>
                
                <button
                  data-testid={`delete-${vm.voicemail_id}`}
                  onClick={() => handleDelete(vm.voicemail_id)}
                  className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoicemailTab;
