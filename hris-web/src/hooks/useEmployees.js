import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchEmployees = useCallback(async (signal) => {
    setLoading(true)
    try {
      const data = await api('/employees', { signal })
      setEmployees(data)
      setError(null)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    const ctrl = new AbortController()
    // Use async IIFE to properly handle async data fetching
    ;(async () => {
      setLoading(true)
      try {
        const data = await api('/employees', { signal: ctrl.signal })
        if (!ignore) {
          setEmployees(data)
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

  return { employees, loading, error, refetch: fetchEmployees }
}