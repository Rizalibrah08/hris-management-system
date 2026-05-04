export const menus = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'karyawan', label: 'Karyawan' },
  { key: 'absensi', label: 'Absensi' },
  { key: 'cuti', label: 'Cuti & Izin' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'role', label: 'Role Management' },
]

export const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#6C5CE7', '#00B894', '#FDCB6E']

export function canRunPayroll(role) {
  return ['HRD', 'Finance', 'Super Admin'].includes(role)
}

export function canApproveFinance(role) {
  return ['Finance', 'Super Admin'].includes(role)
}

export function canReview(role) {
  return ['HRD', 'Super Admin'].includes(role)
}

export function canEditSalary(role) {
  return ['HRD', 'Super Admin'].includes(role)
}
