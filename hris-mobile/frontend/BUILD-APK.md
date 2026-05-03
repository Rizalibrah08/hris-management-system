# APK Build Guide - Workmate HRIS Mobile App

This guide explains how to build Android APK files for the Workmate HRIS mobile application.

---

## 1. Prerequisites

Before building the APK, ensure you have the following installed:

### Required Software

| Software | Minimum Version | Download Link |
|----------|----------------|---------------|
| Android Studio | Latest stable | [developer.android.com/studio](https://developer.android.com/studio) |
| JDK (Java Development Kit) | 17 or higher | [oracle.com/java](https://www.oracle.com/java/technologies/downloads/) |
| Android SDK | API 33+ | Included with Android Studio |
| Node.js | 18 or higher | [nodejs.org](https://nodejs.org/) |
| npm | 9 or higher | Included with Node.js |

### Environment Variables

Ensure these environment variables are set:

```bash
# Windows
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools

# macOS/Linux
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Verify Installation

```bash
# Check Java version
java -version

# Check Android SDK
adb --version

# Check Node.js
node -v
npm -v
```

---

## 2. Configuration

### Update API Configuration

Before building the APK, you MUST update the API base URL in `services/api.js`:

**File:** `hris-mobile/frontend/services/api.js`

```javascript
// Line 4: Replace YOUR_VPS_IP with your actual server IP or domain
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000'
  : 'http://YOUR_VPS_IP:5000';  // <-- CHANGE THIS
```

**Replace `YOUR_VPS_IP` with one of the following:**

| Environment | Example URL |
|-------------|-------------|
| Local network testing | `http://192.168.1.100:5000` |
| VPS/Cloud server | `http://203.0.113.45:5000` |
| Domain with SSL | `https://api.yourcompany.com` |

**Important:** If using HTTP (not HTTPS), make sure `usesCleartextTraffic` is enabled in `app.json` (see Section 7).

### Update App Version (Optional)

In `app.json`, you can update the version before building:

```json
{
  "expo": {
    "version": "1.0.0",  // Update this for new releases
    "android": {
      "package": "com.hris.workmate"
    }
  }
}
```

---

## 3. Prebuild

The prebuild step generates native Android project files from the Expo configuration.

### Step 1: Install Dependencies

```bash
cd hris-mobile/frontend
npm install
```

### Step 2: Run Prebuild

```bash
npx expo prebuild --platform android
```

This command creates:
- `android/` directory with native Android project files
- `android/app/build.gradle` - Build configuration
- `android/app/src/main/AndroidManifest.xml` - App manifest
- `android/app/src/main/res/` - Resources (icons, strings, etc.)

### What Prebuild Does

| Action | Description |
|--------|-------------|
| Generates native code | Creates Android Studio project from Expo config |
| Applies plugins | Processes Expo plugins (camera, navigation bar, etc.) |
| Syncs assets | Copies icons and splash screens |
| Updates manifest | Applies permissions and configuration from `app.json` |

### Clean Prebuild (If Needed)

If you encounter issues, clean and rebuild:

```bash
# Remove generated Android folder
rm -rf android

# Run prebuild again
npx expo prebuild --platform android
```

---

## 4. APK Types

Understanding the difference between development and release builds:

| Feature | Development Build | Release Build |
|---------|-------------------|---------------|
| `__DEV__` flag | `true` | `false` |
| API URL | Uses production URL from api.js | Uses production URL from api.js |
| Debug info | Included | Stripped |
| Performance | Slower | Optimized |
| Size | Larger | Smaller |
| Use case | Testing features | Distribution |

### Choosing the Right Build

- **Development Build**: Use when testing app features that need to be verified in a production-like environment
- **Release Build**: Use when distributing the app to end users

---

## 5. Development Build

Development builds include debugging information and are useful for testing.

### Build Command

```bash
cd hris-mobile/frontend
npx expo run:android --variant debug
```

### Alternative: Direct Gradle Build

```bash
cd hris-mobile/frontend/android
./gradlew assembleDebug
```

### Output Location

```
android/app/build/outputs/apk/debug/app-debug.apk
```

### `__DEV__` Behavior

The `__DEV__` global variable is set automatically:

```javascript
// In services/api.js
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000'      // Used during development
  : 'http://YOUR_VPS_IP:5000';  // Used in APK builds
```

**Note:** When running `npx expo run:android`, `__DEV__` is `true`. For APK builds using Gradle directly, `__DEV__` is `false` in release builds and `true` in debug builds.

### Installing Debug APK

```bash
# Install to connected device or emulator
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 6. Release Build

Release builds are optimized for distribution and have `__DEV__ = false`.

### Build Command

```bash
cd hris-mobile/frontend/android
./gradlew assembleRelease
```

### Output Location

```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Build Process

The release build process includes:

1. **Code optimization** - ProGuard/R8 obfuscation and optimization
2. **Resource shrinking** - Removes unused resources
3. **Minification** - Reduces JavaScript bundle size
4. **Asset bundling** - Packages all assets into the APK

### Build Time

Release builds take longer than debug builds:
- **Debug build**: ~1-2 minutes
- **Release build**: ~3-5 minutes

### Installing Release APK

```bash
# Install to connected device
adb install android/app/build/outputs/apk/release/app-release-unsigned.apk
```

**Note:** Unsigned APKs can be installed on devices with "Install unknown apps" permission enabled.

---

## 7. Cleartext Traffic

### What is `usesCleartextTraffic`?

The `usesCleartextTraffic` setting in `app.json` allows the app to make HTTP (unencrypted) network requests:

```json
{
  "expo": {
    "android": {
      "usesCleartextTraffic": true
    }
  }
}
```

### Why It Is Needed

| Scenario | Required |
|----------|----------|
| HTTP API (no SSL) | Yes |
| Local network testing | Yes |
| HTTPS API with valid certificate | No |

### Security Considerations

**Warning:** Using cleartext traffic exposes data to interception. Only enable this when:
- Testing on a secure local network
- Your backend does not support HTTPS yet
- You are in a controlled development environment

### For Production

Always use HTTPS for production APIs:

```javascript
// services/api.js - Production configuration
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000'
  : 'https://api.yourcompany.com';  // Use HTTPS in production
```

Then disable cleartext traffic:

```json
{
  "expo": {
    "android": {
      "usesCleartextTraffic": false
    }
  }
}
```

---

## 8. Troubleshooting

### Common Build Issues

#### Issue: `ANDROID_HOME` not set

**Error:**
```
ERROR: ANDROID_HOME is not set and "android" command not in your PATH
```

**Solution:**
```bash
# Windows - Set permanently via System Properties
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"

# macOS/Linux - Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Issue: Gradle build fails with memory error

**Error:**
```
java.lang.OutOfMemoryError: Java heap space
```

**Solution:**

Create or edit `android/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
org.gradle.daemon=true
org.gradle.parallel=true
```

#### Issue: `usesCleartextTraffic` not working

**Symptom:** Network requests fail with "Network Error"

**Solution:**

1. Verify `app.json` has the setting:
```json
{
  "expo": {
    "android": {
      "usesCleartextTraffic": true
    }
  }
}
```

2. Clean and rebuild:
```bash
rm -rf android
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

#### Issue: App cannot connect to backend

**Symptom:** Login fails, API calls timeout

**Solutions:**

1. **Verify YOUR_VPS_IP is replaced** in `services/api.js`
2. **Check backend is running** on the specified IP and port
3. **Test network connectivity:**
   ```bash
   adb shell ping YOUR_VPS_IP
   ```
4. **Check firewall settings** on the server
5. **Verify same network** (for local IPs like 192.168.x.x)

#### Issue: Build fails with "SDK not found"

**Solution:**

1. Open Android Studio
2. Go to Tools > SDK Manager
3. Install Android SDK Platform 33 or higher
4. Install Android SDK Build-Tools

#### Issue: APK installs but crashes immediately

**Solutions:**

1. Check logcat for errors:
   ```bash
   adb logcat -e "AndroidRuntime" "ReactNative" "YourApp"
   ```
2. Verify `YOUR_VPS_IP` is a valid IP (not placeholder)
3. Check that `usesCleartextTraffic` is enabled if using HTTP
4. Ensure all npm dependencies are installed

#### Issue: Metro bundler not starting

**Error:**
```
Could not connect to development server
```

**Solution:**

For APK builds, Metro bundler is not needed. The JavaScript is bundled into the APK. If you want to test with Metro:

```bash
npx expo start
# Then press 'a' for Android
```

---

## Quick Reference

### Full Build Process

```bash
# 1. Update YOUR_VPS_IP in services/api.js

# 2. Navigate to frontend
cd hris-mobile/frontend

# 3. Install dependencies
npm install

# 4. Prebuild
npx expo prebuild --platform android

# 5. Build release APK
cd android
./gradlew assembleRelease

# 6. Install APK
adb install app/build/outputs/apk/release/app-release-unsigned.apk
```

### File Locations

| File | Path |
|------|------|
| API config | `hris-mobile/frontend/services/api.js` |
| App config | `hris-mobile/frontend/app.json` |
| Debug APK | `hris-mobile/frontend/android/app/build/outputs/apk/debug/app-debug.apk` |
| Release APK | `hris-mobile/frontend/android/app/build/outputs/apk/release/app-release-unsigned.apk` |

---

## Notes

- This guide is for APK builds only (not AAB for Play Store)
- No signing configuration is included (unsigned APKs)
- No EAS (Expo Application Services) configuration is provided
- The backend server must be accessible from the device network
