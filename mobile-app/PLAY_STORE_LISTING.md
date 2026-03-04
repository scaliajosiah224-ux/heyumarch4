# GummyText - Google Play Store Listing

## App Information

### App Name
GummyText - Second Phone Number

### Short Description (80 characters max)
Get a real US/Canada phone number. Text, call & voicemail over WiFi. Free!

### Full Description (4000 characters max)
GummyText gives you a real second phone number for calls, texts, and voicemail - all over WiFi or data. Keep your personal number private while staying connected!

🎉 **Why Choose GummyText?**

✅ **Real Phone Numbers** - Get a genuine US or Canada phone number from hundreds of area codes. It's a real number that works anywhere!

✅ **No SIM Card Needed** - Works entirely over WiFi or mobile data. Perfect for tablets, iPads, or using internationally.

✅ **Privacy First** - Keep your real number private for dating apps, online shopping, Craigslist, or business calls.

✅ **Crystal Clear Calls** - HD voice quality for all your calls. No more dropped calls or static.

✅ **Unlimited Texting** - Send and receive SMS and MMS messages with photos, videos, and GIFs.

✅ **Smart Voicemail** - Auto-transcription so you can read your voicemails instead of listening.

✅ **Multi-Number Support** - Manage up to 10 different phone numbers from one account.

✅ **PIN Lock Security** - Protect your messages with a 4-digit PIN.

📱 **Features:**
• Real phone number assignment
• Send & receive SMS/MMS
• Voice calls (VoIP)
• Video calls
• Voicemail with transcription
• Message reactions (❤️ 😂 👍)
• Voice messages
• GIF support
• Contact sync
• Call history
• PIN lock security
• Dark theme with beautiful UI

💰 **Pricing:**
• **FREE** - 1 number, 25 credits/month
• **Personal $4.99/month** - 1 number, unlimited texts & calls
• **Pro $9.99/month** - 5 numbers, unlimited everything

Perfect for:
• Online dating (keep your real number private)
• Small businesses (separate work & personal)
• Travelers (local number without roaming)
• Privacy-conscious users
• Anyone who needs a second line!

Download GummyText today and get your second number in seconds! 🚀

---

## Categorization

**Category:** Communication
**Content Rating:** Everyone
**Target Audience:** 13+

---

## Required Screenshots (Take these from the app)

1. **Landing Page** - Hero section with phone mockup
2. **Login Screen** - Authentication page
3. **Dashboard - Messages** - Conversation list
4. **Chat Screen** - Message thread with reactions
5. **Dialer** - Gummy keypad
6. **Number Selection** - Choose area code
7. **Settings** - App settings page
8. **Credit Purchase** - Subscription plans

---

## Content Rating Questionnaire Answers

**Violence:** None
**Sexual Content:** None
**Language:** None
**Controlled Substance:** None
**Miscellaneous:** None

**User-Generated Content:** Yes (messages between users)
**Shares Location:** No
**Shares Personal Information:** Yes (phone number, for communication)
**Contains Ads:** No (in premium plans)

---

## Permissions Justifications

| Permission | Justification |
|------------|---------------|
| RECORD_AUDIO | Required for voice calls and voice messages |
| READ_CONTACTS | Optional: To sync contacts for easier calling |
| CAMERA | Required for video calls and sending photos |
| INTERNET | Required for VoIP calls and messaging |
| VIBRATE | For notification alerts |
| READ_EXTERNAL_STORAGE | To attach photos/videos to messages |
| RECEIVE_BOOT_COMPLETED | To receive calls/messages on boot |

---

## Privacy Policy Requirements

Your Privacy Policy must include:
1. What data you collect (phone number, messages, call history)
2. How you use the data (to provide communication services)
3. Third-party services (Twilio for phone services, Stripe for payments)
4. Data retention policy
5. User rights (data deletion, export)
6. Contact information

---

## Build & Submit Instructions

### Prerequisites
1. Install Node.js 18+
2. Install EAS CLI: `npm install -g eas-cli`
3. Create Expo account: https://expo.dev/signup
4. Create Google Play Developer account: https://play.google.com/console

### Build Steps

```bash
# Navigate to mobile app
cd /app/mobile-app

# Install dependencies
npm install

# Login to Expo
eas login

# Configure your project
eas build:configure

# Build for Android (APK for testing)
eas build --platform android --profile preview

# Build for Android (AAB for Play Store)
eas build --platform android --profile production
```

### Submit to Play Store

```bash
# Automatic submission (requires service account key)
eas submit --platform android --profile production

# Or download the AAB and upload manually via Play Console
```

### Manual Upload Steps
1. Go to https://play.google.com/console
2. Create new app
3. Fill in store listing details (above)
4. Upload screenshots
5. Set up pricing (free with in-app purchases)
6. Upload AAB file from EAS build
7. Submit for review

---

## Version History

### v2.0.0 (Current)
- Bubbly 2026 UI redesign
- Message reactions
- Voice messages
- Video call support (coming soon)
- Confetti celebrations
- Improved real-time messaging

### v1.0.0
- Initial release
- Basic messaging & calling
- Twilio integration
