# GummyText - Product Requirements Document

## Project Overview
**App Name:** GummyText - Second Phone Number App  
**Version:** 1.3.0 (Real-time WebSocket Messaging)  
**Last Updated:** 2026-03-04

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

### Website - COMPLETE
- [x] **Stunning Landing Page (2026 Design):**
  - [x] Navigation with logo, links, CTA buttons
  - [x] Hero section with animated phone mockup
  - [x] 6 Feature cards with gradient icons
  - [x] 3-step "How It Works" section
  - [x] Pricing section (Free, Unlimited, Business plans)
  - [x] Testimonials with star ratings
  - [x] CTA section and footer
  - [x] Animated background blobs
  - [x] Mobile responsive design

### Backend (FastAPI + MongoDB) - COMPLETE
- [x] User registration with email/password
- [x] User login with JWT tokens
- [x] Google OAuth integration (Emergent Auth)
- [x] Session management with cookies
- [x] **LIVE Twilio Integration:**
  - [x] /api/phone-numbers/twilio-account - Get owned numbers
  - [x] /api/phone-numbers/add-existing - Add owned Twilio number
  - [x] /api/phone-numbers/available - Search by area code
  - [x] /api/phone-numbers/nearby - Get available numbers
  - [x] /api/phone-numbers/search - Pattern search
  - [x] /api/phone-numbers/purchase - Buy new number
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
- [x] **WebSocket Real-time Messaging:**
  - [x] /api/ws/chat - WebSocket endpoint for real-time chat
  - [x] ConnectionManager for handling connections
  - [x] Typing indicators support
  - [x] Message read receipts
  - [x] Online status tracking

### Frontend (React.js) - COMPLETE
- [x] Onboarding flow (3 screens)
- [x] Authentication (Login/Register/Google)
- [x] **Enhanced Number Selection:**
  - [x] "Your Twilio Numbers" section (owned numbers)
  - [x] "Numbers Available Now" from Twilio inventory
  - [x] Area code search with filtering
  - [x] Capability badges (Voice, SMS, MMS)
  - [x] Confirmation screen with details
  - [x] **Back arrow navigates to Dashboard (P0 Fix)**
- [x] Dashboard with tabs
- [x] Messages tab with conversations
- [x] **Real-time Chat Screen:**
  - [x] WebSocket connection with auto-reconnect
  - [x] Typing indicators ("typing..." animation)
  - [x] Connection status indicator (Wifi icon)
  - [x] Optimistic UI updates for instant feedback
  - [x] Message read receipts (checkmark icons)
- [x] Dialer with gummy keypad
- [x] Calls history tab
- [x] Voicemail tab
- [x] Settings page
- [x] PIN lock modal
- [x] Credit purchase page
- [x] Bottom navigation
- [x] Beautiful 2026 gummy design

### Design System - COMPLETE
- [x] Dark theme with purple gradients
- [x] 3D gummy-style buttons
- [x] Glass panel effects
- [x] Neon glow effects
- [x] Nunito/Quicksand/Fredoka fonts
- [x] Micro-animations

## React Native Mobile App - STRUCTURE COMPLETE

Located in `/app/mobile-app/`:

### Completed Screens:
- [x] SplashScreen.js - Animated logo splash
- [x] OnboardingScreen.js - 3-slide intro
- [x] LoginScreen.js - Email/password login
- [x] SignupScreen.js - Registration form
- [x] DialerScreen.js - 3D gummy keypad
- [x] MessagesScreen.js - Conversation list
- [x] ChatScreen.js - Individual chat
- [x] VoicemailScreen.js - Voicemail list
- [x] SettingsScreen.js - Profile & settings

### To Deploy to Play Store:
```bash
cd mobile-app
npm install
eas build --platform android
eas submit --platform android
```

## Twilio Configuration
```
Account SID: AC8dc5a79d40c743d7a8252e4faed3558f
Phone Number: +16812614963 (681) 261-4963
Capabilities: Voice ✓ SMS ✓ MMS ✓
Account Type: Trial (can own 1 number)
```

## Prioritized Backlog

### P0 (Blocking for Production)
- [x] ~~Back arrow on Choose Area Code navigates to Dashboard~~ **FIXED 2026-03-04**
- [ ] Upgrade to Twilio paid account for multiple numbers
- [ ] Configure Twilio webhooks for incoming SMS/calls
- [x] ~~Implement real-time message receiving~~ **DONE 2026-03-04**

### P1 (Important)
- [ ] WebRTC integration for actual VoIP calls
- [ ] Voicemail transcription (OpenAI Whisper)
- [ ] Push notifications
- [ ] Contact syncing

### P2 (Nice to Have)
- [ ] MMS media upload/display
- [ ] Call recording
- [ ] Spam filtering
- [ ] Block contacts
- [ ] Message search

## Recent Changes (2026-03-04)
1. **P0 Bug Fix:** Back arrow on NumberSelection.js now navigates to `/dashboard` instead of using `navigate(-1)`
2. **WebSocket Implementation:**
   - Added ConnectionManager class in backend for managing WebSocket connections
   - Created `/api/ws/chat` WebSocket endpoint for real-time messaging
   - Added useWebSocket hook for frontend
   - Updated Chat.js with real-time messaging, typing indicators, and connection status
   - Updated MessagesTab.js with real-time indicator

## Technical Stack
- **Frontend:** React.js 19, Tailwind CSS, Lucide React
- **Backend:** Python FastAPI, MongoDB, Motor
- **Auth:** JWT + Emergent Google OAuth
- **Payments:** Stripe (test key)
- **Phone:** Twilio (LIVE - trial account)
- **Real-time:** WebSockets (FastAPI WebSocket)
- **Design:** Gummy UI 2026

## Test Credentials
- Email: test2@gummytext.com
- Password: Test123456
- Twilio Number: (681) 261-4963
