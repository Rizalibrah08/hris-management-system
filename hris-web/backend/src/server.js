import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import os from 'os'
import fs from 'node:fs'
import { v2 as cloudinary } from 'cloudinary'
import { query } from './db.js'
import { authRequired, roleRequired } from './middleware.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') })

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image' }, (err, result) => {
        if (err) return reject(err)
        resolve(result.secure_url)
      })
      .end(buffer)
  })
}

const app = express()
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
}))
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))

const uploadsDir = path.join(__dirname, 'uploads')

// Selfie & profile photo → Cloudinary (memory storage)
const uploadSelfie = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
const uploadPhoto = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// CSV import → local temp disk, deleted after processing
const importStorage = multer.diskStorage({
  destination: path.join(uploadsDir, 'imports'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const uploadImport = multer({ storage: importStorage, limits: { fileSize: 5 * 1024 * 1024 } })

app.use('/uploads', express.static(uploadsDir))

// Ensure upload directories exist
for (const sub of ['imports']) {
  fs.mkdirSync(path.join(uploadsDir, sub), { recursive: true })
}

await query(`CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info',
  reference_type VARCHAR(50),
  reference_id INT,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`)

try {
  await query("ALTER TABLE employees ADD COLUMN photo_url VARCHAR(500) NULL")
} catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.warn('photo_url column:', e.message) }

// Strip /api prefix for production (matches Vite proxy behavior)
// NOTE: Using plain app.use (no mount path) because Express mount points restore req.url after sub-app
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req._isApiRoute = true
    req.url = req.url.replace(/^\/api/, '')
    if (req.url === '') req.url = '/'
  }
  next()
})

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.post('/auth/login', async (req, res) => {
  const { nik, password } = req.body
  const users = await query(
    `SELECT u.id, u.nik, u.password, r.name AS role, u.employee_id
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.nik = ?`,
    [nik],
  )
  const user = users[0]
  if (!user) return res.status(401).json({ message: 'NIK tidak ditemukan' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ message: 'Password salah' })

  const token = jwt.sign({ sub: user.id, nik: user.nik, role: user.role, employeeId: user.employee_id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  })

  const webRoles = ['Super Admin', 'HRD', 'Finance', 'Manager']
  const allowedPortals = webRoles.includes(user.role) ? ['web', 'mobile'] : ['mobile']

  let employeeName = null
  let department = null
  if (user.employee_id) {
    const empRows = await query(
      `SELECT e.name, d.name AS department FROM employees e LEFT JOIN departments d ON d.id = e.department_id WHERE e.id = ?`,
      [user.employee_id],
    )
    if (empRows.length > 0) {
      employeeName = empRows[0].name
      department = empRows[0].department
    }
  }

  return res.json({
    token,
    role: user.role,
    employeeId: user.employee_id,
    employeeName,
    department,
    allowedPortals,
  })
})

app.post('/auth/register', async (req, res) => {
  const { nik, email, phone, password, name, department_id, position_id } = req.body
  if (!nik || !password || !name) {
    return res.status(400).json({ message: 'NIK, nama, dan password wajib diisi' })
  }
  const existing = await query('SELECT id FROM users WHERE nik = ?', [nik])
  if (existing.length > 0) {
    return res.status(409).json({ message: 'NIK sudah terdaftar' })
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  const employeeRole = await query("SELECT id FROM roles WHERE name = 'Employee'")
  const roleId = employeeRole.length > 0 ? employeeRole[0].id : 1
  const empResult = await query(
    'INSERT INTO employees(name, department_id, position_id, email, phone) VALUES (?,?,?,?,?)',
    [name, department_id || null, position_id || null, email || null, phone || null],
  )
  const empId = empResult.insertId
  const userResult = await query(
    'INSERT INTO users(nik, email, phone, password, role_id, employee_id) VALUES (?,?,?,?,?,?)',
    [nik, email || null, phone || null, hashedPassword, roleId, empId],
  )
  const token = jwt.sign({ sub: userResult.insertId, nik, role: 'Employee', employeeId: empId }, process.env.JWT_SECRET, { expiresIn: '1d' })
  res.status(201).json({ token, role: 'Employee', employeeId: empId, userId: userResult.insertId })
})

app.get('/auth/me', authRequired, async (req, res) => {
  const users = await query(
    `SELECT u.id, u.nik, u.email, u.phone, r.name AS role, u.employee_id,
            e.name AS employee_name, d.name AS department, p.name AS position, e.contract_end
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN employees e ON e.id = u.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN positions p ON p.id = e.position_id
     WHERE u.id = ?`,
    [req.user.sub],
  )
  if (users.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' })
  const user = users[0]
  res.json({
    id: user.id,
    nik: user.nik,
    email: user.email,
    phone: user.phone,
    role: user.role,
    employeeId: user.employee_id,
    employeeName: user.employee_name,
    department: user.department,
    position: user.position,
    contractEnd: user.contract_end,
  })
})

app.post('/auth/logout', authRequired, (_, res) => res.json({ message: 'Logout berhasil' }))

app.get('/employees/me', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) {
    return res.status(404).json({ message: 'User tidak memiliki data karyawan' })
  }
  const rows = await query(
    `SELECT e.id, e.name, e.email, e.phone, e.photo_url, d.name AS department, p.name AS position, e.contract_end, e.department_id, e.position_id
     FROM employees e
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN positions p ON p.id = e.position_id
     WHERE e.id = ?`,
    [employeeId],
  )
  if (rows.length === 0) return res.status(404).json({ message: 'Data karyawan tidak ditemukan' })
  const emp = rows[0]
  res.json({
    ...emp,
    photoUrl: emp.photo_url,
  })
})

app.put('/employees/me', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })
  const { phone, email } = req.body
  await query('UPDATE employees SET phone=?, email=? WHERE id=?', [phone, email, employeeId])
  const updated = await query('SELECT * FROM employees WHERE id = ?', [employeeId])
  res.json(updated[0])
})

app.get('/employees', authRequired, roleRequired('HRD', 'Super Admin'), async (_, res) => {
  const rows = await query(
    `SELECT e.id, e.name, e.department_id, e.position_id, d.name department, p.name position,
            e.contract_end, e.email, e.phone, e.is_active, u.nik
     FROM employees e
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN positions p ON p.id = e.position_id
     LEFT JOIN users u ON u.employee_id = e.id
     ORDER BY e.name ASC`,
  )
  res.json(rows)
})

