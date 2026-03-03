import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Delete, PhoneCall } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';

const DialerTab = ({ primaryNumber }) => {
  const navigate = useNavigate();
  const [number, setNumber] = useState('');
  const [calling, setCalling] = useState(false);

  const handleKeyPress = (digit) => {
    setNumber(number + digit);
  };

  const handleDelete = () => {
    setNumber(number.slice(0, -1));
  };

  const handleCall = async () => {
    if (!number || calling) return;

    // Format number
    let formattedNumber = number.replace(/\D/g, '');
    if (formattedNumber.length === 10) {
      formattedNumber = '+1' + formattedNumber;
    } else if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }

    setCalling(true);
    try {
      await axios.post(`${API}/calls/initiate`, {
        to_number: formattedNumber
      }, {
        withCredentials: true
      });
      
      toast.success('Call initiated (Demo mode)');
      // In real app, this would open WebRTC call UI
    } catch (error) {
      if (error.response?.status === 402) {
        toast.error('Insufficient credits');
        navigate('/purchase');
      } else {
        toast.error('Failed to initiate call');
      }
    } finally {
      setCalling(false);
    }
  };

  const handleMessage = () => {
    if (!number) return;

    let formattedNumber = number.replace(/\D/g, '');
    if (formattedNumber.length === 10) {
      formattedNumber = '+1' + formattedNumber;
    } else if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }

    navigate(`/chat/${encodeURIComponent(formattedNumber)}`);
  };

  const formatDisplay = (num) => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const keys = [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
    { digit: '*', letters: '' },
    { digit: '0', letters: '+' },
    { digit: '#', letters: '' }
  ];

  return (
    <div data-testid="dialer-tab" className="flex flex-col items-center py-4">
      {/* Display */}
      <div className="mb-8 text-center">
        <p className="text-white/50 text-sm mb-2">
          Calling from: {primaryNumber?.friendly_name || 'No number'}
        </p>
        <div className="h-16 flex items-center justify-center">
          <p 
            data-testid="dialer-display" 
            className="text-white text-4xl font-bold tracking-wider"
          >
            {formatDisplay(number) || 'Enter number'}
          </p>
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 max-w-xs w-full mb-8">
        {keys.map((key) => (
          <button
            key={key.digit}
            data-testid={`key-${key.digit}`}
            onClick={() => handleKeyPress(key.digit)}
            className="gummy-key aspect-square flex flex-col items-center justify-center"
          >
            <span className="text-white text-2xl font-bold">{key.digit}</span>
            {key.letters && (
              <span className="text-white/40 text-xs tracking-widest">{key.letters}</span>
            )}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Message Button */}
        <button
          data-testid="message-btn"
          onClick={handleMessage}
          disabled={!number}
          className="w-14 h-14 rounded-full glass-panel flex items-center justify-center disabled:opacity-30"
        >
          <Phone className="w-6 h-6 text-cyan-400 rotate-[135deg]" />
        </button>

        {/* Call Button */}
        <button
          data-testid="call-btn"
          onClick={handleCall}
          disabled={!number || calling}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
        >
          {calling ? (
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <PhoneCall className="w-8 h-8 text-white" />
          )}
        </button>

        {/* Delete Button */}
        <button
          data-testid="delete-btn"
          onClick={handleDelete}
          disabled={!number}
          className="w-14 h-14 rounded-full glass-panel flex items-center justify-center disabled:opacity-30"
        >
          <Delete className="w-6 h-6 text-white/70" />
        </button>
      </div>
    </div>
  );
};

export default DialerTab;
