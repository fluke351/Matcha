# Matcha - Social Discovery App Specification

## 1. Concept & Vision

**Matcha** is a cute, safe, and playful social discovery app that connects people based on geographic proximity and shared interests. The experience feels like sipping warm matcha in a cozy café — relaxed, friendly, and inviting. Users discover nearby connections through random matching with a friendly, non-intimidating vibe similar to Omegle but with modern safety features and a kawaii aesthetic.

## 2. Design Language

### Color Palette

- **Primary Green**: `#A8D5BA` (soft matcha green)
- **Secondary Green**: `#7BC9A4` (deeper matcha)
- **Accent Green**: `#5DB885` (button highlights)
- **Background**: `#F8FBF9` (off-white cream)
- **Surface**: `#FFFFFF` (pure white cards)
- **Text Primary**: `#2D3436` (dark charcoal)
- **Text Secondary**: `#636E72` (muted gray)
- **Bubble Self**: `#A8D5BA` (matcha green - own messages)
- **Bubble Other**: `#E8E8E8` (light gray - others' messages)
- **Danger**: `#E74C3C` (skip/report red)
- **Safe**: `#27AE60` (continue green)

### Typography

- **Primary Font**: 'Prompt' (Thai-friendly, rounded)
- **Fallback**: system-ui, -apple-system, sans-serif
- **Headings**: 24-32px, font-weight 600
- **Body**: 16px, font-weight 400
- **Caption**: 14px, font-weight 300

### Spatial System

- Base unit: 8px
- Border radius: 16px (cards), 24px (buttons), 50% (avatars)
- Padding: 16px (compact), 24px (standard), 32px (spacious)
- Shadow: `0 4px 12px rgba(0,0,0,0.08)` (soft elevation)

### Motion Philosophy

- **Transitions**: 300ms ease-in-out (default)
- **Fade**: opacity 0→1, 200ms
- **Slide Up**: translateY(20px→0), 300ms
- **Scale**: 0.95→1 on button press
- **Loading**: Pulsing animation (1s infinite)

### Visual Assets

- Emoji icons throughout (🍵 🎮 🎵 💻 etc.)
- Rounded avatar placeholders
- Soft gradient backgrounds on hero sections

## 3. Layout & Structure

### Screen Flow

```
Splash → Welcome → Age Verification → Interests Selection → Home (Matching)
                                                                    ↓
                                              Chat ← Match Found ← Nearby Search
                                                                    ↓
                                                         No Match (Retry)
```

### Screen Breakdown

1. **Splash Screen**: Logo animation, 2s duration
2. **Welcome Screen**: App intro, Login/Guest button
3. **Age Verification**: DOB picker + 18+ checkbox
4. **Interest Selection**: Grid of interest chips (min 3)
5. **Home/Matching Screen**: Central "Find Someone 🍵" button, distance selector
6. **Match Found Screen**: Partner preview, Skip/Continue buttons
7. **Chat Screen**: Bubble UI, Skip/Next controls
8. **Profile/Settings**: Edit interests, block list, report history

### Navigation

- Stack Navigator (main flow)
- Bottom sheet for distance selector
- Modal for Report/Block flows

## 4. Features & Interactions

### 4.1 Location-Based Matching

- Request geolocation permission on first find attempt
- Distance options: 1km, 5km, 10km (pill selector)
- Haversine formula for geo-distance calculation
- Filter: online users within radius
- Match algorithm prioritizes:
  1. Same interests (weighted)
  2. Online status
  3. Last active (prefer recent)

### 4.2 Anonymous Chat

- No real name required
- Random generated names: "MatchaBoy123", "ชาเขียวสายลุย", "TeaLover99"
- Guest ID stored locally
- Real-time messaging (polling every 3s or WebSocket)
- Typing indicator
- Online/offline status

### 4.3 Skip/Next System

- **❌ Skip**: End conversation, return to matching pool
- **💬 Continue**: Stay in current chat
- Skip increments user's skip count (soft rate limit: 10/hour)

### 4.4 Safety System

- **Report**: Select reason (spam, inappropriate, harassment), optional details
- **Block**: Immediate, bidirectional, irreversible
- **Profanity Filter**: Basic word list replacement (\*\*\*\*)
- **Age Verification**: DOB required, minimum 18 years
- **Content Guidelines**: Displayed on first chat

### 4.5 Interest Matching

Available interests (emoji-tagged):

- 🎮 เกม (Gaming)
- 🎵 เพลง (Music)
- 💻 Dev (Development)
- 📚 อ่านหนังสือ (Reading)
- 🍳 ทำอาหาร (Cooking)
- 🏃 ออกกำลังกาย (Fitness)
- 🎬 หนัง (Movies)
- ✈️ ท่องเที่ยว (Travel)
- 🐱 สัตว์เลี้ยง (Pets)
- 🎨 ศิลปะ (Art)

## 5. Component Inventory

### Buttons

- **Primary**: Green fill (#7BC9A4), white text, 48px height, full rounded
- **Secondary**: White fill, green border, green text
- **Danger**: Red fill (#E74C3C), white text
- **Icon Button**: 48x48px, circular, subtle background

### Cards

- White background
- 16px border radius
- Soft shadow
- 24px internal padding

### Chat Bubble

- Max-width: 75%
- Own: Green background (#A8D5BA), right-aligned
- Other: Gray background (#E8E8E8), left-aligned
- 12px border radius (more rounded on outer edge)

### Input Fields

- 48px height
- 24px border radius
- Light gray border (#E0E0E0)
- Focus: Green border (#7BC9A4)

### Chips/Tags

- Pill shape (full rounded)
- Background: light green (#E8F5ED)
- Text: dark green (#2D5A3D)
- Selected: Green fill, white text

### Modals

- Bottom sheet style
- Drag handle indicator
- Rounded top corners (24px)

### Loading States

- Spinner: Rotating matcha leaf emoji 🍃
- Skeleton: Shimmer effect on cards
- Button: Scale down + opacity reduction

### Empty States

- Friendly illustration placeholder
- Encouraging message
- Action button when applicable

### Error States

- Red border/badge
- Clear error message
- Retry action

## 6. Technical Approach

### Frontend (React Native / Expo)

- **Framework**: Expo SDK 50+
- **Navigation**: React Navigation 6 (Stack)
- **State**: React Context + useReducer
- **HTTP Client**: Axios
- **Storage**: AsyncStorage (guest ID, preferences)
- **Location**: expo-location

### Backend (Node.js)

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: In-memory store (Map) for demo, designed for MongoDB
- **Real-time**: Socket.io for chat
- **Auth**: Simple guest token (UUID v4)

### API Endpoints

#### Auth

- `POST /api/auth/guest` - Create guest account, returns guestId + generated name

#### Users

- `GET /api/users/match` - Find match based on location + interests
  - Query: `lat`, `lng`, `radius`, `interests[]`
- `PUT /api/users/location` - Update user location
- `PUT /api/users/interests` - Update user interests
- `GET /api/users/profile/:id` - Get user profile (limited info)

#### Chat

- `GET /api/chat/:matchId/messages` - Get chat history
- `POST /api/chat/:matchId/messages` - Send message
- `WS /chat` - Real-time chat via Socket.io

#### Safety

- `POST /api/report` - Report user
  - Body: `{ reportedUserId, reason, details }`
- `POST /api/block` - Block user
  - Body: `{ blockedUserId }`
- `GET /api/blocked` - Get blocked users list

### Data Models

#### User

```javascript
{
  id: string,
  guestId: string,
  displayName: string,
  avatar: string (emoji-based),
  interests: string[],
  location: { lat: number, lng: number },
  lastActive: timestamp,
  isOnline: boolean,
  createdAt: timestamp
}
```

#### Match

```javascript
{
  id: string,
  userIds: [string, string],
  createdAt: timestamp,
  status: 'active' | 'ended'
}
```

#### Message

```javascript
{
  id: string,
  matchId: string,
  senderId: string,
  content: string,
  createdAt: timestamp
}
```

#### Report

```javascript
{
  id: string,
  reporterId: string,
  reportedUserId: string,
  reason: string,
  details: string,
  createdAt: timestamp
}
```

### Profanity Filter

Basic word list approach:

- Maintain array of inappropriate Thai/English words
- Replace matches with asterisks
- Case-insensitive matching
- Extendable list stored in config
