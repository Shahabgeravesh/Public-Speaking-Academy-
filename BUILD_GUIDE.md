# Build and Publishing Guide

## Quick Start

### 1. Setup EAS Account (One-time)

```bash
# Login to Expo
npx eas login

# If you don't have an account, create one at: https://expo.dev/signup
```

### 2. Initialize EAS Project (One-time)

```bash
# This will create an EAS project and update app.json
npx eas init
```

This will:
- Create an EAS project for your app
- Update `app.json` with your project ID
- Link your local project to EAS

### 3. Build for Production

#### iOS Build

```bash
# Build for iOS App Store
npm run build:ios
```

**First time setup:**
- You'll need an Apple Developer account ($99/year)
- EAS will guide you through credential setup
- You can use EAS Managed credentials (recommended) or provide your own

#### Android Build

```bash
# Build for Google Play Store
npm run build:android
```

**First time setup:**
- EAS will guide you through credential setup
- You can use EAS Managed credentials (recommended) or provide your own

#### Build Both Platforms

```bash
# Build for both iOS and Android
npm run build:all
```

### 4. Preview Builds (Internal Testing)

```bash
# Build preview versions for internal testing
npm run build:preview
```

These builds are perfect for:
- Testing on real devices
- Sharing with team members
- Testing before production release

## Submitting to App Stores

### iOS App Store Submission

#### Prerequisites:
1. Apple Developer Account (active)
2. App Store Connect app created
3. App Store Connect API Key (optional, for automated submission)

#### Steps:

1. **Update `eas.json` with your Apple credentials:**
   ```json
   "submit": {
     "production": {
       "ios": {
         "appleId": "your-apple-id@example.com",
         "ascAppId": "your-app-store-connect-app-id",
         "appleTeamId": "your-apple-team-id"
       }
     }
   }
   ```

2. **Submit to App Store:**
   ```bash
   npm run submit:ios
   ```

   Or manually:
   ```bash
   npx eas submit --platform ios
   ```

3. **After submission:**
   - Go to App Store Connect
   - Complete app information (screenshots, description, etc.)
   - Submit for review

### Google Play Store Submission

#### Prerequisites:
1. Google Play Developer Account ($25 one-time)
2. Service Account JSON key for API access

#### Steps:

1. **Create Google Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Google Play Android Developer API"
   - Create a Service Account
   - Grant "Play Console Admin" role
   - Download JSON key file
   - Save as `google-service-account.json` in project root
   - **Important:** Add this file to `.gitignore` (already done)

2. **Link Service Account to Play Console:**
   - Go to Play Console → Setup → API access
   - Link the service account
   - Grant appropriate permissions

3. **Update `eas.json` (already configured):**
   ```json
   "submit": {
     "production": {
       "android": {
         "serviceAccountKeyPath": "./google-service-account.json",
         "track": "internal"
       }
     }
   }
   ```

4. **Submit to Play Store:**
   ```bash
   npm run submit:android
   ```

   Or manually:
   ```bash
   npx eas submit --platform android
   ```

5. **After submission:**
   - Go to Google Play Console
   - Complete store listing
   - Submit for review

## Build Profiles Explained

### Development
- For local development
- Includes development client
- Fast iteration

### Preview
- Internal testing builds
- APK for Android, IPA for iOS
- No app store required

### Production
- Production builds
- AAB for Android (required for Play Store)
- IPA for iOS (required for App Store)
- Auto-increments build numbers

## Updating Your App

### Version Updates

1. **Update version in `app.json`:**
   ```json
   {
     "expo": {
       "version": "1.0.1"  // Increment version
     }
   }
   ```

2. **Build and submit:**
   ```bash
   npm run build:all
   npm run submit:all
   ```

### Build Number

- **iOS:** Auto-incremented by EAS (if `autoIncrement: true`)
- **Android:** Auto-incremented by EAS in production builds

## Troubleshooting

### Build Fails

1. **Check logs:**
   ```bash
   npx eas build:list
   npx eas build:view [build-id]
   ```

2. **Common issues:**
   - Missing assets: Verify all files in `assets/` folder exist
   - Invalid configuration: Run `npx expo-doctor`
   - Credential issues: Run `npx eas credentials`

### Credential Issues

```bash
# View credentials
npx eas credentials

# Reset credentials (if needed)
npx eas credentials --clear
```

### Submission Fails

1. **iOS:**
   - Verify Apple ID and Team ID in `eas.json`
   - Check App Store Connect app exists
   - Ensure build is approved for submission

2. **Android:**
   - Verify service account JSON key exists
   - Check service account has proper permissions
   - Ensure app is created in Play Console

## Best Practices

1. **Always test preview builds before production**
2. **Keep credentials secure (never commit to git)**
3. **Use EAS Managed credentials when possible**
4. **Test on real devices before submission**
5. **Follow App Store and Play Store guidelines**
6. **Update changelog for each version**

## Resources

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)

## Need Help?

- [Expo Forums](https://forums.expo.dev/)
- [EAS Support](https://expo.dev/support)
- [Discord Community](https://chat.expo.dev/)

