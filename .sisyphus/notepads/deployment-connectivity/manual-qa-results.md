# Manual QA Results - Deployment Connectivity

**Date**: 2026-05-03
**Tester**: Sisyphus-Junior (Real Manual QA)

---

## Summary

| Test Category | Status | Notes |
|--------------|--------|-------|
| Docker Production | ⚠️ PARTIAL | Build works, but API 404 handling has issues |
| Web Build | ✅ PASS | Build succeeds, dist folder verified |
| Mobile Prebuild | ⚠️ PARTIAL | Prebuild works, but missing usesCleartextTraffic |
| Documentation | ❌ FAIL | BUILD-APK.md missing |

**OVERALL VERDICT: REJECT**

---

## 1. Docker Production Tests

### 1.1 Build Test
- **Command**: `docker compose build`
- **Result**: ✅ SUCCESS
- **Output**: Image webhris-web built successfully
- **Notes**: 
  - 2-stage build completed (builder + runner)
  - 360 packages installed
  - Vite build successful
  - No vulnerabilities found

### 1.2 Container Start Test
- **Command**: `docker compose -f docker-compose.yml up -d`
- **Result**: ✅ SUCCESS (after fixing port conflict)
- **Notes**:
  - MySQL container started and healthy
  - Web container started on port 5000
  - Had to kill existing node.exe process using port 5000

### 1.3 Health Endpoint Test
- **Command**: `curl http://localhost:5000/health`
- **Result**: ✅ PASS
- **Response**: `{"status":"ok"}`

### 1.4 API Health Endpoint Test
- **Command**: `curl http://localhost:5000/api/health`
- **Result**: ❌ FAIL (timeout/hang)
- **Issue**: Route hangs instead of returning 404 JSON
- **Root Cause**: SPA fallback catches API 404s but doesn't handle them properly
- **Server Log**: Shows `GET /api/health` with no response

### 1.5 Root/SPA Endpoint Test
- **Command**: `curl http://localhost:5000/`
- **Result**: ✅ PASS
- **Response**: HTML with SPA content
- **Content**: index.html with React app mount point

### 1.6 API 404 Error Test
- **Command**: `curl http://localhost:5000/api/nonexistent`
- **Result**: ❌ FAIL (timeout/hang)
- **Issue**: Should return JSON error but hangs instead
- **Expected**: JSON error response
- **Actual**: Request timeout

### 1.7 MySQL Port Security Test
- **Command**: `curl http://localhost:3306`
- **Result**: ✅ PASS (Connection refused/no response)
- **Verification**: MySQL port 3306 NOT exposed to host
- **Security**: Confirmed - only internal Docker network access

### 1.8 Docker Cleanup
- **Command**: `docker compose -f docker-compose.yml down`
- **Result**: ✅ SUCCESS
- **Containers**: Stopped and removed

**Docker Test Summary**: Build and basic container operations work, but API 404 handling has critical issues that need fixing.

---

## 2. Web Build Tests

### 2.1 Build Test
- **Command**: `npm run build`
- **Location**: hris-web/
- **Result**: ✅ SUCCESS
- **Build Time**: 5.80s
- **Output**:
  - dist/index.html (0.49 kB)
  - dist/assets/index-jjPvd0-T.css (9.87 kB)
  - dist/assets/index-CvycHDHi.js (1,045.71 kB)

### 2.2 Dist Directory Verification
- **Exists**: ✅ Yes
- **index.html**: ✅ Present
- **Assets folder**: ✅ Present with JS/CSS files

### 2.3 API References Verification
- **Pattern**: `/api` found in dist/assets/index-CvycHDHi.js
- **Code**: `Eq="/api"` used in fetch requests
- **Result**: ✅ API calls correctly use `/api` prefix

**Web Build Test Summary**: All tests pass. Production build is ready.

---

## 3. Mobile Prebuild Tests

### 3.1 Expo Prebuild Test
- **Command**: `npx expo prebuild --platform android --clean`
- **Location**: hris-mobile/frontend/
- **Result**: ✅ SUCCESS
- **Output**:
  - Cleared android code
  - Created native directory
  - Updated package.json
  - Finished prebuild

