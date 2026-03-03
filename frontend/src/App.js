import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'sonner';

// Pages
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import NumberSelection from './pages/NumberSelection';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Purchase from './pages/Purchase';
import PinLock from './pages/PinLock';

import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);

  const checkAuth = useCallback(async () => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/auth/me`, {
        withCredentials: true
      });
      setUser(response.data);
      
      // Check PIN status
      const pinResponse = await axios.get(`${API}/auth/pin/status`, {
        withCredentials: true
      });
      setHasPin(pinResponse.data.has_pin);
      setPinVerified(!pinResponse.data.has_pin);
    } catch (error) {
      setUser(null);
      setHasPin(false);
      setPinVerified(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (userData, token) => {
    setUser(userData);
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setHasPin(false);
    setPinVerified(true);
    localStorage.removeItem('auth_token');
  };

  const updateCredits = (newCredits) => {
    setUser(prev => prev ? { ...prev, credits: newCredits } : null);
  };

  const verifyPin = () => {
    setPinVerified(true);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      checkAuth, 
      updateCredits,
      hasPin,
      pinVerified,
      verifyPin,
      setHasPin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading, hasPin, pinVerified } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (hasPin && !pinVerified && location.pathname !== '/pin-lock') {
    return <Navigate to="/pin-lock" replace />;
  }

  return children;
};

// App Router Component
const AppRouter = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Check URL fragment for session_id (OAuth callback)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <Onboarding />
      } />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/auth" element={
        user ? <Navigate to="/dashboard" replace /> : <Auth />
      } />
      <Route path="/pin-lock" element={
        <ProtectedRoute>
          <PinLock />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/select-number" element={
        <ProtectedRoute>
          <NumberSelection />
        </ProtectedRoute>
      } />
      <Route path="/chat/:contactNumber" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/purchase" element={
        <ProtectedRoute>
          <Purchase />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App min-h-screen">
          <AppRouter />
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: 'rgba(30, 11, 43, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                backdropFilter: 'blur(12px)'
              }
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
