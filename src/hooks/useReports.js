import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import {
  REPORTS_DASHBOARD,
  REPORTS_SALARY_DISTRIBUTION,
  REPORTS_LEAVE_STATS,
} from '../api/endpoints.js'

export function useReports() {
  const [report, setReport] = useState(null)
  const [salaryDistribution, setSalaryDistribution] = useState({ byDepartment: [], byPosition: [], byRole: [] })
  const [leaveStats, setLeaveStats] = useState({ byType: [], byStatus: [], monthlySummary: [] })
  const [loadingReports, setLoadingReports] = useState(false)

  async function fetchDashboardData() {
    try {
      const data = await api(REPORTS_DASHBOARD)
      setReport(data)
    } catch {
      // ignore
    }
  }

  async function fetchSalaryDistribution() {
    try {
      const data = await api(REPORTS_SALARY_DISTRIBUTION)
      setSalaryDistribution(data)
    } catch {
      setSalaryDistribution({ byDepartment: [], byPosition: [], byRole: [] })
    }
  }

  async function fetchLeaveStats() {
    try {
      const data = await api(REPORTS_LEAVE_STATS)
      setLeaveStats(data)
    } catch {
      setLeaveStats({ byType: [], byStatus: [], monthlySummary: [] })
    }
  }

  useEffect(() => {
    // Optional initial fetchs could be triggered by token/route in real app
  }, [])

  return {
    report,
    salaryDistribution,
    leaveStats,
    loadingReports,
    fetchDashboardData,
    fetchSalaryDistribution,
    fetchLeaveStats,
    setReport,
    setSalaryDistribution,
    setLeaveStats,
  }
}
