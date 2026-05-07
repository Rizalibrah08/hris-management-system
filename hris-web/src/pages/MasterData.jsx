import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import '../styles/global.css'

function MasterTab({ title, endpoint, labelField = 'name', labelHeader = 'Nama', entityName = 'item' }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (signal) => {
    setLoading(true)
    try {
      const data = await api(endpoint, { signal })
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [load])

  const handleAdd = async () => {
    if (!newName.trim()) { setError('Nama wajib diisi'); return }
    setError('')
    setAdding(true)
    try {
      await api(endpoint, { method: 'POST', body: JSON.stringify({ name: newName.trim() }) })
      setMessage(`${entityName} berhasil ditambahkan`)
      setNewName('')
      const ctrl = new AbortController()
      await load(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleEdit = async (id) => {
    if (!editName.trim()) { setError('Nama wajib diisi'); return }
    setError('')
    setSaving(true)
    try {
      await api(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify({ name: editName.trim() }) })
      setMessage(`${entityName} berhasil diupdate`)
      setEditingId(null)
      setEditName('')
      const ctrl = new AbortController()
      await load(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(`Yakin hapus ${entityName} ini?`)) return
    setError('')
    try {
      await api(`${endpoint}/${id}`, { method: 'DELETE' })
      setMessage(`${entityName} berhasil dihapus`)
      const ctrl = new AbortController()
      await load(ctrl.signal)
      ctrl.abort()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      {message && <div className="toast success" onClick={() => setMessage('')}>{message}</div>}
      {error && <div className="toast error" onClick={() => setError('')}>{error}</div>}

      <div className="panel-head">
        <h3>{title}</h3>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <input
          className="search-input"
          placeholder={`Tambah ${entityName} baru...`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="primary-btn" onClick={handleAdd} disabled={adding}>
          {adding ? '...' : 'Tambah'}
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Memuat data...</p>
      ) : items.length === 0 ? (
        <p className="empty-text">Belum ada data {entityName}.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{labelHeader}</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        className="search-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit(item.id)}
                        style={{ minWidth: 'auto', width: '100%' }}
                      />
                    ) : (
                      item[labelField]
                    )}
                  </td>
                  <td className="action-cell">
                    {editingId === item.id ? (
                      <>
                        <button className="small-btn" onClick={() => handleEdit(item.id)} disabled={saving}>
                          {saving ? '...' : 'Simpan'}
                        </button>
                        <button className="small-btn cancel-btn" onClick={() => { setEditingId(null); setEditName('') }}>
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="small-btn" onClick={() => { setEditingId(item.id); setEditName(item[labelField]) }}>
                          Edit
                        </button>
                        <button className="small-btn cancel-btn" onClick={() => handleDelete(item.id)}>
                          Hapus
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function MasterData() {
  const [tab, setTab] = useState('departemen')

  const tabs = [
    { key: 'departemen', label: 'Departemen', endpoint: '/departments', labelField: 'name', labelHeader: 'Nama Departemen', entityName: 'Departemen' },
    { key: 'jabatan', label: 'Jabatan', endpoint: '/positions', labelField: 'name', labelHeader: 'Nama Jabatan', entityName: 'Jabatan' },
    { key: 'izin', label: 'Jenis Izin', endpoint: '/leave-types', labelField: 'name', labelHeader: 'Nama Jenis Izin', entityName: 'Jenis Izin' },
  ]

  const active = tabs.find((t) => t.key === tab)

  return (
    <section className="feature-layout">
      <article className="panel">
        <div className="payroll-tabs" style={{ marginBottom: '14px' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {active && (
          <MasterTab
            key={active.key}
            title={active.label}
            endpoint={active.endpoint}
            labelField={active.labelField}
            labelHeader={active.labelHeader}
            entityName={active.entityName}
          />
        )}
      </article>
    </section>
  )
}
