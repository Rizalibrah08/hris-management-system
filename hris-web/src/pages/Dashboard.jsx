import { useState, useEffect, useMemo } from 'react'
import { useReports } from '../hooks/useReports'
import { api } from '../api/client'
import { formatRupiah } from '../utils/formatters'
import MetricsGrid from '../components/MetricsGrid'
import '../styles/global.css'
import '../styles/dashboard.css'

export default function Dashboard() {
  const { report, loading: loadingReports } = useReports()
  const [attendanceData, setAttendanceData] = useState([])
  const [leaveData, setLeaveData] = useState([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [loadingLeave, setLoadingLeave] = useState(false)

  useEffect(() => {
    let ignore = false
    const ctrl = new AbortController()
    ;(async () => {
      setLoadingAttendance(true)
      setLoadingLeave(true)
      try {
        const [attData, leave] = await Promise.all([
          api('/attendance/today', { signal: ctrl.signal }),
          api('/leave', { signal: ctrl.signal }),
        ])
        if (!ignore) {
          setAttendanceData(attData)
          setLeaveData(leave)
        }
      } catch {
        if (!ignore) {
          setAttendanceData([])
          setLeaveData([])
        }
      } finally {
        if (!ignore) {
          setLoadingAttendance(false)
          setLoadingLeave(false)
        }
      }
    })()
    return () => {
      ignore = true
      ctrl.abort()
    }
  }, [])

  const metrics = useMemo(
    () => [
      { label: 'Total Karyawan', value: String(report.totalEmployees), note: 'Data realtime', trend: '+12%' },
      { label: 'Kehadiran Hari Ini', value: `${report.attendanceRate}%`, note: 'Target 95%', trend: 'Stabil' },
      { label: 'Cuti Menunggu', value: String(report.pendingLeave), note: 'Perlu approval', trend: 'Perlu aksi' },
      { label: 'Total Payroll', value: formatRupiah(report.payrollTotal), note: 'Periode bulan ini', trend: 'Terkendali' },
    ],
    [report]
  )

  const attendanceRows = useMemo(() => {
    if (attendanceData.length > 0) {
      return attendanceData.map((a) => ({
        name: a.employee_name,
        dept: a.department || '-',
        clockIn: a.clock_in ? new Date(a.clock_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        clockOut: a.clock_out ? new Date(a.clock_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        status: a.status || 'Aktif',
      }))
    }
    return [
      { name: 'Aditia Pratama', dept: 'Engineering', clockIn: '07:55', clockOut: '17:05', status: 'Aktif' },
      { name: 'Nadia Putri', dept: 'HRD', clockIn: '08:10', clockOut: '17:20', status: 'Aktif' },
      { name: 'Rizky Maulana', dept: 'Finance', clockIn: '08:22', clockOut: '17:15', status: 'Aktif' },
      { name: 'Salsa Wijaya', dept: 'Marketing', clockIn: '09:01', clockOut: '17:30', status: 'Terlambat' },
      { name: 'Budi Santoso', dept: 'Operations', clockIn: '07:50', clockOut: '17:00', status: 'Aktif' },
      { name: 'Intan Lestari', dept: 'Engineering', clockIn: '08:05', clockOut: '-', status: 'Aktif' },
      { name: 'Dini Prameswari', dept: 'HRD', clockIn: '08:00', clockOut: '17:10', status: 'Aktif' },
      { name: 'Maya Sari', dept: 'Finance', clockIn: '07:45', clockOut: '17:00', status: 'Aktif' },
    ]
  }, [attendanceData])

  const pendingLeaves = useMemo(() => leaveData.filter((l) => l.status === 'Pending'), [leaveData])
  const recentLeaves = useMemo(() => leaveData.slice(0, 5), [leaveData])

  const isLoading = loadingReports || loadingAttendance || loadingLeave

  return (
    <div className="dashboard-page">
      <MetricsGrid metrics={metrics} />

      <section className="main-grid">
        <article className="panel table-panel">
          <div className="panel-head">
            <h3>Monitoring Kehadiran Real-time</h3>
            <button>Lihat Semua</button>
          </div>
          {isLoading ? (
            <p>Memuat data...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Departemen</th>
                  <th>Clock In</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.dept}</td>
                    <td>{row.clockIn}</td>
                    <td>
                      <span className={`status ${row.status.toLowerCase()}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>

        <article className="panel">
          <h3>Pengajuan Cuti & Izin</h3>
          {isLoading ? (
            <p>Memuat data...</p>
          ) : pendingLeaves.length === 0 && recentLeaves.length === 0 ? (
            <p style={{ color: '#6471a4', fontSize: 14 }}>Belum ada pengajuan cuti.</p>
          ) : (
            <ul className="timeline">
              {pendingLeaves.slice(0, 4).map((l) => (
                <li key={l.id}>
                  <strong>{l.leave_type} - {l.employee_name}</strong>
                  <p>{l.reason || 'Tanpa keterangan'} &middot; <span className="status pending">{l.status}</span></p>
                </li>
              ))}
              {pendingLeaves.length === 0 && recentLeaves.slice(0, 3).map((l) => (
                <li key={l.id}>
                  <strong>{l.leave_type} - {l.employee_name}</strong>
                  <p>{l.start_date?.slice(0, 10)} s/d {l.end_date?.slice(0, 10)} &middot; <span className={`status ${l.status.toLowerCase()}`}>{l.status}</span></p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="panel highlight">
          <h3>Payroll Basic (Bulan Ini)</h3>
          <p>Total Penggajian</p>
          <strong>{formatRupiah(report.payrollTotal)}</strong>
          <div className="payroll-kpis">
            <div>
              <span>Karyawan Aktif</span>
              <b>{report.totalEmployees}</b>
            </div>
            <div>
              <span>Cuti Pending</span>
              <b>{report.pendingLeave}</b>
            </div>
            <div>
              <span>Payslip Terbit</span>
              <b>{report.totalEmployees}</b>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}