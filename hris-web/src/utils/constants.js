export const menus = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'karyawan', label: 'Karyawan' },
  { key: 'absensi', label: 'Absensi' },
  { key: 'cuti', label: 'Cuti & Izin' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'slipgaji', label: 'Slip Gaji' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'masterdata', label: 'Master Data' },
  { key: 'pengaturan', label: 'Pengaturan' },
  { key: 'role', label: 'Role Management' },
]

export const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#6C5CE7', '#00B894', '#FDCB6E']

export function canRunPayroll(role) {
  return ['HRD', 'Super Admin'].includes(role)
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

export function canApproveLeave(role) {
  return ['HRD', 'Super Admin', 'Manager'].includes(role)
}

export function canSeeAllPayslips(role) {
  return ['HRD', 'Finance', 'Super Admin'].includes(role)
}
