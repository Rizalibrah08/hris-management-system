import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/global.css'
import '../styles/login.css'

export default function Login() {
  const { login } = useAuth()
  const [nik, setNik] = useState('ADM001')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    const success = await login(nik, password)
    if (!success) {
      setError('Login gagal. Cek NIK/password dan pastikan backend aktif.')
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
        <button type="submit">Masuk</button>
      </form>
    </div>
  )
}