app.post('/employees', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { name, department_id, position_id, contract_end, email, phone } = req.body
  if (!name) return res.status(400).json({ message: 'Nama wajib diisi' })
  const inserted = await query(
    `INSERT INTO employees(name, department_id, position_id, contract_end, email, phone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, department_id || null, position_id || null, contract_end || null, email || null, phone || null],
  )
  const created = await query('SELECT * FROM employees WHERE id = ?', [inserted.insertId])
  res.status(201).json(created[0])
})

app.put('/employees/:id', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { id } = req.params
  const { name, department_id, position_id, contract_end, email, phone, is_active } = req.body
  if (!name) return res.status(400).json({ message: 'Nama wajib diisi' })
  await query(
    `UPDATE employees SET name=?, department_id=?, position_id=?, contract_end=?, email=?, phone=?, is_active=?
     WHERE id=?`,
    [name, department_id || null, position_id || null, contract_end || null, email || null, phone || null, is_active !== undefined ? is_active : 1, id],
  )
  const updated = await query('SELECT * FROM employees WHERE id = ?', [id])
  res.json(updated[0] || null)
})

app.delete('/employees/:id', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  await query('DELETE FROM employees WHERE id=?', [req.params.id])
  res.status(204).end()
})

// === EMPLOYEE IMPORT (CSV) ===
app.post('/employees/import', authRequired, roleRequired('HRD', 'Super Admin'), uploadImport.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'File CSV wajib diupload' })

  const fs = await import('node:fs/promises')
  const csvText = await fs.readFile(req.file.path, 'utf8')
  const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return res.status(400).json({ message: 'File CSV kosong atau hanya header' })

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim())
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })

  const results = { success: 0, errors: [] }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2
    try {
      if (!row.nama) { results.errors.push(`Baris ${rowNum}: nama kosong`); continue }

      // Get or create department
      let deptId = null
      if (row.departemen) {
        const depts = await query('SELECT id FROM departments WHERE name=?', [row.departemen])
        if (depts.length) { deptId = depts[0].id }
        else {
          const ins = await query('INSERT INTO departments(name) VALUES (?)', [row.departemen])
          deptId = ins.insertId
        }
      }

      // Get or create position
      let posId = null
      if (row.jabatan) {
        const poss = await query('SELECT id FROM positions WHERE name=?', [row.jabatan])
        if (poss.length) { posId = poss[0].id }
        else {
          const ins = await query('INSERT INTO positions(name) VALUES (?)', [row.jabatan])
          posId = ins.insertId
        }
      }

      // Insert employee
      const empResult = await query(
        'INSERT INTO employees(name, department_id, position_id, contract_end, email, phone) VALUES (?,?,?,?,?,?)',
        [row.nama, deptId, posId, row.akhir_kontrak || null, row.email || null, row.telepon || null]
      )
      const empId = empResult.insertId

      // Create user account if nik provided
      if (row.nik) {
        const roleName = row.role || 'Employee'
        const roles = await query('SELECT id FROM roles WHERE name=?', [roleName])
        const roleId = roles.length ? roles[0].id : (await query('SELECT id FROM roles WHERE name="Employee"'))[0].id
        const hashedPw = await bcrypt.hash(row.password || 'admin123', 10)
        await query('INSERT INTO users(nik, password, role_id, employee_id, email, phone) VALUES (?,?,?,?,?,?)',
          [row.nik, hashedPw, roleId, empId, row.email || null, row.telepon || null])
      }

      // Create salary profile if gaji_pokok provided
      if (row.gaji_pokok && Number(row.gaji_pokok) > 0) {
        await query(
          `INSERT INTO employee_salary_profiles(employee_id, effective_date, base_salary, payment_method, bank_name, bank_account_name, bank_account_number, is_active)
           VALUES (?, CURDATE(), ?, ?, ?, ?, ?, 1)`,
          [empId, Number(row.gaji_pokok), row.metode_bayar || 'bank_transfer', row.nama_bank || null, row.nama_rekening || null, row.no_rekening || null]
        )
      }

      results.success++
    } catch (err) {
      results.errors.push(`Baris ${rowNum} (${row.nama}): ${err.message}`)
    }
  }

  try { await fs.unlink(req.file.path) } catch { /* ignore */ }

  res.json({ message: `Import selesai: ${results.success} berhasil, ${results.errors.length} gagal`, ...results })
})

app.post('/attendance/clockin', authRequired, uploadSelfie.single('selfie'), async (req, res) => {
  const employee_id = req.body.employee_id
  const _gps_location = req.body.gps_location
  let selfie = null
  if (req.file) {
    try {
      selfie = await uploadToCloudinary(req.file.buffer, 'hris/selfies')
    } catch (err) {
      console.error('Cloudinary upload error:', err)
      return res.status(500).json({ message: 'Gagal mengunggah foto selfie' })
    }
  } else if (req.body.selfie) {
    selfie = req.body.selfie
  }

  const empId = employee_id || req.user.employeeId
  if (!empId) return res.status(400).json({ message: 'employee_id wajib diisi' })

  if (req.user.role === 'Employee' && employee_id && String(employee_id) !== String(req.user.employeeId)) {
    return res.status(403).json({ message: 'Tidak dapat clock in untuk karyawan lain' })
  }

  const active = await query(
    "SELECT id FROM attendance WHERE employee_id = ? AND DATE(clock_in) = CURDATE() AND clock_out IS NULL",
    [empId],
  )
  if (active.length > 0) return res.status(409).json({ message: 'Sudah clock in hari ini', attendance: active[0] })
  const inserted = await query(
    `INSERT INTO attendance(employee_id, clock_in, gps_location, selfie, status)
     VALUES (?, NOW(), ?, ?, 'Aktif')`,
     [empId, _gps_location || null, selfie || null],
  )
  const created = await query('SELECT * FROM attendance WHERE id = ?', [inserted.insertId])
  res.status(201).json(created[0])
})

app.post('/attendance/clockout', authRequired, async (req, res) => {
  const { attendance_id, gps_location: _gps_location } = req.body
  const empId = req.user.employeeId
  let attId = attendance_id
  if (!attId && empId) {
    const active = await query(
      "SELECT id FROM attendance WHERE employee_id = ? AND DATE(clock_in) = CURDATE() AND clock_out IS NULL",
      [empId],
    )
    if (active.length === 0) return res.status(404).json({ message: 'Tidak ada record clock in aktif' })
    attId = active[0].id
  }
  if (!attId) return res.status(400).json({ message: 'attendance_id wajib diisi' })

  await query('UPDATE attendance SET clock_out = NOW() WHERE id=?', [attId])
  const updated = await query('SELECT * FROM attendance WHERE id = ?', [attId])
  res.json(updated[0] || null)
})

app.get('/attendance/my', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })
  const month = req.query.month
  let rows
  if (month) {
    rows = await query(
      `SELECT a.*, e.name AS employee_name
       FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       WHERE a.employee_id = ? AND DATE_FORMAT(a.clock_in, '%Y-%m') = ?
       ORDER BY a.clock_in DESC`,
      [employeeId, month],
    )
  } else {
    rows = await query(
      `SELECT a.*, e.name AS employee_name
       FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       WHERE a.employee_id = ?
       ORDER BY a.clock_in DESC LIMIT 30`,
      [employeeId],
    )
  }
  res.json(rows)
})

app.get('/attendance/my-status', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })
  const todayClockIn = await query(
    "SELECT * FROM attendance WHERE employee_id = ? AND DATE(clock_in) = CURDATE()",
    [employeeId],
  )
  res.json({
    hasClockedIn: todayClockIn.length > 0,
    hasClockedOut: todayClockIn.length > 0 && todayClockIn[0].clock_out !== null,
    attendance: todayClockIn[0] || null,
  })
})

app.post('/leave', authRequired, async (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body
  const empId = employee_id || req.user.employeeId
  if (!empId) return res.status(400).json({ message: 'employee_id wajib diisi' })
  if (!leave_type) return res.status(400).json({ message: 'Jenis cuti wajib diisi' })
  if (!start_date) return res.status(400).json({ message: 'Tanggal mulai wajib diisi' })
  if (!end_date) return res.status(400).json({ message: 'Tanggal selesai wajib diisi' })
  if (new Date(start_date) > new Date(end_date)) return res.status(400).json({ message: 'Tanggal mulai tidak boleh setelah tanggal selesai' })
  const leaveTypes = await query('SELECT name FROM leave_types')
  const allowedTypes = leaveTypes.map((r) => r.name)
  if (!allowedTypes.includes(leave_type)) return res.status(400).json({ message: `Jenis cuti harus salah satu: ${allowedTypes.join(', ')}` })
  const inserted = await query(
    `INSERT INTO leave_request(employee_id, leave_type, start_date, end_date, reason, status)
     VALUES(?, ?, ?, ?, ?, 'Pending')`,
    [empId, leave_type, start_date, end_date, reason],
  )
  const created = await query('SELECT * FROM leave_request WHERE id = ?', [inserted.insertId])
  res.status(201).json(created[0])
})

app.put('/leave/approve', authRequired, roleRequired('Manager', 'HRD', 'Super Admin'), async (req, res) => {
  const { leave_id, status } = req.body
  if (!leave_id || !status) return res.status(400).json({ message: 'leave_id dan status wajib diisi' })
  const allowed = ['Approved', 'Rejected']
  if (!allowed.includes(status)) return res.status(400).json({ message: `Status harus salah satu: ${allowed.join(', ')}` })
  await query('UPDATE leave_request SET status=? WHERE id=?', [status, leave_id])
  const updated = await query('SELECT * FROM leave_request WHERE id = ?', [leave_id])
  if (updated.length > 0) {
    await notifyUserByEmployeeId(
      updated[0].employee_id,
      status === 'Approved' ? 'Pengajuan Cuti Disetujui' : 'Pengajuan Cuti Ditolak',
      `${status === 'Approved' ? 'Pengajuan' : 'Maaf, pengajuan'} cuti ${updated[0].leave_type} Anda (${updated[0].start_date} s/d ${updated[0].end_date}) ${status === 'Approved' ? 'telah disetujui' : 'ditolak'}.`,
      status === 'Approved' ? 'success' : 'warning',
      'leave',
      leave_id,
    )
  }
  res.json(updated[0] || null)
})

app.delete('/leave/:id', authRequired, async (req, res) => {
  const leaveId = Number(req.params.id)
  if (!leaveId) return res.status(400).json({ message: 'ID tidak valid' })
  const leave = await query('SELECT * FROM leave_request WHERE id = ?', [leaveId])
  if (!leave.length) return res.status(404).json({ message: 'Pengajuan tidak ditemukan' })
  if (leave[0].status !== 'Pending') return res.status(400).json({ message: 'Hanya pengajuan dengan status Pending yang dapat dibatalkan' })
  if (leave[0].employee_id !== req.user.employeeId && !['Super Admin', 'HRD'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Anda tidak berhak membatalkan pengajuan karyawan lain' })
  }
  await query('DELETE FROM leave_request WHERE id = ?', [leaveId])
  res.json({ message: 'Pengajuan berhasil dibatalkan', id: leaveId })
})

app.get('/attendance/today', authRequired, roleRequired('HRD', 'Super Admin'), async (_, res) => {
  const rows = await query(
    `SELECT a.id, a.employee_id, e.name AS employee_name, d.name AS department,
            a.clock_in, a.clock_out, a.status, a.gps_location, a.selfie
     FROM attendance a
     JOIN employees e ON e.id = a.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE DATE(a.clock_in) = CURDATE()
     ORDER BY a.clock_in ASC`,
  )
  res.json(rows)
})

app.get('/leave/my', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })
  const rows = await query(
    `SELECT lr.id, lr.employee_id, e.name AS employee_name, d.name AS department,
            lr.leave_type, lr.start_date, lr.end_date, lr.reason, lr.status, lr.created_at
     FROM leave_request lr
     JOIN employees e ON e.id = lr.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE lr.employee_id = ?
     ORDER BY lr.id DESC`,
    [employeeId],
  )
  res.json(rows)
})

app.get('/leave', authRequired, roleRequired('HRD', 'Manager', 'Super Admin', 'Finance'), async (_, res) => {
  const rows = await query(
    `SELECT lr.id, lr.employee_id, e.name AS employee_name, d.name AS department,
            lr.leave_type, lr.start_date, lr.end_date, lr.reason, lr.status
     FROM leave_request lr
     JOIN employees e ON e.id = lr.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     ORDER BY lr.id DESC`,
  )
  res.json(rows)
})

async function auditLog(payrollRunId, actorUserId, action, beforeData, afterData, ipAddress) {
  await query(
    `INSERT INTO payroll_audit_logs(payroll_run_id, actor_user_id, action, before_data, after_data, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payrollRunId,
      actorUserId,
      action,
      beforeData ? JSON.stringify(beforeData) : null,
      afterData ? JSON.stringify(afterData) : null,
      ipAddress || null,
    ],
  )
}

async function getSalaryProfileWithComponents(employeeId) {
  const profileRows = await query(
    `SELECT * FROM employee_salary_profiles WHERE employee_id = ? AND is_active = 1 ORDER BY effective_date DESC LIMIT 1`,
    [employeeId],
  )
  if (profileRows.length === 0) return null
  const profile = profileRows[0]

  const componentValues = await query(
    `SELECT escv.*, pc.code, pc.name, pc.type, pc.taxable
     FROM employee_salary_component_values escv
     JOIN payroll_components pc ON pc.id = escv.component_id
     WHERE escv.salary_profile_id = ?`,
    [profile.id],
  )

  return { profile, componentValues }
}

