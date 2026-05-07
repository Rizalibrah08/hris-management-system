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
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [selectedRunId, setSelectedRunId] = useState('')

  const isAdmin = ['HRD', 'Finance', 'Super Admin'].includes(role)

  const loadPayslips = useCallback(async (signal) => {
    setLoading(true)
    try {
      const endpoint = isAdmin ? '/payslips' : '/payslips/my'
      const data = await api(endpoint, { signal })
      setPayslips(data)
    } catch (err) {
      if (err.name !== 'AbortError') setPayslips([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  const loadRuns = useCallback(async (signal) => {
    try {
      const data = await api('/payroll/runs', { signal })
      setPayrollRuns(data.filter((r) => r.status === 'finalized'))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    loadPayslips(ctrl.signal)
    if (isAdmin) loadRuns(ctrl.signal)
    return () => ctrl.abort()
  }, [loadPayslips, loadRuns, isAdmin])

  const handleGenerate = async () => {
    if (!selectedRunId) { setError('Pilih payroll run terlebih dahulu'); return }
    setError('')
    setMessage('')
    setGenerating(true)
    try {
      const data = await api(`/payroll/runs/${selectedRunId}/payslips/generate`, { method: 'POST' })
      setMessage(data.message)
      setSelectedRunId('')
      const ctrl = new AbortController()
      await Promise.all([loadPayslips(ctrl.signal), loadRuns(ctrl.signal)])
      ctrl.abort()
    } catch (err) {
      setError(err.message || 'Gagal generate payslip')
    } finally {
      setGenerating(false)
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
      generatePayslipPDF(data)
    } catch (err) {
      setError(err.message || 'Gagal mengunduh PDF')
    }
  }

  const availableRuns = useMemo(() => {
    const generatedRunIds = new Set(payslips.map((p) => p.payroll_run_id))
    return payrollRuns.filter((r) => !generatedRunIds.has(r.id))
  }, [payrollRuns, payslips])

  return (
    <section className="feature-layout">
      {message && <div className="toast success" onClick={() => setMessage('')}>{message}</div>}
      {error && <div className="toast error" onClick={() => setError('')}>{error}</div>}

      {isAdmin && (
        <article className="panel">
          <h3>Generate Slip Gaji</h3>
          <p className="section-note">Generate slip gaji dari payroll run yang sudah finalized. Otomatis generate untuk semua karyawan di run tersebut.</p>
          <div className="generate-form">
            <select value={selectedRunId} onChange={(e) => setSelectedRunId(e.target.value)}>
              <option value="">-- Pilih Payroll Run --</option>
              {availableRuns.map((r) => (
                <option key={r.id} value={r.id}>
                  Run #{r.id} — {String(r.period_month).slice(0, 7)} — {r.employee_count} karyawan
                </option>
              ))}
            </select>
            <button className="primary-btn" onClick={handleGenerate} disabled={generating || availableRuns.length === 0}>
              {generating ? 'Generating...' : 'Generate Slip Gaji'}
            </button>
          </div>
        </article>
      )}

      <article className="panel">
        <h3>Daftar Slip Gaji</h3>
        {loading ? (
          <p className="loading-text">Memuat data...</p>
        ) : payslips.length === 0 ? (
          <p className="empty-text">Belum ada slip gaji yang tersedia.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {isAdmin && <th>Karyawan</th>}
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
                {payslips.map((p) => (
                  <tr key={p.id}>
                    {isAdmin && <td>{p.employee_name}</td>}
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
