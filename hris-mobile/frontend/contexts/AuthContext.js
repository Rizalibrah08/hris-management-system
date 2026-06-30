import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, clearAuthToken as clearApiToken, setOnUnauthorized, api } from '../services/api';

const AuthContext = createContext(null);

const USER_KEY = 'auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    let cancelled = false;
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
            if (cancelled) return;
            setUser(me);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
            setSessionError(false);
          } catch (err) {
            if (cancelled) return;
            if (err.isAuthError || err.status === 401) {
              // Token benar-benar invalid/expired → wajib login ulang.
              setSessionError(true);
              await AsyncStorage.removeItem('auth_token');
              await AsyncStorage.removeItem(USER_KEY);
              clearApiToken();
              setUser(null);
            } else {
              // Network error / server belum siap → JANGAN hapus token.
              // Pertahankan sesi, user bisa retry (refresh app / tunggu server).
              setSessionError(true);
              console.warn('[Auth] Sesi belum bisa diverifikasi (network/server):', err.message);
            }
          }
        }
      } catch {
        if (!cancelled) setSessionError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
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
    setSessionError(false);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    // Local-first: bersihkan token dari memori & storage DULU,
    // sehingga request api.auth.logout() tidak akan menyertakan token
    // (aman dari 401 yang akan trigger onUnauthorizedCallback).
    clearApiToken();
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
    // Beri tahu server untuk audit (ignore error — tujuan utama sudah tercapai).
    try { await api.auth.logout(); } catch {}
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      clearApiToken();
      AsyncStorage.removeItem('auth_token');
      AsyncStorage.removeItem(USER_KEY);
      setUser(null);
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.auth.me();
      setUser(me);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
    } catch {}
  }, []);

  const refreshSession = useCallback(async () => {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      setSessionError(true);
      return false;
    }
    setAuthToken(token);
    try {
      const me = await api.auth.me();
      setUser(me);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
      setSessionError(false);
      return true;
    } catch (err) {
      if (err.isAuthError || err.status === 401) {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem(USER_KEY);
        clearApiToken();
        setUser(null);
      }
      setSessionError(true);
      return false;
    }
  }, []);

  const clearSessionError = useCallback(() => setSessionError(false), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, sessionError, login, logout, refreshUser, refreshSession, clearSessionError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}