async function recalculatePayrollRun(runId) {
  const items = await query('SELECT * FROM payroll_run_items WHERE payroll_run_id = ?', [runId])
  const totals = items.reduce(
    (acc, item) => {
      acc.gross += Number(item.gross_amount || 0)
      acc.deduction += Number(item.deduction_amount || 0)
      acc.net += Number(item.net_amount || 0)
      return acc
    },
    { gross: 0, deduction: 0, net: 0 },
  )

  await query(
    `UPDATE payroll_runs
     SET employee_count=?, total_gross=?, total_deduction=?, total_net=?, updated_at=NOW()
     WHERE id=?`,
    [items.length, totals.gross, totals.deduction, totals.net, runId],
  )
}

// =============================
// Salary Components CRUD
// =============================

app.get('/salary-components', authRequired, async (_, res) => {
  const rows = await query(
    `SELECT id, code, name, type, taxable, is_active, created_at, updated_at
     FROM payroll_components
     ORDER BY type, code`,
  )
  res.json(rows)
})

app.post('/salary-components', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { code, name, type, taxable } = req.body
  if (!code || !name || !type) {
    return res.status(400).json({ message: 'code, name, dan type wajib diisi' })
  }
  if (!['earning', 'deduction'].includes(type)) {
    return res.status(400).json({ message: 'type harus earning atau deduction' })
  }
  try {
    const inserted = await query(
      `INSERT INTO payroll_components(code, name, type, taxable, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [code, name, type, taxable !== undefined ? taxable : 1],
    )
    const created = await query('SELECT * FROM payroll_components WHERE id = ?', [inserted.insertId])
    await auditLog(null, req.user.sub, 'CREATE_COMPONENT', null, created[0], req.ip)
    res.status(201).json(created[0])
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: `Komponen dengan code "${code}" sudah ada` })
    }
    throw err
  }
})

app.put('/salary-components/:id', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { id } = req.params
  const { name, type, taxable, is_active } = req.body
  const existing = await query('SELECT * FROM payroll_components WHERE id = ?', [id])
  if (existing.length === 0) return res.status(404).json({ message: 'Komponen tidak ditemukan' })

  const before = existing[0]
  await query(
    `UPDATE payroll_components SET name=?, type=?, taxable=?, is_active=?, updated_at=NOW()
     WHERE id=?`,
    [name ?? before.name, type ?? before.type, taxable ?? before.taxable, is_active ?? before.is_active, id],
  )
  const updated = await query('SELECT * FROM payroll_components WHERE id = ?', [id])
  await auditLog(null, req.user.sub, 'UPDATE_COMPONENT', before, updated[0], req.ip)
  res.json(updated[0])
})

app.delete('/salary-components/:id', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { id } = req.params
  const existing = await query('SELECT * FROM payroll_components WHERE id = ?', [id])
  if (existing.length === 0) return res.status(404).json({ message: 'Komponen tidak ditemukan' })
  await query('UPDATE payroll_components SET is_active = 0, updated_at = NOW() WHERE id = ?', [id])
  await auditLog(null, req.user.sub, 'DEACTIVATE_COMPONENT', existing[0], null, req.ip)
  res.json({ message: 'Komponen berhasil dinonaktifkan' })
})

// =============================
// Salary Profiles CRUD
// =============================

app.get('/salary-profiles', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (_, res) => {
  const rows = await query(
    `SELECT esp.id AS profile_id, esp.employee_id, e.name AS employee_name,
            d.name AS department, esp.base_salary, esp.effective_date,
            esp.payment_method, esp.bank_name, esp.bank_account_name, esp.bank_account_number,
            esp.is_active
     FROM employee_salary_profiles esp
     JOIN employees e ON e.id = esp.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE esp.is_active = 1
     ORDER BY e.name`,
  )

  const profileIds = rows.map((r) => r.profile_id)
  let componentValues = []
  if (profileIds.length > 0) {
    componentValues = await query(
      `SELECT escv.salary_profile_id, escv.component_id, escv.amount,
              pc.code AS component_code, pc.name AS component_name, pc.type AS component_type
       FROM employee_salary_component_values escv
       JOIN payroll_components pc ON pc.id = escv.component_id
       WHERE escv.salary_profile_id IN (${profileIds.map(() => '?').join(',')})`,
      profileIds,
    )
  }

  const componentMap = new Map()
  for (const cv of componentValues) {
    if (!componentMap.has(cv.salary_profile_id)) {
      componentMap.set(cv.salary_profile_id, [])
    }
    componentMap.get(cv.salary_profile_id).push(cv)
  }

  const result = rows.map((row) => {
    const components = componentMap.get(row.profile_id) || []
    const earnings = components.filter((c) => c.component_type === 'earning').reduce((s, c) => s + Number(c.amount), 0)
    const deductions = components.filter((c) => c.component_type === 'deduction').reduce((s, c) => s + Number(c.amount), 0)
    return {
      ...row,
      allowance: earnings,
      deduction: deductions,
      components,
    }
  })

  res.json(result)
})

app.get('/salary-profiles/:employeeId', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (req, res) => {
  const { employeeId } = req.params
  const data = await getSalaryProfileWithComponents(employeeId)
  if (!data) return res.status(404).json({ message: 'Profil gaji belum diset untuk karyawan ini' })
  const { profile, componentValues } = data
  const earnings = componentValues.filter((c) => c.type === 'earning').reduce((s, c) => s + Number(c.amount), 0)
  const deductions = componentValues.filter((c) => c.type === 'deduction').reduce((s, c) => s + Number(c.amount), 0)
  res.json({
    profileId: profile.id,
    employeeId: profile.employee_id,
    baseSalary: Number(profile.base_salary),
    allowance: earnings,
    deduction: deductions,
    paymentMethod: profile.payment_method,
    bankName: profile.bank_name,
    bankAccountName: profile.bank_account_name,
    bankAccountNumber: profile.bank_account_number,
    components: componentValues.map((c) => ({
      componentId: c.component_id,
      code: c.code,
      name: c.name,
      type: c.type,
      amount: Number(c.amount),
    })),
  })
})

app.post('/salary-profiles', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { employeeId, baseSalary, allowance, deduction, paymentMethod, bankName, bankAccountName, bankAccountNumber } = req.body

  if (!employeeId) return res.status(400).json({ message: 'employeeId wajib diisi' })
  if (baseSalary === undefined || Number.isNaN(Number(baseSalary))) {
    return res.status(400).json({ message: 'baseSalary wajib berupa angka yang valid' })
  }
  if (Number(baseSalary) < 0) return res.status(400).json({ message: 'Base salary tidak boleh minus' })

  const employee = await query('SELECT id FROM employees WHERE id = ?', [employeeId])
  if (employee.length === 0) return res.status(404).json({ message: 'Karyawan tidak ditemukan' })

  const existingProfile = await query(
    `SELECT * FROM employee_salary_profiles WHERE employee_id = ? AND is_active = 1`,
    [employeeId],
  )

  let profileId
  if (existingProfile.length > 0) {
    const before = existingProfile[0]
    await query(
      `UPDATE employee_salary_profiles
       SET base_salary=?, payment_method=?, bank_name=?, bank_account_name=?, bank_account_number=?, effective_date=CURDATE(), updated_at=NOW()
       WHERE id=?`,
      [baseSalary, paymentMethod || 'bank_transfer', bankName || null, bankAccountName || null, bankAccountNumber || null, before.id],
    )
    profileId = before.id
  } else {
    const inserted = await query(
      `INSERT INTO employee_salary_profiles(employee_id, effective_date, base_salary, payment_method, bank_name, bank_account_name, bank_account_number, is_active)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?, 1)`,
      [employeeId, baseSalary, paymentMethod || 'bank_transfer', bankName || null, bankAccountName || null, bankAccountNumber || null],
    )
    profileId = inserted.insertId
  }

  const componentRows = await query(`SELECT id, code FROM payroll_components WHERE is_active = 1`)
  const componentMap = new Map(componentRows.map((c) => [c.code, c.id]))

  const allowanceValue = Number(allowance || 0)
  const deductionValue = Number(deduction || 0)

  if (allowanceValue < 0 || deductionValue < 0) {
    return res.status(400).json({ message: 'Tunjangan dan potongan tidak boleh minus' })
  }

  const tunjCode = componentMap.get('TUNJ')
  const potCode = componentMap.get('POT')

  if (tunjCode) {
    await query(
      `INSERT INTO employee_salary_component_values(salary_profile_id, component_id, amount)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [profileId, tunjCode, allowanceValue],
    )
  }

  if (potCode) {
    await query(
      `INSERT INTO employee_salary_component_values(salary_profile_id, component_id, amount)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [profileId, potCode, deductionValue],
    )
  }

  await auditLog(null, req.user.sub, existingProfile.length > 0 ? 'UPDATE_SALARY_PROFILE' : 'CREATE_SALARY_PROFILE', existingProfile[0] || null, { employeeId, baseSalary, allowance: allowanceValue, deduction: deductionValue }, req.ip)

  const data = await getSalaryProfileWithComponents(employeeId)
  const earnings = data.componentValues.filter((c) => c.type === 'earning').reduce((s, c) => s + Number(c.amount), 0)
  const ded = data.componentValues.filter((c) => c.type === 'deduction').reduce((s, c) => s + Number(c.amount), 0)

  res.json({
    profileId: data.profile.id,
    employeeId: data.profile.employee_id,
    baseSalary: Number(data.profile.base_salary),
    allowance: earnings,
    deduction: ded,
    paymentMethod: data.profile.payment_method,
    message: 'Salary structure berhasil disimpan',
  })
})

app.put('/salary-profiles/:employeeId', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { employeeId } = req.params
  const { baseSalary, allowance, deduction, paymentMethod, bankName, bankAccountName, bankAccountNumber } = req.body

  const existingProfile = await query(
    `SELECT * FROM employee_salary_profiles WHERE employee_id = ? AND is_active = 1`,
    [employeeId],
  )
  if (existingProfile.length === 0) {
    return res.status(404).json({ message: 'Profil gaji untuk karyawan ini belum ada. Gunakan POST untuk membuat baru.' })
  }

  const before = existingProfile[0]

  if (baseSalary !== undefined && Number(baseSalary) < 0) {
    return res.status(400).json({ message: 'Base salary tidak boleh minus' })
  }
  if (allowance !== undefined && Number(allowance) < 0) {
    return res.status(400).json({ message: 'Tunjangan tidak boleh minus' })
  }
  if (deduction !== undefined && Number(deduction) < 0) {
    return res.status(400).json({ message: 'Potongan tidak boleh minus' })
  }

  await query(
    `UPDATE employee_salary_profiles
     SET base_salary=?, payment_method=?, bank_name=?, bank_account_name=?, bank_account_number=?, updated_at=NOW()
     WHERE id=?`,
    [baseSalary ?? before.base_salary, paymentMethod ?? before.payment_method, bankName ?? before.bank_name, bankAccountName ?? before.bank_account_name, bankAccountNumber ?? before.bank_account_number, before.id],
  )

  const profileId = before.id
  const componentRows = await query(`SELECT id, code FROM payroll_components WHERE is_active = 1`)
  const componentMap = new Map(componentRows.map((c) => [c.code, c.id]))

  if (allowance !== undefined && componentMap.get('TUNJ')) {
    await query(
      `INSERT INTO employee_salary_component_values(salary_profile_id, component_id, amount)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [profileId, componentMap.get('TUNJ'), Number(allowance)],
    )
  }

  if (deduction !== undefined && componentMap.get('POT')) {
    await query(
      `INSERT INTO employee_salary_component_values(salary_profile_id, component_id, amount)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [profileId, componentMap.get('POT'), Number(deduction)],
    )
  }

  await auditLog(null, req.user.sub, 'UPDATE_SALARY_PROFILE', before, { employeeId, baseSalary, allowance, deduction }, req.ip)

  const data = await getSalaryProfileWithComponents(employeeId)
  const earnings = data.componentValues.filter((c) => c.type === 'earning').reduce((s, c) => s + Number(c.amount), 0)
  const ded = data.componentValues.filter((c) => c.type === 'deduction').reduce((s, c) => s + Number(c.amount), 0)

  res.json({
    profileId: data.profile.id,
    employeeId: Number(employeeId),
    baseSalary: Number(data.profile.base_salary),
    allowance: earnings,
    deduction: ded,
    message: 'Salary structure berhasil diupdate',
  })
})

app.delete('/salary-profiles/:employeeId', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { employeeId } = req.params
  const existing = await query(
    `SELECT * FROM employee_salary_profiles WHERE employee_id = ? AND is_active = 1`,
    [employeeId],
  )
  if (existing.length === 0) return res.status(404).json({ message: 'Profil gaji tidak ditemukan' })
  await query('UPDATE employee_salary_profiles SET is_active = 0, updated_at = NOW() WHERE id = ?', [existing[0].id])
  await auditLog(null, req.user.sub, 'DEACTIVATE_SALARY_PROFILE', existing[0], null, req.ip)
  res.json({ message: 'Profil gaji berhasil dinonaktifkan' })
})

// =============================
// Payroll Run Generation (uses salary profiles from DB)
// =============================

app.post('/payroll/runs/generate', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (req, res) => {
  const periodMonth = req.body.periodMonth || new Date().toISOString().slice(0, 7) + '-01'

  const existingRuns = await query(
    "SELECT id, status FROM payroll_runs WHERE period_month = ? AND status IN ('draft','reviewed','approved') ORDER BY id DESC LIMIT 1",
    [periodMonth],
  )
  if (existingRuns.length > 0) {
    return res.status(409).json({ message: 'Masih ada run aktif untuk periode ini', run: existingRuns[0] })
  }

  const runInsert = await query(
    `INSERT INTO payroll_runs(period_month, status, created_by, updated_at)
     VALUES(?, 'draft', ?, NOW())`,
    [periodMonth, req.user.sub],
  )

  const runId = runInsert.insertId
  const employeeRows = await query('SELECT id FROM employees WHERE is_active = 1 ORDER BY id')

  for (const employee of employeeRows) {
    let baseSalary = 0
    let totalEarnings = 0
    let totalDeductions = 0
    const componentBreakdown = []

    const salaryData = await getSalaryProfileWithComponents(employee.id)
    if (salaryData) {
      baseSalary = Number(salaryData.profile.base_salary)
      for (const cv of salaryData.componentValues) {
        const amount = Number(cv.amount)
        if (cv.type === 'earning') {
          totalEarnings += amount
        } else {
          totalDeductions += amount
        }
        componentBreakdown.push({
          componentId: cv.component_id,
          name: cv.name,
          type: cv.type,
          amount,
        })
      }
    } else {
      baseSalary = 0
    }

    const grossAmount = baseSalary + totalEarnings
    const netAmount = grossAmount - totalDeductions

    const itemInsert = await query(
      `INSERT INTO payroll_run_items(payroll_run_id, employee_id, gross_amount, deduction_amount, net_amount, tax_amount, bpjs_amount, created_at, updated_at)
       VALUES(?, ?, ?, ?, ?, 0, 0, NOW(), NOW())`,
      [runId, employee.id, grossAmount, totalDeductions, netAmount],
    )

    await query(
      `INSERT INTO payroll_run_item_components(payroll_run_item_id, component_id, component_name_snapshot, component_type, amount, calculation_meta, created_at)
       VALUES (?, ?, 'Gaji Pokok', 'earning', ?, JSON_OBJECT('source','salary_profile'), NOW())`,
      [itemInsert.insertId, null, baseSalary],
    )

    for (const cb of componentBreakdown) {
      await query(
        `INSERT INTO payroll_run_item_components(payroll_run_item_id, component_id, component_name_snapshot, component_type, amount, calculation_meta, created_at)
         VALUES (?, ?, ?, ?, ?, JSON_OBJECT('source','salary_profile'), NOW())`,
        [itemInsert.insertId, cb.componentId, cb.name, cb.type, cb.amount],
      )
    }
  }

  await recalculatePayrollRun(runId)
  await auditLog(runId, req.user.sub, 'GENERATE_PAYROLL_RUN', null, { periodMonth }, req.ip)

  const runs = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  return res.status(201).json(runs[0])
})

app.get('/payroll/runs', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (req, res) => {
  const period = req.query.period
  const rows = period
    ? await query('SELECT * FROM payroll_runs WHERE period_month = ? ORDER BY id DESC', [period])
    : await query('SELECT * FROM payroll_runs ORDER BY id DESC LIMIT 24')
  return res.json(rows)
})

app.get('/payroll/runs/:runId', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (req, res) => {
  const runId = req.params.runId
  const runRows = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  if (runRows.length === 0) return res.status(404).json({ message: 'Run tidak ditemukan' })

  const itemRows = await query(
    `SELECT pri.*, e.name AS employee_name, d.name AS department
     FROM payroll_run_items pri
     JOIN employees e ON e.id = pri.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE pri.payroll_run_id = ?
     ORDER BY e.name`,
    [runId],
  )

  const components = await query(
    `SELECT prc.*
     FROM payroll_run_item_components prc
     JOIN payroll_run_items pri ON pri.id = prc.payroll_run_item_id
     WHERE pri.payroll_run_id = ?`,
    [runId],
  )

  const groupedComponents = new Map()
  for (const component of components) {
    if (!groupedComponents.has(component.payroll_run_item_id)) {
      groupedComponents.set(component.payroll_run_item_id, [])
    }
    groupedComponents.get(component.payroll_run_item_id).push(component)
  }

  const itemsWithComponents = itemRows.map((item) => ({
    ...item,
    components: groupedComponents.get(item.id) || [],
  }))

  return res.json({ run: runRows[0], items: itemsWithComponents })
})

// =============================
// Payroll Validation
// =============================

async function validatePayrollRun(runId) {
  const errors = []

  const runRows = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  if (runRows.length === 0) {
    return { valid: false, errors: ['Run tidak ditemukan'] }
  }

  if (runRows[0].status === 'finalized' || runRows[0].status === 'published') {
    return { valid: false, errors: ['Run sudah difinalisasi'] }
  }

  const items = await query(
    `SELECT pri.*, e.name AS employee_name, e.id AS employee_id
     FROM payroll_run_items pri
     JOIN employees e ON e.id = pri.employee_id
     WHERE pri.payroll_run_id = ?`,
    [runId],
  )

  if (items.length === 0) {
    errors.push('Tidak ada item payroll dalam run ini')
  }

  for (const item of items) {
    if (Number(item.net_amount) < 0) {
      errors.push(`Net minus untuk ${item.employee_name}: ${item.net_amount}`)
    }

    const profile = await query(
      `SELECT * FROM employee_salary_profiles WHERE employee_id = ? AND is_active = 1`,
      [item.employee_id],
    )
    if (profile.length === 0) {
      errors.push(`Profil gaji belum diset untuk ${item.employee_name}`)
    } else if (profile[0].payment_method === 'bank_transfer' && (!profile[0].bank_account_number || !profile[0].bank_name)) {
      errors.push(`Data bank kosong untuk ${item.employee_name} (metode: bank_transfer)`)
    }

    if (Number(item.gross_amount) === 0) {
      errors.push(`Gross = 0 untuk ${item.employee_name}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

// =============================
// Payroll Approval Workflow
// =============================

app.post('/payroll/runs/:runId/review', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { runId } = req.params
  const runRows = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  if (runRows.length === 0) return res.status(404).json({ message: 'Run tidak ditemukan' })

  const run = runRows[0]
  if (run.status !== 'draft') {
    return res.status(400).json({ message: `Run dengan status "${run.status}" tidak bisa di-review. Harus status "draft".` })
  }

  const validation = await validatePayrollRun(Number(runId))
  if (!validation.valid) {
    return res.status(400).json({ message: 'Validasi gagal', errors: validation.errors })
  }

  const before = { ...run }
  await query("UPDATE payroll_runs SET status='reviewed', updated_at=NOW() WHERE id=?", [runId])

  await query(
    `INSERT INTO payroll_approvals(payroll_run_id, approval_level, approver_user_id, status, comment, approved_at)
     VALUES (?, 1, ?, 'approved', 'Submitted for review', NOW())`,
    [runId, req.user.sub],
  )

  await auditLog(Number(runId), req.user.sub, 'REVIEW_PAYROLL_RUN', before, { status: 'reviewed' }, req.ip)

  const updated = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  res.json(updated[0])
})

app.post('/payroll/runs/:runId/approve', authRequired, roleRequired('Finance', 'Super Admin'), async (req, res) => {
  const { runId } = req.params
  const { comment } = req.body
  const runRows = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  if (runRows.length === 0) return res.status(404).json({ message: 'Run tidak ditemukan' })

  const run = runRows[0]
  if (run.status !== 'reviewed') {
    return res.status(400).json({ message: `Run dengan status "${run.status}" tidak bisa di-approve. Harus status "reviewed".` })
  }

  const before = { ...run }
  await query("UPDATE payroll_runs SET status='approved', updated_at=NOW() WHERE id=?", [runId])

  await query(
    `INSERT INTO payroll_approvals(payroll_run_id, approval_level, approver_user_id, status, comment, approved_at)
     VALUES (?, 2, ?, 'approved', ?, NOW())`,
    [runId, req.user.sub, comment || 'Approved'],
  )

  await auditLog(Number(runId), req.user.sub, 'APPROVE_PAYROLL_RUN', before, { status: 'approved' }, req.ip)

  const updated = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  res.json(updated[0])
})

app.post('/payroll/runs/:runId/reject', authRequired, roleRequired('Finance', 'HRD', 'Super Admin'), async (req, res) => {
  const { runId } = req.params
  const { comment } = req.body
  const runRows = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  if (runRows.length === 0) return res.status(404).json({ message: 'Run tidak ditemukan' })

  const run = runRows[0]
  if (!['draft', 'reviewed'].includes(run.status)) {
    return res.status(400).json({ message: `Run dengan status "${run.status}" tidak bisa direject.` })
  }

  const before = { ...run }
  await query("UPDATE payroll_runs SET status='draft', updated_at=NOW() WHERE id=?", [runId])

  await query(
    `INSERT INTO payroll_approvals(payroll_run_id, approval_level, approver_user_id, status, comment)
     VALUES (?, 0, ?, 'rejected', ?)`,
    [runId, req.user.sub, comment || 'Rejected'],
  )

  await auditLog(Number(runId), req.user.sub, 'REJECT_PAYROLL_RUN', before, { status: 'draft' }, req.ip)

  const updated = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  res.json(updated[0])
})

app.post('/payroll/runs/:runId/finalize', authRequired, roleRequired('Finance', 'Super Admin'), async (req, res) => {
  const { runId } = req.params
  const runRows = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  const run = runRows[0]
  if (!run) return res.status(404).json({ message: 'Run tidak ditemukan' })

  if (!['approved'].includes(run.status)) {
    return res.status(400).json({
      message: `Run harus berstatus "approved" sebelum difinalisasi. Status saat ini: "${run.status}".` +
        (run.status === 'draft' ? ' Submit ke review terlebih dahulu.' : '') +
        (run.status === 'reviewed' ? ' Perlu approval Finance.' : ''),
    })
  }

  const validation = await validatePayrollRun(Number(runId))
  if (!validation.valid) {
    return res.status(400).json({ message: 'Validasi gagal, tidak bisa finalize', errors: validation.errors })
  }

  const before = { ...run }
  await query(
    `UPDATE payroll_runs
     SET status='finalized', finalized_by=?, finalized_at=NOW(), updated_at=NOW()
     WHERE id=?`,
    [req.user.sub, runId],
  )

  await query(
    `INSERT INTO payroll_approvals(payroll_run_id, approval_level, approver_user_id, status, comment, approved_at)
     VALUES (?, 3, ?, 'approved', 'Finalized', NOW())`,
    [runId, req.user.sub],
  )

  await auditLog(Number(runId), req.user.sub, 'FINALIZE_PAYROLL_RUN', before, { status: 'finalized' }, req.ip)

  const updated = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  const items = await query('SELECT employee_id FROM payroll_run_items WHERE payroll_run_id = ?', [runId])
  for (const item of items) {
    await notifyUserByEmployeeId(item.employee_id, 'Payroll Sudah Difinalisasi', `Payroll periode ${updated[0].period_month} telah difinalisasi.`, 'info', 'payroll', runId)
  }
  return res.json(updated[0])
})

app.post('/payroll/run', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (req, res) => {
  const periodMonth = new Date().toISOString().slice(0, 7) + '-01'
  const runInsert = await query(
    `INSERT INTO payroll_runs(period_month, status, created_by, updated_at)
     VALUES(?, 'finalized', ?, NOW())`,
    [periodMonth, req.user.sub],
  )
  const runId = runInsert.insertId
  const rows = await query('SELECT id FROM employees ORDER BY id')
  let count = 0

  for (const employee of rows) {
    let baseSalary = 0
    let totalEarnings = 0
    let totalDeductions = 0

    const salaryData = await getSalaryProfileWithComponents(employee.id)
    if (salaryData) {
      baseSalary = Number(salaryData.profile.base_salary)
      for (const cv of salaryData.componentValues) {
        if (cv.type === 'earning') totalEarnings += Number(cv.amount)
        else totalDeductions += Number(cv.amount)
      }
    }

    const total = baseSalary + totalEarnings - totalDeductions
    await query(
      `INSERT INTO payroll(employee_id, salary, allowance, deduction, total, period_month)
       VALUES(?, ?, ?, ?, ?, ?)`,
      [employee.id, baseSalary, totalEarnings, totalDeductions, total, periodMonth],
    )
    await query(
      `INSERT INTO payroll_run_items(payroll_run_id, employee_id, gross_amount, deduction_amount, net_amount, tax_amount, bpjs_amount, created_at, updated_at)
       VALUES(?, ?, ?, ?, ?, 0, 0, NOW(), NOW())`,
      [runId, employee.id, baseSalary + totalEarnings, totalDeductions, total],
    )
    count += 1
  }

  await recalculatePayrollRun(runId)
  await query("UPDATE payroll_runs SET finalized_by=?, finalized_at=NOW() WHERE id=?", [req.user.sub, runId])
  await auditLog(runId, req.user.sub, 'QUICK_PAYROLL_RUN', null, { periodMonth, count }, req.ip)
  res.json({ message: 'Payroll selesai', count, runId })
})

app.get('/payroll/runs/:runId/validate', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (req, res) => {
  const runId = Number(req.params.runId)
  const validation = await validatePayrollRun(runId)
  res.json(validation)
})

// =============================
// Audit Logs
// =============================

app.get('/payroll/audit-logs', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (req, res) => {
  const runId = req.query.runId
  const logs = runId
    ? await query('SELECT * FROM payroll_audit_logs WHERE payroll_run_id = ? ORDER BY created_at DESC', [runId])
    : await query('SELECT * FROM payroll_audit_logs ORDER BY created_at DESC LIMIT 100')
  res.json(logs)
})

app.get('/payroll/approvals/:runId', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (req, res) => {
  const { runId } = req.params
  const approvals = await query(
    'SELECT * FROM payroll_approvals WHERE payroll_run_id = ? ORDER BY approval_level',
    [runId],
  )
  res.json(approvals)
})

app.get('/payroll/my', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })
  const profile = await getSalaryProfileWithComponents(employeeId)
  if (!profile) return res.status(404).json({ message: 'Profil gaji belum diset' })
  const earnings = profile.componentValues.filter(c => c.type === 'earning').reduce((s, c) => s + Number(c.amount), 0)
  const deductions = profile.componentValues.filter(c => c.type === 'deduction').reduce((s, c) => s + Number(c.amount), 0)
  res.json({
    profileId: profile.profile.id,
    employeeId: profile.profile.employee_id,
    baseSalary: Number(profile.profile.base_salary),
    allowance: earnings,
    deduction: deductions,
    netSalary: Number(profile.profile.base_salary) + earnings - deductions,
    paymentMethod: profile.profile.payment_method,
    components: profile.componentValues.map(c => ({
      componentId: c.component_id,
      code: c.code,
      name: c.name,
      type: c.type,
      amount: Number(c.amount),
    })),
  })
})

