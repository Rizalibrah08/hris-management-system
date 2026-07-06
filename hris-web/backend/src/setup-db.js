import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') })

const host = process.env.DB_HOST || 'localhost'
const port = Number(process.env.DB_PORT || 3306)
const user = process.env.DB_USER || 'root'
const password = process.env.DB_PASSWORD || ''
const database = process.env.DB_NAME || 'hris_db'

async function run() {
  const conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true })

  await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\``)
  await conn.changeUser({ database })

  const fs = await import('node:fs/promises')
  const pathMod = await import('node:path')

  const schemaSql = await fs.readFile(pathMod.resolve(process.cwd(), 'backend/schema.sql'), 'utf8')
  const payrollSchemaSql = await fs.readFile(pathMod.resolve(process.cwd(), 'backend/payroll-schema.sql'), 'utf8')

  // Drop all tables
  await conn.query('SET FOREIGN_KEY_CHECKS = 0')
  const tablesToDrop = [
    'notifications', 'expenses', 'office_assets', 'tasks',
    'payslips', 'payslip', 'payroll',
    'attendance', 'leave_request', 'users',
    'payroll_audit_logs', 'payroll_approvals', 'payroll_run_item_components',
    'payroll_run_items', 'payroll_runs', 'payroll_variable_inputs',
    'employee_salary_component_values', 'employee_salary_profiles',
    'payroll_components', 'employees', 'positions', 'departments', 'roles', 'leave_types',
  ]
  for (const t of tablesToDrop) {
    try { await conn.execute(`DROP TABLE IF EXISTS \`${t}\``) } catch { /* ignore */ }
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1')

  // Create tables
  await conn.query(schemaSql)
  await conn.query(payrollSchemaSql)

  // === MASTER DATA ===

  const roles = ['Super Admin', 'System Admin', 'HRD', 'Finance', 'Manager', 'Employee']
  for (const name of roles) {
    await conn.execute('INSERT INTO roles(name) VALUES (?)', [name])
  }

  const departments = ['Engineering', 'HRD', 'Finance', 'Marketing', 'Operations', 'Product', 'Legal', 'IT Support']
  for (const name of departments) {
    await conn.execute('INSERT INTO departments(name) VALUES (?)', [name])
  }

  const positions = [
    'Software Engineer', 'Senior Software Engineer', 'Engineering Manager',
    'HR Specialist', 'HR Manager', 'Payroll Analyst', 'Finance Manager',
    'Marketing Lead', 'Digital Marketing Specialist', 'Operations Manager',
    'Data Analyst', 'Product Manager', 'Legal Counsel', 'UI/UX Designer',
    'DevOps Engineer', 'HR Admin', 'Recruitment Specialist', 'Accountant',
    'Tax Specialist', 'Content Writer', 'SEO Specialist', 'Admin Staff',
    'IT Support Specialist', 'IT Administrator', 'Junior Software Engineer', 'Graphic Designer',
  ]
  for (const name of positions) {
    await conn.execute('INSERT INTO positions(name) VALUES (?)', [name])
  }

  const leaveTypes = ['Cuti Tahunan', 'Cuti Sakit', 'Cuti Melahirkan', 'Cuti Menikah', 'Izin Pribadi', 'Izin Mendadak', 'Lainnya']
  for (const name of leaveTypes) {
    await conn.execute('INSERT INTO leave_types(name) VALUES (?)', [name])
  }

  const components = [
    ['GAPOK', 'Gaji Pokok', 'earning', 1],
    ['TUNJ', 'Tunjangan Tetap', 'earning', 1],
    ['TJ_TRANSPORT', 'Tunjangan Transport', 'earning', 0],
    ['TJ_MAKAN', 'Tunjangan Makan', 'earning', 0],
    ['POT', 'Potongan Absensi', 'deduction', 1],
    ['BPJS_TK', 'BPJS Ketenagakerjaan', 'deduction', 1],
    ['BPJS_KES', 'BPJS Kesehatan', 'deduction', 1],
    ['PPH21', 'PPh 21', 'deduction', 1],
  ]
  for (const [code, name, type, taxable] of components) {
    await conn.execute('INSERT INTO payroll_components(code, name, type, taxable) VALUES (?,?,?,?)', [code, name, type, taxable])
  }

  // === ADMIN USERS (with employee records) ===
  const getRoleId = async (name) => { const [rows] = await conn.execute('SELECT id FROM roles WHERE name=?', [name]); return rows[0]?.id }
  const getDeptId = async (name) => { const [rows] = await conn.execute('SELECT id FROM departments WHERE name=?', [name]); return rows[0]?.id }
  const getPosId = async (name) => { const [rows] = await conn.execute('SELECT id FROM positions WHERE name=?', [name]); return rows[0]?.id }

  // bcrypt hash for 'admin123'
  const hash = '$2b$10$2Y8uPaG8pBSGyd7fwqcLbOY67TEKq/qjvlUr9XwJG0DP4I92G1.rW'
  const adminUsers = [
    // [nik, roleName, employeeName, departmentName, positionName, email, joinDate]
    ['EMP-20220101-001', 'Super Admin', 'Administrator', 'IT Support', 'IT Support Specialist', 'admin@hris.local', '2022-01-01'],
    ['EMP-20220201-002', 'HRD', 'HRD Manager', 'HRD', 'HR Manager', 'hrd@hris.local', '2022-02-01'],
    ['EMP-20220301-003', 'Finance', 'Finance Manager', 'Finance', 'Finance Manager', 'finance@hris.local', '2022-03-01'],
    ['EMP-20220401-004', 'Manager', 'Engineering Manager', 'Engineering', 'Engineering Manager', 'manager@hris.local', '2022-04-01'],
    ['EMP-20220501-005', 'System Admin', 'IT Administrator', 'IT Support', 'IT Administrator', 'sysadmin@hris.local', '2022-05-01'],
  ]
  for (const [nik, roleName, empName, deptName, posName, email, joinDate] of adminUsers) {
    // Create employee record first (permanent employees, no contract_end)
    const [empResult] = await conn.execute(
      'INSERT INTO employees(name, department_id, position_id, email, is_active) VALUES (?,?,?,?,?)',
      [empName, await getDeptId(deptName), await getPosId(posName), email, 1],
    )
    const empId = empResult.insertId
    // Create user linked to the employee
    await conn.execute(
      'INSERT INTO users(nik, email, password, role_id, employee_id, is_active) VALUES (?,?,?,?,?,?)',
      [nik, email, hash, await getRoleId(roleName), empId, 1],
    )
  }

  // === DEFAULT COMPANY SETTINGS ===
  const defaultSettings = [
    ['company_name', 'PT HRIS Indonesia'],
    ['company_address', 'Jakarta, Indonesia'],
    ['office_latitude', '-6.2088'],
    ['office_longitude', '106.8456'],
    ['office_radius', '500'],
    ['late_threshold_hour', '09:00'],
  ]
  for (const [key, value] of defaultSettings) {
    await conn.execute(
      'INSERT INTO company_settings(setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',
      [key, value],
    )
  }

  const { seedDummyData } = await import('./seed-dummy.js')
  await seedDummyData(conn)

  await conn.end()
  console.log(`\nDatabase "${database}" siap (${host}:${port})`)
  console.log(`  Master: ${roles.length} roles, ${departments.length} dept, ${positions.length} posisi, ${leaveTypes.length} jenis cuti, ${components.length} komponen payroll`)
  console.log(`  Admin Users: EMP-20220101-001 (Super Admin), EMP-20220501-005 (System Admin), EMP-20220201-002 (HRD), EMP-20220301-003 (Finance), EMP-20220401-004 (Manager)`)
  console.log(`  Password: admin123`)
  console.log(`\n  Import karyawan via Excel template di templates/employee-import-template.xlsx`)
}

run().catch((error) => {
  console.error('Setup database gagal:', error)
  process.exit(1)
})
