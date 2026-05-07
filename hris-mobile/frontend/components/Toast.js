import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map((t, i) => (
          <View
            key={t.id}
            style={[
              styles.toast,
              t.type === 'error' && styles.toastError,
              t.type === 'success' && styles.toastSuccess,
              t.type === 'warning' && styles.toastWarning,
            ]}
          >
            <Text style={styles.toastText}>{t.message}</Text>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 60, left: 16, right: 16, zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: '#3B82F6', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14,
    marginBottom: 8, width: width - 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  toastError: { backgroundColor: '#EF4444' },
  toastSuccess: { backgroundColor: '#10B981' },
  toastWarning: { backgroundColor: '#F59E0B' },
  toastText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