app.get('/payroll/my-runs', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })
  const rows = await query(
    `SELECT pri.*, e.name AS employee_name, d.name AS department
     FROM payroll_run_items pri
     JOIN payroll_runs pr ON pr.id = pri.payroll_run_id
     JOIN employees e ON e.id = pri.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE pri.employee_id = ?
     ORDER BY pri.created_at DESC`,
    [employeeId],
  )
  const periods = await query(
    `SELECT pr.id, pr.period_month, pr.status, pri.gross_amount, pri.deduction_amount, pri.net_amount
     FROM payroll_runs pr
     JOIN payroll_run_items pri ON pri.payroll_run_id = pr.id
     WHERE pri.employee_id = ?
     ORDER BY pr.period_month DESC`,
    [employeeId],
  )
  res.json({ items: rows, periods })
})

app.get('/payroll/my-runs/:id', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })

  const run = await query(
    `SELECT pr.* FROM payroll_runs pr
     JOIN payroll_run_items pri ON pri.payroll_run_id = pr.id
     WHERE pr.id = ? AND pri.employee_id = ?`,
    [req.params.id, employeeId],
  )
  if (run.length === 0) return res.status(404).json({ message: 'Data payroll tidak ditemukan' })

  const item = await query(
    `SELECT pri.*, e.name AS employee_name, d.name AS department
     FROM payroll_run_items pri
     JOIN employees e ON e.id = pri.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE pri.payroll_run_id = ? AND pri.employee_id = ?`,
    [req.params.id, employeeId],
  )

  const components = await query(
    `SELECT pric.component_name_snapshot, pric.component_type, pric.amount
     FROM payroll_run_item_components pric
     WHERE pric.payroll_run_item_id = ?
     ORDER BY pric.component_type, pric.id`,
    [item.length > 0 ? item[0].id : 0],
  )

  res.json({ run: run[0], items: item, components })
})

