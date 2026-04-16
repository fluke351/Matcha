# 🍵 Matcha - Social Discovery App

แอปหาเพื่อนใหม่ตามระยะทางและความสนใจ (Matcha Vibe)

## 🚀 วิธีการรันโปรเจกต์

### 1. ส่วน Backend (Node.js)
```bash
cd backend
npm install
npm start
```
*รันอยู่ที่ http://localhost:3000*

### 2. ส่วน Frontend (React Native / Expo)
```bash
cd frontend
npm install
npx expo start
```
*ใช้แอป **Expo Go** บนมือถือสแกน QR Code เพื่อรัน*

## 🧩 ฟีเจอร์ที่มีให้
- 🔍 **Location Matching**: ค้นหาเพื่อนในระยะ 1km, 5km, 10km (ใช้ Haversine Formula)
- 🎯 **Interest Matching**: เลือกสิ่งที่สนใจ (เกม, เพลง, Dev, ฯลฯ) เพื่อแมตช์คนคอเดียวกัน
- 💬 **Anonymous Chat**: แชทสดผ่าน Socket.io ไม่ต้องสมัครสมาชิก (Guest ID)
- ❌ **Skip / Next**: ข้ามคนที่ไม่ใช่ เพื่อหาเพื่อนใหม่ทันที
- 🛡️ **Safety System**: ระบบรายงาน (Report), บล็อก (Block) และกรองคำหยาบ (Profanity Filter)

## 🎨 Design System
- **Theme**: Matcha Green (#A8D5BA, #7BC9A4)
- **Vibe**: Cute, Minimal, Rounded UI
- **Components**: Custom Chips, Pulsing Search, Chat Bubbles

## 📂 โครงสร้างโปรเจกต์
- `/backend`: Express.js + Socket.io (In-memory store)
- `/frontend`: React Native + React Navigation + Axios
- `SPEC.md`: รายละเอียดสเปคและดีไซน์ทั้งหมด
