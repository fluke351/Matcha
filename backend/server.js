const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

const webDistCandidates = [
  path.join(__dirname, '..', 'frontend', 'dist'),
  path.join(__dirname, '..', 'frontend', 'web-build')
];
const webDistPath = webDistCandidates.find(p => fs.existsSync(p));

if (webDistPath) {
  app.use(express.static(webDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
}

const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap',
  'เหี้ย', 'มึง', 'กู', 'ไอ้', 'ควย', 'เย็ด', 'สัตว์', 'ตอแหล', 'ล่อก', 'แม่ง'
];

const INTERESTS = [
  { id: 'gaming', emoji: '🎮', label: 'เกม', labelEn: 'Gaming' },
  { id: 'music', emoji: '🎵', label: 'เพลง', labelEn: 'Music' },
  { id: 'dev', emoji: '💻', label: 'Dev', labelEn: 'Development' },
  { id: 'reading', emoji: '📚', label: 'อ่านหนังสือ', labelEn: 'Reading' },
  { id: 'cooking', emoji: '🍳', label: 'ทำอาหาร', labelEn: 'Cooking' },
  { id: 'fitness', emoji: '🏃', label: 'ออกกำลังกาย', labelEn: 'Fitness' },
  { id: 'movies', emoji: '🎬', label: 'หนัง', labelEn: 'Movies' },
  { id: 'travel', emoji: '✈️', label: 'ท่องเที่ยว', labelEn: 'Travel' },
  { id: 'pets', emoji: '🐱', label: 'สัตว์เลี้ยง', labelEn: 'Pets' },
  { id: 'art', emoji: '🎨', label: 'ศิลปะ', labelEn: 'Art' }
];

const NAME_PREFIXES = ['MatchaBoy', 'MatchaGirl', 'ชาเขียว', 'TeaLover', 'Matcha', 'ชานม', 'MatchaKing', 'ชาไข่', 'GreenTea', 'MatchaChan'];
const NAME_SUFFIXES = ['123', '007', '99', '2024', '777', '555', '420', '69', '13', '17'];

function generateRandomName() {
  const useThai = Math.random() > 0.5;
  if (useThai) {
    return `${NAME_PREFIXES[Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 1000)}`;
  }
  return `${NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)]}${NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)]}`;
}

function filterProfanity(text) {
  let filtered = text;
  PROFANITY_LIST.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isWithinRadius(userLoc, targetLoc, radiusKm) {
  const distance = calculateDistance(userLoc.lat, userLoc.lng, targetLoc.lat, targetLoc.lng);
  return distance <= radiusKm;
}

function calculateMatchScore(user, targetUser, userLocation, radius) {
  let score = 0;

  if (!isWithinRadius(userLocation, targetUser.location, radius)) {
    return -1;
  }

  const interestMatch = user.interests.filter(i => targetUser.interests.includes(i)).length;
  score += interestMatch * 10;

  if (targetUser.isOnline) {
    score += 5;
  }

  const timeDiff = Date.now() - new Date(targetUser.lastActive).getTime();
  if (timeDiff < 300000) {
    score += 3;
  }

  return score;
}

const users = new Map();
const matches = new Map();
const messages = new Map();
const blockedUsers = new Map();
const reports = [];
const onlineUsers = new Set();
const searchingUsers = new Map();
const userSockets = new Map();
const testBotsByUser = new Map();

function getUserById(id) {
  return users.get(id);
}

function getActiveMatchForUser(userId) {
  return Array.from(matches.values()).find(m => m.status === 'active' && m.userIds.includes(userId)) || null;
}

function buildMatchPayload(match, userId) {
  const partnerId = match.userIds.find(id => id !== userId);
  const partner = users.get(partnerId);
  return {
    id: match.id,
    partner: {
      id: partner?.id || partnerId,
      displayName: partner?.displayName || 'Unknown',
      avatar: partner?.avatar || '🍵',
      interests: partner?.interests || []
    }
  };
}

function registerSocketForUser(userId, socketId) {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socketId);
}

function unregisterSocketForUser(userId, socketId) {
  const set = userSockets.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) userSockets.delete(userId);
}