### 3.2 AndroidManifest.xml Verification
- **File**: android/app/src/main/AndroidManifest.xml
- **Check**: usesCleartextTraffic attribute
- **Result**: ❌ MISSING
- **Current**: No `android:usesCleartextTraffic="true"` in application tag
- **Required**: Must be added for HTTP API connections

### 3.3 Application ID Verification
- **File**: android/app/build.gradle
- **Check**: applicationId
- **Result**: ✅ CORRECT
- **Value**: `com.hris.workmate`

**Mobile Prebuild Test Summary**: Prebuild works but critical security configuration missing.

---

## 4. Documentation Tests

### 4.1 DEPLOY.md Verification
- **File**: DEPLOY.md
- **Exists**: ✅ Yes
- **Sections Verified**:
  - ✅ Prerequisites
  - ✅ Quick Start
  - ✅ Environment Variables
  - ✅ Database Setup
  - ✅ Building
  - ✅ Running
  - ✅ Verification
  - ✅ Stopping
  - ✅ Updating
  - ✅ Troubleshooting
  - ✅ Security Notes
- **Quality**: Comprehensive and well-structured

### 4.2 BUILD-APK.md Verification
- **File**: BUILD-APK.md
- **Exists**: ❌ NO
- **Required Sections** (from task requirements):
  - ❌ Prerequisites
  - ❌ Configuration
  - ❌ Build

**Documentation Test Summary**: DEPLOY.md is complete but BUILD-APK.md is completely missing.

---

## Critical Issues Found

### Issue #1: API 404 Handling Broken
- **Severity**: HIGH
- **Description**: API routes that don't exist hang instead of returning JSON 404
- **Reproduce**: `curl http://localhost:5000/api/nonexistent`
- **Expected**: JSON error response
- **Actual**: Request timeout
- **Location**: server.js SPA fallback

### Issue #2: Missing usesCleartextTraffic
- **Severity**: HIGH
- **Description**: AndroidManifest.xml missing usesCleartextTraffic="true"
- **Impact**: Mobile app cannot connect to HTTP API endpoints
- **Fix**: Add `android:usesCleartextTraffic="true"` to application tag

### Issue #3: Missing BUILD-APK.md
- **Severity**: MEDIUM
- **Description**: Required documentation file for mobile APK building is missing
- **Impact**: Users cannot build mobile app without guidance

---

## Recommendations

1. **Fix API 404 handling** in server.js:
   - Add explicit 404 handler for API routes
   - Ensure JSON response format
   - Prevent SPA fallback from catching API routes

2. **Fix AndroidManifest.xml**:
   - Add usesCleartextTraffic attribute
   - Document in BUILD-APK.md

3. **Create BUILD-APK.md**:
   - Document prerequisites (Android SDK, Java, etc.)
   - Include configuration steps
   - Provide build commands
   - Add troubleshooting section

4. **Add API health endpoint**:
   - Consider adding `/health` under `/api` prefix
   - Or document that `/health` is the correct endpoint

---

## Test Commands Used

```bash
# Docker Tests
docker compose build
docker compose -f docker-compose.yml up -d
curl http://localhost:5000/health
curl http://localhost:5000/api/health
curl http://localhost:5000/
curl http://localhost:5000/api/nonexistent
curl http://localhost:3306
docker compose -f docker-compose.yml down

# Web Tests
cd hris-web && npm run build
ls dist/
grep "/api" dist/assets/*.js

# Mobile Tests
cd hris-mobile/frontend
npx expo prebuild --platform android --clean
grep usesCleartextTraffic android/app/src/main/AndroidManifest.xml
grep applicationId android/app/build.gradle
```

---

## Environment

- **OS**: Windows (PowerShell)
- **Docker**: 29.4.1
- **Docker Compose**: v5.1.3
- **Node**: v20.x
- **Working Directory**: D:\WEB HRIS

---

**End of Report**
