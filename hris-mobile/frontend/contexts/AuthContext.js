import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, clearAuthToken as clearApiToken, api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          setAuthToken(token);
          const me = await api.auth.me();
          setUser(me);
        }
      } catch {
        await AsyncStorage.removeItem('auth_token');
        clearApiToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (nik, password) => {
    const res = await api.auth.login(nik, password);
    setAuthToken(res.token);
    await AsyncStorage.setItem('auth_token', res.token);
    const me = await api.auth.me();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try { await api.auth.logout(); } catch {}
    clearApiToken();
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.auth.me();
      setUser(me);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}