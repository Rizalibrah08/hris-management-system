import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  async function fetchEmployees() {
    setLoadingEmployees(true)
    try {
      const data = await api('/employees')
      setEmployees(data)
    } catch {
      setEmployees([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function addEmployee(employeeData) {
    const data = await api('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    })
    await fetchEmployees()
    return data
  }

  async function updateEmployee(id, data) {
    const resp = await api(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    await fetchEmployees()
    return resp
  }

  async function deleteEmployee(id) {
    const resp = await api(`/employees/${id}`, { method: 'DELETE' })
    await fetchEmployees()
    return resp
  }

  return {
    employees,
    loadingEmployees,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  }
}
