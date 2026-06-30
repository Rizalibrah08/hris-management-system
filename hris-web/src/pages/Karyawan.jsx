import { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '../api/client'
import { formatRupiah } from '../utils/formatters'
import '../styles/global.css'
import '../styles/karyawan.css'

export default function Karyawan() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [positions, setPositions] = useState([])
  const [salaryProfiles, setSalaryProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSalaryModal, setShowSalaryModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [salaryEmployee, setSalaryEmployee] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [importing, setImporting] = useState(false)

  const [addForm, setAddForm] = useState({
    name: '', department_id: '', position_id: '', contract_end: '', email: '', phone: '',
  })
  const [editForm, setEditForm] = useState({
    name: '', department_id: '', position_id: '', contract_end: '', email: '', phone: '', is_active: 1,
  })
  const [salaryForm, setSalaryForm] = useState({
    baseSalary: 0, allowance: 0, deduction: 0,
    paymentMethod: 'bank_transfer', bankName: '', bankAccountName: '', bankAccountNumber: '',
  })

  const clearMessages = () => { setMessage(''); setError('') }

  const loadAll = useCallback(async (signal) => {
    setLoading(true)
    try {
      const [emp, dept, pos, sal] = await Promise.all([
        api('/employees', { signal }),
        api('/departments', { signal }),
        api('/positions', { signal }),
        api('/salary-profiles', { signal }),
      ])
      setEmployees(emp)
      setDepartments(dept)
      setPositions(pos)
      setSalaryProfiles(sal.map((s) => ({
        employeeId: s.employee_id,
        employeeName: s.employee_name,
        baseSalary: Number(s.base_salary),
        allowance: Number(s.allowance),
        deduction: Number(s.deduction),
        paymentMethod: s.payment_method || 'bank_transfer',
        bankName: s.bank_name || '',
        bankAccountName: s.bank_account_name || '',
        bankAccountNumber: s.bank_account_number || '',
      })))
    } catch (err) {
      if (err.name !== 'AbortError') setEmployees([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    loadAll(ctrl.signal)
    return () => ctrl.abort()
  }, [loadAll])

  const getSalary = (empId) => salaryProfiles.find((s) => s.employeeId === empId)

  const filtered = useMemo(() => {
    if (!search.trim()) return employees
    const q = search.toLowerCase()
    return employees.filter((e) =>
      (e.name || '').toLowerCase().includes(q) ||
      (e.department || '').toLowerCase().includes(q) ||
      (e.position || '').toLowerCase().includes(q),
    )
  }, [employees, search])

  const contractStatus = (contractEnd) => {
    if (!contractEnd) return { label: 'Tanpa Kontrak', cls: 'none' }
    const end = new Date(contractEnd)
    const now = new Date()
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    if (days < 0) return { label: 'Berakhir', cls: 'expired' }
    if (days <= 30) return { label: `${days} hari`, cls: 'expiring' }
    return { label: 'Aktif', cls: 'active' }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    clearMessages()
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = localStorage.getItem('hris_token')
      const API = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${API}/employees/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMessage(data.message)
      if (data.errors?.length) setError(data.errors.join('\n'))
      const ctrl = new AbortController()
      await loadAll(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message || 'Gagal import')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const resetAddForm = () => setAddForm({ name: '', department_id: '', position_id: '', contract_end: '', email: '', phone: '' })

  const handleAdd = async (e) => {
    e.preventDefault()
    clearMessages()
    if (!addForm.name.trim()) { setError('Nama wajib diisi'); return }
    setSubmitting(true)
    try {
      const created = await api('/employees', {
        method: 'POST',
        body: JSON.stringify({
          name: addForm.name,
          department_id: addForm.department_id ? Number(addForm.department_id) : null,
          position_id: addForm.position_id ? Number(addForm.position_id) : null,
          contract_end: addForm.contract_end || null,
          email: addForm.email || null,
          phone: addForm.phone || null,
        }),
      })
      setMessage(`Karyawan berhasil ditambahkan. NIK: ${created.nik} | Password: ${created.defaultPassword}`)
      setShowAddModal(false)
      resetAddForm()
      const ctrl = new AbortController()
      await loadAll(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message || 'Gagal menambah karyawan')
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (emp) => {
    setEditingEmployee(emp)
    setEditForm({
      name: emp.name || '',
      department_id: emp.department_id ? String(emp.department_id) : '',
      position_id: emp.position_id ? String(emp.position_id) : '',
      contract_end: emp.contract_end ? emp.contract_end.slice(0, 10) : '',
      email: emp.email || '',
      phone: emp.phone || '',
      is_active: emp.is_active !== undefined ? emp.is_active : 1,
    })
    setShowEditModal(true)
    clearMessages()
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    clearMessages()
    if (!editForm.name.trim()) { setError('Nama wajib diisi'); return }
    setSubmitting(true)
    try {
      await api(`/employees/${editingEmployee.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editForm.name,
          department_id: editForm.department_id ? Number(editForm.department_id) : null,
          position_id: editForm.position_id ? Number(editForm.position_id) : null,
          contract_end: editForm.contract_end || null,
          email: editForm.email || null,
          phone: editForm.phone || null,
          is_active: editForm.is_active,
        }),
      })
      setMessage(`Data ${editingEmployee.name} berhasil diupdate`)
      setShowEditModal(false)
      setEditingEmployee(null)
      const ctrl = new AbortController()
      await loadAll(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message || 'Gagal mengupdate karyawan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (emp) => {
    clearMessages()
    try {
      await api(`/employees/${emp.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: emp.name,
          department_id: emp.department_id,
          position_id: emp.position_id,
          contract_end: emp.contract_end ? emp.contract_end.slice(0, 10) : null,
          email: emp.email || null,
          phone: emp.phone || null,
          is_active: emp.is_active ? 0 : 1,
        }),
      })
      setMessage(`${emp.name} ${emp.is_active ? 'dinonaktifkan' : 'diaktifkan'}`)
      const ctrl = new AbortController()
      await loadAll(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message || 'Gagal mengubah status')
    }
  }

  const handleDelete = async (emp) => {
    if (!window.confirm(`Yakin ingin menghapus karyawan "${emp.name}"? Tindakan ini tidak dapat dibatalkan.`)) return
    clearMessages()
    try {
      await api(`/employees/${emp.id}`, { method: 'DELETE' })
      setMessage(`Karyawan "${emp.name}" berhasil dihapus`)
      const ctrl = new AbortController()
      await loadAll(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message || 'Gagal menghapus karyawan')
    }
  }

  const openSalary = (emp) => {
    const sal = getSalary(emp.id)
    setSalaryEmployee(emp)
    setSalaryForm({
      baseSalary: sal ? sal.baseSalary : 8000000,
      allowance: sal ? sal.allowance : 1000000,
      deduction: sal ? sal.deduction : 250000,
      paymentMethod: sal ? sal.paymentMethod : 'bank_transfer',
      bankName: sal ? sal.bankName : '',
      bankAccountName: sal ? sal.bankAccountName : '',
      bankAccountNumber: sal ? sal.bankAccountNumber : '',
    })
    setShowSalaryModal(true)
    clearMessages()
  }

  const handleSaveSalary = async (e) => {
    e.preventDefault()
    clearMessages()
    setSubmitting(true)
    try {
      await api('/salary-profiles', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: salaryEmployee.id,
          baseSalary: Number(salaryForm.baseSalary),
          allowance: Number(salaryForm.allowance),
          deduction: Number(salaryForm.deduction),
          paymentMethod: salaryForm.paymentMethod,
          bankName: salaryForm.paymentMethod === 'bank_transfer' ? salaryForm.bankName || null : null,
          bankAccountName: salaryForm.paymentMethod === 'bank_transfer' ? salaryForm.bankAccountName || null : null,
          bankAccountNumber: salaryForm.paymentMethod === 'bank_transfer' ? salaryForm.bankAccountNumber || null : null,
        }),
      })
      setMessage(`Gaji ${salaryEmployee.name} berhasil disimpan`)
      setShowSalaryModal(false)
      setSalaryEmployee(null)
      const ctrl = new AbortController()
      await loadAll(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan gaji')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="feature-layout">
      {message && <div className="toast success">{message}</div>}
      {error && <div className="toast error">{error}</div>}

      <article className="panel">
        <div className="panel-head">
          <h3>Manajemen Karyawan</h3>
          <div className="panel-head-actions">
            <input
              className="search-input"
              placeholder="Cari nama, departemen, jabatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="primary-btn" style={{ cursor: importing ? 'wait' : 'pointer' }}>
              {importing ? 'Importing...' : '📥 Import CSV'}
              <input type="file" accept=".csv" onChange={handleImport} hidden disabled={importing} />
            </label>
            <button className="primary-btn" onClick={() => { resetAddForm(); setShowAddModal(true); clearMessages() }}>
              + Tambah Karyawan
            </button>
          </div>
        </div>
      </article>

      <article className="panel">
        {loading ? (
          <p className="loading-text">Memuat data karyawan...</p>
        ) : filtered.length === 0 ? (
          <p className="empty-text">Tidak ada data karyawan{search ? ' yang cocok' : ''}.</p>
        ) : (
          <div className="table-container">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NIK</th>
                  <th>Password</th>
                  <th>Departemen</th>
                  <th>Jabatan</th>
                  <th>Gaji Pokok</th>
                  <th>Akhir Kontrak</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const sal = getSalary(emp.id)
                  const kontrak = contractStatus(emp.contract_end)
                  return (
                    <tr key={emp.id} className={!emp.is_active ? 'row-inactive' : ''}>
                      <td>
                        <span className="emp-name">{emp.name}</span>
                        {emp.email && <span className="emp-detail">{emp.email}</span>}
                      </td>
                      <td><code>{emp.nik || '-'}</code></td>
                      <td><code>{emp.nik ? 'admin123' : '-'}</code></td>
                      <td>{emp.department || '-'}</td>
                      <td>{emp.position || '-'}</td>
                      <td>
                        {sal ? (
                          <span className="salary-cell">{formatRupiah(sal.baseSalary)}</span>
                        ) : (
                          <span className="muted-text">Belum diatur</span>
                        )}
                      </td>
                      <td>
                        <div className="contract-cell">
                          <span>{emp.contract_end ? emp.contract_end.slice(0, 10) : '-'}</span>
                          <span className={`contract-badge ${kontrak.cls}`}>{kontrak.label}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge-sm ${emp.is_active ? 'active' : 'inactive'}`}>
                          {emp.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button className="small-btn" onClick={() => openEdit(emp)}>Edit</button>
                        <button className="small-btn salary-btn" onClick={() => openSalary(emp)}>Gaji</button>
                        <button className="small-btn toggle-btn" onClick={() => handleToggleActive(emp)}>
                          {emp.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button className="small-btn cancel-btn" onClick={() => handleDelete(emp)}>Hapus</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); resetAddForm(); clearMessages() }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Tambah Karyawan Baru</h3>
            <p className="section-note">NIK dan Password akan di-generate secara otomatis setelah disimpan.</p>
            <form onSubmit={handleAdd}>
              <div className="modal-form">
                <label htmlFor="add-name">Nama Lengkap</label>
                <input id="add-name" value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} required />
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="add-dept">Departemen</label>
                    <select id="add-dept" value={addForm.department_id} onChange={(e) => setAddForm((p) => ({ ...p, department_id: e.target.value }))}>
                      <option value="">-- Pilih --</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="add-pos">Jabatan</label>
                    <select id="add-pos" value={addForm.position_id} onChange={(e) => setAddForm((p) => ({ ...p, position_id: e.target.value }))}>
                      <option value="">-- Pilih --</option>
                      {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="add-contract">Akhir Kontrak</label>
                    <input id="add-contract" type="date" value={addForm.contract_end} onChange={(e) => setAddForm((p) => ({ ...p, contract_end: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="add-email">Email</label>
                    <input id="add-email" type="email" value={addForm.email} onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))} placeholder="opsional" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="add-phone">Telepon</label>
                  <input id="add-phone" value={addForm.phone} onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))} placeholder="opsional" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="small-btn cancel-btn" onClick={() => { setShowAddModal(false); resetAddForm(); clearMessages() }}>Batal</button>
                <button type="submit" className="primary-btn" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); setEditingEmployee(null); clearMessages() }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Karyawan</h3>
            <p className="section-note">{editingEmployee.name}</p>
            <form onSubmit={handleEdit}>
              <div className="modal-form">
                <label htmlFor="edit-name">Nama Lengkap</label>
                <input id="edit-name" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} required />
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-dept">Departemen</label>
                    <select id="edit-dept" value={editForm.department_id} onChange={(e) => setEditForm((p) => ({ ...p, department_id: e.target.value }))}>
                      <option value="">-- Pilih --</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-pos">Jabatan</label>
                    <select id="edit-pos" value={editForm.position_id} onChange={(e) => setEditForm((p) => ({ ...p, position_id: e.target.value }))}>
                      <option value="">-- Pilih --</option>
                      {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-contract">Akhir Kontrak</label>
                    <input id="edit-contract" type="date" value={editForm.contract_end} onChange={(e) => setEditForm((p) => ({ ...p, contract_end: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-email">Email</label>
                    <input id="edit-email" type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-phone">Telepon</label>
                    <input id="edit-phone" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-active">Status</label>
                    <select id="edit-active" value={editForm.is_active} onChange={(e) => setEditForm((p) => ({ ...p, is_active: Number(e.target.value) }))}>
                      <option value={1}>Aktif</option>
                      <option value={0}>Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="small-btn cancel-btn" onClick={() => { setShowEditModal(false); setEditingEmployee(null); clearMessages() }}>Batal</button>
                <button type="submit" className="primary-btn" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Modal */}
      {showSalaryModal && salaryEmployee && (
        <div className="modal-overlay" onClick={() => { setShowSalaryModal(false); setSalaryEmployee(null); clearMessages() }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Atur Gaji — {salaryEmployee.name}</h3>
            <p className="section-note">Departemen: {salaryEmployee.department || '-'} &middot; Jabatan: {salaryEmployee.position || '-'}</p>
            <form onSubmit={handleSaveSalary}>
              <div className="modal-form">
                <div className="form-group">
                  <label htmlFor="sal-base">Gaji Pokok</label>
                  <input id="sal-base" type="number" min={0} step={50000} value={salaryForm.baseSalary} onChange={(e) => setSalaryForm((p) => ({ ...p, baseSalary: Number(e.target.value) || 0 }))} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="sal-allowance">Tunjangan</label>
                    <input id="sal-allowance" type="number" min={0} step={10000} value={salaryForm.allowance} onChange={(e) => setSalaryForm((p) => ({ ...p, allowance: Number(e.target.value) || 0 }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sal-deduction">Potongan</label>
                    <input id="sal-deduction" type="number" min={0} step={10000} value={salaryForm.deduction} onChange={(e) => setSalaryForm((p) => ({ ...p, deduction: Number(e.target.value) || 0 }))} />
                  </div>
                </div>
                <div className="salary-preview">
                  <span>Take Home Pay: <strong>{formatRupiah(salaryForm.baseSalary + salaryForm.allowance - salaryForm.deduction)}</strong></span>
                </div>
                <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                <div className="form-group">
                  <label htmlFor="sal-payment-method">Metode Pembayaran</label>
                  <select
                    id="sal-payment-method"
                    value={salaryForm.paymentMethod}
                    onChange={(e) => setSalaryForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                  >
                    <option value="bank_transfer">Transfer Bank</option>
                    <option value="cash">Tunai (Cash)</option>
                  </select>
                </div>
                {salaryForm.paymentMethod === 'bank_transfer' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="sal-bank-name">Nama Bank</label>
                        <input
                          id="sal-bank-name"
                          value={salaryForm.bankName}
                          onChange={(e) => setSalaryForm((p) => ({ ...p, bankName: e.target.value }))}
                          placeholder="cth: BCA, Mandiri, BRI"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="sal-account-name">Nama Pemilik Rekening</label>
                        <input
                          id="sal-account-name"
                          value={salaryForm.bankAccountName}
                          onChange={(e) => setSalaryForm((p) => ({ ...p, bankAccountName: e.target.value }))}
                          placeholder="Sesuai buku tabungan"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="sal-account-number">Nomor Rekening</label>
                      <input
                        id="sal-account-number"
                        value={salaryForm.bankAccountNumber}
                        onChange={(e) => setSalaryForm((p) => ({ ...p, bankAccountNumber: e.target.value }))}
                        placeholder="cth: 1234567890"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="small-btn cancel-btn" onClick={() => { setShowSalaryModal(false); setSalaryEmployee(null); clearMessages() }}>Batal</button>
                <button type="submit" className="primary-btn" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan Gaji'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
