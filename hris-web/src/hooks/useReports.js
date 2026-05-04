import { useState, useEffect } from 'react'
import { api } from '../api/client'

export function useReports() {
  const [report, setReport] = useState({
    totalEmployees: 0,
    attendanceRate: 0,
    pendingLeave: 0,
    payrollTotal: 0,
    payrollCostBreakdown: [],
    attendanceTrend: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    const ctrl = new AbortController()
    ;(async () => {
      setLoading(true)
      try {
        const data = await api('/reports/dashboard', { signal: ctrl.signal })
        if (!ignore) {
          setReport(data)
          setError(null)
        }
      } catch (err) {
        if (!ignore && err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
      ctrl.abort()
    }
  }, [])

  return { report, loading, error }
}

export function useSalaryDistribution() {
  const [salaryDistribution, setSalaryDistribution] = useState({
    byDepartment: [],
    byPosition: [],
    byRole: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    const ctrl = new AbortController()
    ;(async () => {
      setLoading(true)
      try {
        const data = await api('/reports/salary-distribution', { signal: ctrl.signal })
        if (!ignore) {
          setSalaryDistribution(data)
          setError(null)
        }
      } catch (err) {
        if (!ignore && err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
      ctrl.abort()
    }
  }, [])

  return { salaryDistribution, loading, error }
}

export function useLeaveStats() {
  const [leaveStats, setLeaveStats] = useState({
    byType: [],
    byStatus: [],
    monthlySummary: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    const ctrl = new AbortController()
    ;(async () => {
      setLoading(true)
      try {
        const data = await api('/reports/leave-stats', { signal: ctrl.signal })
        if (!ignore) {
          setLeaveStats(data)
          setError(null)
        }
      } catch (err) {
        if (!ignore && err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
      ctrl.abort()
    }
  }, [])

  return { leaveStats, loading, error }
}