# GummyText Mobile App

A React Native mobile app for the GummyText second phone number service.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### Installation

```bash
cd mobile-app
npm install
# or
yarn install
```

### Running the App

```bash
# Start the development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios
```

## 📱 Building for Google Play Store

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure EAS Build
```bash
eas build:configure
```

### 4. Build for Android
```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### 5. Submit to Play Store
```bash
eas submit --platform android
```

## 📁 Project Structure

```
mobile-app/
├── App.js                 # Main entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── src/
    ├── screens/           # All app screens
    │   ├── SplashScreen.js
    │   ├── OnboardingScreen.js
    │   ├── LoginScreen.js
    │   ├── SignupScreen.js
    │   ├── DialerScreen.js
    │   ├── MessagesScreen.js
    │   ├── ChatScreen.js
    │   ├── VoicemailScreen.js
    │   └── SettingsScreen.js
    ├── services/
    │   └── api.js         # API client
    ├── components/        # Reusable components
    ├── hooks/             # Custom hooks
    └── assets/            # Images, fonts
```

## 🎨 Design System

The app uses the **2026 Gummy UI** design language:

- **Colors**: Purple-dominant gradients (#D946EF, #8B5CF6)
- **Background**: Dark (#0D0415, #1A0529)
- **Accent**: Cyan (#06B6D4), Amber (#F59E0B)
- **Style**: 3D glossy "gummy" buttons, glass-morphism panels

## 🔧 Configuration

### API Base URL
Update the API URL in `src/services/api.js`:

```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

### App Configuration
Edit `app.json` for:
- App name and slug
- Bundle identifier (iOS/Android)
- Splash screen
- Icons
- Permissions

## 📋 Screens Overview

| Screen | Description |
|--------|-------------|
| Splash | Animated logo on app launch |
| Onboarding | 3-slide intro (Privacy, Second Number, WiFi Calling) |
| Login | Email/password + Google login |
| Signup | Registration with trial info |
| Dialer | 3D gummy keypad for calls |
| Messages | Conversation list |
| Chat | Individual message thread |
| Voicemail | Voicemail list with transcription |
| Settings | Profile, PIN lock, subscription |

## 🔐 Required Permissions

- `RECORD_AUDIO` - For voice calls
- `READ_CONTACTS` - For contact sync (optional)
- `VIBRATE` - For haptic feedback
- `USE_BIOMETRIC` - For biometric unlock (optional)

## 🛠 Development Tips

### Hot Reload
Changes auto-reload in Expo Go.

### Debugging
- Shake device to open dev menu
- Use `console.log()` or React Native Debugger

### Testing on Device
1. Install Expo Go on your phone
2. Scan QR code from terminal
3. App loads instantly

## 📦 Dependencies

Key packages:
- `@react-navigation/native` - Navigation
- `expo-linear-gradient` - Gradient backgrounds
- `expo-haptics` - Touch feedback
- `expo-secure-store` - Secure token storage
- `axios` - API requests

## 🚀 Deployment Checklist

Before submitting to Play Store:

- [ ] Update `app.json` with production values
- [ ] Replace API URL with production endpoint
- [ ] Add app icons (adaptive icon for Android)
- [ ] Create splash screen assets
- [ ] Test on multiple devices
- [ ] Write Play Store listing
- [ ] Create screenshots
- [ ] Set up privacy policy URL
- [ ] Configure signing keys

## 📞 Support

For issues or questions, check the main project README or contact support.
