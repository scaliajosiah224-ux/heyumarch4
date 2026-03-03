import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, MessageSquare, Voicemail, Settings, Plus, Coins } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth, API } from '../App';
import BottomNav from '../components/BottomNav';
import MessagesTab from '../components/MessagesTab';
import CallsTab from '../components/CallsTab';
import VoicemailTab from '../components/VoicemailTab';
import DialerTab from '../components/DialerTab';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateCredits } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [primaryNumber, setPrimaryNumber] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhoneNumbers();
    
    // Handle payment callback
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
      pollPaymentStatus(sessionId);
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled');
    }
    
    // Clean URL
    if (paymentStatus || sessionId) {
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const fetchPhoneNumbers = async () => {
    try {
      const response = await axios.get(`${API}/phone-numbers`, {
        withCredentials: true
      });
      setPhoneNumbers(response.data);
      const primary = response.data.find(n => n.is_primary);
      setPrimaryNumber(primary);
      
      if (response.data.length === 0) {
        navigate('/select-number');
      }
    } catch (error) {
      console.error('Error fetching numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      toast.info('Payment is processing. Credits will be added shortly.');
      return;
    }

    try {
      const response = await axios.get(`${API}/payments/status/${sessionId}`, {
        withCredentials: true
      });

      if (response.data.payment_status === 'paid') {
        toast.success('Payment successful! Credits added.');
        // Refresh user data
        const userResponse = await axios.get(`${API}/auth/me`, {
          withCredentials: true
        });
        updateCredits(userResponse.data.credits);
        return;
      } else if (response.data.status === 'expired') {
        toast.error('Payment session expired.');
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Payment status error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard" className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel-light px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Your Number</p>
            <p className="text-white font-bold text-lg">
              {primaryNumber?.friendly_name || 'No number'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Credits Badge */}
            <button
              data-testid="credits-btn"
              onClick={() => navigate('/purchase')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-bold">{user?.credits || 0}</span>
            </button>
            
            {/* Add Number */}
            <button
              data-testid="add-number-btn"
              onClick={() => navigate('/select-number')}
              className="w-10 h-10 rounded-full glass-panel-light flex items-center justify-center"
            >
              <Plus className="w-5 h-5 text-fuchsia-400" />
            </button>
            
            {/* Settings */}
            <button
              data-testid="settings-btn"
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full glass-panel-light flex items-center justify-center"
            >
              <Settings className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'dialer', label: 'Dialer', icon: Phone },
            { id: 'calls', label: 'Calls', icon: Phone },
            { id: 'voicemail', label: 'Voicemail', icon: Voicemail }
          ].map(tab => (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-fuchsia-500/30 to-purple-500/30 text-white border border-fuchsia-500/30'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <tab.icon className={`w-4 h-4 mx-auto mb-1 ${activeTab === tab.id ? 'neon-glow' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Tab Content */}
      <main className="p-4">
        {activeTab === 'messages' && <MessagesTab primaryNumber={primaryNumber} />}
        {activeTab === 'dialer' && <DialerTab primaryNumber={primaryNumber} />}
        {activeTab === 'calls' && <CallsTab />}
        {activeTab === 'voicemail' && <VoicemailTab />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;