app.get('/dashboard/mobile', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  let attendanceStatus = null
  if (employeeId) {
    const todayAtt = await query(
      "SELECT * FROM attendance WHERE employee_id = ? AND DATE(clock_in) = CURDATE()",
      [employeeId],
    )
    attendanceStatus = todayAtt.length > 0 ? todayAtt[0] : null
  }
  const [totalEmployees, pendingLeave, todayAttendance] = await Promise.all([
    query('SELECT COUNT(*) AS total FROM employees WHERE is_active = 1'),
    query("SELECT COUNT(*) AS total FROM leave_request WHERE status='Pending'"),
    query(
      `SELECT COALESCE(
        ROUND(
          (SELECT COUNT(*) FROM attendance WHERE DATE(clock_in) = CURDATE()) /
          NULLIF((SELECT COUNT(*) FROM employees WHERE is_active = 1), 0) * 100,
        1),
      0) AS percentage`,
    ),
  ])
  let myLeaveCount = 0
  if (employeeId) {
    const ml = await query(
      "SELECT COUNT(*) AS total FROM leave_request WHERE employee_id = ? AND status='Pending'",
      [employeeId],
    )
    myLeaveCount = Number(ml[0].total)
  }
  res.json({
    totalEmployees: Number(totalEmployees[0].total),
    attendanceRate: Number(todayAttendance[0].percentage),
    pendingLeave: Number(pendingLeave[0].total),
    myPendingLeave: myLeaveCount,
    todayClockIn: attendanceStatus ? { clock_in: attendanceStatus.clock_in, clock_out: attendanceStatus.clock_out } : null,
  })
})

