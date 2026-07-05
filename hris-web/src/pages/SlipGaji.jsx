import { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { formatRupiah } from '../utils/formatters'
import { generatePayslipPDF } from '../utils/payslipPdf'
import '../styles/global.css'
import '../styles/slipgaji.css'

export default function SlipGaji() {
  const { role } = useAuth()
  const [payslips, setPayslips] = useState([])
  const [payrollRuns, setPayrollRuns] = useState([])
  const [payslipCountByRun, setPayslipCountByRun] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingRuns, setLoadingRuns] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const [generating, setGenerating] = useState('')
  const [filterRunId, setFilterRunId] = useState('')

  // Search & Filter state
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')

  const isAdmin = ['HRD', 'Finance', 'Super Admin'].includes(role)

  const loadPayslips = useCallback(async (signal) => {
    setLoading(true)
    setLoadingRuns(true)
    try {
      const endpoint = isAdmin ? '/payslips' : '/payslips/my'
      const data = await api(endpoint, { signal })
      const list = Array.isArray(data) ? data : []
      setPayslips(list)
      if (isAdmin) {
        const counts = {}
        list.forEach((p) => { counts[p.payroll_run_id] = (counts[p.payroll_run_id] || 0) + 1 })
        setPayslipCountByRun(counts)
      }
    } catch (err) {
      if (err.name !== 'AbortError') setPayslips([])
    } finally {
      setLoading(false)
      setLoadingRuns(false)
    }
  }, [isAdmin])

  const loadRuns = useCallback(async (signal) => {
    try {
      const data = await api('/payroll/runs', { signal })
      setPayrollRuns(Array.isArray(data) ? data : [])
    } catch {
      setPayrollRuns([])
    }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    loadPayslips(ctrl.signal)
    if (isAdmin) loadRuns(ctrl.signal)
    return () => ctrl.abort()
  }, [loadPayslips, loadRuns, isAdmin])

  const handleGenerate = async (runId) => {
    setError('')
    setMessage('')
    setGenerating(String(runId))
    try {
      const data = await api(`/payroll/runs/${runId}/payslips/generate`, { method: 'POST' })
      setMessage(data.message || 'Payslip berhasil digenerate')
      const ctrl = new AbortController()
      await Promise.all([loadPayslips(ctrl.signal), loadRuns(ctrl.signal)])
      ctrl.abort()
    } catch (err) {
      setError(err.message || 'Gagal generate payslip')
    } finally {
      setGenerating('')
    }
  }

  const handleViewDetail = async (id) => {
    try {
      const data = await api(`/payslips/${id}`)
      setDetail(data)
    } catch (err) {
      setError(err.message || 'Gagal memuat detail')
    }
  }

  const handleDownloadPDF = async (id) => {
    try {
      const data = await api(`/payslips/${id}/pdf`)
      await generatePayslipPDF(data)
    } catch (err) {
      setError(err.message || 'Gagal mengunduh PDF')
    }
  }

  const availableRuns = useMemo(() => {
    return payrollRuns.filter((r) => r.status === 'finalized' && !(payslipCountByRun[r.id] > 0))
  }, [payrollRuns, payslipCountByRun])

  // Filter berdasarkan payroll run
  const runFilteredPayslips = useMemo(() => {
    if (!filterRunId) return payslips
    return payslips.filter((p) => String(p.payroll_run_id) === String(filterRunId))
  }, [payslips, filterRunId])

  // Daftar departemen unik dari slip gaji
  const departments = useMemo(() => {
    const depts = runFilteredPayslips
      .map((p) => p.department)
      .filter((d) => d && d !== '-')
    return [...new Set(depts)].sort()
  }, [runFilteredPayslips])

  // Filter akhir berdasarkan search nama + departemen
  const visiblePayslips = useMemo(() => {
    return runFilteredPayslips.filter((p) => {
      const matchSearch = !search || (p.employee_name || '').toLowerCase().includes(search.toLowerCase())
      const matchDept = !filterDept || p.department === filterDept
      return matchSearch && matchDept
    })
  }, [runFilteredPayslips, search, filterDept])

  const hasActiveFilter = search || filterDept

  const resetFilters = () => {
    setSearch('')
    setFilterDept('')
  }

  return (
    <section className="feature-layout">
      {message && <div className="toast success" onClick={() => setMessage('')}>{message}</div>}
      {error && <div className="toast error" onClick={() => setError('')}>{error}</div>}

      {isAdmin && (
        <article className="panel">
          <h3>List Payroll Run</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
            Daftar semua payroll run. Slip gaji hanya bisa dibuat untuk run berstatus <strong>finalized</strong> yang belum diterbitkan.
          </p>
          {payrollRuns.length === 0 ? (
            <p className="empty-text">
              {loadingRuns ? 'Memuat payroll run...' : 'Belum ada payroll run. Buat dan finalisasi payroll di halaman Payroll terlebih dahulu.'}
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Periode</th>
                    <th>Status</th>
                    <th>Jumlah Karyawan</th>
                    <th>Total Net</th>
                    <th>Slip Diterbitkan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRuns.map((r) => {
                    const slipCount = payslipCountByRun[r.id] ?? null
                    const canGenerate = r.status === 'finalized' && !slipCount
                    const isPublished = r.status === 'published' || (slipCount && slipCount > 0)
                    return (
                      <tr key={r.id}>
                        <td>#{r.id}</td>
                        <td>{String(r.period_month || '').slice(0, 7)}</td>
                        <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                        <td>{r.employee_count ?? '-'}</td>
                        <td className="amount-cell net">{formatRupiah(r.total_net)}</td>
                        <td>{slipCount == null ? '—' : slipCount}</td>
                        <td className="action-cell">
                          {canGenerate ? (
                            <button
                              className="small-btn"
                              onClick={() => handleGenerate(r.id)}
                              disabled={generating === String(r.id)}
                            >
                              {generating === String(r.id) ? 'Generating...' : 'Generate Slip'}
                            </button>
                          ) : isPublished ? (
                            <button
                              className="small-btn"
                              onClick={() => {
                                setFilterRunId(filterRunId === String(r.id) ? '' : String(r.id))
                                resetFilters()
                              }}
                            >
                              {filterRunId === String(r.id) ? 'Sembunyikan' : 'Lihat Slip'}
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                              {r.status === 'draft' ? 'Finalisasi dahulu' : r.status === 'approved' ? 'Finalisasi dahulu' : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* Hidden legacy helper kept for reference (empty now) */}
          <span style={{ display: 'none' }}>{availableRuns.length}</span>
        </article>
      )}

      <article className="panel">
        <div className="panel-head" style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Daftar Slip Gaji</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isAdmin && filterRunId && (
              <button className="small-btn cancel-btn" onClick={() => { setFilterRunId(''); resetFilters() }}>
                Reset Filter (Run #{filterRunId})
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar — hanya tampil saat ada data */}
        {!loading && runFilteredPayslips.length > 0 && (
          <div className="search-filter-bar">
            {isAdmin && (
              <div className="search-input-wrap">
                <input
                  id="slipgaji-search"
                  className="search-input"
                  type="text"
                  placeholder="Cari nama karyawan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="clear-search-btn" onClick={() => setSearch('')} title="Hapus pencarian">
                    ×
                  </button>
                )}
              </div>
            )}
            {isAdmin && departments.length > 0 && (
              <div className="filter-wrap">
                <select
                  id="slipgaji-filter-dept"
                  className="filter-select"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="">Semua Jabatan</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}
            {hasActiveFilter && (
              <button className="reset-filter-btn" onClick={resetFilters}>
                Reset Filter
              </button>
            )}
            <span className="result-count">
              {visiblePayslips.length} dari {runFilteredPayslips.length} slip gaji
            </span>
          </div>
        )}

        {loading ? (
          <p className="loading-text">Memuat data...</p>
        ) : runFilteredPayslips.length === 0 ? (
          <p className="empty-text">
            {isAdmin && payrollRuns.length > 0
              ? 'Belum ada slip gaji yang diterbitkan. Generate dari salah satu payroll run di atas.'
              : 'Belum ada slip gaji yang tersedia untuk Anda.'}
          </p>
        ) : visiblePayslips.length === 0 ? (
          <p className="empty-text">Tidak ada hasil yang sesuai dengan filter.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {isAdmin && <th>Karyawan</th>}
                  {isAdmin && <th>Departemen</th>}
                  <th>No. Slip</th>
                  <th>Periode</th>
                  <th>Pendapatan</th>
                  <th>Potongan</th>
                  <th>Take Home Pay</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {visiblePayslips.map((p) => (
                  <tr key={p.id}>
                    {isAdmin && <td>{p.employee_name}</td>}
                    {isAdmin && (
                      <td>
                        <span className="dept-badge">{p.department || '-'}</span>
                      </td>
                    )}
                    <td><span className="mono">{p.slip_number}</span></td>
                    <td>{p.period_month?.slice(0, 7)}</td>
                    <td className="amount-cell earning">{formatRupiah(p.gross_amount)}</td>
                    <td className="amount-cell deduction">{formatRupiah(p.deduction_amount)}</td>
                    <td className="amount-cell net">{formatRupiah(p.net_amount)}</td>
                    <td>{p.published_at ? new Date(p.published_at).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="action-cell">
                      <button className="small-btn" onClick={() => handleViewDetail(p.id)}>Detail</button>
                      <button className="small-btn" onClick={() => handleDownloadPDF(p.id)}>PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-card payslip-detail" onClick={(e) => e.stopPropagation()}>
            <div className="payslip-header">
              <h3>Slip Gaji</h3>
              <p className="mono">{detail.slip_number}</p>
            </div>

            <div className="payslip-info">
              <div className="info-row">
                <span>Periode</span>
                <strong>{detail.period_month?.slice(0, 7)}</strong>
              </div>
              <div className="info-row">
                <span>Nama</span>
                <strong>{detail.employee_name}</strong>
              </div>
              <div className="info-row">
                <span>Departemen</span>
                <strong>{detail.department || '-'}</strong>
              </div>
              <div className="info-row">
                <span>Jabatan</span>
                <strong>{detail.position || '-'}</strong>
              </div>
            </div>

            <div className="payslip-components">
              <h4>Pendapatan</h4>
              <table>
                <tbody>
                  {(detail.components || []).filter((c) => c.component_type === 'earning').map((c, i) => (
                    <tr key={i}>
                      <td>{c.component_name_snapshot}</td>
                      <td className="amount-cell earning">{formatRupiah(c.amount)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td>Total Pendapatan</td>
                    <td className="amount-cell">{formatRupiah(detail.gross_amount)}</td>
                  </tr>
                </tbody>
              </table>

              {(detail.components || []).filter((c) => c.component_type === 'deduction').length > 0 && (
                <>
                  <h4>Potongan</h4>
                  <table>
                    <tbody>
                      {(detail.components || []).filter((c) => c.component_type === 'deduction').map((c, i) => (
                        <tr key={i}>
                          <td>{c.component_name_snapshot}</td>
                          <td className="amount-cell deduction">{formatRupiah(c.amount)}</td>
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td>Total Potongan</td>
                        <td className="amount-cell">{formatRupiah(detail.deduction_amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className="payslip-net">
              <span>Take Home Pay</span>
              <strong>{formatRupiah(detail.net_amount)}</strong>
            </div>

            <div className="modal-actions">
              <button className="small-btn cancel-btn" onClick={() => setDetail(null)}>Tutup</button>
              <button className="primary-btn" onClick={() => { handleDownloadPDF(detail.id); setDetail(null) }}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}