function emitToUser(userId, event, payload) {
  const set = userSockets.get(userId);
  if (!set) return;
  set.forEach(socketId => io.to(socketId).emit(event, payload));
}

async function ensureUserInCache(userId) {
  if (!userId) return null;
  if (users.has(userId)) return users.get(userId);
  if (!supabaseAdmin) return null;

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('id,display_name,avatar_emoji,avatar_url,created_at')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.id) return null;

  const { data: interestsRows } = await supabaseAdmin
    .from('user_interests')
    .select('interest_id')
    .eq('user_id', userId);

  const { data: loc } = await supabaseAdmin
    .from('user_locations')
    .select('lat,lng,last_active,is_online')
    .eq('user_id', userId)
    .maybeSingle();

  const user = {
    id: profile.id,
    guestId: null,
    displayName: profile.display_name,
    avatar: profile.avatar_emoji || '🍵',
    avatarUrl: profile.avatar_url || null,
    interests: (interestsRows || []).map(r => r.interest_id),
    location: loc ? { lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) } : { lat: 0, lng: 0 },
    lastActive: loc?.last_active || profile.created_at || new Date().toISOString(),
    isOnline: loc?.is_online ?? true,
    blockedBy: new Set(),
    createdAt: profile.created_at || new Date().toISOString()
  };

  users.set(userId, user);
  if (user.isOnline) onlineUsers.add(userId);
  return user;
}

async function persistUserLocation(userId, lat, lng, isOnline = true) {
  if (!supabaseAdmin) return;
  await supabaseAdmin
    .from('user_locations')
    .upsert({
      user_id: userId,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      last_active: new Date().toISOString(),
      is_online: !!isOnline
    }, { onConflict: 'user_id' });
}

async function persistUserInterests(userId, interests) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from('user_interests').delete().eq('user_id', userId);
  const rows = (interests || []).map(interestId => ({ user_id: userId, interest_id: interestId }));
  if (rows.length > 0) {
    await supabaseAdmin.from('user_interests').insert(rows);
  }
}

async function persistMatchRow(match) {
  if (!supabaseAdmin) return;
  const a = match.userIds[0];
  const b = match.userIds[1];
  const { error } = await supabaseAdmin
    .from('matches')
    .insert({ id: match.id, user_a: a, user_b: b, status: match.status, created_at: match.createdAt });

  if (!error) return;

  const { data: existing } = await supabaseAdmin
    .from('matches')
    .select('id,user_a,user_b,status,created_at,ended_at')
    .or(`and(user_a.eq.${a},user_b.eq.${b}),and(user_a.eq.${b},user_b.eq.${a})`)
    .maybeSingle();

  if (existing?.id) {
    match.id = existing.id;
  }
}

async function fetchMessagesFromDb(matchId) {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from('messages')
    .select('id,match_id,sender_id,content,created_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  return (data || []).map(m => ({
    id: m.id,
    matchId: m.match_id,
    senderId: m.sender_id,
    content: m.content,
    createdAt: m.created_at
  }));
}

