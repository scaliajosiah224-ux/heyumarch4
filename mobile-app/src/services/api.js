// API Service for GummyText Mobile
import axios from 'axios';

// Replace with your actual backend URL
const API_BASE_URL = 'https://sweet-design-3.preview.emergentagent.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set auth token for all requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// API Endpoints
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  setupPin: (pin) => api.post('/auth/pin/setup', { pin }),
  verifyPin: (pin) => api.post('/auth/pin/verify', { pin }),
  pinStatus: () => api.get('/auth/pin/status'),
  removePin: () => api.delete('/auth/pin'),
};

export const phoneAPI = {
  getOwned: () => api.get('/phone-numbers/twilio-account'),
  getAvailable: (areaCode, limit = 20) => api.get('/phone-numbers/available', { params: { area_code: areaCode, limit } }),
  getNearby: (limit = 10) => api.get('/phone-numbers/nearby', { params: { limit } }),
  search: (query, limit = 20) => api.get('/phone-numbers/search', { params: { query, limit } }),
  addExisting: (phoneNumber, twilioSid) => api.post('/phone-numbers/add-existing', { phone_number: phoneNumber, twilio_sid: twilioSid }),
  purchase: (phoneNumber, areaCode, country = 'US') => api.post('/phone-numbers/purchase', { phone_number: phoneNumber, area_code: areaCode, country }),
  getUserNumbers: () => api.get('/phone-numbers'),
  setPrimary: (phoneId) => api.put(`/phone-numbers/${phoneId}/primary`),
  release: (phoneId) => api.delete(`/phone-numbers/${phoneId}`),
};

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getThread: (contactNumber, limit = 50) => api.get(`/messages/thread/${encodeURIComponent(contactNumber)}`, { params: { limit } }),
  send: (toNumber, body, mediaUrl = null) => api.post('/messages/send', { to_number: toNumber, body, media_url: mediaUrl }),
  markRead: (messageId) => api.put(`/messages/${messageId}/read`),
};

export const callsAPI = {
  initiate: (toNumber) => api.post('/calls/initiate', { to_number: toNumber }),
  getHistory: (limit = 50) => api.get('/calls', { params: { limit } }),
  end: (callId, duration = 0) => api.put(`/calls/${callId}/end`, null, { params: { duration } }),
};

export const voicemailAPI = {
  getAll: (limit = 50) => api.get('/voicemails', { params: { limit } }),
  markRead: (voicemailId) => api.put(`/voicemails/${voicemailId}/read`),
  delete: (voicemailId) => api.delete(`/voicemails/${voicemailId}`),
};

export const paymentsAPI = {
  getPackages: () => api.get('/payments/packages'),
  getSubscriptions: () => api.get('/payments/subscriptions'),
  checkout: (packageId, originUrl) => api.post('/payments/checkout', { package_id: packageId, origin_url: originUrl }),
  getStatus: (sessionId) => api.get(`/payments/status/${sessionId}`),
};

export default api;
