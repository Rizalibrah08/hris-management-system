import { useState, useEffect } from 'react'
import '../styles/role-management.css'

const API = import.meta.env.VITE_API_URL || '/api'

async function api(path, opts = {}) {
  const token = localStorage.getItem('hris_token')
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, { ...opts, headers, signal: opts.signal })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || `Error ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

export default function RoleManagement() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ nik: '', password: '', role_id: '', employee_id: '', email: '', phone: '' })
  const [editUserId, setEditUserId] = useState(null)
  const [editRoleId, setEditRoleId] = useState('')
  const [editActive, setEditActive] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [usersData, rolesData, employeesData] = await Promise.all([
        api('/users'),
        api('/roles'),
        api('/employees'),
      ])
      setUsers(usersData)
      setRoles(rolesData)
      setEmployees(employeesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddUser(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api('/users', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          role_id: Number(form.role_id),
          employee_id: form.employee_id ? Number(form.employee_id) : null,
        }),
      })
      setSuccess('User berhasil ditambahkan')
      setShowAddModal(false)
      setForm({ nik: '', password: '', role_id: '', employee_id: '', email: '', phone: '' })
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleUpdateRole(userId) {
    setError('')
    setSuccess('')
    try {
      await api(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role_id: Number(editRoleId) }),
      })
      setSuccess('Role berhasil diupdate')
      setEditUserId(null)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleToggleActive(userId, isActive) {
    setError('')
    setSuccess('')
    try {
      await api(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: isActive ? 0 : 1 }),
      })
      setSuccess(isActive ? 'User dinonaktifkan' : 'User diaktifkan')
      setEditActive(null)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="role-management"><p>Loading...</p></div>

  return (
    <div className="role-management">
      {error && <div className="rm-alert rm-alert-error">{error}</div>}
      {success && <div className="rm-alert rm-alert-success">{success}</div>}

      <div className="rm-header">
        <h3>Role Management</h3>
        <button className="rm-btn rm-btn-primary" onClick={() => setShowAddModal(true)}>
          + Tambah User
        </button>
      </div>

      <table className="rm-table">
        <thead>
          <tr>
            <th>NIK</th>
            <th>Nama Karyawan</th>
            <th>Departemen</th>
            <th>Role</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td><strong>{u.nik}</strong></td>
              <td>{u.employee_name || '-'}</td>
              <td>{u.department || '-'}</td>
              <td>
                {editUserId === u.id ? (
                  <div className="rm-inline-edit">
                    <select value={editRoleId} onChange={(e) => setEditRoleId(e.target.value)}>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <button className="rm-btn rm-btn-sm" onClick={() => handleUpdateRole(u.id)}>Simpan</button>
                    <button className="rm-btn rm-btn-sm rm-btn-ghost" onClick={() => setEditUserId(null)}>Batal</button>
                  </div>
                ) : (
                  <span className={`rm-role-badge rm-role-${u.role?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {u.role}
                  </span>
                )}
              </td>
              <td>
                <span className={`rm-status-badge ${u.is_active ? 'rm-status-active' : 'rm-status-inactive'}`}>
                  {u.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </td>
              <td>
                <div className="rm-actions">
                  {editUserId !== u.id && (
                    <button
                      className="rm-btn rm-btn-sm rm-btn-ghost"
                      onClick={() => { setEditUserId(u.id); setEditRoleId(u.role_id) }}
                    >
                      Edit Role
                    </button>
                  )}
                  <button
                    className={`rm-btn rm-btn-sm ${u.is_active ? 'rm-btn-warning' : 'rm-btn-success'}`}
                    onClick={() => handleToggleActive(u.id, u.is_active)}
                  >
                    {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <div className="rm-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Tambah User Baru</h4>
            <form onSubmit={handleAddUser}>
              <div className="rm-form-group">
                <label>NIK</label>
                <input required value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} />
              </div>
              <div className="rm-form-group">
                <label>Password</label>
                <input required type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="rm-form-group">
                <label>Role</label>
                <select required value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })}>
                  <option value="">Pilih Role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="rm-form-group">
                <label>Karyawan (opsional)</label>
                <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
                  <option value="">Tanpa Karyawan</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} — {e.department}</option>
                  ))}
                </select>
              </div>
              <div className="rm-form-group">
                <label>Email (opsional)</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="rm-form-group">
                <label>Phone (opsional)</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="rm-modal-actions">
                <button type="submit" className="rm-btn rm-btn-primary">Simpan</button>
                <button type="button" className="rm-btn rm-btn-ghost" onClick={() => setShowAddModal(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
