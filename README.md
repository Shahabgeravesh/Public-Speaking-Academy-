# Public Speaking Academy

A comprehensive mobile app for learning and mastering public speaking skills through structured modules and practice exercises.

## Features

- 12 comprehensive learning modules
- 15 cards per module with detailed content
- Progress tracking and persistence
- Journal feature for each module
- Module unlocking system
- Beautiful, polished UI optimized for iOS and Android

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- EAS CLI (for building)
- Expo account (free tier works)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Building for Production

### Initial Setup

1. **Login to Expo:**
   ```bash
   npx eas login
   ```

2. **Initialize EAS project:**
   ```bash
   npx eas init
   ```
   This will create an EAS project and update your `app.json` with a project ID.

### Build Commands

```bash
# Build for iOS (production)
npm run build:ios

# Build for Android (production)
npm run build:android

# Build for both platforms
npm run build:all

# Build preview/internal builds
npm run build:preview
```

### Submitting to App Stores

#### iOS (App Store)

1. **Configure Apple Developer Account:**
   - Ensure you have an Apple Developer account ($99/year)
   - Update `eas.json` with your Apple ID, App Store Connect App ID, and Team ID

2. **Submit to App Store:**
   ```bash
   npm run submit:ios
   ```

#### Android (Google Play Store)

1. **Create Google Service Account:**
   - Go to Google Cloud Console
   - Create a service account with Play Console Admin role
   - Download the JSON key file
   - Save it as `google-service-account.json` in the project root
   - Add it to `.gitignore` (already included)

2. **Submit to Play Store:**
   ```bash
   npm run submit:android
   ```

## Project Structure

```
PublicSpeakingAcademy/
├── App.js                 # Main application file
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
├── index.js              # Entry point
├── package.json          # Dependencies and scripts
└── assets/               # Images and icons
    ├── icon.png
    ├── adaptive-icon.png
    ├── splash-icon.png
    └── favicon.png
```

## Configuration

### App Information

- **Bundle Identifier (iOS):** `com.publicspeakingacademy.app`
- **Package Name (Android):** `com.publicspeakingacademy.app`
- **Version:** 1.0.0
- **Build Number:** Auto-incremented in production builds

### EAS Build Profiles

- **development:** For development and testing
- **preview:** Internal builds for testing
- **production:** Production builds for app stores

## Development

```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## App Store Guidelines Compliance

✅ No tracking or analytics  
✅ No camera or photo library access  
✅ No location services  
✅ Encrypted exports declared (non-exempt)  
✅ Safe area handling for all devices  
✅ Accessibility labels for VoiceOver  

## Device Support

- **iOS:** iPhone 6s and newer, all iPad models (iOS 13.0+)
- **Android:** Android 8.0+ (API level 26+)
- **Orientation:** Portrait only

## Troubleshooting

### Build Issues

1. **EAS Build fails:**
   - Ensure you're logged in: `npx eas login`
   - Check `app.json` configuration
   - Verify all assets exist in `assets/` folder

2. **iOS build issues:**
   - Verify Apple Developer account is active
   - Check bundle identifier is unique
   - Ensure provisioning profiles are set up

3. **Android build issues:**
   - Verify package name is unique
   - Check that `google-service-account.json` exists (for submission)

### Development Issues

1. **Metro bundler errors:**
   - Clear cache: `npx expo start -c`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

2. **Safe area issues:**
   - App uses `react-native-safe-area-context` for proper safe area handling

## License

Private - All rights reserved

## Support

For issues or questions, please contact the development team.