function generateSlipNumber(runId, empId) {
  const d = new Date()
  return `SLIP-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${String(runId).padStart(4, '0')}-${String(empId).padStart(4, '0')}`
}

app.post('/payroll/runs/:runId/payslips/generate', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (req, res) => {
  const runId = Number(req.params.runId)
  const run = await query('SELECT * FROM payroll_runs WHERE id = ?', [runId])
  if (!run.length) return res.status(404).json({ message: 'Payroll run tidak ditemukan' })
  if (run[0].status !== 'finalized') return res.status(400).json({ message: 'Hanya run yang sudah finalized yang bisa generate payslip' })

  const existing = await query('SELECT COUNT(*) AS cnt FROM payslips WHERE payroll_run_id = ?', [runId])
  if (existing[0].cnt > 0) return res.status(400).json({ message: 'Payslip untuk run ini sudah digenerate' })

  const items = await query(
    `SELECT pri.*, e.name AS employee_name
     FROM payroll_run_items pri
     JOIN employees e ON e.id = pri.employee_id
     WHERE pri.payroll_run_id = ?
     ORDER BY pri.id`,
    [runId],
  )

  let count = 0
  for (const item of items) {
    const slipNumber = generateSlipNumber(runId, item.employee_id)
    await query(
      `INSERT INTO payslips(employee_id, payroll_run_id, payroll_run_item_id, slip_number, period_month, gross_amount, allowance_amount, deduction_amount, net_amount, tax_amount, bpjs_amount, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [item.employee_id, runId, item.id, slipNumber, run[0].period_month, item.gross_amount, item.gross_amount - (item.deduction_amount + item.tax_amount + item.bpjs_amount), item.deduction_amount, item.net_amount, item.tax_amount, item.bpjs_amount],
    )
    count++
  }

  await query("UPDATE payroll_runs SET status='published', updated_at=NOW() WHERE id=?", [runId])
  for (const item of items) {
    await notifyUserByEmployeeId(item.employee_id, 'Slip Gaji Tersedia', `Slip gaji periode ${run[0].period_month} sudah tersedia.`, 'success', 'payslip', runId)
  }
  res.json({ message: `${count} payslip berhasil digenerate`, count, runId: Number(runId) })
})

app.get('/payslips', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (req, res) => {
  const { runId, employeeId } = req.query
  let sql = `SELECT ps.*, e.name AS employee_name, d.name AS department, p.name AS position
     FROM payslips ps
     JOIN employees e ON e.id = ps.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN positions p ON p.id = e.position_id`
  const params = []
  const conditions = []
  if (runId) { conditions.push('ps.payroll_run_id = ?'); params.push(Number(runId)) }
  if (employeeId) { conditions.push('ps.employee_id = ?'); params.push(Number(employeeId)) }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ')
  sql += ' ORDER BY ps.created_at DESC'
  const rows = await query(sql, params)
  res.json(rows)
})

app.get('/payslips/my', authRequired, async (req, res) => {
  const empId = req.user.employeeId
  if (!empId) return res.json([])
  const rows = await query(
    `SELECT ps.*, e.name AS employee_name, d.name AS department, p.name AS position
     FROM payslips ps
     JOIN employees e ON e.id = ps.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN positions p ON p.id = e.position_id
     WHERE ps.employee_id = ?
     ORDER BY ps.period_month DESC`,
    [empId],
  )
  res.json(rows)
})

app.get('/payslips/:id', authRequired, async (req, res) => {
  const payslipId = Number(req.params.id)
  const rows = await query(
    `SELECT ps.*, e.name AS employee_name, e.email, e.phone, d.name AS department, p.name AS position,
            pr.status AS run_status, pr.period_month AS run_period
     FROM payslips ps
     JOIN employees e ON e.id = ps.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN positions p ON p.id = e.position_id
     JOIN payroll_runs pr ON pr.id = ps.payroll_run_id
     WHERE ps.id = ?`,
    [payslipId],
  )
  if (!rows.length) return res.status(404).json({ message: 'Payslip tidak ditemukan' })
  const payslip = rows[0]

  if (req.user.role === 'Employee' && payslip.employee_id !== req.user.employeeId) {
    return res.status(403).json({ message: 'Anda hanya bisa melihat payslip sendiri' })
  }

  const components = await query(
    `SELECT pric.component_name_snapshot, pric.component_type, pric.amount
     FROM payroll_run_item_components pric
     WHERE pric.payroll_run_item_id = ?
     ORDER BY pric.component_type, pric.id`,
    [payslip.payroll_run_item_id],
  )

  payslip.components = components
  res.json(payslip)
})

app.get('/payslips/:id/pdf', authRequired, async (req, res) => {
  const payslipId = Number(req.params.id)
  const rows = await query(
    `SELECT ps.*, e.name AS employee_name, e.email, d.name AS department, p.name AS position,
            u.nik
     FROM payslips ps
     JOIN employees e ON e.id = ps.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN positions p ON p.id = e.position_id
     LEFT JOIN users u ON u.employee_id = e.id
     WHERE ps.id = ?`,
    [payslipId],
  )
  if (!rows.length) return res.status(404).json({ message: 'Payslip tidak ditemukan' })
  const payslip = rows[0]

  if (req.user.role === 'Employee' && payslip.employee_id !== req.user.employeeId) {
    return res.status(403).json({ message: 'Anda hanya bisa mengunduh payslip sendiri' })
  }

  const components = await query(
    `SELECT component_name_snapshot, component_type, amount
     FROM payroll_run_item_components
     WHERE payroll_run_item_id = ?
     ORDER BY component_type, id`,
    [payslip.payroll_run_item_id],
  )

  res.json({ ...payslip, components })
})

app.get('/reports/dashboard', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (_, res) => {
  const [employees, pendingLeave, attendanceToday, payrollTotal, payrollCostBreakdown, attendanceTrend] = await Promise.all([
    query('SELECT COUNT(*) AS total FROM employees'),
    query("SELECT COUNT(*) AS total FROM leave_request WHERE status='Pending'"),
    query(
      `SELECT COALESCE(
        ROUND(
          (
            (SELECT COUNT(*) FROM attendance WHERE DATE(clock_in) = CURDATE()) /
            NULLIF((SELECT COUNT(*) FROM employees), 0)
          ) * 100,
        1),
      0) AS percentage`,
    ),
    query("SELECT COALESCE(SUM(total),0) AS total FROM payroll WHERE period_month = DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
    query(
      `SELECT 
        d.name AS department,
        COUNT(e.id) AS employee_count,
        COALESCE(SUM(esp.base_salary), 0) AS total_gross
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employee_salary_profiles esp ON esp.employee_id = e.id AND esp.is_active = 1
      WHERE e.is_active = 1
      GROUP BY d.id, d.name
      ORDER BY total_gross DESC`
    ),
    query(
      `SELECT 
        DATE(DATE_SUB(CURDATE(), INTERVAL DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL day_offset DAY), '%w') DAY)) AS week_start,
        ROUND((SELECT COUNT(*) FROM attendance WHERE DATE(clock_in) = DATE_SUB(CURDATE(), INTERVAL day_offset DAY)) / NULLIF((SELECT COUNT(*) FROM employees WHERE is_active = 1), 0) * 100, 1) AS attendance_rate
      FROM (SELECT 0 AS day_offset UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) d
      ORDER BY week_start`
    ),
  ])

  res.json({
    totalEmployees: Number(employees[0].total),
    attendanceRate: Number(attendanceToday[0].percentage),
    pendingLeave: Number(pendingLeave[0].total),
    payrollTotal: Number(payrollTotal[0].total),
    payrollCostBreakdown: payrollCostBreakdown || [],
    attendanceTrend: attendanceTrend || [],
  })
})

app.get('/reports/salary-distribution', authRequired, roleRequired('HRD', 'Finance', 'Super Admin'), async (_, res) => {
  const [byDepartment, byPosition, byRole] = await Promise.all([
    query(
      `SELECT 
        d.name AS label,
        COUNT(e.id) AS count,
        COALESCE(ROUND(SUM(esp.base_salary), 0), 0) AS total_salary,
        COALESCE(ROUND(AVG(esp.base_salary), 0), 0) AS avg_salary
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employee_salary_profiles esp ON esp.employee_id = e.id AND esp.is_active = 1
      WHERE e.is_active = 1
      GROUP BY d.id, d.name
      ORDER BY total_salary DESC`
    ),
    query(
      `SELECT 
        p.name AS label,
        COUNT(e.id) AS count,
        COALESCE(ROUND(SUM(esp.base_salary), 0), 0) AS total_salary,
        COALESCE(ROUND(AVG(esp.base_salary), 0), 0) AS avg_salary
      FROM employees e
      LEFT JOIN positions p ON p.id = e.position_id
      LEFT JOIN employee_salary_profiles esp ON esp.employee_id = e.id AND esp.is_active = 1
      WHERE e.is_active = 1
      GROUP BY p.id, p.name
      ORDER BY total_salary DESC`
    ),
    query(
      `SELECT 
        r.name AS label,
        COUNT(u.id) AS count,
        COALESCE(ROUND(SUM(esp.base_salary), 0), 0) AS total_salary,
        COALESCE(ROUND(AVG(esp.base_salary), 0), 0) AS avg_salary
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      LEFT JOIN employee_salary_profiles esp ON esp.employee_id = u.id AND esp.is_active = 1
      WHERE u.is_active = 1
      GROUP BY r.id, r.name
      ORDER BY total_salary DESC`
    ),
  ])

  res.json({
    byDepartment: byDepartment || [],
    byPosition: byPosition || [],
    byRole: byRole || [],
  })
})

app.get('/reports/leave-stats', authRequired, roleRequired('HRD', 'Finance', 'Manager', 'Super Admin'), async (_, res) => {
  const [byType, byStatus, monthlySummary] = await Promise.all([
    query(
      `SELECT 
        leave_type AS label,
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending
      FROM leave_request
      GROUP BY leave_type
      ORDER BY total DESC`
    ),
    query(
      `SELECT 
        status,
        COUNT(*) AS total,
        leave_type
      FROM leave_request
      GROUP BY status, leave_type
      ORDER BY status, leave_type`
    ),
    query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved
      FROM leave_request
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month`
    ),
  ])

  res.json({
    byType: byType || [],
    byStatus: byStatus || [],
    monthlySummary: monthlySummary || [],
  })
})

