import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('hris_token') || '')
  const [role, setRole] = useState(localStorage.getItem('hris_role') || '')
  const [employeeName, setEmployeeName] = useState(localStorage.getItem('hris_name') || '')
  const [department, setDepartment] = useState(localStorage.getItem('hris_dept') || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('hris_token')
    if (!stored) { setLoading(false); return }
    api('/auth/me', { headers: { Authorization: `Bearer ${stored}` } })
      .then((data) => {
        setToken(stored)
        setRole(data.role)
        setEmployeeName(data.employeeName || '')
        setDepartment(data.department || '')
        localStorage.setItem('hris_token', stored)
        localStorage.setItem('hris_role', data.role)
        localStorage.setItem('hris_name', data.employeeName || '')
        localStorage.setItem('hris_dept', data.department || '')
      })
      .catch(() => {
        localStorage.removeItem('hris_token')
        localStorage.removeItem('hris_role')
        localStorage.removeItem('hris_name')
        localStorage.removeItem('hris_dept')
        setToken('')
        setRole('')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (nik, password) => {
    setError('')
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ nik, password }),
      })

      if (!data.allowedPortals.includes('web')) {
        setError('Akun karyawan hanya untuk akses mobile. Silakan gunakan aplikasi Workmate.')
        return false
      }

      setToken(data.token)
      setRole(data.role)
      setEmployeeName(data.employeeName || '')
      setDepartment(data.department || '')
      localStorage.setItem('hris_token', data.token)
      localStorage.setItem('hris_role', data.role)
      localStorage.setItem('hris_name', data.employeeName || '')
      localStorage.setItem('hris_dept', data.department || '')
      return true
    } catch (err) {
      setError(err.message || 'Login gagal. Cek NIK/password dan pastikan backend aktif.')
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('hris_token')
    localStorage.removeItem('hris_role')
    localStorage.removeItem('hris_name')
    localStorage.removeItem('hris_dept')
    setToken('')
    setRole('')
    setEmployeeName('')
    setDepartment('')
  }, [])

  return (
    <AuthContext.Provider value={{ token, role, employeeName, department, error, loading, login, logout }}>
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