# GummyText - Product Requirements Document

## Project Overview
**App Name:** GummyText - Second Phone Number App  
**Version:** 1.1.0 (Twilio Integration Complete)  
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

### Frontend (React.js) - COMPLETE
- [x] Onboarding flow (3 screens)
- [x] Authentication (Login/Register/Google)
- [x] **Enhanced Number Selection:**
  - [x] "Your Twilio Numbers" section (owned numbers)
  - [x] "Numbers Available Now" from Twilio inventory
  - [x] Area code search with filtering
  - [x] Capability badges (Voice, SMS, MMS)
  - [x] Confirmation screen with details
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

### Design System - COMPLETE
- [x] Dark theme with purple gradients
- [x] 3D gummy-style buttons
- [x] Glass panel effects
- [x] Neon glow effects
- [x] Nunito/Quicksand/Fredoka fonts
- [x] Micro-animations

## Twilio Configuration
```
Account SID: AC8dc5a79d40c743d7a8252e4faed3558f
Phone Number: +16812614963 (681) 261-4963
Capabilities: Voice ✓ SMS ✓ MMS ✓
Account Type: Trial (can own 1 number)
```

## Prioritized Backlog

### P0 (Blocking for Production)
- [ ] Upgrade to Twilio paid account for multiple numbers
- [ ] Configure Twilio webhooks for incoming SMS/calls
- [ ] Implement real-time message receiving

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

## React Native Mobile App (Not Yet Started)
The web app is complete. For Google Play Store deployment:
1. Create React Native project with Expo
2. Port components from web app
3. Add native features (biometrics, push)
4. Test on Android emulator
5. Generate signed APK

## Technical Stack
- **Frontend:** React.js 19, Tailwind CSS, Lucide React
- **Backend:** Python FastAPI, MongoDB, Motor
- **Auth:** JWT + Emergent Google OAuth
- **Payments:** Stripe (test key)
- **Phone:** Twilio (LIVE - trial account)
- **Design:** Gummy UI 2026

## Test Credentials
- Email: demo2@gummytext.com / test@gummytext.com
- Password: password123
- Twilio Number: (681) 261-4963
