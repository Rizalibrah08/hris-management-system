import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('hris_token') || '')
  const [role, setRole] = useState(localStorage.getItem('hris_role') || '')
  const [error, setError] = useState('')

  const login = useCallback(async (nik, password) => {
    setError('')
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ nik, password }),
      })
      setToken(data.token)
      setRole(data.role)
      localStorage.setItem('hris_token', data.token)
      localStorage.setItem('hris_role', data.role)
      return true
    } catch (err) {
      setError(err.message || 'Login gagal. Cek NIK/password dan pastikan backend aktif.')
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('hris_token')
    localStorage.removeItem('hris_role')
    setToken('')
    setRole('')
  }, [])

  return (
    <AuthContext.Provider value={{ token, role, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}