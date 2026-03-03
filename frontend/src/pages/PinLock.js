import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Delete } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth, API } from '../App';

const PinLock = () => {
  const navigate = useNavigate();
  const { verifyPin, user } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      handleVerify();
    }
  }, [pin]);

  const handleVerify = async () => {
    setLoading(true);
    setError(false);

    try {
      await axios.post(`${API}/auth/pin/verify`, { pin }, {
        withCredentials: true
      });
      verifyPin();
      navigate('/dashboard');
    } catch (error) {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
      toast.error('Invalid PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (digit) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div data-testid="pin-lock-screen" className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-fuchsia-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Lock Icon */}
      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center mb-8 ${error ? 'animate-shake' : ''}`}>
        <Lock className="w-10 h-10 text-white" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
      <p className="text-white/60 mb-8">{user?.name || 'Enter your PIN to continue'}</p>

      {/* PIN Dots */}
      <div className="flex gap-4 mb-12">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              pin.length > index
                ? error
                  ? 'bg-red-500 scale-110'
                  : 'bg-fuchsia-500 scale-110'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Hidden input for keyboard support */}
      <input
        ref={inputRef}
        type="password"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        className="sr-only"
        data-testid="pin-input"
      />

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 max-w-xs w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'delete'].map((key, index) => {
          if (key === null) return <div key={index} />;
          
          if (key === 'delete') {
            return (
              <button
                key={index}
                data-testid="pin-delete"
                onClick={handleDelete}
                disabled={loading}
                className="gummy-key aspect-square flex items-center justify-center"
              >
                <Delete className="w-6 h-6 text-white/70" />
              </button>
            );
          }

          return (
            <button
              key={index}
              data-testid={`pin-key-${key}`}
              onClick={() => handleKeyPress(key.toString())}
              disabled={loading}
              className="gummy-key aspect-square flex items-center justify-center text-2xl font-bold text-white"
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="mt-8">
          <div className="w-8 h-8 border-3 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PinLock;
