// Replace YOUR_VPS_IP with your actual VPS IP address before building APK
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000'
  : 'http://YOUR_VPS_IP:5000';

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
    ...(options.headers || {}),
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

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

  dashboard: {
    mobile: () => request('/dashboard/mobile'),
  },
};

export default api;