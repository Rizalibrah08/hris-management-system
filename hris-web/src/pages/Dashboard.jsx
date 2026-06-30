import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useReports } from '../hooks/useReports'
import { api } from '../api/client'
import { formatRupiah } from '../utils/formatters'
import MetricsGrid from '../components/MetricsGrid'
import '../styles/global.css'
import '../styles/dashboard.css'

export default function Dashboard() {
  const { role } = useAuth()
  const isManager = role === 'Manager'

  const { report, loading: loadingReports } = useReports()
  const [attendanceData, setAttendanceData] = useState([])
  const [leaveData, setLeaveData] = useState([])
  const [myPayslips, setMyPayslips] = useState([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [loadingLeave, setLoadingLeave] = useState(false)
  const [loadingPayslips, setLoadingPayslips] = useState(false)

  useEffect(() => {
    if (isManager) {
      let ignore = false
      const ctrl = new AbortController()
      ;(async () => {
        setLoadingLeave(true)
        setLoadingPayslips(true)
        try {
          const [leave, slips] = await Promise.all([
            api('/leave', { signal: ctrl.signal }),
            api('/payslips/my', { signal: ctrl.signal }),
          ])
          if (!ignore) {
            setLeaveData(Array.isArray(leave) ? leave : [])
            setMyPayslips(Array.isArray(slips) ? slips : [])
          }
        } catch {
          if (!ignore) {
            setLeaveData([])
            setMyPayslips([])
          }
        } finally {
          if (!ignore) {
            setLoadingLeave(false)
            setLoadingPayslips(false)
          }
        }
      })()
      return () => {
        ignore = true
        ctrl.abort()
      }
    }

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
  }, [isManager])

  const metrics = useMemo(
    () => isManager
      ? [
        { label: 'Cuti Pending Approval', value: String(leaveData.filter((l) => l.status === 'Pending').length), note: 'Perlu aksi Anda', trend: 'Perlu aksi' },
        { label: 'Cuti Disetujui Bulan Ini', value: String(leaveData.filter((l) => l.status === 'Approved').length), note: 'Sudah diproses', trend: 'Terkendali' },
        { label: 'Slip Gaji Saya', value: String(myPayslips.length), note: 'Tahun berjalan', trend: 'Aktif' },
      ]
      : [
        { label: 'Total Karyawan', value: String(report.totalEmployees), note: 'Data realtime', trend: '+12%' },
        { label: 'Kehadiran Hari Ini', value: `${report.attendanceRate}%`, note: 'Target 95%', trend: 'Stabil' },
        { label: 'Cuti Menunggu', value: String(report.pendingLeave), note: 'Perlu approval', trend: 'Perlu aksi' },
        { label: 'Total Payroll', value: formatRupiah(report.payrollTotal), note: 'Periode bulan ini', trend: 'Terkendali' },
      ],
    [isManager, report, leaveData, myPayslips]
  )

  const pendingLeaves = useMemo(() => leaveData.filter((l) => l.status === 'Pending'), [leaveData])
  const recentLeaves = useMemo(() => leaveData.slice(0, 5), [leaveData])
  const recentPayslips = useMemo(() => myPayslips.slice(0, 4), [myPayslips])

  const attendanceRows = useMemo(() => {
    return attendanceData.map((a) => ({
      name: a.employee_name,
      dept: a.department || '-',
      clockIn: a.clock_in ? new Date(a.clock_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
      clockOut: a.clock_out ? new Date(a.clock_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Belum',
      status: a.status || 'Aktif',
    }))
  }, [attendanceData])

  if (isManager) {
    const isLoading = loadingLeave || loadingPayslips
    return (
      <div className="dashboard-page">
        <MetricsGrid metrics={metrics} />

        <section className="main-grid">
          <article className="panel">
            <div className="panel-head">
              <h3>Cuti Menunggu Approval</h3>
            </div>
            {isLoading ? (
              <p>Memuat data...</p>
            ) : pendingLeaves.length === 0 ? (
              <p style={{ color: '#6471a4', fontSize: 14 }}>Tidak ada cuti yang menunggu approval.</p>
            ) : (
              <ul className="timeline">
                {pendingLeaves.slice(0, 6).map((l) => (
                  <li key={l.id}>
                    <strong>{l.leave_type} - {l.employee_name}</strong>
                    <p>{l.start_date?.slice(0, 10)} s/d {l.end_date?.slice(0, 10)} &middot; <span className="status pending">{l.status}</span></p>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="panel highlight">
            <h3>Slip Gaji Terbaru</h3>
            {isLoading ? (
              <p>Memuat data...</p>
            ) : recentPayslips.length === 0 ? (
              <p style={{ color: '#6471a4', fontSize: 14 }}>Belum ada slip gaji.</p>
            ) : (
              <ul className="timeline">
                {recentPayslips.map((s) => (
                  <li key={s.id}>
                    <strong>{s.period_month?.slice(0, 10) || s.run_id}</strong>
                    <p>{formatRupiah(s.net_amount || s.total_net)} &middot; <span className="status approved">Final</span></p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </div>
    )
  }

  const isLoading = loadingReports || loadingAttendance || loadingLeave

  return (
    <div className="dashboard-page">
      <MetricsGrid metrics={metrics} />

      <section className="main-grid">
        <article className="panel table-panel">
          <div className="panel-head">
            <h3>Monitoring Kehadiran Real-time</h3>
            <button className="small-btn">Lihat Semua</button>
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
                  <th>Clock Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.dept}</td>
                    <td>{row.clockIn}</td>
                    <td className={row.clockOut === 'Belum' ? 'muted' : ''}>{row.clockOut}</td>
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
