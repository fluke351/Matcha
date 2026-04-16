import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const authApi = {
  loginGuest: () => api.post('/auth/guest'),
};

export const userApi = {
  updateInterests: (userId, interests) => api.put('/users/interests', { userId, interests }),
  updateLocation: (userId, lat, lng) => api.put('/users/location', { userId, lat, lng }),
  findMatch: (userId, lat, lng, radius) => api.get('/users/match', { params: { userId, lat, lng, radius } }),
  getProfile: (id) => api.get(`/users/profile/${id}`),
};

export const chatApi = {
  getMessages: (matchId, userId) => api.get(`/chat/${matchId}/messages`, { params: { userId } }),
  sendMessage: (matchId, userId, content) => api.post(`/chat/${matchId}/messages`, { userId, content }),
  skipMatch: (matchId, userId) => api.post(`/match/${matchId}/skip`, { userId }),
};

export const safetyApi = {
  report: (userId, reportedUserId, reason, details) => api.post('/report', { userId, reportedUserId, reason, details }),
  block: (userId, blockedUserId) => api.post('/block', { userId, blockedUserId }),
  getBlocked: (userId) => api.get('/blocked', { params: { userId } }),
};
