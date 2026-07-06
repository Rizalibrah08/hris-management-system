import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { LOGO_BASE64 } from './utils/logoBase64'
import './styles/global.css'
import './styles/payroll.css'
import './styles/laporan.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Karyawan from './pages/Karyawan'
import Absensi from './pages/Absensi'
import Cuti from './pages/Cuti'
import RoleManagement from './pages/RoleManagement'
import SlipGaji from './pages/SlipGaji'
import MasterData from './pages/MasterData'
import Pengaturan from './pages/Pengaturan'
import { useAuth } from './contexts/AuthContext'
import { canRunPayroll, canApproveFinance, canReview } from './utils/constants'
// Payroll page is still handled by FeaturePages component

const menus = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'karyawan', label: 'Karyawan' },
  { key: 'absensi', label: 'Absensi' },
  { key: 'cuti', label: 'Cuti & Izin' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'slipgaji', label: 'Slip Gaji' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'masterdata', label: 'Master Data' },
  { key: 'pengaturan', label: 'Pengaturan' },
  { key: 'role',       label: 'Role Management' },
]

const API = import.meta.env.VITE_API_URL || '/api'

async function api(path, opts = {}) {
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

function App() {
  const { token, role, employeeName, department, logout } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('hris_sidebar')
    return saved !== null ? saved === '1' : true
  })

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev
      localStorage.setItem('hris_sidebar', next ? '1' : '0')
      return next
    })
  }

  const roleMenus = useMemo(() => {
    const menuByKey = Object.fromEntries(menus.map(m => [m.key, m]))
    const order = ['dashboard', 'karyawan', 'absensi', 'cuti', 'payroll', 'slipgaji', 'laporan', 'masterdata', 'pengaturan', 'role']
    let keys = ['dashboard', 'slipgaji']
    if (['HRD', 'Super Admin'].includes(role)) {
      keys.push('karyawan', 'absensi', 'cuti', 'payroll', 'laporan', 'masterdata', 'pengaturan')
    }
    if (role === 'Finance') {
      keys.push('payroll', 'laporan')
    }
    if (role === 'Manager') {
      keys.push('cuti')
    }
    if (role === 'Super Admin') {
      keys.push('role')
    }
    if (role === 'System Admin') {
      keys.push('karyawan', 'laporan', 'masterdata', 'pengaturan', 'role')
    }
    return [...new Set(keys)]
      .sort((a, b) => order.indexOf(a) - order.indexOf(b))
      .map(k => menuByKey[k])
      .filter(Boolean)
  }, [role])
  const [activePage, setActivePage] = useState('dashboard')
  const [runningPayroll, setRunningPayroll] = useState(false)
  const [finalizingPayroll, setFinalizingPayroll] = useState(false)
  const [payrollMessage, setPayrollMessage] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectTargetRunId, setRejectTargetRunId] = useState(null)
  const [rejectComment, setRejectComment] = useState('')
  const [payrollRuns, setPayrollRuns] = useState([])
  const [selectedRunId, setSelectedRunId] = useState(null)
  const [payrollDetail, setPayrollDetail] = useState(null)
  const [selectedPayrollItemId, setSelectedPayrollItemId] = useState(null)
  const [payrollDetailSearch, setPayrollDetailSearch] = useState('')
  const [report, setReport] = useState({
    totalEmployees: 0,
    attendanceRate: 0,
    pendingLeave: 0,
    payrollTotal: 0,
    payrollCostBreakdown: [],
    attendanceTrend: [],
  })
  const [salaryDistribution, setSalaryDistribution] = useState({
    byDepartment: [],
    byPosition: [],
    byRole: [],
  })
  const [leaveStats, setLeaveStats] = useState({
    byType: [],
    byStatus: [],
    monthlySummary: [],
  })
  const [loadingReports, setLoadingReports] = useState(false)

  const canRunPayrollVal = canRunPayroll(role)
  const canApproveFinanceVal = canApproveFinance(role)
  const canReviewVal = canReview(role)


  async function loadDashboardData() {
    try {
      const reportData = await api('/reports/dashboard')
      setReport(reportData)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (!token) return
    const ctrl = new AbortController()
    const init = async () => {
      try {
        const reportData = await api('/reports/dashboard', { signal: ctrl.signal })
        setReport(reportData)
      } catch { /* ignore */ }
    }
    init()
    return () => ctrl.abort()
  }, [token])

  useEffect(() => {
    if (!token || activePage !== 'payroll') return
    loadPayrollRuns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activePage])

  useEffect(() => {
    if (!token || activePage !== 'laporan') return
    const fetchReports = async () => {
      try {
        setLoadingReports(true)
        const [dashboardData, salaryDistData, leaveStatsData] = await Promise.all([
          api('/reports/dashboard'),
          api('/reports/salary-distribution'),
          api('/reports/leave-stats'),
        ])

        const toNum = (val) => (val != null && !isNaN(Number(val)) ? Number(val) : val)

        const normDashboard = {
          ...dashboardData,
          payrollCostBreakdown: (dashboardData.payrollCostBreakdown || []).map((r) => ({
            ...r,
            total_gross: toNum(r.total_gross),
            employee_count: toNum(r.employee_count),
          })),
          attendanceTrend: (dashboardData.attendanceTrend || []).map((r) => ({
            ...r,
            attendance_rate: toNum(r.attendance_rate),
          })),
        }

        const normSalary = {
          byDepartment: (salaryDistData.byDepartment || []).map((r) => ({
            ...r,
            count: toNum(r.count),
            total_salary: toNum(r.total_salary),
            avg_salary: toNum(r.avg_salary),
          })),
          byPosition: (salaryDistData.byPosition || []).map((r) => ({
            ...r,
            count: toNum(r.count),
            total_salary: toNum(r.total_salary),
            avg_salary: toNum(r.avg_salary),
          })),
          byRole: (salaryDistData.byRole || []).map((r) => ({
            ...r,
            count: toNum(r.count),
            total_salary: toNum(r.total_salary),
            avg_salary: toNum(r.avg_salary),
          })),
        }

        const normLeave = {
          ...leaveStatsData,
          byType: (leaveStatsData.byType || []).map((r) => ({
            ...r,
            total: toNum(r.total),
            approved: toNum(r.approved),
            rejected: toNum(r.rejected),
            pending: toNum(r.pending),
          })),
          byStatus: (leaveStatsData.byStatus || []).map((r) => ({
            ...r,
            total: toNum(r.total),
          })),
          monthlySummary: (leaveStatsData.monthlySummary || []).map((r) => ({
            ...r,
            total: toNum(r.total),
            approved: toNum(r.approved),
          })),
        }

        setReport(normDashboard)
        setSalaryDistribution(normSalary)
        setLeaveStats(normLeave)
      } catch (err) {
        console.error('Failed to fetch reports:', err)
      } finally {
        setLoadingReports(false)
      }
    }
    fetchReports()
  }, [token, activePage])

  const handleLogout = () => {
    logout()
    setActivePage('dashboard')
  }

  async function loadPayrollRuns() {
    try {
      const data = await api('/payroll/runs')
      setPayrollRuns(data)
      if (data.length > 0 && !selectedRunId) {
        setSelectedRunId(data[0].id)
        await loadPayrollDetail(data[0].id)
      }
    } catch { /* ignore */ }
  }

  async function loadPayrollDetail(runId) {
    try {
      const data = await api(`/payroll/runs/${runId}`)
      setPayrollDetail(data)
      setSelectedPayrollItemId(data.items?.[0]?.id || null)
    } catch { /* ignore */ }
  }

  const handleRunPayroll = async () => {
    setRunningPayroll(true)
    setPayrollMessage('')
    try {
      const data = await api('/payroll/runs/generate', {
        method: 'POST',
        body: JSON.stringify({ periodMonth: new Date().toISOString().slice(0, 7) + '-01' }),
      })
      setPayrollMessage(`Draft payroll berhasil dibuat (Run #${data.id})`)
      await loadPayrollRuns()
      await loadPayrollDetail(data.id)
      await loadDashboardData()
    } catch (err) {
      setPayrollMessage(err.message || 'Gagal menjalankan payroll')
    }
    setRunningPayroll(false)
  }

  const handleReviewRun = async () => {
    if (!selectedRunId) return
    try {
      const data = await api(`/payroll/runs/${selectedRunId}/review`, { method: 'POST' })
      setPayrollMessage(`Run #${data.id} berhasil di-review (menunggu approval Finance)`)
      await loadPayrollRuns()
      await loadPayrollDetail(selectedRunId)
    } catch (err) {
      setPayrollMessage(err.message || 'Gagal me-review payroll run')
    }
  }

  const handleApproveRun = async () => {
    if (!selectedRunId) return
    try {
      const data = await api(`/payroll/runs/${selectedRunId}/approve`, { method: 'POST' })
      setPayrollMessage(`Run #${data.id} berhasil di-approve oleh Finance`)
      await loadPayrollRuns()
      await loadPayrollDetail(selectedRunId)
    } catch (err) {
      setPayrollMessage(err.message || 'Gagal me-approve payroll run')
    }
  }

  const openRejectModal = (runId) => {
    const id = runId || selectedRunId
    if (!id) return
    setRejectTargetRunId(id)
    setRejectComment('')
    setShowRejectModal(true)
  }

  const closeRejectModal = () => {
    setShowRejectModal(false)
    setRejectComment('')
    setRejectTargetRunId(null)
  }

  const confirmReject = async () => {
    if (!rejectTargetRunId) return
    if (!rejectComment.trim()) {
      setPayrollMessage('Alasan reject wajib diisi')
      return
    }
    try {
      const data = await api(`/payroll/runs/${rejectTargetRunId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ comment: rejectComment.trim() }),
      })
      setPayrollMessage(`Run #${data.id} telah di-reject: ${rejectComment.trim()}`)
      closeRejectModal()
      await loadPayrollRuns()
      await loadPayrollDetail(data.id)
    } catch (err) {
      setPayrollMessage(err.message || 'Gagal me-reject payroll run')
    }
  }

  const handleFinalizeRun = async () => {
    if (!selectedRunId) return
    setFinalizingPayroll(true)
    setPayrollMessage('')
    try {
      const data = await api(`/payroll/runs/${selectedRunId}/finalize`, { method: 'POST' })
      setPayrollMessage(`Run #${data.id} berhasil difinalisasi`)
      await loadPayrollRuns()
      await loadPayrollDetail(selectedRunId)
      await loadDashboardData()
    } catch (err) {
      if (err.errors) {
        setPayrollMessage(`Validasi gagal: ${err.errors.join('; ')}`)
      } else {
        setPayrollMessage(err.message || 'Gagal finalize payroll run')
      }
    }
    setFinalizingPayroll(false)
  }

  const handleValidateRun = async () => {
    if (!selectedRunId) return
    try {
      const data = await api(`/payroll/runs/${selectedRunId}/validate`)
      if (data.valid) {
        setPayrollMessage('Validasi berhasil: tidak ada anomali')
      } else {
        setPayrollMessage(`Validasi gagal: ${data.errors.join('; ')}`)
      }
    } catch (err) {
      setPayrollMessage(err.message || 'Gagal memvalidasi payroll run')
    }
  }

  const handleDeleteDraftRun = async (runId) => {
    if (!runId) return
    if (!window.confirm(`Yakin ingin menghapus draft payroll run #${runId}? Tindakan ini tidak dapat dibatalkan.`)) return
    setPayrollMessage('')
    try {
      const data = await api(`/payroll/runs/${runId}`, { method: 'DELETE' })
      setPayrollMessage(data.message || `Draft payroll run #${runId} berhasil dihapus`)
      if (selectedRunId === runId) {
        setSelectedRunId(null)
        setPayrollDetail(null)
        setSelectedPayrollItemId(null)
      }
      await loadPayrollRuns()
      await loadDashboardData()
    } catch (err) {
      setPayrollMessage(err.message || 'Gagal menghapus draft payroll run')
    }
  }

  if (!token) {
    return <Login />
  }

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar${sidebarOpen ? '' : ' collapsed'}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo">H</div>
            <div className="brand-text">
              <h1>Cloud HRIS</h1>
              <p>Workspace Console</p>
            </div>
          </div>
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span className="toggle-icon">{sidebarOpen ? '\u2039' : '\u203A'}</span>
          </button>
        </div>

        <nav className="menu">
          <span className="menu-label">Main Menu</span>
          {roleMenus.map((menu) => (
            <button
              key={menu.key}
              className={`menu-item ${activePage === menu.key ? 'active' : ''}`}
              onClick={() => setActivePage(menu.key)}
            >
              {menu.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{employeeName ? employeeName.charAt(0).toUpperCase() : 'A'}</div>
            <div className="user-info">
              <strong>{employeeName || 'Administrator'}</strong>
              <p>{role || 'Administrator'}{department ? ` — ${department}` : ''}</p>
            </div>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="section-label">{roleMenus.find((menu) => menu.key === activePage)?.label}</p>
            <h2>Human Resource Information System (HRIS) Terpadu Berbasis Cloud</h2>
          </div>
        </header>

        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'karyawan' && ['HRD', 'Super Admin', 'System Admin'].includes(role) && <Karyawan />}
        {activePage === 'absensi' && ['HRD', 'Super Admin'].includes(role) && <Absensi />}
        {activePage === 'cuti' && ['HRD', 'Super Admin', 'Manager'].includes(role) && <Cuti />}
        {activePage === 'role' && ['Super Admin', 'System Admin'].includes(role) && <RoleManagement />}
        {activePage === 'slipgaji' && <SlipGaji />}
        {activePage === 'masterdata' && ['HRD', 'Super Admin', 'System Admin'].includes(role) && <MasterData />}
        {activePage === 'pengaturan' && ['HRD', 'Super Admin', 'System Admin'].includes(role) && <Pengaturan />}
        {activePage === 'payroll' && ['HRD', 'Finance', 'Super Admin'].includes(role) && (
          <FeaturePages
            activePage={activePage}
            report={report}
            role={role}
            canRunPayroll={canRunPayrollVal}
            canApproveFinance={canApproveFinanceVal}
            canReview={canReviewVal}
            onRunPayroll={handleRunPayroll}
            onFinalizeRun={handleFinalizeRun}
            onReviewRun={handleReviewRun}
            onApproveRun={handleApproveRun}
            onRequestReject={openRejectModal}
            onValidateRun={handleValidateRun}
            onDeleteDraftRun={handleDeleteDraftRun}
            onSelectRun={async (runId) => {
              setSelectedRunId(runId)
              await loadPayrollDetail(runId)
            }}
            payrollMessage={payrollMessage}
            runningPayroll={runningPayroll}
            finalizingPayroll={finalizingPayroll}
            payrollRuns={payrollRuns}
            selectedRunId={selectedRunId}
            payrollDetail={payrollDetail}
            selectedPayrollItemId={selectedPayrollItemId}
            onSelectPayrollItem={setSelectedPayrollItemId}
            payrollDetailSearch={payrollDetailSearch}
            onPayrollDetailSearchChange={setPayrollDetailSearch}
            salaryDistribution={salaryDistribution}
            leaveStats={leaveStats}
            loadingReports={loadingReports}
          />
        )}
        {activePage === 'laporan' && ['HRD', 'Finance', 'Super Admin', 'System Admin'].includes(role) && (
          <FeaturePages
            activePage={activePage}
            report={report}
            role={role}
            canRunPayroll={canRunPayrollVal}
            canApproveFinance={canApproveFinanceVal}
            canReview={canReviewVal}
            onRunPayroll={handleRunPayroll}
            onFinalizeRun={handleFinalizeRun}
            onReviewRun={handleReviewRun}
            onApproveRun={handleApproveRun}
            onRequestReject={openRejectModal}
            onValidateRun={handleValidateRun}
            onDeleteDraftRun={handleDeleteDraftRun}
            onSelectRun={async (runId) => {
              setSelectedRunId(runId)
              await loadPayrollDetail(runId)
            }}
            payrollMessage={payrollMessage}
            runningPayroll={runningPayroll}
            finalizingPayroll={finalizingPayroll}
            payrollRuns={payrollRuns}
            selectedRunId={selectedRunId}
            payrollDetail={payrollDetail}
            selectedPayrollItemId={selectedPayrollItemId}
            onSelectPayrollItem={setSelectedPayrollItemId}
            payrollDetailSearch={payrollDetailSearch}
            onPayrollDetailSearchChange={setPayrollDetailSearch}
            salaryDistribution={salaryDistribution}
            leaveStats={leaveStats}
            loadingReports={loadingReports}
          />
        )}
        {showRejectModal && (
          <RejectModal
            runId={selectedRunId}
            comment={rejectComment}
            onCommentChange={setRejectComment}
            onCancel={closeRejectModal}
            onConfirm={confirmReject}
          />
        )}
      </main>
    </div>
  )
}

function FeaturePages({
  activePage,
  report,
  role,
  canRunPayroll,
  canApproveFinance,
  canReview,
  onRunPayroll,
  onFinalizeRun,
  onReviewRun,
  onApproveRun,
  onRequestReject,
  onValidateRun,
  onSelectRun,
  onDeleteDraftRun,
  payrollMessage,
  runningPayroll,
  finalizingPayroll,
  payrollRuns,
  selectedRunId,
  payrollDetail,
  selectedPayrollItemId,
  onSelectPayrollItem,
  payrollDetailSearch,
  onPayrollDetailSearchChange,
  salaryDistribution,
  leaveStats,
  loadingReports,
}) {
  if (activePage === 'payroll') {
    const currentRun = payrollRuns.find((r) => r.id === selectedRunId)
    const runStatus = currentRun?.status || ''
    const filteredPayrollItems = payrollDetail
      ? payrollDetail.items.filter((item) => item.employee_name.toLowerCase().includes(payrollDetailSearch.toLowerCase()))
      : []

    const exportPayrollCsv = () => {
      if (!payrollDetail || filteredPayrollItems.length === 0) return
      const headers = ['Nama', 'Departemen', 'Gross', 'Potongan', 'Net']
      const rows = filteredPayrollItems.map((item) => [
        item.employee_name,
        item.department || '-',
        item.gross_amount,
        item.deduction_amount,
        item.net_amount,
      ])
      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
        .join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payroll-run-${payrollDetail.run.id}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    return (
      <section className="feature-layout payroll-layout">
        <>
          <article className="panel">
              <div className="panel-head">
                <h3>Payroll Management</h3>
                {canRunPayroll && (
                  <div className="payroll-actions">
                    <button className="primary-btn" disabled={runningPayroll} onClick={onRunPayroll}>
                      {runningPayroll ? 'Membuat draft...' : 'Generate Draft Run'}
                    </button>
                    {runStatus === 'draft' && canReview && (
                      <button className="primary-btn secondary-btn" onClick={onReviewRun}>
                        Submit Review
                      </button>
                    )}
                    {runStatus === 'reviewed' && canApproveFinance && (
                      <>
                        <button className="primary-btn" onClick={onApproveRun}>
                          Approve
                        </button>
                        <button className="small-btn cancel-btn" onClick={() => onRequestReject(selectedRunId)}>
                          Reject
                        </button>
                      </>
                    )}
                    {runStatus === 'approved' && canApproveFinance && (
                      <button
                        className="primary-btn"
                        disabled={finalizingPayroll}
                        onClick={onFinalizeRun}
                      >
                        {finalizingPayroll ? 'Finalizing...' : 'Finalize Run'}
                      </button>
                    )}
                    {selectedRunId && (
                      <button className="small-btn" onClick={onValidateRun}>
                        Validate
                      </button>
                    )}
                  </div>
                )}
              </div>
              <p>Total payroll bulan ini: {formatRupiah(report.payrollTotal)}</p>
              {payrollMessage ? <p className="message">{payrollMessage}</p> : null}
              {runStatus ? (
                <div className="quick-grid detail-summary" style={{ marginTop: 10 }}>
                  <div className="quick-card">
                    <span>Status Workflow</span>
                    <strong className={`status-badge status-${runStatus}`}>{runStatus}</strong>
                  </div>
                  {runStatus === 'draft' && <div className="quick-card"><span>Next Step</span><strong>HRD Submit Review</strong></div>}
                  {runStatus === 'reviewed' && <div className="quick-card"><span>Next Step</span><strong>Finance Approve</strong></div>}
                  {runStatus === 'approved' && <div className="quick-card"><span>Next Step</span><strong>Finance Finalize</strong></div>}
                  {runStatus === 'finalized' && <div className="quick-card"><span>Status</span><strong>Selesai</strong></div>}
                </div>
              ) : null}
            </article>

            <article className="panel">
              <h3>Daftar Payroll Run</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Periode</th>
                    <th>Status</th>
                    <th>Karyawan</th>
                    <th>Total Net</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRuns.map((run) => (
                    <tr key={run.id}>
                      <td>#{run.id}</td>
                      <td>{String(run.period_month).slice(0, 10)}</td>
                      <td>
                        <span className={`status-badge status-${run.status}`}>{run.status}</span>
                      </td>
                      <td>{run.employee_count}</td>
                      <td>{formatRupiah(run.total_net)}</td>
                      <td>
                        <button className="small-btn" onClick={() => onSelectRun(run.id)}>
                          Detail
                        </button>
                        {run.status === 'draft' && canRunPayroll && (
                          <button
                            className="small-btn cancel-btn"
                            style={{ marginLeft: '4px' }}
                            onClick={() => onDeleteDraftRun(run.id)}
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <article className="panel">
              <h3>Detail Run {selectedRunId ? `#${selectedRunId}` : ''}</h3>
              {!payrollDetail ? (
                <p>Pilih run untuk melihat detail.</p>
              ) : (
                <>
                  <div className="quick-grid detail-summary">
                    <div className="quick-card">
                      <span>Periode</span>
                      <strong>{String(payrollDetail.run.period_month).slice(0, 10)}</strong>
                    </div>
                    <div className="quick-card">
                      <span>Status</span>
                      <strong className={`status-badge status-${payrollDetail.run.status}`}>
                        {payrollDetail.run.status}
                      </strong>
                    </div>
                    <div className="quick-card">
                      <span>Total Net</span>
                      <strong>{formatRupiah(payrollDetail.run.total_net)}</strong>
                    </div>
                  </div>

                  <div className="detail-toolbar">
                    <input
                      className="detail-search"
                      placeholder="Cari nama karyawan..."
                      value={payrollDetailSearch}
                      onChange={(event) => onPayrollDetailSearchChange(event.target.value)}
                    />
                    <button className="small-btn" onClick={exportPayrollCsv}>
                      Export CSV
                    </button>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Karyawan</th>
                        <th>Departemen</th>
                        <th>Gross</th>
                        <th>Potongan</th>
                        <th>Net</th>
                        <th>Komponen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayrollItems.map((item) => (
                        <tr
                          key={item.id}
                          className={selectedPayrollItemId === item.id ? 'editing-row' : ''}
                        >
                          <td>{item.employee_name}</td>
                          <td>{item.department || '-'}</td>
                          <td>{formatRupiah(item.gross_amount)}</td>
                          <td>{formatRupiah(item.deduction_amount)}</td>
                          <td className={Number(item.net_amount) < 0 ? 'error' : ''}>
                            {formatRupiah(item.net_amount)}
                          </td>
                          <td>
                            <button className="small-btn" onClick={() => onSelectPayrollItem(item.id)}>
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <PayrollItemBreakdown
                    item={filteredPayrollItems.find((item) => item.id === selectedPayrollItemId)}
                  />
                </>
              )}
            </article>
          </>
      </section>
    )
  }

  if (activePage === 'laporan') {
    const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#6C5CE7', '#00B894', '#FDCB6E']
    
    return (
      <section className="feature-layout">
        <article className="panel">
          <h3>Laporan & Analitik HR</h3>
          
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '8px' }}>
            <button 
              className="primary-btn" 
              onClick={() => exportReportsToPDF(report, salaryDistribution, leaveStats)}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Export PDF
            </button>
          </div>
          
          {/* Summary Cards */}
          <div className="quick-grid" style={{ marginBottom: '2rem' }}>
            <div className="quick-card">
              <span>Total Karyawan</span>
              <strong>{report.totalEmployees}</strong>
            </div>
            <div className="quick-card">
              <span>Kehadiran Hari Ini</span>
              <strong>{report.attendanceRate}%</strong>
            </div>
            <div className="quick-card">
              <span>Cuti Menunggu</span>
              <strong>{report.pendingLeave}</strong>
            </div>
            <div className="quick-card">
              <span>Total Payroll (Bulan)</span>
              <strong>{formatRupiah(report.payrollTotal)}</strong>
            </div>
          </div>

          {loadingReports ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading reports...</p>
          ) : (
            <>
              {/* Charts Section */}
              <div className="charts-grid">
                {/* Salary Distribution by Department - Pie Chart */}
                <div className="chart-container">
                  <h4>Distribusi Gaji per Departemen</h4>
                  {salaryDistribution.byDepartment?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={salaryDistribution.byDepartment}
                          dataKey="total_salary"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {salaryDistribution.byDepartment.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatRupiah(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>No data available</p>
                  )}
                </div>

                {/* Leave by Type - Bar Chart */}
                <div className="chart-container">
                  <h4>Jumlah Cuti per Tipe</h4>
                  {leaveStats.byType?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={leaveStats.byType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#8884D8" />
                        <Bar dataKey="approved" fill="#82CA9D" />
                        <Bar dataKey="rejected" fill="#FFA07A" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>No data available</p>
                  )}
                </div>

                {/* Attendance Trend - Line Chart */}
                <div className="chart-container">
                  <h4>Tren Kehadiran (7 Hari)</h4>
                  {report.attendanceTrend?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={report.attendanceTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week_start" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="attendance_rate" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>No data available</p>
                  )}
                </div>

                {/* Payroll Cost Breakdown - Bar Chart */}
                <div className="chart-container">
                  <h4>Biaya Payroll per Departemen</h4>
                  {report.payrollCostBreakdown?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={report.payrollCostBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatRupiah(value)} />
                        <Legend />
                        <Bar dataKey="total_gross" fill="#8884D8" name="Total Gaji Bruto" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>No data available</p>
                  )}
                </div>

                {/* Salary by Position - Bar Chart */}
                <div className="chart-container">
                  <h4>Distribusi Gaji per Posisi</h4>
                  {salaryDistribution.byPosition?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salaryDistribution.byPosition}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatRupiah(value)} />
                        <Bar dataKey="total_salary" fill="#6C5CE7" name="Total Gaji" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>No data available</p>
                  )}
                </div>

                {/* Leave Status Summary - Bar Chart */}
                <div className="chart-container">
                  <h4>Status Cuti Bulanan (3 Bulan Terakhir)</h4>
                  {leaveStats.monthlySummary?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={leaveStats.monthlySummary}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#8884D8" name="Total" />
                        <Bar dataKey="approved" fill="#82CA9D" name="Disetujui" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>No data available</p>
                  )}
                </div>
              </div>

              {/* Detailed Tables */}
              <div style={{ marginTop: '2rem' }}>
                <h4>Detail Distribusi Gaji</h4>
                <table style={{ width: '100%', marginTop: '1rem' }}>
                  <thead>
                    <tr>
                      <th>Departemen</th>
                      <th>Jumlah Karyawan</th>
                      <th>Total Gaji</th>
                      <th>Rata-rata Gaji</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryDistribution.byDepartment?.map((dept) => (
                      <tr key={dept.label}>
                        <td>{dept.label}</td>
                        <td>{dept.count}</td>
                        <td>{formatRupiah(dept.total_salary)}</td>
                        <td>{formatRupiah(dept.avg_salary)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </article>
      </section>
    )
  }

  return (
    <section className="feature-layout">
      <article className="panel">
        <h3>Role Management</h3>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Akses Modul</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Super Admin</td>
              <td>Semua Modul</td>
              <td>Aktif</td>
            </tr>
            <tr>
              <td>HRD</td>
              <td>Karyawan, Absensi, Cuti, Payroll, Laporan</td>
              <td>{role}</td>
            </tr>
            <tr>
              <td>Manager</td>
              <td>Approval Cuti dan Monitoring Tim</td>
              <td>Aktif</td>
            </tr>
            <tr>
              <td>Employee</td>
              <td>Self-service Profile dan Slip Gaji</td>
              <td>Aktif</td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>
  )
}

function PayrollItemBreakdown({ item }) {
  if (!item) return null

  return (
    <div className="component-box">
      <h4>Komponen Gaji - {item.employee_name}</h4>
      {item.components?.length ? (
        <table>
          <thead>
            <tr>
              <th>Nama Komponen</th>
              <th>Tipe</th>
              <th>Nominal</th>
            </tr>
          </thead>
          <tbody>
            {item.components.map((component) => (
              <tr key={component.id}>
                <td>{component.component_name_snapshot}</td>
                <td>{component.component_type}</td>
                <td>{formatRupiah(component.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Belum ada komponen payroll untuk item ini.</p>
      )}
    </div>
  )
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0)
}

function RejectModal({ runId, comment, onCommentChange, onCancel, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <h3>Reject Payroll Run #{runId}</h3>
        <p style={{ fontSize: 14, color: '#6471a4', marginBottom: 12 }}>
          Tulis alasan penolakan. Alasan ini akan tercatat di audit log.
        </p>
        <textarea
          rows={4}
          placeholder="Contoh: komponen tunjangan belum diverifikasi..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          style={{ width: '100%', resize: 'vertical', padding: 8, borderRadius: 6, border: '1px solid #d6dbe8' }}
        />
        <div className="modal-actions">
          <button type="button" className="small-btn cancel-btn" onClick={onCancel}>Batal</button>
          <button type="button" className="primary-btn" onClick={onConfirm}>Kirim Reject</button>
        </div>
      </div>
    </div>
  )
}

function exportReportsToPDF(report, salaryDistribution, leaveStats) {
  // Tambahkan logo ke halaman yang diberikan
  function addPageWithLogoApp(doc) {
    doc.addImage(LOGO_BASE64, 'PNG', 15, 10, 20, 20)
  }

  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPos = margin + 25

  // Logo di halaman pertama
  addPageWithLogoApp(doc)

  // Title
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text('Laporan HR & Analitik', margin, yPos)
  yPos += 10

  // Date
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, margin, yPos)
  yPos += 15

  // Summary Section
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Ringkasan', margin, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  const summaryData = [
    ['Metrik', 'Nilai'],
    ['Total Karyawan', `${report.totalEmployees}`],
    ['Kehadiran Hari Ini', `${report.attendanceRate}%`],
    ['Cuti Menunggu Approval', `${report.pendingLeave}`],
    ['Total Payroll Bulan Ini', formatRupiah(report.payrollTotal)],
  ]
  autoTable(doc, {
    startY: yPos,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: [31, 49, 113], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { textColor: [29, 35, 64] },
    alternateRowStyles: { fillColor: [240, 243, 249] },
  })
  yPos = doc.lastAutoTable.finalY + 12

  // Salary Distribution by Department
  if (salaryDistribution.byDepartment && salaryDistribution.byDepartment.length > 0) {
    if (yPos > pageHeight - 40) {
      doc.addPage()
      addPageWithLogoApp(doc)
      yPos = margin + 25
    }
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Distribusi Gaji per Departemen', margin, yPos)
    yPos += 8

    const departmentData = [
      ['Departemen', 'Jumlah Karyawan', 'Total Gaji', 'Rata-rata Gaji'],
      ...salaryDistribution.byDepartment.map((dept) => [
        dept.label,
        `${dept.count}`,
        formatRupiah(dept.total_salary),
        formatRupiah(dept.avg_salary),
      ]),
    ]
    autoTable(doc, {
      startY: yPos,
      head: [departmentData[0]],
      body: departmentData.slice(1),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [31, 49, 113], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { textColor: [29, 35, 64] },
      alternateRowStyles: { fillColor: [240, 243, 249] },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
      },
    })
    yPos = doc.lastAutoTable.finalY + 12
  }

  // Leave Statistics by Type
  if (leaveStats.byType && leaveStats.byType.length > 0) {
    if (yPos > pageHeight - 40) {
      doc.addPage()
      addPageWithLogoApp(doc)
      yPos = margin + 25
    }
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Statistik Cuti per Tipe', margin, yPos)
    yPos += 8

    const leaveTypeData = [
      ['Tipe Cuti', 'Total', 'Disetujui', 'Ditolak', 'Pending'],
      ...leaveStats.byType.map((leave) => [
        leave.label,
        `${leave.total}`,
        `${leave.approved}`,
        `${leave.rejected}`,
        `${leave.pending}`,
      ]),
    ]
    autoTable(doc, {
      startY: yPos,
      head: [leaveTypeData[0]],
      body: leaveTypeData.slice(1),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [31, 49, 113], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { textColor: [29, 35, 64] },
      alternateRowStyles: { fillColor: [240, 243, 249] },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
      },
    })
    yPos = doc.lastAutoTable.finalY + 12
  }

  // Payroll Cost Breakdown
  if (report.payrollCostBreakdown && report.payrollCostBreakdown.length > 0) {
    if (yPos > pageHeight - 40) {
      doc.addPage()
      addPageWithLogoApp(doc)
      yPos = margin + 25
    }
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Biaya Payroll per Departemen', margin, yPos)
    yPos += 8

    const payrollData = [
      ['Departemen', 'Jumlah Karyawan', 'Total Gaji Bruto'],
      ...report.payrollCostBreakdown.map((pb) => [
        pb.department || '-',
        `${pb.employee_count || 0}`,
        formatRupiah(pb.total_gross || 0),
      ]),
    ]
    autoTable(doc, {
      startY: yPos,
      head: [payrollData[0]],
      body: payrollData.slice(1),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [31, 49, 113], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { textColor: [29, 35, 64] },
      alternateRowStyles: { fillColor: [240, 243, 249] },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
      },
    })
  }

  const filename = `Laporan_HR_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

export default App