// =============================
// Reference Data
// =============================

app.get('/departments', authRequired, async (_, res) => {
  const rows = await query('SELECT id, name FROM departments ORDER BY name')
  res.json(rows)
})

app.get('/positions', authRequired, async (_, res) => {
  const rows = await query('SELECT id, name FROM positions ORDER BY name')
  res.json(rows)
})

app.get('/roles', authRequired, async (_, res) => {
  const rows = await query('SELECT id, name FROM roles ORDER BY id')
  res.json(rows)
})

// === Departments CRUD ===
app.post('/departments', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ message: 'Nama departemen wajib diisi' })
  try {
    const result = await query('INSERT INTO departments (name) VALUES (?)', [name.trim()])
    res.status(201).json({ id: result.insertId, name: name.trim() })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Departemen sudah ada' })
    throw err
  }
})

app.put('/departments/:id', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ message: 'Nama departemen wajib diisi' })
  const rows = await query('SELECT id FROM departments WHERE id = ?', [Number(req.params.id)])
  if (!rows.length) return res.status(404).json({ message: 'Departemen tidak ditemukan' })
  try {
    await query('UPDATE departments SET name = ? WHERE id = ?', [name.trim(), Number(req.params.id)])
    res.json({ id: Number(req.params.id), name: name.trim() })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Departemen sudah ada' })
    throw err
  }
})

app.delete('/departments/:id', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const id = Number(req.params.id)
  const rows = await query('SELECT id FROM departments WHERE id = ?', [id])
  if (!rows.length) return res.status(404).json({ message: 'Departemen tidak ditemukan' })
  const linked = await query('SELECT COUNT(*) AS cnt FROM employees WHERE department_id = ?', [id])
  if (linked[0].cnt > 0) return res.status(400).json({ message: 'Departemen masih digunakan oleh karyawan' })
  await query('DELETE FROM departments WHERE id = ?', [id])
  res.json({ message: 'Departemen berhasil dihapus' })
})

// === Positions CRUD ===
app.post('/positions', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ message: 'Nama jabatan wajib diisi' })
  try {
    const result = await query('INSERT INTO positions (name) VALUES (?)', [name.trim()])
    res.status(201).json({ id: result.insertId, name: name.trim() })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Jabatan sudah ada' })
    throw err
  }
})

app.put('/positions/:id', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ message: 'Nama jabatan wajib diisi' })
  const rows = await query('SELECT id FROM positions WHERE id = ?', [Number(req.params.id)])
  if (!rows.length) return res.status(404).json({ message: 'Jabatan tidak ditemukan' })
  try {
    await query('UPDATE positions SET name = ? WHERE id = ?', [name.trim(), Number(req.params.id)])
    res.json({ id: Number(req.params.id), name: name.trim() })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Jabatan sudah ada' })
    throw err
  }
})

app.delete('/positions/:id', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const id = Number(req.params.id)
  const rows = await query('SELECT id FROM positions WHERE id = ?', [id])
  if (!rows.length) return res.status(404).json({ message: 'Jabatan tidak ditemukan' })
  const linked = await query('SELECT COUNT(*) AS cnt FROM employees WHERE position_id = ?', [id])
  if (linked[0].cnt > 0) return res.status(400).json({ message: 'Jabatan masih digunakan oleh karyawan' })
  await query('DELETE FROM positions WHERE id = ?', [id])
  res.json({ message: 'Jabatan berhasil dihapus' })
})

// === Leave Types CRUD ===
app.get('/leave-types', authRequired, async (_, res) => {
  const rows = await query('SELECT id, name FROM leave_types ORDER BY name')
  res.json(rows)
})

app.post('/leave-types', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ message: 'Nama jenis izin wajib diisi' })
  try {
    const result = await query('INSERT INTO leave_types (name) VALUES (?)', [name.trim()])
    res.status(201).json({ id: result.insertId, name: name.trim() })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Jenis izin sudah ada' })
    throw err
  }
})

app.put('/leave-types/:id', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ message: 'Nama jenis izin wajib diisi' })
  const rows = await query('SELECT id FROM leave_types WHERE id = ?', [Number(req.params.id)])
  if (!rows.length) return res.status(404).json({ message: 'Jenis izin tidak ditemukan' })
  try {
    await query('UPDATE leave_types SET name = ? WHERE id = ?', [name.trim(), Number(req.params.id)])
    res.json({ id: Number(req.params.id), name: name.trim() })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Jenis izin sudah ada' })
    throw err
  }
})

app.delete('/leave-types/:id', authRequired, roleRequired('HRD', 'Super Admin'), async (req, res) => {
  const id = Number(req.params.id)
  const rows = await query('SELECT id FROM leave_types WHERE id = ?', [id])
  if (!rows.length) return res.status(404).json({ message: 'Jenis izin tidak ditemukan' })
  const linked = await query('SELECT COUNT(*) AS cnt FROM leave_request WHERE leave_type = (SELECT name FROM leave_types WHERE id = ?)', [id])
  if (linked[0].cnt > 0) return res.status(400).json({ message: 'Jenis izin masih digunakan oleh pengajuan cuti' })
  await query('DELETE FROM leave_types WHERE id = ?', [id])
  res.json({ message: 'Jenis izin berhasil dihapus' })
})

// =============================
// User Management (Super Admin only)
// =============================

app.get('/users', authRequired, roleRequired('Super Admin'), async (_, res) => {
  const rows = await query(
    `SELECT u.id, u.nik, u.email, u.phone, u.role_id, r.name AS role,
            u.employee_id, e.name AS employee_name, d.name AS department,
            u.is_active, u.created_at
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN employees e ON e.id = u.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     ORDER BY u.id`,
  )
  res.json(rows)
})

app.post('/users', authRequired, roleRequired('Super Admin'), async (req, res) => {
  const { nik, password, role_id, employee_id, email, phone } = req.body
  if (!nik || !password || !role_id) {
    return res.status(400).json({ message: 'NIK, password, dan role_id wajib diisi' })
  }
  const hash = await bcrypt.hash(password, 10)
  try {
    const inserted = await query(
      `INSERT INTO users(nik, password, role_id, employee_id, email, phone) VALUES (?,?,?,?,?,?)`,
      [nik, hash, role_id, employee_id || null, email || null, phone || null],
    )
    const created = await query('SELECT id, nik, role_id, employee_id, email, phone, is_active FROM users WHERE id = ?', [inserted.insertId])
    res.status(201).json(created[0])
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: `User dengan NIK "${nik}" sudah ada` })
    }
    throw err
  }
})

