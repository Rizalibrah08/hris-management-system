// ============================================================
// HRIS Mobile API Configuration
// ============================================================
//
// Cara koneksi (otomatis, prioritas):
//   1. Custom URL (atur via setServerUrl / AsyncStorage key: api_server_url)
//   2. Auto-detect LAN IP (pakai IP dev machine dari Expo, port 5000)
//   3. Production URL (PROD_URL)
//
// Setup:
//   - HP & PC satu WiFi → auto LAN, tidak perlu konfigurasi
//   - HP beda jaringan → setel URL manual via setServerUrl()
// ============================================================

import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'api_server_url';
const PROD_URL = 'https://your-production-api.com';

let _baseUrl = null;

async function resolveBaseUrl() {
  if (_baseUrl) return _baseUrl;

  try {
    const custom = await AsyncStorage.getItem(STORAGE_KEY);
    if (custom) {
      _baseUrl = custom;
      return _baseUrl;
    }
  } catch {}

  if (__DEV__) {
    try {
      const hostUri = Constants.expoConfig?.hostUri;
      if (hostUri) {
        const host = hostUri.split(':')[0];
        _baseUrl = `http://${host}:5000`;
        return _baseUrl;
      }
    } catch {}
  }

  _baseUrl = PROD_URL;
  return _baseUrl;
}

export async function setServerUrl(url) {
  if (url) {
    await AsyncStorage.setItem(STORAGE_KEY, url);
    _baseUrl = url;
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY);
    _baseUrl = null;
  }
}

export async function getServerUrl() {
  return resolveBaseUrl();
}

let authToken = null;
let onUnauthorizedCallback = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
}

export function setOnUnauthorized(callback) {
  onUnauthorizedCallback = callback;
}

async function request(endpoint, options = {}) {
  const baseUrl = await resolveBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  console.log(`[API Request] ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const body = await response.json();
        message = body.message || message;
      } catch {}
      if (response.status === 401 && onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    console.error(`[API Error] ${error.message}`);
    if (error.message.includes('Network request failed')) {
      throw new Error(
        'Cannot connect to server. Please check:\n' +
        '1. Backend is running (npm run dev:server)\n' +
        '2. Device & PC on same WiFi (LAN mode)\n' +
        '3. Or set custom URL via Settings'
      );
    }
    throw error;
  }
}

async function requestMultipart(endpoint, formData) {
  const baseUrl = await resolveBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  const headers = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  console.log(`[API Upload] POST ${url}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      let message = `Upload failed (${response.status})`;
      try {
        const body = await response.json();
        message = body.message || message;
      } catch {}
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Upload timeout. Coba lagi dengan koneksi yang lebih stabil.');
      console.error(`[API Error] ${timeoutError.message}`);
      throw timeoutError;
    }
    console.error(`[API Error] ${error.message}`);
    if (error.message && error.message.includes('Network request failed')) {
      throw new Error(
        'Gagal terhubung ke server. Pastikan:\n' +
        '1. Server HRIS berjalan\n' +
        '2. HP & PC di WiFi yang sama\n' +
        '3. Coba reload aplikasi'
      );
    }
    throw error;
  }
}

export const api = {
  auth: {
    login: (nik, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ nik, password }) }),

    register: (data) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    me: () => request('/auth/me'),

    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  employees: {
    me: () => request('/employees/me'),
    updateMe: (data) =>
      request('/employees/me', { method: 'PUT', body: JSON.stringify(data) }),
    delegationList: () => request('/employees/delegation-list'),
    uploadPhoto: async (photoUri) => {
      const formData = new FormData();
      formData.append('photo', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
      return requestMultipart('/employees/me/photo', formData);
    },
    getPhoto: () => request('/employees/me/photo'),
  },

  attendance: {
    clockIn: async (employeeId, gpsLocation, selfieUri) => {
      if (selfieUri && (selfieUri.startsWith('file://') || selfieUri.startsWith('content://'))) {
        const formData = new FormData();
        formData.append('employee_id', String(employeeId));
        if (gpsLocation) formData.append('gps_location', gpsLocation);
        formData.append('selfie', {
          uri: selfieUri,
          type: 'image/jpeg',
          name: `selfie-${Date.now()}.jpg`,
        });
        return requestMultipart('/attendance/clockin', formData);
      }
      return request('/attendance/clockin', {
        method: 'POST',
        body: JSON.stringify({ employee_id: employeeId, gps_location: gpsLocation }),
      });
    },

    clockOut: (attendanceId) =>
      request('/attendance/clockout', {
        method: 'POST',
        body: JSON.stringify({ attendance_id: attendanceId }),
      }),

    myStatus: () => request('/attendance/my-status'),
    myHistory: (month) => request(`/attendance/my${month ? `?month=${month}` : ''}`),
    today: () => request('/attendance/today'),
  },

  leave: {
    myList: () => request('/leave/my'),
    types: () => request('/leave-types'),
    submit: (employeeId, leaveType, startDate, endDate, reason) =>
      request('/leave', {
        method: 'POST',
        body: JSON.stringify({
          employee_id: employeeId,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason,
        }),
      }),
    quota: () => request('/leave/quota'),
  },

  payroll: {
    mySalary: () => request('/payroll/my'),
    myRuns: () => request('/payroll/my-runs'),
    myRunDetail: (id) => request(`/payroll/my-runs/${id}`),
  },

  payslips: {
    my: () => request('/payslips/my'),
    detail: (id) => request(`/payslips/${id}`),
    pdf: (id) => request(`/payslips/${id}/pdf`),
  },

  dashboard: {
    mobile: () => request('/dashboard/mobile'),
  },

  notifications: {
    my: () => request('/notifications/my'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
  },
};

export default api;
