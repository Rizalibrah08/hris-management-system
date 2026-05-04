import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'
import {
  PAYROLL_RUNS,
} from '../api/endpoints.js'
import { useAuth } from '../contexts/AuthContext.jsx'

// PAYROLL related state & actions extracted from App.jsx (refactored into a hook)
export function usePayroll() {
  const { token } = useAuth()

  // UI state (as per specification)
  const [payrollTab, setPayrollTab] = useState('run')
  const [payrollRuns, setPayrollRuns] = useState([])
  const [selectedRunId, setSelectedRunId] = useState(null)
  const [payrollDetail, setPayrollDetail] = useState(null)
  const [selectedPayrollItemId, setSelectedPayrollItemId] = useState(null)
  const [payrollDetailSearch, setPayrollDetailSearch] = useState('')
  const [payrollMessage, setPayrollMessage] = useState('')
  const [runningPayroll, setRunningPayroll] = useState(false)
  const [finalizingPayroll, setFinalizingPayroll] = useState(false)
  const [salaryStructures, setSalaryStructures] = useState([])
  const [loadingSalary, setLoadingSalary] = useState(false)
  const [salaryForm, setSalaryForm] = useState({
    employeeId: '',
    baseSalary: 8000000,
    allowance: 1000000,
    deduction: 250000,
  })
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)
  const [editSalaryModal, setEditSalaryModal] = useState({
    open: false,
    employeeId: '',
    employeeName: '',
    baseSalary: 0,
    allowance: 0,
    deduction: 0,
  })
  const [employees, setEmployees] = useState([])

  // Helper: load employees (needed for salary form and lookups)
  async function loadEmployees() {
    try {
      const data = await api('/employees')
      setEmployees(data)
      if (data.length > 0 && salaryForm.employeeId === '') {
        setSalaryForm((c) => ({ ...c, employeeId: String(data[0].id) }))
      }
    } catch {
      setEmployees([])
    }
  }

  // Helpers: CRUD-like actions for payroll and salary structures
  async function loadPayrollRuns() {
    try {
      const data = await api('/payroll/runs')
      setPayrollRuns(data)
      if (data.length > 0 && !selectedRunId) {
        setSelectedRunId(data[0].id)
        await loadPayrollDetail(data[0].id)
      }
    } catch {
      // ignore
    }
  }

  async function loadPayrollDetail(runId) {
    try {
      const data = await api(`/payroll/runs/${runId}`)
      setPayrollDetail(data)
      setSelectedPayrollItemId(data.items?.[0]?.id || null)
    } catch {
      // ignore
    }
  }

  async function handleSaveSalaryStructure() {
    const employee = employees.find((e) => String(e.id) === String(salaryForm.employeeId))
    if (!employee) return
    if (
      Number.isNaN(Number(salaryForm.baseSalary)) ||
      Number.isNaN(Number(salaryForm.allowance)) ||
      Number.isNaN(Number(salaryForm.deduction))
    ) {
      setPayrollMessage('Nominal gaji wajib berupa angka yang valid')
      return
    }
    if (
      Number(salaryForm.baseSalary) < 0 ||
      Number(salaryForm.allowance) < 0 ||
      Number(salaryForm.deduction) < 0
    ) {
      setPayrollMessage('Nominal gaji, tunjangan, dan potongan tidak boleh minus')
      return
    }
    try {
      await api('/salary-profiles', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: Number(salaryForm.employeeId),
          baseSalary: Number(salaryForm.baseSalary),
          allowance: Number(salaryForm.allowance),
          deduction: Number(salaryForm.deduction),
        }),
      })
      setPayrollMessage(`Salary structure untuk ${employee.name} berhasil disimpan`)
      resetSalaryForm()
      await loadSalaryStructures()
    } catch (err) {
      setPayrollMessage(err.message || 'Gagal menyimpan salary structure')
    }
  }

  function resetSalaryForm() {
    const defaultEmployeeId = employees.length > 0 ? String(employees[0].id) : ''
    setSalaryForm({ employeeId: defaultEmployeeId, baseSalary: 8000000, allowance: 1000000, deduction: 250000 })
  }

  async function loadSalaryStructures() {
    try {
      setLoadingSalary(true)
      const data = await api('/salary-profiles')
      setSalaryStructures(
        data.map((row) => ({
          profileId: row.profile_id,
          employeeId: row.employee_id,
          employeeName: row.employee_name,
          department: row.department || '-',
          baseSalary: Number(row.base_salary),
          allowance: Number(row.allowance),
          deduction: Number(row.deduction),
          paymentMethod: row.payment_method,
          bankName: row.bank_name,
          bankAccountName: row.bank_account_name,
          bankAccountNumber: row.bank_account_number,
        })),
      )
    } catch {
      setSalaryStructures([])
    }
    setLoadingSalary(false)
  }

  async function handleEditSalaryStructure(item) {
    setEditingEmployeeId(item.employeeId)
    setEditSalaryModal({
      open: true,
      employeeId: String(item.employeeId),
      employeeName: item.employeeName,
      baseSalary: Number(item.baseSalary),
      allowance: Number(item.allowance),
      deduction: Number(item.deduction),
    })
    // message for UX
    setPayrollMessage(`Mode edit aktif untuk ${item.employeeName}`)
  }

  async function handleSaveEditedSalary() {
    if (
      Number(editSalaryModal.baseSalary) < 0 ||
      Number(editSalaryModal.allowance) < 0 ||
      Number(editSalaryModal.deduction) < 0
    ) {
      setPayrollMessage('Nominal gaji, tunjangan, dan potongan tidak boleh minus')
      return
    }
    try {
      await api(`/salary-profiles/${editSalaryModal.employeeId}`, {
        method: 'PUT',
        body: JSON.stringify({
          baseSalary: Number(editSalaryModal.baseSalary),
          allowance: Number(editSalaryModal.allowance),
          deduction: Number(editSalaryModal.deduction),
        }),
      })
      setEditSalaryModal((prev) => ({ ...prev, open: false }))
      setPayrollMessage(`Salary structure untuk ${editSalaryModal.employeeName} berhasil diupdate`)
      setEditingEmployeeId(null)
      await loadSalaryStructures()
    } catch (err) {
      setPayrollMessage(err.message || 'Gagal mengupdate salary structure')
    }
  }

  async function handleRunPayroll() {
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

  async function loadDashboardData() {
    try {
      await api('/reports/dashboard')
    } catch {
      // ignore
    }
  }

  async function handleReviewRun() {
    if (!selectedRunId) return
    try {
      const data = await api(`/payroll/runs/${selectedRunId}/review`, { method: 'POST' })
      setPayrollMessage(`Run #${data.id} berhasil di-review (menunggu approval Finance)`) // UX
      await loadPayrollRuns()
      await loadPayrollDetail(selectedRunId)
    } catch (err) {
      setPayrollMessage(err.message || 'Gagal me-review payroll run')
    }
  }

  async function handleApproveRun() {
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

  async function handleRejectRun() {
    if (!selectedRunId) return
    try {
      const data = await api(`/payroll/runs/${selectedRunId}/reject`, { method: 'POST', body: JSON.stringify({ comment: 'Rejected' }) })
      setPayrollMessage(`Run #${data.id} telah di-reject`)
      await loadPayrollRuns()
      await loadPayrollDetail(selectedRunId)
    } catch (err) {
      setPayrollMessage(err.message || 'Gagal me-reject payroll run')
    }
  }

  async function handleFinalizeRun() {
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

  async function handleValidateRun() {
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

  async function handleDeleteSalaryStructure(employeeId) {
    try {
      await api(`/salary-profiles/${employeeId}`, { method: 'DELETE' })
      setPayrollMessage('Salary structure berhasil dinonaktifkan')
      await loadSalaryStructures()
    } catch (err) {
      setPayrollMessage(err.message || 'Gagal menghapus salary structure')
    }
  }

  // Initialize when token becomes available
  useEffect(() => {
    if (!token) return
    // Load initial data for payroll-related UI
    loadPayrollRuns()
    loadEmployees()
    loadSalaryStructures()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Expose state and actions for components/pages consuming this hook
  return {
    // UI state
    payrollTab,
    payrollRuns,
    selectedRunId,
    payrollDetail,
    selectedPayrollItemId,
    payrollDetailSearch,
    payrollMessage,
    runningPayroll,
    finalizingPayroll,
    salaryStructures,
    loadingSalary,
    salaryForm,
    editingEmployeeId,
    editSalaryModal,
    employees,
    // mutators & actions
    setPayrollTab,
    setSelectedRunId,
    setSelectedPayrollItemId,
    setPayrollDetailSearch,
    setPayrollMessage,
    setRunningPayroll,
    setFinalizingPayroll,
    setSalaryForm,
    setEditSalaryModal,
    setEditingEmployeeId,
    // operations
    loadPayrollRuns,
    loadPayrollDetail,
    handleRunPayroll,
    handleReviewRun,
    handleApproveRun,
    handleRejectRun,
    handleFinalizeRun,
    handleValidateRun,
    handleSaveSalaryStructure,
    handleEditSalaryStructure,
    handleSaveEditedSalary,
    handleDeleteSalaryStructure,
    onSalaryFormChange: setSalaryForm,
  }
}