function getSearchingCandidates(userId, lat, lng, radius) {
  const candidates = [];
  const currentUser = users.get(userId);
  if (!currentUser) return candidates;

  searchingUsers.forEach((search, candidateId) => {
    if (candidateId === userId) return;
    if (!users.has(candidateId)) return;
    if (getActiveMatchForUser(candidateId)) return;
    if (blockedUsers.has(userId) && blockedUsers.get(userId).has(candidateId)) return;
    if (currentUser?.blockedBy && currentUser.blockedBy.has(candidateId)) return;

    const candidateUser = users.get(candidateId);
    if (candidateUser?.blockedBy && candidateUser.blockedBy.has(userId)) return;
    if (!candidateUser?.isOnline) return;

    const withinCurrent = isWithinRadius({ lat, lng }, candidateUser.location, radius);
    if (!withinCurrent) return;

    const withinCandidate = isWithinRadius({ lat: search.lat, lng: search.lng }, currentUser.location, search.radius);
    if (!withinCandidate) return;

    const score = calculateMatchScore(currentUser, candidateUser, { lat, lng }, radius);
    if (score >= 0) candidates.push({ user: candidateUser, score });
  });

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

function getOnlineUsersInRadius(userId, lat, lng, radius, userInterests) {
  const candidates = [];
  const currentUser = users.get(userId);

  users.forEach((user, id) => {
    if (id === userId) return;
    if (getActiveMatchForUser(id)) return;
    if (blockedUsers.has(userId) && blockedUsers.get(userId).has(id)) return;
    if (currentUser?.blockedBy && currentUser.blockedBy.has(id)) return;
    if (user?.blockedBy && user.blockedBy.has(userId)) return;

    const score = calculateMatchScore(currentUser, user, { lat, lng }, radius);
    if (score >= 0) {
      candidates.push({ user, score });
    }
  });

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

async function getOrCreateTestBotForUser(userId, lat, lng, interests) {
  let botId = testBotsByUser.get(userId);
  const offset = 0.0003;

  if (!botId && supabaseAdmin) {
    const email = `bot_${uuidv4()}@matcha.local`;
    const password = `${uuidv4()}${uuidv4()}`;
    const { data } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true });
    botId = data?.user?.id || null;
  }

  if (!botId) {
    botId = uuidv4();
  }

  testBotsByUser.set(userId, botId);

  const bot = users.get(botId) || {
    id: botId,
    guestId: null,
    displayName: `MatchaBot${Math.floor(Math.random() * 1000)}`,
    avatar: '🍵',
    interests: [],
    location: { lat: 0, lng: 0 },
    lastActive: new Date().toISOString(),
    isOnline: true,
    blockedBy: new Set(),
    createdAt: new Date().toISOString(),
    isTestBot: true
  };

  bot.location = { lat: parseFloat(lat) + offset, lng: parseFloat(lng) - offset };
  bot.interests = Array.isArray(interests) ? interests : [];
  bot.lastActive = new Date().toISOString();
  bot.isOnline = true;

  users.set(botId, bot);
  onlineUsers.add(botId);

  if (supabaseAdmin) {
    await supabaseAdmin.from('users').upsert({ id: botId, display_name: bot.displayName, avatar_emoji: bot.avatar });
    await persistUserLocation(botId, bot.location.lat, bot.location.lng, true);
    await persistUserInterests(botId, bot.interests);
  }

  return bot;
}

app.post('/api/auth/guest', async (req, res) => {
  const guestId = uuidv4();
  const displayName = generateRandomName();
  const avatar = INTERESTS[Math.floor(Math.random() * INTERESTS.length)].emoji;
  let userId = uuidv4();

  try {
    if (supabaseAdmin) {
      const email = `guest_${guestId}@matcha.local`;
      const password = `${uuidv4()}${uuidv4()}`;
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (error || !data?.user?.id) {
        return res.status(500).json({ success: false, error: 'Supabase create user failed' });
      }

      userId = data.user.id;
      await supabaseAdmin.from('users').upsert({
        id: userId,
        display_name: displayName,
        avatar_emoji: avatar
      });
      await persistUserLocation(userId, 0, 0, true);
    }
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Auth guest failed' });
  }

  const user = {
    id: userId,
    guestId,
    displayName,
    avatar,
    interests: [],
    location: { lat: 0, lng: 0 },
    lastActive: new Date().toISOString(),
    isOnline: true,
    blockedBy: new Set(),
    createdAt: new Date().toISOString()
  };

  users.set(userId, user);
  onlineUsers.add(userId);

  res.json({
    success: true,
    userId,
    guestId,
    displayName,
    avatar,
    interests: []
  });
});

app.get('/api/interests', (req, res) => {
  res.json({ success: true, interests: INTERESTS });
});

