import { useState, useEffect, useMemo } from 'react'
import { api } from '../api/client'
import '../styles/global.css'
import '../styles/absensi.css'

function parseGps(gps) {
  if (!gps) return null
  const parts = gps.split(',').map((s) => Number(s.trim()))
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null
  return { lat: parts[0], lng: parts[1] }
}

function formatGps(gps) {
  const coords = parseGps(gps)
  if (!coords) return '-'
  return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
}

export default function Absensi() {
  const [attendanceData, setAttendanceData] = useState([])
  const [report, setReport] = useState({ attendanceRate: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    const fetchData = async () => {
      setLoading(true)
      try {
        const [attData, reportData] = await Promise.all([
          api('/attendance/today', { signal: ctrl.signal }),
          api('/reports/dashboard', { signal: ctrl.signal }),
        ])
        setAttendanceData(attData)
        setReport(reportData)
      } catch {
        setAttendanceData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => ctrl.abort()
  }, [])

  const attendanceRows = useMemo(() => {
    if (attendanceData.length > 0) {
      return attendanceData.map((a) => ({
        name: a.employee_name,
        dept: a.department || '-',
        clockIn: a.clock_in
          ? new Date(a.clock_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '-',
        clockOut: a.clock_out
          ? new Date(a.clock_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : 'Belum',
        gps: a.gps_location,
        gpsDisplay: formatGps(a.gps_location),
        hasGps: !!parseGps(a.gps_location),
        status: a.status || 'Aktif',
      }))
    }
    return [
      { name: 'Aditia Pratama', dept: 'Engineering', clockIn: '07:55', clockOut: '17:05', gpsDisplay: '-', hasGps: false, status: 'Aktif' },
      { name: 'Nadia Putri', dept: 'HRD', clockIn: '08:10', clockOut: '17:20', gpsDisplay: '-', hasGps: false, status: 'Aktif' },
      { name: 'Rizky Maulana', dept: 'Finance', clockIn: '08:22', clockOut: '17:15', gpsDisplay: '-', hasGps: false, status: 'Aktif' },
      { name: 'Salsa Wijaya', dept: 'Marketing', clockIn: '09:01', clockOut: '17:30', gpsDisplay: '-', hasGps: false, status: 'Terlambat' },
      { name: 'Budi Santoso', dept: 'Operations', clockIn: '07:50', clockOut: '17:00', gpsDisplay: '-', hasGps: false, status: 'Aktif' },
      { name: 'Intan Lestari', dept: 'Engineering', clockIn: '08:05', clockOut: 'Belum', gpsDisplay: '-', hasGps: false, status: 'Aktif' },
      { name: 'Dini Prameswari', dept: 'HRD', clockIn: '08:00', clockOut: '17:10', gpsDisplay: '-', hasGps: false, status: 'Aktif' },
      { name: 'Maya Sari', dept: 'Finance', clockIn: '07:45', clockOut: '17:00', gpsDisplay: '-', hasGps: false, status: 'Aktif' },
    ]
  }, [attendanceData])

  const lateCount = attendanceRows.filter((r) => r.status === 'Terlambat').length
  const aktifCount = attendanceRows.filter((r) => r.status === 'Aktif').length

  return (
    <section className="feature-layout">
      <article className="panel">
        <h3>Absensi Digital (GPS + Selfie)</h3>
        <div className="quick-grid">
          <div className="quick-card">
            <span>Kehadiran Hari Ini</span>
            <strong>{report.attendanceRate}%</strong>
          </div>
          <div className="quick-card">
            <span>Hadir Tepat Waktu</span>
            <strong>{aktifCount} orang</strong>
          </div>
          <div className="quick-card">
            <span>Terlambat</span>
            <strong>{lateCount} orang</strong>
          </div>
        </div>
      </article>

      <article className="panel">
        <h3>Log Kehadiran Hari Ini</h3>
        {loading ? <p>Memuat data...</p> : null}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Departemen</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Lokasi GPS</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.name}</td>
                  <td>{row.dept}</td>
                  <td>{row.clockIn}</td>
                  <td className={row.clockOut === 'Belum' ? 'muted' : ''}>{row.clockOut}</td>
                  <td>
                    {row.hasGps ? (
                      <span className="gps-badge valid">{row.gpsDisplay}</span>
                    ) : (
                      <span className="gps-badge none">{row.gpsDisplay}</span>
                    )}
                  </td>
                  <td>
                    <span className={`status ${row.status.toLowerCase()}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
