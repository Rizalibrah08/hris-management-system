import { useState, useEffect } from 'react'
import { api } from '../api/client'
import '../styles/global.css'
import '../styles/role-management.css'

export default function RoleManagement() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ nik: '', password: '', role_id: '', employee_id: '', email: '', phone: '' })
  const [editUserId, setEditUserId] = useState(null)
  const [editRoleId, setEditRoleId] = useState('')

  useEffect(() => {
    const ctrl = new AbortController()
    loadData(ctrl.signal)
    return () => ctrl.abort()
  }, [])

  async function loadData(signal) {
    setLoading(true)
    try {
      const [usersData, rolesData, employeesData] = await Promise.all([
        api('/users', { signal }),
        api('/roles', { signal }),
        api('/employees', { signal }),
      ])
      setUsers(usersData)
      setRoles(rolesData)
      setEmployees(employeesData)
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddUser(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await api('/users', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          role_id: Number(form.role_id),
          employee_id: form.employee_id ? Number(form.employee_id) : null,
        }),
      })
      setMessage('User berhasil ditambahkan')
      setShowAddModal(false)
      setForm({ nik: '', password: '', role_id: '', employee_id: '', email: '', phone: '' })
      const ctrl = new AbortController()
      await loadData(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleUpdateRole(userId) {
    setError('')
    setMessage('')
    try {
      await api(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role_id: Number(editRoleId) }),
      })
      setMessage('Role berhasil diupdate')
      setEditUserId(null)
      const ctrl = new AbortController()
      await loadData(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleToggleActive(userId, isActive) {
    setError('')
    setMessage('')
    try {
      await api(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: isActive ? 0 : 1 }),
      })
      setMessage(isActive ? 'User dinonaktifkan' : 'User diaktifkan')
      const ctrl = new AbortController()
      await loadData(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="feature-layout">
      {message && <div className="toast success" onClick={() => setMessage('')}>{message}</div>}
      {error && <div className="toast error" onClick={() => setError('')}>{error}</div>}

      <article className="panel">
        <div className="panel-head">
          <h3>Role Management</h3>
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            + Tambah User
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Memuat data...</p>
        ) : (
          <div className="table-container">
            <table>
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
                          <button className="small-btn" onClick={() => handleUpdateRole(u.id)}>Simpan</button>
                          <button className="small-btn cancel-btn" onClick={() => setEditUserId(null)}>Batal</button>
                        </div>
                      ) : (
                        <span className="rm-role-badge">{u.role}</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${u.is_active ? 'status-approved' : 'status-draft'}`}>
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="action-cell">
                      {editUserId !== u.id && (
                        <button
                          className="small-btn"
                          onClick={() => { setEditUserId(u.id); setEditRoleId(u.role_id) }}
                        >
                          Edit Role
                        </button>
                      )}
                      <button
                        className="small-btn toggle-btn"
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                      >
                        {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Tambah User Baru</h3>
            <form onSubmit={handleAddUser}>
              <div className="modal-form">
                <div className="form-group">
                  <label>NIK</label>
                  <input required value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input required type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select required value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })}>
                    <option value="">Pilih Role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Karyawan (opsional)</label>
                  <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
                    <option value="">Tanpa Karyawan</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.name} — {e.department}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Email (opsional)</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone (opsional)</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="primary-btn">Simpan</button>
                <button type="button" className="small-btn cancel-btn" onClick={() => setShowAddModal(false)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