app.put('/api/users/interests', async (req, res) => {
  const { userId, interests } = req.body;

  const user = users.get(userId) || await ensureUserInCache(userId);
  if (!userId || !user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  user.interests = interests || [];
  user.lastActive = new Date().toISOString();
  await persistUserInterests(userId, user.interests);

  res.json({ success: true, interests: user.interests });
});

app.put('/api/users/location', async (req, res) => {
  const { userId, lat, lng } = req.body;

  const user = users.get(userId) || await ensureUserInCache(userId);
  if (!userId || !user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  user.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
  user.lastActive = new Date().toISOString();
  user.isOnline = true;
  onlineUsers.add(userId);
  await persistUserLocation(userId, user.location.lat, user.location.lng, true);

  res.json({ success: true });
});

app.get('/api/users/match', async (req, res) => {
  const { userId, lat, lng, radius = 10 } = req.query;
  const testMode = req.query.testMode === '1' || req.query.testMode === 'true';
  const forceBot = req.query.forceBot === '1' || req.query.forceBot === 'true';
  const cancel = req.query.cancel === '1' || req.query.cancel === 'true';

  const currentUser = users.get(userId) || await ensureUserInCache(userId);
  if (!userId || !currentUser) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  if (cancel) {
    searchingUsers.delete(userId);
    return res.json({ success: true, match: null, cancelled: true });
  }

  let existingMatch = getActiveMatchForUser(userId);
  if (!existingMatch && supabaseAdmin) {
    const { data: m } = await supabaseAdmin
      .from('matches')
      .select('id,user_a,user_b,status,created_at')
      .eq('status', 'active')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (m?.id) {
      existingMatch = {
        id: m.id,
        userIds: [m.user_a, m.user_b],
        createdAt: m.created_at,
        status: m.status
      };
      matches.set(existingMatch.id, existingMatch);
      const partnerId = existingMatch.userIds.find(id => id !== userId);
      if (partnerId) await ensureUserInCache(partnerId);
    }
  }
  if (existingMatch) {
    searchingUsers.delete(userId);
    return res.json({ success: true, match: buildMatchPayload(existingMatch, userId) });
  }
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const parsedRadius = parseFloat(radius);
  searchingUsers.set(userId, { lat: parsedLat, lng: parsedLng, radius: parsedRadius, createdAt: Date.now() });
  const candidates = forceBot ? [] : getSearchingCandidates(userId, parsedLat, parsedLng, parsedRadius);

  if (candidates.length === 0) {
    if (testMode || forceBot) {
      const bot = await getOrCreateTestBotForUser(userId, parsedLat, parsedLng, currentUser.interests);
      const matchId = uuidv4();
      const match = {
        id: matchId,
        userIds: [userId, bot.id],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      matches.set(matchId, match);
      messages.set(matchId, []);
      searchingUsers.delete(userId);
      await persistMatchRow(match);

      return res.json({ success: true, match: buildMatchPayload(match, userId) });
    }

    return res.json({ success: true, match: null, waiting: true });
  }

  const matchedUser = candidates[0].user;

  const matchId = uuidv4();
  const match = {
    id: matchId,
    userIds: [userId, matchedUser.id],
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  matches.set(matchId, match);
  messages.set(matchId, []);
  searchingUsers.delete(userId);
  searchingUsers.delete(matchedUser.id);
  await persistMatchRow(match);

  emitToUser(matchedUser.id, 'match_found', buildMatchPayload(match, matchedUser.id));
  emitToUser(userId, 'match_found', buildMatchPayload(match, userId));

  res.json({ success: true, match: buildMatchPayload(match, userId) });
});

app.get('/api/users/profile/:id', async (req, res) => {
  const userId = req.params.id;
  const user = users.get(userId) || await ensureUserInCache(userId);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.json({
    success: true,
    profile: {
      id: user.id,
      displayName: user.displayName,
      avatar: user.avatar,
      interests: user.interests,
      isOnline: user.isOnline
    }
  });
});

app.get('/api/chat/:matchId/messages', async (req, res) => {
  const { matchId } = req.params;
  const { userId } = req.query;

  let match = matches.get(matchId);
  if (!match && supabaseAdmin) {
    const { data: m } = await supabaseAdmin
      .from('matches')
      .select('id,user_a,user_b,status,created_at')
      .eq('id', matchId)
      .maybeSingle();
    if (m?.id) {
      match = { id: m.id, userIds: [m.user_a, m.user_b], createdAt: m.created_at, status: m.status };
      matches.set(match.id, match);
      await ensureUserInCache(m.user_a);
      await ensureUserInCache(m.user_b);
    }
  }
  if (!match || !match.userIds.includes(userId)) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  let chatMessages = messages.get(matchId);
  if (!chatMessages) {
    chatMessages = await fetchMessagesFromDb(matchId);
    messages.set(matchId, chatMessages);
  }

  res.json({ success: true, messages: chatMessages });
});

app.post('/api/chat/:matchId/messages', async (req, res) => {
  const { matchId } = req.params;
  const { userId, content } = req.body;

  let match = matches.get(matchId);
  if (!match && supabaseAdmin) {
    const { data: m } = await supabaseAdmin
      .from('matches')
      .select('id,user_a,user_b,status,created_at')
      .eq('id', matchId)
      .maybeSingle();
    if (m?.id) {
      match = { id: m.id, userIds: [m.user_a, m.user_b], createdAt: m.created_at, status: m.status };
      matches.set(match.id, match);
    }
  }
  if (!match || !match.userIds.includes(userId)) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  const filteredContent = filterProfanity(content);

  const message = {
    id: uuidv4(),
    matchId,
    senderId: userId,
    content: filteredContent,
    createdAt: new Date().toISOString()
  };

  const chatMessages = messages.get(matchId) || [];
  chatMessages.push(message);
  messages.set(matchId, chatMessages);

  if (supabaseAdmin) {
    await supabaseAdmin.from('messages').insert({
      id: message.id,
      match_id: matchId,
      sender_id: userId,
      content: message.content,
      created_at: message.createdAt
    });
  }

  io.to(matchId).emit('new_message', message);

  const otherId = match.userIds.find(id => id !== userId);
  const otherUser = users.get(otherId);
  const isBot = otherUser?.isTestBot;

  if (isBot) {
    setTimeout(async () => {
      const replies = ['รับแล้ว 🍵', 'โอเคเลย!', 'เล่าเพิ่มหน่อยสิ', '555 เข้าใจละ', 'น่าสนใจนะ'];
      const reply = {
        id: uuidv4(),
        matchId,
        senderId: otherId,
        content: replies[Math.floor(Math.random() * replies.length)],
        createdAt: new Date().toISOString()
      };

      const nextMessages = messages.get(matchId) || [];
      nextMessages.push(reply);
      messages.set(matchId, nextMessages);
      if (supabaseAdmin) {
        await supabaseAdmin.from('messages').insert({
          id: reply.id,
          match_id: matchId,
          sender_id: otherId,
          content: reply.content,
          created_at: reply.createdAt
        });
      }
      io.to(matchId).emit('new_message', reply);
    }, 450);
  }

  res.json({ success: true, message });
});

app.post('/api/block', async (req, res) => {
  const { userId, blockedUserId } = req.body;

  const user = users.get(userId) || await ensureUserInCache(userId);
  if (!userId || !user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  if (!user.blockedBy) {
    user.blockedBy = new Set();
  }
  user.blockedBy.add(blockedUserId);

  if (!blockedUsers.has(userId)) {
    blockedUsers.set(userId, new Set());
  }
  blockedUsers.get(userId).add(blockedUserId);

  const matchToEnd = Array.from(matches.values()).find(
    m => m.status === 'active' && m.userIds.includes(userId) && m.userIds.includes(blockedUserId)
  );
  if (matchToEnd) {
    matchToEnd.status = 'ended';
  }

  if (supabaseAdmin) {
    await supabaseAdmin.from('blocks').upsert({ user_id: userId, blocked_user_id: blockedUserId });
    if (matchToEnd) {
      await supabaseAdmin.from('matches').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', matchToEnd.id);
    }
  }

  res.json({ success: true });
});

app.get('/api/blocked', async (req, res) => {
  const { userId } = req.query;

  const user = users.get(userId) || await ensureUserInCache(userId);
  if (!userId || !user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  let blockedList = [];
  if (supabaseAdmin) {
    const { data: rows } = await supabaseAdmin
      .from('blocks')
      .select('blocked_user_id')
      .eq('user_id', userId);

    const ids = (rows || []).map(r => r.blocked_user_id);
    if (ids.length === 0) {
      blockedList = [];
    } else {
      const { data: urows } = await supabaseAdmin
        .from('users')
        .select('id,display_name,avatar_emoji')
        .in('id', ids);
      const byId = new Map((urows || []).map(u => [u.id, u]));
      blockedList = ids.map(id => ({
        id,
        displayName: byId.get(id)?.display_name || 'Unknown',
        avatar: byId.get(id)?.avatar_emoji || '🍵'
      }));
    }
  } else {
    const blocked = blockedUsers.get(userId) || new Set();
    blockedList = Array.from(blocked).map(id => {
      const u = users.get(id);
      return u ? { id: u.id, displayName: u.displayName, avatar: u.avatar } : null;
    }).filter(Boolean);
  }

  res.json({ success: true, blocked: blockedList });
});

app.post('/api/report', (req, res) => {
  const { userId, reportedUserId, reason, details } = req.body;

  if (!userId || !users.has(userId)) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  const report = {
    id: uuidv4(),
    reporterId: userId,
    reportedUserId,
    reason,
    details: details || '',
    createdAt: new Date().toISOString()
  };

  reports.push(report);

  res.json({ success: true, message: 'Report submitted' });
});

app.post('/api/match/:matchId/skip', (req, res) => {
  const { matchId } = req.params;
  const { userId } = req.body;

  const match = matches.get(matchId);
  if (!match || !match.userIds.includes(userId)) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  match.status = 'ended';

  res.json({ success: true });
});

app.put('/api/users/status', (req, res) => {
  const { userId, isOnline } = req.body;

  if (!userId || !users.has(userId)) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  const user = users.get(userId);
  user.isOnline = isOnline;
  user.lastActive = new Date().toISOString();

  if (!isOnline) {
    onlineUsers.delete(userId);
  } else {
    onlineUsers.add(userId);
  }

  res.json({ success: true });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    socket.userId = userId;
    registerSocketForUser(userId, socket.id);
  });

  socket.on('join_match', (matchId, userId) => {
    socket.join(matchId);
    socket.matchId = matchId;
    socket.userId = userId;
    registerSocketForUser(userId, socket.id);

    const user = users.get(userId);
    if (user) {
      user.isOnline = true;
      user.lastActive = new Date().toISOString();
      onlineUsers.add(userId);
    }

    io.to(matchId).emit('user_online', { userId });
  });

  socket.on('leave_match', (matchId) => {
    socket.leave(matchId);
  });

  socket.on('send_message', (data) => {
    const { matchId, userId, content } = data;

    const match = matches.get(matchId);
    if (!match || match.status !== 'active') return;

    const filteredContent = filterProfanity(content);

    const message = {
      id: uuidv4(),
      matchId,
      senderId: userId,
      content: filteredContent,
      createdAt: new Date().toISOString()
    };

    const chatMessages = messages.get(matchId) || [];
    chatMessages.push(message);
    messages.set(matchId, chatMessages);

    io.to(matchId).emit('new_message', message);
  });

  socket.on('typing', (data) => {
    const { matchId, userId, isTyping } = data;
    socket.to(matchId).emit('user_typing', { userId, isTyping });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    if (socket.userId) {
      unregisterSocketForUser(socket.userId, socket.id);
      const user = users.get(socket.userId);
      if (user) {
        user.isOnline = false;
        user.lastActive = new Date().toISOString();
        onlineUsers.delete(socket.userId);
      }

      if (socket.matchId) {
        io.to(socket.matchId).emit('user_offline', { userId: socket.userId });
      }
    }
  });
});

setInterval(() => {
  users.forEach((user, id) => {
    const timeDiff = Date.now() - new Date(user.lastActive).getTime();
    if (timeDiff > 300000 && user.isOnline) {
      user.isOnline = false;
      onlineUsers.delete(id);
    }
  });
}, 60000);

server.listen(PORT, () => {
  console.log(`🍵 Matcha Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.io: ws://localhost:${PORT}`);
});
