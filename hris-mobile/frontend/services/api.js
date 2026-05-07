// ============================================================
// HRIS Mobile API Configuration
// ============================================================
// 
// UNTUK DEVELOPMENT DENGAN NGROK:
// 1. Jalankan backend: npm run dev:server (di folder hris-web)
// 2. Jalankan ngrok: ngrok http 5000
// 3. Copy URL ngrok yang muncul (contoh: https://abc123.ngrok-free.app)
// 4. Ganti value NGROK_URL di bawah dengan URL Anda
// 5. Restart aplikasi mobile (npx expo start --clear)
//
// UNTUK PRODUCTION:
// Ganti PROD_URL dengan URL backend production Anda
// ============================================================

// URL ngrok Anda (GANTI INI setiap kali jalankan ngrok)
const NGROK_URL = 'https://reformer-flagman-urologist.ngrok-free.dev';

// URL production (ganti saat deploy)
const PROD_URL = 'https://your-production-api.com';

// Pilih URL berdasarkan environment
const API_BASE_URL = __DEV__ ? NGROK_URL : PROD_URL;

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
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
        '2. ngrok is running (ngrok http 5000)\n' +
        '3. NGROK_URL in api.js is correct\n' +
        '4. You have internet connection'
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
  },

  employees: {
    me: () => request('/employees/me'),
    updateMe: (data) =>
      request('/employees/me', { method: 'PUT', body: JSON.stringify(data) }),
  },

  attendance: {
    clockIn: (employeeId, gpsLocation, selfie) =>
      request('/attendance/clockin', {
        method: 'POST',
        body: JSON.stringify({ employee_id: employeeId, gps_location: gpsLocation, selfie }),
      }),

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
};

export default api;
