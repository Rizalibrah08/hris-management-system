import { useState, useEffect, useMemo } from 'react'
import { api } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import '../styles/global.css'
import '../styles/cuti.css'

export default function Cuti() {
  const { role } = useAuth()
  const [leaveData, setLeaveData] = useState([])
  const [report, setReport] = useState({
    pendingLeave: 0,
  })
  const [loading, setLoading] = useState(false)

  const canApprove = ['HRD', 'Finance', 'Super Admin', 'Manager'].includes(role)

  useEffect(() => {
    const ctrl = new AbortController()
    const fetchData = async () => {
      setLoading(true)
      try {
        const [leaveResp, reportData] = await Promise.all([
          api('/leave', { signal: ctrl.signal }),
          api('/reports/dashboard', { signal: ctrl.signal }),
        ])
        setLeaveData(leaveResp)
        setReport(reportData)
      } catch {
        setLeaveData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => ctrl.abort()
  }, [])

  const approvedCount = useMemo(() => leaveData.filter((l) => l.status === 'Approved').length, [leaveData])
  const rejectedCount = useMemo(() => leaveData.filter((l) => l.status === 'Rejected').length, [leaveData])

  const handleApprove = async (id) => {
    try {
      await api('/leave/approve', {
        method: 'PUT',
        body: JSON.stringify({ id, status: 'Approved' }),
      })
      // Refresh data
      const leaveResp = await api('/leave')
      setLeaveData(leaveResp)
    } catch (err) {
      console.error('Failed to approve leave:', err)
    }
  }

  const handleReject = async (id) => {
    try {
      await api('/leave/approve', {
        method: 'PUT',
        body: JSON.stringify({ id, status: 'Rejected' }),
      })
      // Refresh data
      const leaveResp = await api('/leave')
      setLeaveData(leaveResp)
    } catch (err) {
      console.error('Failed to reject leave:', err)
    }
  }

  return (
    <section className="feature-layout">
      <article className="panel">
        <h3>Leave Management</h3>
        <div className="quick-grid">
          <div className="quick-card">
            <span>Pending Approval</span>
            <strong>{report.pendingLeave}</strong>
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
      <article className="panel">
        <h3>Daftar Pengajuan Cuti & Izin</h3>
        {loading ? <p>Memuat data...</p> : null}
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
              {canApprove && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {leaveData.map((l) => (
              <tr key={l.id}>
                <td>{l.employee_name}</td>
                <td>{l.department || '-'}</td>
                <td>{l.leave_type}</td>
                <td>{l.start_date?.slice(0, 10)}</td>
                <td>{l.end_date?.slice(0, 10)}</td>
                <td>{l.reason || '-'}</td>
                <td>
                  <span className={`status ${l.status.toLowerCase()}`}>{l.status}</span>
                </td>
                {canApprove && l.status === 'Pending' && (
                  <td>
                    <button className="small-btn" onClick={() => handleApprove(l.id)}>
                      Approve
                    </button>
                    <button className="small-btn cancel-btn" onClick={() => handleReject(l.id)}>
                      Reject
                    </button>
                  </td>
                )}
                {canApprove && l.status !== 'Pending' && <td>-</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  )
}
