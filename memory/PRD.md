# GummyText - Product Requirements Document

## Project Overview
**App Name:** GummyText - Second Phone Number App  
**Version:** 1.0.0 MVP  
**Last Updated:** 2026-03-03

## Original Problem Statement
Build a TextNow/Caddy clone - a complete system that includes both a mobile app (for iOS/Android) and web application that functions exactly like TextNow and Caddy. The app gives users a second real phone number for calls, texts, and voicemail over WiFi/data.

## User Personas
1. **Privacy-conscious individuals** - Want to keep personal number private for online dating, Craigslist, etc.
2. **Small business owners** - Need separate business line without second phone
3. **Travelers** - Want local number in different area codes
4. **Young adults** - Budget-friendly communication solution

## Core Requirements (Static)
- User authentication (Email/Password + Google OAuth)
- Phone number selection by area code (US/Canada)
- SMS/MMS messaging over WiFi/data
- VoIP calling with dialer
- Voicemail with transcription
- PIN lock security
- Credit-based monetization system
- Stripe payment integration
- Multi-number management (up to 10 per account)
- 2026 "Gummy UI" design aesthetic

## What's Been Implemented ✅

### Backend (FastAPI + MongoDB)
- [x] User registration with email/password
- [x] User login with JWT tokens
- [x] Google OAuth integration (Emergent Auth)
- [x] Session management with cookies
- [x] Phone number provisioning API (mock mode)
- [x] Phone number management (primary, release)
- [x] SMS sending/receiving API
- [x] Message conversations/threads
- [x] Call initiation API
- [x] Call history
- [x] Voicemail CRUD operations
- [x] PIN lock setup/verify/remove
- [x] Credit packages API
- [x] Subscription plans API
- [x] Stripe checkout integration
- [x] Payment webhook handling

### Frontend (React.js)
- [x] Onboarding flow (3 screens)
- [x] Authentication (Login/Register/Google)
- [x] Area code selection
- [x] Phone number selection
- [x] Dashboard with tabs
- [x] Messages tab with conversations
- [x] Individual chat screen
- [x] Dialer with gummy keypad
- [x] Calls history tab
- [x] Voicemail tab
- [x] Settings page
- [x] PIN lock modal
- [x] Credit purchase page
- [x] Bottom navigation
- [x] Beautiful 2026 gummy design

### Design System
- [x] Dark theme with purple gradients
- [x] 3D gummy-style buttons
- [x] Glass panel effects
- [x] Neon glow effects
- [x] Nunito/Quicksand/Fredoka fonts
- [x] Micro-animations

## Prioritized Backlog

### P0 (Blocking)
- [ ] Connect real Twilio credentials for live phone numbers
- [ ] WebRTC integration for actual VoIP calls
- [ ] Real-time message receiving via webhooks

### P1 (Important)
- [ ] Voicemail transcription (OpenAI Whisper)
- [ ] MMS media upload/display
- [ ] Push notifications
- [ ] Contact syncing from phone

### P2 (Nice to Have)
- [ ] Call recording
- [ ] Spam filtering
- [ ] Block contacts
- [ ] Message search
- [ ] Custom ringtones
- [ ] Dark/Light theme toggle

## React Native Mobile App (Not Yet Started)
The web app is complete and functional. For Google Play Store deployment:
1. Create React Native project with Expo
2. Port components from web app
3. Add native features (biometrics, push notifications)
4. Test on Android emulator
5. Generate signed APK for Play Store

## Technical Stack
- **Frontend:** React.js 19, Tailwind CSS, Lucide React
- **Backend:** Python FastAPI, MongoDB, Motor
- **Auth:** JWT + Emergent Google OAuth
- **Payments:** Stripe (test key configured)
- **Phone:** Twilio (MOCKED - awaiting credentials)
- **Design:** Gummy UI 2026

## Next Tasks
1. User provides Twilio credentials
2. Switch from mock to real phone numbers
3. Implement WebRTC for live calls
4. Add push notifications
5. Create React Native mobile version

## Test Credentials
- Email: test@gummytext.com
- Password: password123
- Credits: 25 (initial)
- Phone: (415) area code mock number
