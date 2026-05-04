import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { AUTH_LOGIN } from '../api/endpoints.js'

// Auth context to share auth state across the app
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('hris_token') || '')
  const [role, setRole] = useState(localStorage.getItem('hris_role') || '')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on mount if token exists
  useEffect(() => {
    const t = localStorage.getItem('hris_token')
    if (t) {
      setToken(t)
      const r = localStorage.getItem('hris_role') || ''
      setRole(r)
      // Try to fetch current user profile
      api('/auth/me')
        .then((data) => setUser(data))
        .catch(() => setUser(null))
    }
    setIsLoading(false)
  }, [])

  const isAuthenticated = () => Boolean(token)

  const login = async (nik, password) => {
    setIsLoading(true)
    try {
      const data = await api(AUTH_LOGIN, {
        method: 'POST',
        body: JSON.stringify({ nik, password }),
      })
      const { token: t, role: rl } = data
      localStorage.setItem('hris_token', t)
      localStorage.setItem('hris_role', rl)
      setToken(t)
      setRole(rl)
      const me = await api('/auth/me')
      setUser(me)
    } catch (err) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('hris_token')
    localStorage.removeItem('hris_role')
    setToken('')
    setRole('')
    setUser(null)
  }

  const value = {
    token,
    role,
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
