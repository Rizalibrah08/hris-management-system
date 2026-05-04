const API = import.meta.env.VITE_API_URL || '/api'

export async function api(path, opts = {}) {
  const token = localStorage.getItem('hris_token')
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, { ...opts, headers, signal: opts.signal })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || data.errors?.join('; ') || `Error ${res.status}`
    const err = new Error(msg)
    err.status = res.status
    err.errors = data.errors
    throw err
  }
  return data
}
