import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, clearAuthToken as clearApiToken, api } from '../services/api';

const AuthContext = createContext(null);

const USER_KEY = 'auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          setAuthToken(token);
          const savedUser = await AsyncStorage.getItem(USER_KEY);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
          try {
            const me = await api.auth.me();
            setUser(me);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
          } catch {
            setSessionError(true);
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem(USER_KEY);
            clearApiToken();
            setUser(null);
          }
        }
      } catch {
        setSessionError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (nik, password) => {
    const res = await api.auth.login(nik, password);
    setAuthToken(res.token);
    await AsyncStorage.setItem('auth_token', res.token);
    const userData = {
      id: res.employeeId,
      nik: nik,
      role: res.role,
      employeeId: res.employeeId,
      employeeName: res.employeeName,
      department: res.department,
    };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await api.auth.logout(); } catch {}
    clearApiToken();
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.auth.me();
      setUser(me);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, sessionError, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}