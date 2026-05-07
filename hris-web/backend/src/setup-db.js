import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

const host = process.env.DB_HOST || 'localhost'
const port = Number(process.env.DB_PORT || 3306)
const user = process.env.DB_USER || 'root'
const password = process.env.DB_PASSWORD || ''
const database = process.env.DB_NAME || 'hris_db'

async function run() {
  const conn = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true })

  await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\``)

  const fs = await import('node:fs/promises')
  const path = await import('node:path')

  const schemaSql = await fs.readFile(path.resolve(process.cwd(), 'backend/schema.sql'), 'utf8')
  const payrollSchemaSql = await fs.readFile(path.resolve(process.cwd(), 'backend/payroll-schema.sql'), 'utf8')

  // Drop all tables first to ensure clean schema recreation
  await conn.query('SET FOREIGN_KEY_CHECKS = 0')
  const tablesToDrop = [
    'expenses', 'office_assets', 'tasks',
    'payslips', 'payslip', 'payroll',
    'attendance', 'leave_request', 'users',
    'payroll_audit_logs', 'payroll_approvals', 'payroll_run_item_components',
    'payroll_run_items', 'payroll_runs', 'payroll_variable_inputs',
    'employee_salary_component_values', 'employee_salary_profiles',
    'payroll_components', 'employees', 'positions', 'departments', 'roles',
  ]
  for (const t of tablesToDrop) {
    try { await conn.execute(`DROP TABLE IF EXISTS \`${t}\``) } catch { /* intentional: table may not exist */ }
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1')

  // Create all tables from schema
  await conn.query(schemaSql)
  await conn.query(payrollSchemaSql)

  // Clear existing data (reverse order of foreign keys)
  await conn.query('SET FOREIGN_KEY_CHECKS = 0')
  const tables = [
    'payroll_audit_logs', 'payroll_approvals', 'payroll_run_item_components',
    'payroll_run_items', 'payroll_runs', 'payroll_variable_inputs',
    'employee_salary_component_values', 'employee_salary_profiles',
    'payroll_components', 'payslips', 'payslip', 'payroll',
    'attendance', 'leave_request', 'expenses', 'office_assets', 'tasks',
    'users', 'employees', 'positions', 'departments', 'roles',
  ]
  for (const t of tables) {
    try { await conn.query(`DELETE FROM \`${t}\``) } catch { /* table may not exist */ }
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1')

  // Seed roles
  const roles = ['Super Admin', 'HRD', 'Finance', 'Manager', 'Employee']
  for (const name of roles) {
    await conn.execute('INSERT INTO roles(name) VALUES (?)', [name])
  }

  // Seed departments
  const departments = ['Engineering', 'HRD', 'Finance', 'Marketing', 'Operations', 'Product', 'Legal', 'IT Support']
  for (const name of departments) {
    await conn.execute('INSERT INTO departments(name) VALUES (?)', [name])
  }

  // Seed positions
  const positions = ['Software Engineer', 'Senior Software Engineer', 'Engineering Manager', 'HR Specialist', 'HR Manager', 'Payroll Analyst', 'Finance Manager', 'Marketing Lead', 'Digital Marketing Specialist', 'Operations Manager', 'Data Analyst', 'Product Manager', 'Legal Counsel', 'UI/UX Designer', 'DevOps Engineer', 'HR Admin', 'Recruitment Specialist', 'Accountant', 'Tax Specialist', 'Content Writer', 'SEO Specialist', 'Admin Staff', 'IT Support Specialist', 'Junior Software Engineer', 'Graphic Designer']
  for (const name of positions) {
    await conn.execute('INSERT INTO positions(name) VALUES (?)', [name])
  }

  // Helper to get IDs
  const getDeptId = async (name) => { const [rows] = await conn.execute('SELECT id FROM departments WHERE name=?', [name]); return rows[0]?.id }
  const getPosId = async (name) => { const [rows] = await conn.execute('SELECT id FROM positions WHERE name=?', [name]); return rows[0]?.id }

  // Seed employees
  const employees = [
    ['Aditia Pratama',   await getDeptId('Engineering'), await getPosId('Senior Software Engineer'),     '2028-06-30'],
    ['Nadia Putri',      await getDeptId('HRD'),         await getPosId('HR Specialist'),                '2027-12-31'],
    ['Rizky Maulana',    await getDeptId('Finance'),     await getPosId('Payroll Analyst'),              '2027-11-30'],
    ['Salsa Wijaya',     await getDeptId('Marketing'),   await getPosId('Marketing Lead'),                '2026-12-31'],
    ['Budi Santoso',     await getDeptId('Operations'),   await getPosId('Operations Manager'),            '2028-03-15'],
    ['Intan Lestari',     await getDeptId('Engineering'), await getPosId('Software Engineer'),            '2027-09-30'],
    ['Dini Prameswari',  await getDeptId('HRD'),         await getPosId('HR Manager'),                    '2028-01-31'],
    ['Fajar Hidayat',    await getDeptId('Engineering'), await getPosId('UI/UX Designer'),               '2027-08-20'],
    ['Maya Sari',         await getDeptId('Finance'),     await getPosId('Finance Manager'),               '2028-04-30'],
    ['Arif Rahman',       await getDeptId('Product'),      await getPosId('Product Manager'),               '2027-10-31'],
    ['Putri Ayu',         await getDeptId('Marketing'),    await getPosId('Digital Marketing Specialist'),  '2027-07-15'],
    ['Hendra Wijaya',    await getDeptId('Operations'),    await getPosId('Software Engineer'),             '2028-02-28'],
    ['Ratna Dewi',        await getDeptId('Legal'),         await getPosId('Legal Counsel'),                 '2027-06-30'],
    ['Dimas Prasetyo',   await getDeptId('Engineering'), await getPosId('Senior Software Engineer'),     '2028-05-31'],
    ['Lina Marlina',      await getDeptId('Finance'),      await getPosId('Payroll Analyst'),                '2027-12-31'],
    ['Rudi Hermawan',     await getDeptId('Engineering'), await getPosId('Junior Software Engineer'),        '2027-11-30'],
    ['Sinta Rahayu',      await getDeptId('HRD'),         await getPosId('HR Admin'),                        '2028-03-31'],
    ['Bayu Setiawan',     await getDeptId('IT Support'),  await getPosId('IT Support Specialist'),           '2028-02-28'],
    ['Tina Anggraini',    await getDeptId('Marketing'),   await getPosId('Content Writer'),                   '2027-09-30'],
    ['Doni Kusuma',       await getDeptId('Engineering'), await getPosId('DevOps Engineer'),                  '2028-06-30'],
    ['Rina Oktaviani',    await getDeptId('Finance'),     await getPosId('Accountant'),                       '2027-12-31'],
    ['Hendra Gunawan',    await getDeptId('Operations'),  await getPosId('Admin Staff'),                      '2027-10-31'],
    ['Yuni Puspita',      await getDeptId('HRD'),         await getPosId('Recruitment Specialist'),           '2028-01-31'],
    ['Galih Prasetya',    await getDeptId('Product'),     await getPosId('Data Analyst'),                     '2027-08-31'],
    ['Anisa Putri',       await getDeptId('Marketing'),   await getPosId('SEO Specialist'),                    '2027-11-15'],
    ['Eko Saputra',       await getDeptId('Finance'),     await getPosId('Tax Specialist'),                   '2028-04-30'],
    ['Lia Agustina',      await getDeptId('Legal'),       await getPosId('Legal Counsel'),                     '2027-07-31'],
    ['Rama Aditya',       await getDeptId('Engineering'), await getPosId('Software Engineer'),                 '2027-12-31'],
    ['Winda Permata',     await getDeptId('Marketing'),   await getPosId('Graphic Designer'),                  '2028-02-28'],
  ]
  for (const [name, deptId, posId, contractEnd] of employees) {
    await conn.execute('INSERT INTO employees(name, department_id, position_id, contract_end) VALUES (?,?,?,?)', [name, deptId, posId, contractEnd])
  }

  // Get employee IDs by name
  const getEmpId = async (name) => { const [rows] = await conn.execute('SELECT id FROM employees WHERE name=?', [name]); return rows[0]?.id }

  // Seed payroll components
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

  const getRoleId = async (name) => { const [rows] = await conn.execute('SELECT id FROM roles WHERE name=?', [name]); return rows[0]?.id }
  const getCompId = async (code) => { const [rows] = await conn.execute('SELECT id FROM payroll_components WHERE code=?', [code]); return rows[0]?.id }

  // Seed users (linked to employees where applicable)
  const hash = '$2b$10$2Y8uPaG8pBSGyd7fwqcLbOY67TEKq/qjvlUr9XwJG0DP4I92G1.rW'
  const userSeeds = [
    ['ADM001', 'Super Admin', null],
    ['HRD001', 'HRD', await getEmpId('Nadia Putri')],
    ['HRD002', 'HRD', await getEmpId('Dini Prameswari')],
    ['FIN001', 'Finance', await getEmpId('Rizky Maulana')],
    ['FIN002', 'Finance', await getEmpId('Maya Sari')],
    ['MGR001', 'Manager', await getEmpId('Budi Santoso')],
    ['EMP001', 'Employee', await getEmpId('Aditia Pratama')],
    ['EMP002', 'Employee', await getEmpId('Intan Lestari')],
    ['EMP003', 'Employee', await getEmpId('Salsa Wijaya')],
    ['EMP004', 'Employee', await getEmpId('Fajar Hidayat')],
    ['EMP005', 'Employee', await getEmpId('Putri Ayu')],
    ['EMP006', 'Employee', await getEmpId('Rudi Hermawan')],
    ['EMP007', 'Employee', await getEmpId('Sinta Rahayu')],
    ['EMP008', 'Employee', await getEmpId('Bayu Setiawan')],
    ['EMP009', 'Employee', await getEmpId('Tina Anggraini')],
    ['EMP010', 'Employee', await getEmpId('Doni Kusuma')],
  ]
  for (const [nik, roleName, empId] of userSeeds) {
    await conn.execute('INSERT INTO users(nik, password, role_id, employee_id) VALUES (?,?,?,?)', [nik, hash, await getRoleId(roleName), empId])
  }

  // Seed salary profiles
  const salaryProfiles = [
    ['Aditia Pratama',   12000000, 'bank_transfer', 'BCA',     'Aditia Pratama',    '0123456789'],
    ['Nadia Putri',      9500000,  'bank_transfer', 'Mandiri', 'Nadia Putri',       '1122334455'],
    ['Rizky Maulana',   10000000,  'bank_transfer', 'BNI',     'Rizky Maulana',     '2233445566'],
    ['Salsa Wijaya',    8500000,   'bank_transfer', 'BCA',     'Salsa Wijaya',      '3344556677'],
    ['Budi Santoso',   11000000,   'bank_transfer', 'BRI',     'Budi Santoso',      '4455667788'],
    ['Intan Lestari',    8000000,   'bank_transfer', 'Mandiri', 'Intan Lestari',     '5566778899'],
    ['Dini Prameswari',13000000,   'bank_transfer', 'BCA',     'Dini Prameswari',   '6677889900'],
    ['Fajar Hidayat',   7500000,   'bank_transfer', 'BNI',     'Fajar Hidayat',     '7788990011'],
    ['Maya Sari',       11500000,   'bank_transfer', 'Mandiri', 'Maya Sari',         '8899001122'],
    ['Arif Rahman',    10500000,   'bank_transfer', 'BCA',     'Arif Rahman',       '9900112233'],
    ['Putri Ayu',        7000000,   'bank_transfer', 'BRI',     'Putri Ayu',         '0011223344'],
    ['Hendra Wijaya',    8200000,   'cash',          null,      null,                null],
    ['Ratna Dewi',      14000000,   'bank_transfer', 'BCA',     'Ratna Dewi',        '2233445567'],
    ['Dimas Prasetyo',  9800000,    'bank_transfer', 'Mandiri', 'Dimas Prasetyo',    '3344556678'],
    ['Lina Marlina',     8700000,   'bank_transfer', 'BNI',     'Lina Marlina',      '4455667789'],
    ['Rudi Hermawan',   7200000,   'bank_transfer', 'Mandiri', 'Rudi Hermawan',    '5566778800'],
    ['Sinta Rahayu',    7800000,   'bank_transfer', 'BCA',     'Sinta Rahayu',     '6677889911'],
    ['Bayu Setiawan',   8500000,   'bank_transfer', 'BNI',     'Bayu Setiawan',    '7788990022'],
    ['Tina Anggraini',  6500000,   'bank_transfer', 'BRI',     'Tina Anggraini',   '8899001133'],
    ['Doni Kusuma',    11000000,   'bank_transfer', 'BCA',     'Doni Kusuma',      '9900112244'],
    ['Rina Oktaviani',  9000000,   'bank_transfer', 'Mandiri', 'Rina Oktaviani',   '0011223355'],
    ['Hendra Gunawan',  6800000,   'cash',          null,      null,               null],
    ['Yuni Puspita',    8800000,   'bank_transfer', 'BCA',     'Yuni Puspita',     '1122334466'],
    ['Galih Prasetya',  9500000,   'bank_transfer', 'BNI',     'Galih Prasetya',   '2233445577'],
    ['Anisa Putri',     7000000,   'bank_transfer', 'BRI',     'Anisa Putri',      '3344556688'],
    ['Eko Saputra',     9200000,   'bank_transfer', 'Mandiri', 'Eko Saputra',      '4455667799'],
    ['Lia Agustina',   10000000,   'bank_transfer', 'BCA',     'Lia Agustina',     '5566778800'],
    ['Rama Aditya',     7600000,   'bank_transfer', 'BNI',     'Rama Aditya',      '6677889911'],
    ['Winda Permata',   7700000,   'bank_transfer', 'BRI',     'Winda Permata',    '7788990022'],
  ]
  const profileIds = {}
  for (const [name, salary, method, bank, acctName, acctNo] of salaryProfiles) {
    const empId = await getEmpId(name)
    const [result] = await conn.execute(
      'INSERT INTO employee_salary_profiles(employee_id, effective_date, base_salary, payment_method, bank_name, bank_account_name, bank_account_number, is_active) VALUES (?,?,?, ?,?,?,?,?)',
      [empId, '2025-01-01', salary, method, bank, acctName, acctNo, 1]
    )
    profileIds[name] = result.insertId
  }

  // Seed salary component values
  const compValues = {
    'TUNJ':        [2000000,1500000,1800000,1200000,1900000,1000000,2200000,900000,1700000,1600000,800000,1100000,2500000,1400000,1300000,800000,1000000,1100000,700000,1600000,1200000,900000,800000,1300000,600000,1100000,1500000,1300000,900000,1000000],
    'TJ_TRANSPORT': [500000,400000,450000,350000,500000,350000,600000,350000,500000,450000,300000,350000,600000,400000,350000,300000,350000,400000,300000,500000,400000,300000,350000,450000,250000,400000,500000,350000,350000,300000],
    'TJ_MAKAN':    [750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000,750000],
    'POT':         [200000,100000,150000,50000,0,250000,0,300000,0,100000,150000,200000,0,100000,50000,150000,100000,0,200000,0,50000,100000,150000,0,200000,50000,100000,0,150000,100000],
    'BPJS_TK':     [240000,190000,200000,170000,220000,160000,260000,150000,230000,210000,140000,164000,280000,196000,174000,144000,156000,170000,130000,220000,180000,136000,160000,190000,140000,184000,200000,152000,176000,154000],
    'BPJS_KES':    [150000,120000,130000,110000,140000,100000,160000,95000,145000,135000,90000,102500,175000,122500,108750,90000,97500,106000,85000,137000,112000,85000,100000,118000,87500,115000,125000,95000,110000,96000],
    'PPH21':       [950000,580000,710000,420000,820000,350000,1120000,280000,880000,720000,200000,405000,1300000,630000,460000,180000,250000,520000,200000,900000,480000,160000,200000,650000,140000,500000,780000,600000,300000,250000],
  }
  const empNames = salaryProfiles.map(s => s[0])
  for (const [code, amounts] of Object.entries(compValues)) {
    const compId = await getCompId(code)
    for (let i = 0; i < empNames.length; i++) {
      const profileId = profileIds[empNames[i]]
      if (profileId && amounts[i] > 0) {
        await conn.execute(
          'INSERT INTO employee_salary_component_values(salary_profile_id, component_id, amount) VALUES (?,?,?) ON DUPLICATE KEY UPDATE amount=VALUES(amount)',
          [profileId, compId, amounts[i]]
        )
      }
    }
  }

  // Seed attendance — 30 hari (April 2026) untuk semua 30 karyawan
  const allEmpNames = salaryProfiles.map(s => s[0])
  // Senin-Jumat saja (skip weekend) untuk April 2026
  const workDays = []
  for (let d = 1; d <= 30; d++) {
    const date = new Date(2026, 3, d)
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) workDays.push(d)
  }

  for (const day of workDays) {
    for (const name of allEmpNames) {
      const empId = await getEmpId(name)
      if (!empId) continue
      const r = Math.random()
      let status, clockIn, clockOut
      if (r < 0.70) {
        status = 'Aktif'
        const h = 8 + Math.floor(Math.random() * 1)
        const m = String(Math.floor(Math.random() * 30)).padStart(2, '0')
        clockIn = `2026-04-${String(day).padStart(2, '0')} 0${h}:${m}:00`
        const oh = 17 + Math.floor(Math.random() * 1)
        const om = String(Math.floor(Math.random() * 30)).padStart(2, '0')
        clockOut = `2026-04-${String(day).padStart(2, '0')} ${oh}:${om}:00`
      } else if (r < 0.85) {
        status = 'Terlambat'
        const h = 9 + Math.floor(Math.random() * 1)
        const m = String(Math.floor(Math.random() * 30)).padStart(2, '0')
        clockIn = `2026-04-${String(day).padStart(2, '0')} 0${h}:${m}:00`
        const oh = 17 + Math.floor(Math.random() * 1)
        const om = String(Math.floor(Math.random() * 30)).padStart(2, '0')
        clockOut = `2026-04-${String(day).padStart(2, '0')} ${oh}:${om}:00`
      } else if (r < 0.93) {
        status = 'Izin'
        clockIn = null
        clockOut = null
      } else {
        status = 'Alpha'
        clockIn = null
        clockOut = null
      }
      await conn.execute(
        'INSERT INTO attendance(employee_id, clock_in, clock_out, status) VALUES (?,?,?,?)',
        [empId, clockIn, clockOut, status]
      )
    }
  }

  // Seed leave requests (20 records)
  const leaveData = [
    ['Aditia Pratama',  'Cuti Tahunan', '2026-05-10', '2026-05-12', 'Liburan keluarga ke Bali', 'Pending'],
    ['Salsa Wijaya',    'Izin Sakit',    '2026-04-28', '2026-04-28', 'Demam tinggi', 'Pending'],
    ['Intan Lestari',   'Cuti Tahunan',  '2026-05-05', '2026-05-07', 'Acara keluarga', 'Approved'],
    ['Fajar Hidayat',  'Izin',          '2026-04-30', '2026-04-30', 'Urusan perbankan', 'Pending'],
    ['Putri Ayu',       'Cuti Tahunan',  '2026-05-15', '2026-05-16', 'Pernikahan saudara', 'Approved'],
    ['Dimas Prasetyo', 'Izin Sakit',    '2026-04-25', '2026-04-25', 'Sakit kepala', 'Rejected'],
    ['Rizky Maulana',  'Cuti Tahunan',  '2026-06-01', '2026-06-03', 'Honeymoon', 'Pending'],
    ['Maya Sari',       'Izin',          '2026-05-02', '2026-05-02', 'Pindah rumah', 'Approved'],
    ['Hendra Wijaya',  'Izin Sakit',    '2026-04-27', '2026-04-28', 'Flu berat', 'Pending'],
    ['Lina Marlina',    'Cuti Tahunan',  '2026-05-20', '2026-05-22', 'Liburan akhir bulan', 'Pending'],
    ['Nadia Putri',     'Cuti Tahunan',  '2026-06-10', '2026-06-12', 'Family gathering', 'Approved'],
    ['Arif Rahman',     'Izin',          '2026-05-08', '2026-05-08', 'Seminar industry', 'Approved'],
    ['Ratna Dewi',      'Cuti Melahirkan','2026-06-15','2026-08-15', 'Maternity leave', 'Approved'],
    ['Rudi Hermawan',   'Izin Sakit',    '2026-05-03', '2026-05-04', 'Covid symptoms', 'Pending'],
    ['Sinta Rahayu',    'Cuti Tahunan',  '2026-05-25', '2026-05-27', 'Family wedding', 'Pending'],
    ['Bayu Setiawan',   'Izin',          '2026-05-12', '2026-05-12', 'Perpanjangan SIM', 'Approved'],
    ['Tina Anggraini',  'Cuti Tahunan',  '2026-06-20', '2026-06-22', 'Personal trip', 'Pending'],
    ['Doni Kusuma',     'Izin Sakit',    '2026-05-01', '2026-05-01', 'Migraine', 'Rejected'],
    ['Rina Oktaviani',  'Cuti Tahunan',  '2026-07-01', '2026-07-03', 'Anniversary vacation', 'Pending'],
    ['Galih Prasetya',  'Izin',          '2026-05-18', '2026-05-18', 'Parent teacher meeting', 'Approved'],
  ]
  for (const [name, type, start, end, reason, status] of leaveData) {
    const empId = await getEmpId(name)
    await conn.execute('INSERT INTO leave_request(employee_id, leave_type, start_date, end_date, reason, status) VALUES (?,?,?,?,?,?)', [empId, type, start, end, reason, status])
  }

  // Seed payroll runs (4 periods: Jan-Apr 2026)
  const hrdRoleId = await getRoleId('HRD')
  const finRoleId = await getRoleId('Finance')
  const hrdUserRes = hrdRoleId ? await conn.execute("SELECT id FROM users WHERE role_id=?", [hrdRoleId]) : [[], []]
  const finUserRes = finRoleId ? await conn.execute("SELECT id FROM users WHERE role_id=?", [finRoleId]) : [[], []]
  const hrdUserId = hrdUserRes[0][0]?.id || 1
  const finUserId = finUserRes[0][0]?.id || 1

  const payrollPeriods = [
    { month: '2026-01-01', status: 'finalized', finalized: '2026-02-01 10:00:00' },
    { month: '2026-02-01', status: 'finalized', finalized: '2026-02-28 10:00:00' },
    { month: '2026-03-01', status: 'finalized', finalized: '2026-04-01 10:30:00' },
    { month: '2026-04-01', status: 'approved',  finalized: null },
  ]

  const allRunIds = []
  for (const period of payrollPeriods) {
    const [runResult] = await conn.execute(
      'INSERT INTO payroll_runs(period_month, status, employee_count, total_gross, total_deduction, total_net, created_by, approved_by, finalized_by, finalized_at) VALUES (?,?,0,0,0,0,?,?,?,?)',
      [period.month, period.status, hrdUserId, finUserId, finUserId, period.finalized]
    )
    allRunIds.push(runResult.insertId)
  }
  const [runJanId, runFebId, runMarId, runAprId] = allRunIds

  // Generate payroll items from salary profiles
  async function seedPayrollItems(runId) {
    let totalGross = 0, totalDed = 0, totalNet = 0
    const entries = []
    for (const [name, salary] of salaryProfiles.map(s => [s[0], s[1]])) {
      const empId = await getEmpId(name)
      const i = empNames.indexOf(name)
      const tunj = compValues['TUNJ'][i] || 0
      const transport = compValues['TJ_TRANSPORT'][i] || 0
      const makan = compValues['TJ_MAKAN'][i] || 0
      const pot = compValues['POT'][i] || 0
      const bpjsTk = compValues['BPJS_TK'][i] || 0
      const bpjsKes = compValues['BPJS_KES'][i] || 0
      const pph21 = compValues['PPH21'][i] || 0
      const gross = salary + tunj + transport + makan
      const ded = pot + bpjsTk + bpjsKes + pph21
      const net = gross - ded
      totalGross += gross; totalDed += ded; totalNet += net
      const [itemRes] = await conn.execute(
        'INSERT INTO payroll_run_items(payroll_run_id, employee_id, gross_amount, deduction_amount, net_amount, tax_amount, bpjs_amount) VALUES (?,?,?,?,?,?,?)',
        [runId, empId, gross, ded, net, pph21, bpjsTk + bpjsKes]
      )
      entries.push({ itemId: itemRes.insertId, name, salary, tunj, transport, makan, pot, bpjsTk, bpjsKes, pph21, empId })
    }
    await conn.execute('UPDATE payroll_runs SET employee_count=?, total_gross=?, total_deduction=?, total_net=? WHERE id=?',
      [entries.length, totalGross, totalDed, totalNet, runId])
    return entries
  }

  const entriesMar = await seedPayrollItems(runMarId)
  const entriesApr = await seedPayrollItems(runAprId)
  await seedPayrollItems(runJanId)
  await seedPayrollItems(runFebId)

  // Seed component snapshots for first 3 employees of March run
  const gapokId = await getCompId('GAPOK')
  const tunjId = await getCompId('TUNJ')
  const transportId = await getCompId('TJ_TRANSPORT')
  const makanId = await getCompId('TJ_MAKAN')
  const potId = await getCompId('POT')
  for (let idx = 0; idx < 3 && idx < entriesMar.length; idx++) {
    const e = entriesMar[idx]
    const components = [
      [gapokId, 'Gaji Pokok', 'earning', e.salary],
      [tunjId, 'Tunjangan Tetap', 'earning', e.tunj],
      [transportId, 'Tunjangan Transport', 'earning', e.transport],
      [makanId, 'Tunjangan Makan', 'earning', e.makan],
      [potId, 'Potongan Absensi', 'deduction', e.pot],
      [null, 'BPJS Ketenagakerjaan', 'deduction', e.bpjsTk],
      [null, 'BPJS Kesehatan', 'deduction', e.bpjsKes],
      [null, 'PPh 21', 'deduction', e.pph21],
    ]
    for (const [cid, snap, type, amt] of components) {
      await conn.execute('INSERT INTO payroll_run_item_components(payroll_run_item_id, component_id, component_name_snapshot, component_type, amount) VALUES (?,?,?,?,?)',
        [e.itemId, cid, snap, type, amt])
    }
  }

  // Payroll approvals for all runs
  const approvalLevels = [1, 2, 3]
  const approvalComments = ['Draft direview HRD', 'Disetujui Finance', 'Finalized']
  // Jan run approvals
  for (let lvl = 0; lvl < 3; lvl++) {
    const approver = lvl < 1 ? hrdUserId : finUserId
    const date = new Date(2026, 1, 1 + lvl * 15)
    await conn.execute('INSERT INTO payroll_approvals(payroll_run_id, approval_level, approver_user_id, status, comment, approved_at) VALUES (?,?,?,?,"Disetujui HRD",?)',
      [runJanId, lvl + 1, approver, 'approved', date.toISOString().slice(0, 19).replace('T', ' ')])
  }
  // Feb run approvals
  for (let lvl = 0; lvl < 3; lvl++) {
    const approver = lvl < 1 ? hrdUserId : finUserId
    const date = new Date(2026, 2, 1 + lvl * 14)
    await conn.execute('INSERT INTO payroll_approvals(payroll_run_id, approval_level, approver_user_id, status, comment, approved_at) VALUES (?,?,?,?,"Disetujui HRD",?)',
      [runFebId, lvl + 1, approver, 'approved', date.toISOString().slice(0, 19).replace('T', ' ')])
  }
  // Mar & Apr run approvals (keep existing pattern)
  await conn.execute('INSERT INTO payroll_approvals(payroll_run_id, approval_level, approver_user_id, status, comment, approved_at) VALUES (?,1,?,?,"Draft direview HRD","2026-04-01 09:00:00")', [runMarId, hrdUserId, 'approved'])
  await conn.execute('INSERT INTO payroll_approvals(payroll_run_id, approval_level, approver_user_id, status, comment, approved_at) VALUES (?,2,?,?,"Disetujui Finance","2026-04-01 09:30:00")', [runMarId, finUserId, 'approved'])
  await conn.execute('INSERT INTO payroll_approvals(payroll_run_id, approval_level, approver_user_id, status, comment, approved_at) VALUES (?,3,?,?,"Finalized","2026-04-01 10:30:00")', [runMarId, finUserId, 'approved'])
  await conn.execute('INSERT INTO payroll_approvals(payroll_run_id, approval_level, approver_user_id, status, comment, approved_at) VALUES (?,1,?,?,"Draft direview April","2026-04-25 14:00:00")', [runAprId, hrdUserId, 'approved'])
  await conn.execute('INSERT INTO payroll_approvals(payroll_run_id, approval_level, approver_user_id, status, comment, approved_at) VALUES (?,2,?,?,"Disetujui Finance April","2026-04-26 09:00:00")', [runAprId, finUserId, 'approved'])

  // Audit logs for Mar & Apr
  for (const [runId, action, actor] of [[runMarId, 'GENERATE_PAYROLL_RUN', hrdUserId], [runMarId, 'REVIEW_PAYROLL_RUN', hrdUserId], [runMarId, 'APPROVE_PAYROLL_RUN', finUserId], [runMarId, 'FINALIZE_PAYROLL_RUN', finUserId], [runAprId, 'GENERATE_PAYROLL_RUN', hrdUserId], [runAprId, 'REVIEW_PAYROLL_RUN', hrdUserId], [runAprId, 'APPROVE_PAYROLL_RUN', finUserId]]) {
    await conn.execute('INSERT INTO payroll_audit_logs(payroll_run_id, actor_user_id, action, ip_address) VALUES (?,?,?,"127.0.0.1")', [runId, actor, action])
  }

  // Old payroll table entries (for all 30 employees, latest period)
  for (const [name, salary] of salaryProfiles.map(s => [s[0], s[1]])) {
    const empId = await getEmpId(name)
    const i = empNames.indexOf(name)
    const tunj = compValues['TUNJ'][i] || 0
    const transport = compValues['TJ_TRANSPORT'][i] || 0
    const makan = compValues['TJ_MAKAN'][i] || 0
    const pot = compValues['POT'][i] || 0
    const bpjsTk = compValues['BPJS_TK'][i] || 0
    const bpjsKes = compValues['BPJS_KES'][i] || 0
    const pph21 = compValues['PPH21'][i] || 0
    const allowance = tunj + transport + makan
    const deduction = pot + bpjsTk + bpjsKes + pph21
    const total = salary + allowance - deduction
    await conn.execute('INSERT INTO payroll(employee_id, salary, allowance, deduction, total, period_month) VALUES (?,?,?,?,?,?)',
      [empId, salary, allowance, deduction, total, '2026-04-01'])
  }

  await conn.execute("INSERT IGNORE INTO company_settings(setting_key, setting_value) VALUES ('office_latitude', '-6.2088')")
  await conn.execute("INSERT IGNORE INTO company_settings(setting_key, setting_value) VALUES ('office_longitude', '106.8456')")
  await conn.execute("INSERT IGNORE INTO company_settings(setting_key, setting_value) VALUES ('allowed_radius', '500')")

  await conn.end()
  console.log(`Database ${database} siap digunakan di ${host}:${port}`)
}

run().catch((error) => {
  console.error('Setup database gagal:', error)
  process.exit(1)
})