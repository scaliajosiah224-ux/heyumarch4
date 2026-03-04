# GummyText - Product Requirements Document

## Project Overview
**App Name:** GummyText - Second Phone Number App  
**Version:** 2.0.0 (Bubbly UI Redesign)  
**Last Updated:** 2026-03-04

## Original Problem Statement
Build a TextNow/Caddy clone - a complete system that includes both a mobile app (for iOS/Android) and web application that functions exactly like TextNow and Caddy. The app gives users a second real phone number for calls, texts, and voicemail over WiFi/data.

## Design Philosophy - "Gummy UI 2026"
- **Aesthetic:** Bubbly, joyful, classy, upbeat, happy, modern
- **Core Principles:**
  - Tactile & Edible: Elements look soft, squishy, touchable
  - Deep Depth: Layered blurs, inner shadows, glossy highlights
  - Neon Organic: Dark backgrounds with vibrant, fluorescent shapes
  - Playful Physics: Bouncy animations and fluid transitions
  - Glass & Jelly: Surfaces are frosted glass or clear jelly
- **Mood:** Playful, Premium, Futuristic, Friendly, Juicy

## Pricing Structure
| Plan | Price | Features |
|------|-------|----------|
| Starter | $0/forever | 1 Number, 25 Credits, Basic Voicemail |
| **Personal** | **$4.99/month** | 1 Number, Unlimited Texts/Calls, No Ads, Priority Support |
| Pro | $9.99/month | 5 Numbers, Unlimited Everything, API Access, 24/7 Support |

## What's Been Implemented ✅

### Website - COMPLETE (v2.0 Bubbly Redesign)
- [x] **Stunning Landing Page:**
  - [x] Animated gradient background blobs
  - [x] Floating bubble decorations
  - [x] Party emoji animations 🎉🎊
  - [x] Glossy phone mockup with glow effects
  - [x] Stats section (10K+ users, 50M+ messages, 4.9 rating)
  - [x] Feature cards with gradient icons + emojis
  - [x] 3-step "How It Works" with numbered bubbles
  - [x] **Pricing section with $4.99/month Personal plan**
  - [x] Testimonials with emoji avatars
  - [x] Final CTA section with confetti
  - [x] Mobile responsive design

### Backend (FastAPI + MongoDB) - COMPLETE
- [x] User authentication (Email/Password + Google OAuth)
- [x] **LIVE Twilio Integration** for real phone numbers
- [x] **WebSocket Real-time Messaging** (/api/ws/chat)
- [x] SMS/MMS sending and receiving
- [x] Call history and voicemail
- [x] PIN lock security
- [x] Credit/subscription system with updated pricing

### Frontend (React.js) - COMPLETE
- [x] All pages with bubbly gummy design
- [x] Real-time chat with WebSocket connection indicator
- [x] Gummy keypad dialer
- [x] Number selection with Twilio integration
- [x] Settings with PIN lock toggle
- [x] Purchase page with subscriptions

### Mobile App (React Native) - STRUCTURE COMPLETE
Located in `/app/mobile-app/`:
- SplashScreen, Onboarding, Login, Signup
- Dashboard, Messages, Chat, Dialer
- Voicemail, Settings screens

## Twilio Configuration
```
Account SID: AC8dc5a79d40c743d7a8252e4faed3558f
Phone Number: +16812614963 (681) 261-4963
Capabilities: Voice ✓ SMS ✓ MMS ✓
```

## Technical Stack
- **Frontend:** React.js 19, Tailwind CSS, Lucide React
- **Backend:** Python FastAPI, MongoDB
- **Auth:** JWT + Emergent Google OAuth
- **Payments:** Stripe
- **Phone:** Twilio (LIVE)
- **Real-time:** WebSockets

## How to Publish to Google Play Store
```bash
cd /app/mobile-app
npm install
npx expo login
eas build --platform android --profile production
eas submit --platform android
```

## Test Credentials
- Email: test2@gummytext.com
- Password: Test123456
- Twilio Number: (681) 261-4963

## Prioritized Backlog

### P0 (Complete)
- [x] Back arrow navigation fix
- [x] WebSocket real-time messaging
- [x] Bubbly UI redesign
- [x] $4.99/month pricing

### P1 (Next)
- [ ] WebRTC integration for VoIP calls
- [ ] Voicemail transcription (OpenAI Whisper)
- [ ] Push notifications
- [ ] Build and deploy React Native app to Play Store

### P2 (Future)
- [ ] MMS media upload
- [ ] Contact syncing
- [ ] Number porting
- [ ] Group messaging
