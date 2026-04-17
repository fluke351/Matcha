import axios from 'axios';
import io from 'socket.io-client';
import { createClient } from '@supabase/supabase-js';

const isWeb = typeof window !== 'undefined';
const DEFAULT_API_URL = isWeb ? '/api' : 'http://localhost:3000/api';
const DEFAULT_SOCKET_URL = isWeb ? undefined : 'http://localhost:3000';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).trim();
const SOCKET_URL = (process.env.EXPO_PUBLIC_SOCKET_URL || DEFAULT_SOCKET_URL)?.trim();

const normalizeKey = (value) => {
  const v = value?.trim();
  if (!v) return v;
  const unquoted = v.replace(/^['"]|['"]$/g, '');
  const withoutBearer = unquoted.replace(/^Bearer\s+/i, '');
  const lastSegment = withoutBearer.includes(':') ? withoutBearer.split(':').pop() : withoutBearer;
  return lastSegment.trim();
};

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
export const SUPABASE_ANON_KEY = normalizeKey(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const decodeBase64 = (input) => {
  try {
    if (typeof atob === 'function') return atob(input);
    if (typeof Buffer !== 'undefined') return Buffer.from(input, 'base64').toString('utf8');
    return null;
  } catch {
    return null;
  }
};

const parseJwtPayload = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64url = parts[1];
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64url.length / 4) * 4, '=');
    const decoded = decodeBase64(base64);
    if (!decoded) return null;
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const supabaseJwt = parseJwtPayload(SUPABASE_ANON_KEY);
export const SUPABASE_KEY_ROLE = supabaseJwt?.role || null;
export const SUPABASE_PROJECT_REF = supabaseJwt?.ref || null;
export const SUPABASE_CONFIG_ERROR =
  !SUPABASE_URL || !SUPABASE_ANON_KEY
    ? 'ยังไม่ได้ตั้งค่า Supabase: EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY'
    : !SUPABASE_PROJECT_REF
      ? 'Supabase key ไม่ถูกต้อง (คัดลอกมาไม่ครบ/มีคำขึ้นต้นปนมา) กรุณาใช้ anon key แบบเป็นโทเคนล้วนๆ ที่ขึ้นต้นด้วย eyJ...'
      : SUPABASE_KEY_ROLE === 'service_role'
        ? 'คุณกำลังใช้ service_role key ในฝั่งแอป (อันตรายและจะถูกปฏิเสธ) กรุณาใช้ anon key เท่านั้น'
        : null;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const socket = io(SOCKET_URL || undefined, {
  autoConnect: false,
});

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_CONFIG_ERROR
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true } })
  : null;

export const authApi = {
  loginGuest: () => api.post('/auth/guest'),
};

export const userApi = {
  updateInterests: (userId, interests) => api.put('/users/interests', { userId, interests }),
  updateLocation: (userId, lat, lng) => api.put('/users/location', { userId, lat, lng }),
  findMatch: (userId, lat, lng, radius, extraParams = {}) =>
    api.get('/users/match', { params: { userId, lat, lng, radius, ...extraParams } }),
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
