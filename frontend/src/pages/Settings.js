import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, Shield, Bell, CreditCard, 
  LogOut, ChevronRight, Lock, Trash2, Plus 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth, API } from '../App';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, hasPin, setHasPin } = useAuth();
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  const fetchPhoneNumbers = async () => {
    try {
      const response = await axios.get(`${API}/phone-numbers`, {
        withCredentials: true
      });
      setPhoneNumbers(response.data);
    } catch (error) {
      console.error('Error fetching numbers:', error);
    }
  };

  const handleSetPrimary = async (phoneId) => {
    try {
      await axios.put(`${API}/phone-numbers/${phoneId}/primary`, {}, {
        withCredentials: true
      });
      toast.success('Primary number updated');
      fetchPhoneNumbers();
    } catch (error) {
      toast.error('Failed to update primary number');
    }
  };

  const handleReleaseNumber = async (phoneId) => {
    if (phoneNumbers.length <= 1) {
      toast.error('You need at least one phone number');
      return;
    }
    
    try {
      await axios.delete(`${API}/phone-numbers/${phoneId}`, {
        withCredentials: true
      });
      toast.success('Number released');
      fetchPhoneNumbers();
    } catch (error) {
      toast.error('Failed to release number');
    }
  };

  const handleSetupPin = async () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast.error('PIN must be 4 digits');
      return;
    }
    
    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/pin/setup`, { pin: newPin }, {
        withCredentials: true
      });
      toast.success('PIN set successfully');
      setHasPin(true);
      setShowPinModal(false);
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      toast.error('Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePin = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API}/auth/pin`, {
        withCredentials: true
      });
      toast.success('PIN removed');
      setHasPin(false);
    } catch (error) {
      toast.error('Failed to remove PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div data-testid="settings-screen" className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel-light px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            data-testid="back-btn"
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Profile Section */}
        <section>
          <h2 className="text-white/50 text-sm font-semibold mb-3 uppercase tracking-wider">
            Account
          </h2>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                {user?.picture ? (
                  <img src={user.picture} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">{user?.name}</p>
                <p className="text-white/50">{user?.email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Phone Numbers Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white/50 text-sm font-semibold uppercase tracking-wider">
              Phone Numbers ({phoneNumbers.length}/10)
            </h2>
            <button
              data-testid="add-number-btn"
              onClick={() => navigate('/select-number')}
              className="text-fuchsia-400 text-sm font-semibold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <div className="space-y-2">
            {phoneNumbers.map((number) => (
              <div key={number.phone_id} className="glass-panel p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{number.friendly_name}</p>
                      <p className="text-white/50 text-sm">
                        {number.is_primary ? '★ Primary' : 'Secondary'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!number.is_primary && (
                      <button
                        data-testid={`set-primary-${number.phone_id}`}
                        onClick={() => handleSetPrimary(number.phone_id)}
                        className="text-fuchsia-400 text-sm font-medium"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      data-testid={`release-${number.phone_id}`}
                      onClick={() => handleReleaseNumber(number.phone_id)}
                      className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Section */}
        <section>
          <h2 className="text-white/50 text-sm font-semibold mb-3 uppercase tracking-wider">
            Security
          </h2>
          <div className="glass-panel overflow-hidden">
            <button
              data-testid="pin-lock-setting"
              onClick={() => hasPin ? handleRemovePin() : setShowPinModal(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">PIN Lock</p>
                  <p className="text-white/50 text-sm">
                    {hasPin ? 'Enabled' : 'Protect your app with a PIN'}
                  </p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${hasPin ? 'bg-fuchsia-500' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 mt-0.5 rounded-full bg-white transition-transform ${hasPin ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </div>
            </button>
          </div>
        </section>

        {/* Subscription Section */}
        <section>
          <h2 className="text-white/50 text-sm font-semibold mb-3 uppercase tracking-wider">
            Subscription
          </h2>
          <div className="glass-panel overflow-hidden">
            <button
              data-testid="purchase-credits-btn"
              onClick={() => navigate('/purchase')}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Buy Credits</p>
                  <p className="text-white/50 text-sm">Current: {user?.credits} credits</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </button>
          </div>
        </section>

        {/* Logout */}
        <button
          data-testid="logout-btn"
          onClick={handleLogout}
          className="w-full glass-panel p-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </main>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div data-testid="pin-modal" className="glass-panel p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-4">Set PIN Lock</h3>
            <p className="text-white/60 text-sm mb-6">
              Enter a 4-digit PIN to protect your app
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Enter PIN</label>
                <input
                  data-testid="new-pin-input"
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full gummy-input text-center text-2xl tracking-widest"
                  placeholder="••••"
                />
              </div>
              
              <div>
                <label className="text-white/60 text-sm mb-2 block">Confirm PIN</label>
                <input
                  data-testid="confirm-pin-input"
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full gummy-input text-center text-2xl tracking-widest"
                  placeholder="••••"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                data-testid="cancel-pin-btn"
                onClick={() => {
                  setShowPinModal(false);
                  setNewPin('');
                  setConfirmPin('');
                }}
                className="flex-1 gummy-btn-secondary py-3"
              >
                Cancel
              </button>
              <button
                data-testid="save-pin-btn"
                onClick={handleSetupPin}
                disabled={loading}
                className="flex-1 gummy-btn py-3 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Set PIN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
