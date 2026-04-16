const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

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

function getOrCreateTestBotForUser(userId, lat, lng, interests) {
  const botId = `bot:${userId}`;
  const offset = 0.0003;

  const bot = users.get(botId) || {
    id: botId,
    guestId: botId,
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

  return bot;
}

app.post('/api/auth/guest', (req, res) => {
  const guestId = uuidv4();
  const userId = uuidv4();
  const displayName = generateRandomName();
  const avatar = INTERESTS[Math.floor(Math.random() * INTERESTS.length)].emoji;

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

app.put('/api/users/interests', (req, res) => {
  const { userId, interests } = req.body;

  if (!userId || !users.has(userId)) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  const user = users.get(userId);
  user.interests = interests || [];
  user.lastActive = new Date().toISOString();

  res.json({ success: true, interests: user.interests });
});

app.put('/api/users/location', (req, res) => {
  const { userId, lat, lng } = req.body;

  if (!userId || !users.has(userId)) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  const user = users.get(userId);
  user.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
  user.lastActive = new Date().toISOString();
  user.isOnline = true;
  onlineUsers.add(userId);

  res.json({ success: true });
});

app.get('/api/users/match', (req, res) => {
  const { userId, lat, lng, radius = 10 } = req.query;
  const testMode = req.query.testMode === '1' || req.query.testMode === 'true';
  const forceBot = req.query.forceBot === '1' || req.query.forceBot === 'true';

  if (!userId || !users.has(userId)) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  const currentUser = users.get(userId);
  const existingMatch = getActiveMatchForUser(userId);
  if (existingMatch) {
    return res.json({ success: true, match: buildMatchPayload(existingMatch, userId) });
  }
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const parsedRadius = parseFloat(radius);
  const candidates = forceBot
    ? []
    : getOnlineUsersInRadius(userId, parsedLat, parsedLng, parsedRadius, currentUser.interests);

  if (candidates.length === 0) {
    if (testMode || forceBot) {
      const bot = getOrCreateTestBotForUser(userId, parsedLat, parsedLng, currentUser.interests);
      const matchId = uuidv4();
      const match = {
        id: matchId,
        userIds: [userId, bot.id],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      matches.set(matchId, match);
      messages.set(matchId, []);

      return res.json({ success: true, match: buildMatchPayload(match, userId) });
    }

    return res.json({ success: true, match: null, message: 'No matches found nearby' });
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

  res.json({ success: true, match: buildMatchPayload(match, userId) });
});

app.get('/api/users/profile/:id', (req, res) => {
  const userId = req.params.id;
  const user = users.get(userId);

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

app.get('/api/chat/:matchId/messages', (req, res) => {
  const { matchId } = req.params;
  const { userId } = req.query;

  const match = matches.get(matchId);
  if (!match || !match.userIds.includes(userId)) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  const chatMessages = messages.get(matchId) || [];

  res.json({ success: true, messages: chatMessages });
});

app.post('/api/chat/:matchId/messages', (req, res) => {
  const { matchId } = req.params;
  const { userId, content } = req.body;

  const match = matches.get(matchId);
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

  io.to(matchId).emit('new_message', message);

  const otherId = match.userIds.find(id => id !== userId);
  const otherUser = users.get(otherId);
  const isBot = otherUser?.isTestBot || (typeof otherId === 'string' && otherId.startsWith('bot:'));

  if (isBot) {
    setTimeout(() => {
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
      io.to(matchId).emit('new_message', reply);
    }, 450);
  }

  res.json({ success: true, message });
});

app.post('/api/block', (req, res) => {
  const { userId, blockedUserId } = req.body;

  if (!userId || !users.has(userId)) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  const user = users.get(userId);
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

  res.json({ success: true });
});

app.get('/api/blocked', (req, res) => {
  const { userId } = req.query;

  if (!userId || !users.has(userId)) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  const blocked = blockedUsers.get(userId) || new Set();
  const blockedList = Array.from(blocked).map(id => {
    const user = users.get(id);
    return user ? { id: user.id, displayName: user.displayName, avatar: user.avatar } : null;
  }).filter(Boolean);

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

  socket.on('join_match', (matchId, userId) => {
    socket.join(matchId);
    socket.matchId = matchId;
    socket.userId = userId;

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
