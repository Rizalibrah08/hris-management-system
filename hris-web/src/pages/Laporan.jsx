import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { useReports, useSalaryDistribution, useLeaveStats } from '../hooks/useReports'
import { COLORS } from '../utils/constants'
import { exportReportsToPDF } from '../utils/pdfExport'
import { formatRupiah } from '../utils/formatters'
import '../styles/global.css'
import '../styles/laporan.css'

export default function Laporan() {
  const { report, loading: reportLoading } = useReports()
  const { salaryDistribution, loading: salaryLoading } = useSalaryDistribution()
  const { leaveStats, loading: leaveLoading } = useLeaveStats()
  
  const loadingReports = reportLoading || salaryLoading || leaveLoading

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

              {/* Salary by Position - Pie Chart */}
              <div className="chart-container">
                <h4>Distribusi Gaji per Posisi</h4>
                {salaryDistribution.byPosition?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={salaryDistribution.byPosition}
                        dataKey="total_salary"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {salaryDistribution.byPosition.map((_, idx) => (
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
