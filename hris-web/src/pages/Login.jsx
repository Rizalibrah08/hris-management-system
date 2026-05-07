import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/global.css'
import '../styles/login.css'

export default function Login() {
  const { login, error: authError } = useAuth()
  const [nik, setNik] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)

  useEffect(() => {
    const savedNik = localStorage.getItem('hris_saved_nik')
    if (savedNik) setNik(savedNik)
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    const success = await login(nik, password)
    if (success) {
      if (remember) {
        localStorage.setItem('hris_saved_nik', nik)
      } else {
        localStorage.removeItem('hris_saved_nik')
      }
    }
    setLoading(false)
    if (!success) {
      setError(authError || 'Login gagal. Cek NIK/password dan pastikan backend aktif.')
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>HRIS Login</h2>
        <p>Gunakan akun seed default untuk mulai eksplorasi backend.</p>
        <label htmlFor="nik">NIK</label>
        <input id="nik" value={nik} onChange={(e) => setNik(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <small className="error">{error}</small> : null}
        <div className="remember-row">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label htmlFor="remember" className="remember-label">Simpan login</label>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Masuk...' : 'Masuk'}</button>
      </form>
    </div>
  )
}