app.put('/users/:id', authRequired, roleRequired('Super Admin'), async (req, res) => {
  const { id } = req.params
  const { role_id, employee_id, email, phone, is_active } = req.body
  const existing = await query('SELECT * FROM users WHERE id = ?', [id])
  if (existing.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' })
  await query(
    `UPDATE users SET role_id=COALESCE(?,role_id), employee_id=COALESCE(?,employee_id),
     email=COALESCE(?,email), phone=COALESCE(?,phone), is_active=COALESCE(?,is_active)
     WHERE id=?`,
    [role_id ?? null, employee_id ?? null, email ?? null, phone ?? null, is_active ?? null, id],
  )
  const updated = await query(
    `SELECT u.id, u.nik, u.role_id, r.name AS role, u.employee_id, e.name AS employee_name, u.email, u.phone, u.is_active
     FROM users u JOIN roles r ON r.id = u.role_id LEFT JOIN employees e ON e.id = u.employee_id WHERE u.id = ?`,
    [id],
  )
  res.json(updated[0])
})

app.put('/users/:id/password', authRequired, async (req, res) => {
  const { id } = req.params
  const { oldPassword, newPassword } = req.body

  if (req.user.sub !== Number(id) && req.user.role !== 'Super Admin') {
    return res.status(403).json({ message: 'Anda hanya dapat mengubah password sendiri' })
  }

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Password lama dan baru wajib diisi' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter' })
  }

  const users = await query('SELECT * FROM users WHERE id = ?', [id])
  if (users.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' })

  const valid = await bcrypt.compare(oldPassword, users[0].password)
  if (!valid) return res.status(400).json({ message: 'Password lama salah' })

  const hash = await bcrypt.hash(newPassword, 10)
  await query('UPDATE users SET password = ? WHERE id = ?', [hash, id])
  res.json({ message: 'Password berhasil diubah' })
})

// =============================
// Delegation List
// =============================

app.get('/employees/delegation-list', authRequired, async (req, res) => {
  const rows = await query(
    `SELECT e.id, e.name, d.name AS department, p.name AS position
     FROM employees e
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN positions p ON p.id = e.position_id
     WHERE e.is_active = 1
     ORDER BY e.name ASC`,
  )
  res.json(rows)
})

// =============================
// Profile Photo Upload
// =============================

app.post('/employees/me/photo', authRequired, uploadPhoto.single('photo'), async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })
  if (!req.file) return res.status(400).json({ message: 'File foto wajib diupload' })

  try {
    const photoUrl = await uploadToCloudinary(req.file.buffer, 'hris/photos')
    await query('UPDATE employees SET photo_url = ? WHERE id = ?', [photoUrl, employeeId])
    res.json({ photoUrl, message: 'Foto profil berhasil diupload' })
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    res.status(500).json({ message: 'Gagal mengunggah foto profil' })
  }
})

app.get('/employees/me/photo', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })

  const rows = await query('SELECT photo_url FROM employees WHERE id = ?', [employeeId])
  if (!rows.length || !rows[0].photo_url) return res.status(404).json({ message: 'Foto profil belum diupload' })
  res.json({ photoUrl: rows[0].photo_url })
})

// =============================
// Notifications
// =============================

async function createNotification(userId, title, message, type = 'info', refType = null, refId = null) {
  await query(
    `INSERT INTO notifications(user_id, title, message, type, reference_type, reference_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, title, message, type, refType, refId],
  )
}

async function notifyUserByEmployeeId(employeeId, title, message, type = 'info', refType = null, refId = null) {
  const users = await query('SELECT id FROM users WHERE employee_id = ?', [employeeId])
  if (users.length > 0) {
    await createNotification(users[0].id, title, message, type, refType, refId)
  }
}

app.get('/notifications/my', authRequired, async (req, res) => {
  const rows = await query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [req.user.sub],
  )
  const unread = rows.filter(r => !r.is_read).length
  res.json({ notifications: rows, unread })
})

app.put('/notifications/:id/read', authRequired, async (req, res) => {
  const { id } = req.params
  const existing = await query('SELECT * FROM notifications WHERE id = ? AND user_id = ?', [id, req.user.sub])
  if (existing.length === 0) return res.status(404).json({ message: 'Notifikasi tidak ditemukan' })
  await query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id])
  res.json({ message: 'Notifikasi ditandai sudah dibaca' })
})

app.put('/notifications/read-all', authRequired, async (req, res) => {
  await query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [req.user.sub])
  res.json({ message: 'Semua notifikasi ditandai sudah dibaca' })
})

// =============================
// Leave Quota
// =============================

app.get('/leave/quota', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })

  const currentYear = new Date().getFullYear()
  const [quotaTotal, usedApproved] = await Promise.all([
    query(
      `SELECT leave_type, COUNT(*) AS total
       FROM leave_request
       WHERE employee_id = ? AND YEAR(created_at) = ? AND status = 'Approved'
       GROUP BY leave_type`,
      [employeeId, currentYear],
    ),
    query('SELECT id, name FROM leave_types ORDER BY name'),
  ])

  const leaveTypes = quotaTotal
  const used = {}
  for (const row of usedApproved) {
    used[row.leave_type] = Number(row.total)
  }

  const DEFAULT_QUOTA = { 'Cuti Tahunan': 12, 'Izin Sakit': 12, 'Izin': 6, 'Cuti Khusus': 3, 'Izin Pribadi': 6 }
  const quotas = leaveTypes.map(lt => ({
    leaveType: lt.name,
    total: DEFAULT_QUOTA[lt.name] || 12,
    used: used[lt.name] || 0,
    remaining: (DEFAULT_QUOTA[lt.name] || 12) - (used[lt.name] || 0),
  }))

  res.json({ quotas, year: currentYear })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ message: 'Referensi data tidak ditemukan di database' })
  }
  if (err.code === 'ER_BAD_NULL_ERROR') {
    return res.status(400).json({ message: 'Data wajib tidak boleh kosong' })
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token tidak valid atau telah kadaluarsa. Silakan login kembali.' })
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({ message: 'Database tidak tersedia. Hubungi administrator.' })
  }
  res.status(500).json({ message: 'Terjadi kesalahan server. Coba lagi nanti.' })
})

// =============================
// Expenses (Mobile)
// =============================

app.post('/expenses', authRequired, async (req, res) => {
  const { title, amount, category, description } = req.body
  const employeeId = req.user.employeeId || req.body.employee_id
  if (!employeeId) return res.status(400).json({ message: 'employee_id wajib diisi' })
  if (!title || amount === undefined) return res.status(400).json({ message: 'title dan amount wajib diisi' })
  const inserted = await query(
    `INSERT INTO expenses(employee_id, title, amount, category, description, status)
     VALUES (?, ?, ?, ?, ?, 'Pending')`,
    [employeeId, title, Number(amount), category || 'Other', description || null],
  )
  const created = await query('SELECT * FROM expenses WHERE id = ?', [inserted.insertId])
  res.status(201).json(created[0])
})

app.get('/expenses/my', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })
  const rows = await query(
    `SELECT * FROM expenses WHERE employee_id = ? ORDER BY created_at DESC`,
    [employeeId],
  )
  const total = rows.reduce((s, r) => s + Number(r.amount), 0)
  const pending = rows.filter(r => r.status === 'Pending').reduce((s, r) => s + Number(r.amount), 0)
  const approved = rows.filter(r => r.status === 'Approved').reduce((s, r) => s + Number(r.amount), 0)
  res.json({ expenses: rows, total, pending, approved })
})

// =============================
// Office Assets (Mobile)
// =============================

app.get('/assets/my', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })
  const rows = await query(
    `SELECT * FROM office_assets WHERE employee_id = ? ORDER BY created_at DESC`,
    [employeeId],
  )
  res.json(rows)
})

// =============================
// Tasks (Mobile)
// =============================

app.post('/tasks', authRequired, async (req, res) => {
  const { title, description, priority, due_date } = req.body
  const employeeId = req.user.employeeId || req.body.employee_id
  if (!employeeId) return res.status(400).json({ message: 'employee_id wajib diisi' })
  if (!title) return res.status(400).json({ message: 'title wajib diisi' })
  const inserted = await query(
    `INSERT INTO tasks(employee_id, title, description, priority, due_date, status)
     VALUES (?, ?, ?, ?, ?, 'To Do')`,
    [employeeId, title, description || null, priority || 'Medium', due_date || null],
  )
  const created = await query('SELECT * FROM tasks WHERE id = ?', [inserted.insertId])
  res.status(201).json(created[0])
})

app.get('/tasks/my', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' })
  const rows = await query(
    `SELECT * FROM tasks WHERE employee_id = ? ORDER BY created_at DESC`,
    [employeeId],
  )
  const todo = rows.filter(r => r.status === 'To Do').length
  const inProgress = rows.filter(r => r.status === 'In Progress').length
  const done = rows.filter(r => r.status === 'Done').length
  res.json({ tasks: rows, summary: { todo, inProgress, done, total: rows.length } })
})

app.put('/tasks/:id', authRequired, async (req, res) => {
  const { id } = req.params
  const { status, title, description, priority, due_date } = req.body
  const existing = await query('SELECT * FROM tasks WHERE id = ? AND employee_id = ?', [id, req.user.employeeId])
  if (existing.length === 0) return res.status(404).json({ message: 'Task tidak ditemukan' })
  await query(
    `UPDATE tasks SET status=?, title=COALESCE(?,title), description=COALESCE(?,description), priority=COALESCE(?,priority), due_date=COALESCE(?,due_date) WHERE id=?`,
    [status || existing[0].status, title || null, description || null, priority || null, due_date || null, id],
  )
  const updated = await query('SELECT * FROM tasks WHERE id = ?', [id])
  res.json(updated[0])
})

// Static file serving for production (dist folder)
app.use(express.static(path.join(__dirname, '../../dist')))

// API 404 handler - must come before SPA fallback
app.use((req, res, next) => {
  if (req._isApiRoute) {
    return res.status(404).json({ message: 'Endpoint not found', path: req.path })
  }
  next()
})

// SPA fallback: serve index.html for non-API routes
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'))
})

const port = process.env.PORT || 5000
app.listen(port, '0.0.0.0', () => {
  const nets = os.networkInterfaces()
  const lanIp = Object.values(nets).flat().find(i => i.family === 'IPv4' && !i.internal)?.address || 'unknown'
  console.log(`\n=== HRIS API Server ===`)
  console.log(`Local:   http://localhost:${port}`)
  console.log(`Network: http://${lanIp}:${port}`)
  console.log(`Health:  http://localhost:${port}/health`)
  console.log(`\nMobile app akan auto-detect IP: ${lanIp}:${port}`)
  console.log(`Pastikan HP & PC terhubung ke WiFi yang sama\n`)
})