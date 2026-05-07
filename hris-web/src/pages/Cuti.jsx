import { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import '../styles/global.css'
import '../styles/cuti.css'

export default function Cuti() {
  const { role } = useAuth()
  const [leaveData, setLeaveData] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    employee_id: '',
    leave_type: 'Cuti Tahunan',
    start_date: '',
    end_date: '',
    reason: '',
  })
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('')
  const [leaveTypes, setLeaveTypes] = useState([])

  const canApprove = ['HRD', 'Super Admin', 'Manager'].includes(role)
  const isAdmin = ['HRD', 'Super Admin'].includes(role)

  const loadData = useCallback(async (signal) => {
    setLoading(true)
    try {
      const leaveResp = await api('/leave', { signal })
      setLeaveData(leaveResp)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setLeaveData([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const loadEmployees = useCallback(async (signal) => {
    try {
      const data = await api('/employees', { signal })
      setEmployees(data)
    } catch {
      setEmployees([])
    }
  }, [])

  const loadLeaveTypes = useCallback(async (signal) => {
    try {
      const data = await api('/leave-types', { signal })
      setLeaveTypes(Array.isArray(data) ? data : [])
    } catch {
      setLeaveTypes([])
    }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    loadData(ctrl.signal)
    loadLeaveTypes(ctrl.signal)
    if (isAdmin) loadEmployees(ctrl.signal)
    return () => ctrl.abort()
  }, [loadData, loadEmployees, loadLeaveTypes, isAdmin])

  const approvedCount = useMemo(() => leaveData.filter((l) => l.status === 'Approved').length, [leaveData])
  const rejectedCount = useMemo(() => leaveData.filter((l) => l.status === 'Rejected').length, [leaveData])
  const pendingCount = useMemo(() => leaveData.filter((l) => l.status === 'Pending').length, [leaveData])

  const clearMessages = () => {
    setMessage('')
    setError('')
  }

  const handleApprove = async (leaveId) => {
    clearMessages()
    try {
      await api('/leave/approve', {
        method: 'PUT',
        body: JSON.stringify({ leave_id: leaveId, status: 'Approved' }),
      })
      setMessage('Pengajuan cuti berhasil disetujui')
      const ctrl = new AbortController()
      await loadData(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message || 'Gagal menyetujui pengajuan')
    }
  }

  const handleReject = async (leaveId) => {
    clearMessages()
    try {
      await api('/leave/approve', {
        method: 'PUT',
        body: JSON.stringify({ leave_id: leaveId, status: 'Rejected' }),
      })
      setMessage('Pengajuan cuti ditolak')
      const ctrl = new AbortController()
      await loadData(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message || 'Gagal menolak pengajuan')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearMessages()
    setSubmitting(true)
    try {
      const payload = {
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason || null,
      }
      if (isAdmin && form.employee_id) {
        payload.employee_id = Number(form.employee_id)
      }
      await api('/leave', { method: 'POST', body: JSON.stringify(payload) })
      setMessage('Pengajuan cuti berhasil dikirim')
      setShowForm(false)
      resetForm()
      const ctrl = new AbortController()
      await loadData(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message || 'Gagal mengajukan cuti')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm({
      employee_id: isAdmin && employees.length > 0 ? String(employees[0].id) : '',
      leave_type: 'Cuti Tahunan',
      start_date: '',
      end_date: '',
      reason: '',
    })
  }

  const handleEmployeeSelect = (e) => {
    const empId = e.target.value
    setForm((prev) => ({ ...prev, employee_id: empId }))
    const emp = employees.find((em) => String(em.id) === empId)
    setSelectedEmployeeName(emp ? emp.name : '')
  }

  const openNewForm = () => {
    resetForm()
    setSelectedEmployeeName('')
    showForm ? setShowForm(false) : setShowForm(true)
    clearMessages()
  }

  return (
    <section className="feature-layout">
      {message && <div className="toast success">{message}</div>}
      {error && <div className="toast error">{error}</div>}

      <article className="panel">
        <div className="panel-head">
          <h3>Leave Management</h3>
          <button className="primary-btn" onClick={openNewForm}>
            {showForm ? 'Tutup Form' : '+ Ajukan Cuti / Izin'}
          </button>
        </div>
        <div className="quick-grid">
          <div className="quick-card">
            <span>Menunggu Approval</span>
            <strong>{pendingCount}</strong>
          </div>
          <div className="quick-card">
            <span>Disetujui</span>
            <strong>{approvedCount}</strong>
          </div>
          <div className="quick-card">
            <span>Ditolak</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>
      </article>

      {showForm && (
        <article className="panel">
          <h3>{isAdmin && form.employee_id ? `Ajukan Cuti untuk ${selectedEmployeeName}` : 'Form Pengajuan Cuti / Izin'}</h3>
          <form className="leave-form" onSubmit={handleSubmit}>
            {isAdmin && (
              <div className="form-group">
                <label htmlFor="employee-select">Karyawan</label>
                <select id="employee-select" value={form.employee_id} onChange={handleEmployeeSelect} required>
                  <option value="">-- Pilih Karyawan --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} {emp.department ? `(${emp.department})` : ''}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="leave-type">Jenis Cuti / Izin</label>
              <select id="leave-type" value={form.leave_type} onChange={(e) => setForm((p) => ({ ...p, leave_type: e.target.value }))} required>
                {leaveTypes.map((type) => (
                  <option key={type.id || type.name} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start-date">Tanggal Mulai</label>
                <input id="start-date" type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label htmlFor="end-date">Tanggal Selesai</label>
                <input id="end-date" type="date" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} required min={form.start_date || undefined} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reason">Alasan</label>
              <textarea id="reason" rows={3} value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Tulis alasan pengajuan cuti atau izin..." />
            </div>
            <div className="form-actions">
              <button type="button" className="small-btn cancel-btn" onClick={() => { setShowForm(false); resetForm(); clearMessages() }}>Batal</button>
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
              </button>
            </div>
          </form>
        </article>
      )}

      <article className="panel">
        <div className="panel-head">
          <h3>Daftar Pengajuan Cuti & Izin</h3>
        </div>
        {loading ? (
          <p className="loading-text">Memuat data...</p>
        ) : leaveData.length === 0 ? (
          <p className="empty-text">Belum ada pengajuan cuti atau izin.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Departemen</th>
                  <th>Jenis</th>
                  <th>Mulai</th>
                  <th>Selesai</th>
                  <th>Alasan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {leaveData.map((l) => (
                  <tr key={l.id}>
                    <td>{l.employee_name}</td>
                    <td>{l.department || '-'}</td>
                    <td>
                      <span className="leave-type-badge">{l.leave_type}</span>
                    </td>
                    <td>{l.start_date?.slice(0, 10)}</td>
                    <td>{l.end_date?.slice(0, 10)}</td>
                    <td>{l.reason || '-'}</td>
                    <td>
                      <span className={`status ${l.status.toLowerCase()}`}>{l.status}</span>
                    </td>
                    <td className="action-cell">
                      {canApprove && l.status === 'Pending' && (
                        <>
                          <button className="small-btn approve-btn" onClick={() => handleApprove(l.id)}>
                            Setuju
                          </button>
                          <button className="small-btn reject-btn" onClick={() => handleReject(l.id)}>
                            Tolak
                          </button>
                        </>
                      )}
                      {!canApprove && l.status !== 'Pending' && (
                        <span className="muted">-</span>
                      )}
                      {canApprove && l.status !== 'Pending' && (
                        <span className="muted">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  )
}
