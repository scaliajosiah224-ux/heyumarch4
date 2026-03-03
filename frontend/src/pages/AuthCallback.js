import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth, API } from '../App';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login, checkAuth } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);
        
        if (!sessionIdMatch) {
          toast.error('Authentication failed');
          navigate('/auth');
          return;
        }

        const sessionId = sessionIdMatch[1];

        // Exchange session_id for user data
        const response = await axios.post(`${API}/auth/session`, {
          session_id: sessionId
        }, {
          withCredentials: true
        });

        login(response.data);
        toast.success('Welcome!');

        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);

        // Check if user has a phone number
        const numbersResponse = await axios.get(`${API}/phone-numbers`, {
          withCredentials: true
        });

        if (numbersResponse.data.length === 0) {
          navigate('/select-number', { state: { user: response.data } });
        } else {
          navigate('/dashboard', { state: { user: response.data } });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/auth');
      }
    };

    processAuth();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/70">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
