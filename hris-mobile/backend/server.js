import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hris_db',
  waitForConnections: true,
  connectionLimit: 10,
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Token tidak valid atau telah kadaluarsa' });
  }
}

function roleRequired(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// =============================
// Auth
// =============================

app.post('/auth/login', async (req, res) => {
  const { nik, password } = req.body;
  if (!nik || !password) {
    return res.status(400).json({ message: 'NIK dan Password wajib diisi' });
  }
  const users = await query(
    `SELECT u.id, u.nik, u.password, r.name AS role, u.employee_id
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.nik = ?`,
    [nik],
  );
  const user = users[0];
  if (!user) return res.status(401).json({ message: 'NIK tidak ditemukan' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Password salah' });

  const token = jwt.sign(
    { sub: user.id, nik: user.nik, role: user.role, employeeId: user.employee_id },
    JWT_SECRET,
    { expiresIn: '1d' },
  );
  return res.json({ token, role: user.role, employeeId: user.employee_id });
});

app.post('/auth/register', async (req, res) => {
  const { nik, email, phone, password, name, department_id, position_id } = req.body;
  if (!nik || !password || !name) {
    return res.status(400).json({ message: 'NIK, nama, dan password wajib diisi' });
  }
  const existing = await query('SELECT id FROM users WHERE nik = ?', [nik]);
  if (existing.length > 0) {
    return res.status(409).json({ message: 'NIK sudah terdaftar' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const employeeRole = await query("SELECT id FROM roles WHERE name = 'Employee'");
  const roleId = employeeRole.length > 0 ? employeeRole[0].id : 1;
  const empResult = await query(
    'INSERT INTO employees(name, department_id, position_id, email, phone) VALUES (?,?,?,?,?)',
    [name, department_id || null, position_id || null, email || null, phone || null],
  );
  const empId = empResult.insertId;
  const userResult = await query(
    'INSERT INTO users(nik, email, phone, password, role_id, employee_id) VALUES (?,?,?,?,?,?)',
    [nik, email || null, phone || null, hashedPassword, roleId, empId],
  );
  const token = jwt.sign(
    { sub: userResult.insertId, nik, role: 'Employee', employeeId: empId },
    JWT_SECRET,
    { expiresIn: '1d' },
  );
  res.status(201).json({ token, role: 'Employee', employeeId: empId, userId: userResult.insertId });
});

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
  );
  if (users.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
  const user = users[0];
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
  });
});

app.post('/auth/logout', authRequired, (_, res) => res.json({ message: 'Logout berhasil' }));

// =============================
// Employees
// =============================

app.get('/employees/me', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) {
    return res.status(404).json({ message: 'User tidak memiliki data karyawan' });
  }
  const rows = await query(
    `SELECT e.id, e.name, e.email, e.phone, d.name AS department, p.name AS position, e.contract_end, e.department_id, e.position_id
     FROM employees e
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN positions p ON p.id = e.position_id
     WHERE e.id = ?`,
    [employeeId],
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Data karyawan tidak ditemukan' });
  res.json(rows[0]);
});

app.put('/employees/me', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' });
  const { phone, email } = req.body;
  await query('UPDATE employees SET phone=?, email=? WHERE id=?', [phone, email, employeeId]);
  const updated = await query('SELECT * FROM employees WHERE id = ?', [employeeId]);
  res.json(updated[0]);
});

// =============================
// Attendance
// =============================

app.post('/attendance/clockin', authRequired, async (req, res) => {
  const { employee_id, gps_location, selfie } = req.body;
  const empId = employee_id || req.user.employeeId;
  if (!empId) return res.status(400).json({ message: 'employee_id wajib diisi' });
  const active = await query(
    "SELECT id FROM attendance WHERE employee_id = ? AND DATE(clock_in) = CURDATE() AND clock_out IS NULL",
    [empId],
  );
  if (active.length > 0) return res.status(409).json({ message: 'Sudah clock in hari ini', attendance: active[0] });
  const inserted = await query(
    `INSERT INTO attendance(employee_id, clock_in, gps_location, selfie, status)
     VALUES (?, NOW(), ?, ?, 'Aktif')`,
    [empId, gps_location || null, selfie || null],
  );
  const created = await query('SELECT * FROM attendance WHERE id = ?', [inserted.insertId]);
  res.status(201).json(created[0]);
});

app.post('/attendance/clockout', authRequired, async (req, res) => {
  const { attendance_id } = req.body;
  const empId = req.user.employeeId;
  let attId = attendance_id;
  if (!attId && empId) {
    const active = await query(
      "SELECT id FROM attendance WHERE employee_id = ? AND DATE(clock_in) = CURDATE() AND clock_out IS NULL",
      [empId],
    );
    if (active.length === 0) return res.status(404).json({ message: 'Tidak ada record clock in aktif' });
    attId = active[0].id;
  }
  if (!attId) return res.status(400).json({ message: 'attendance_id wajib diisi' });
  await query('UPDATE attendance SET clock_out = NOW() WHERE id=?', [attId]);
  const updated = await query('SELECT * FROM attendance WHERE id = ?', [attId]);
  res.json(updated[0] || null);
});

app.get('/attendance/my', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' });
  const month = req.query.month;
  let rows;
  if (month) {
    rows = await query(
      `SELECT a.*, e.name AS employee_name
       FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       WHERE a.employee_id = ? AND DATE_FORMAT(a.clock_in, '%Y-%m') = ?
       ORDER BY a.clock_in DESC`,
      [employeeId, month],
    );
  } else {
    rows = await query(
      `SELECT a.*, e.name AS employee_name
       FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       WHERE a.employee_id = ?
       ORDER BY a.clock_in DESC LIMIT 30`,
      [employeeId],
    );
  }
  res.json(rows);
});

app.get('/attendance/my-status', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' });
  const todayClockIn = await query(
    "SELECT * FROM attendance WHERE employee_id = ? AND DATE(clock_in) = CURDATE()",
    [employeeId],
  );
  res.json({
    hasClockedIn: todayClockIn.length > 0,
    hasClockedOut: todayClockIn.length > 0 && todayClockIn[0].clock_out !== null,
    attendance: todayClockIn[0] || null,
  });
});

app.get('/attendance/today', authRequired, async (_, res) => {
  const rows = await query(
    `SELECT a.id, a.employee_id, e.name AS employee_name, d.name AS department,
            a.clock_in, a.clock_out, a.status
     FROM attendance a
     JOIN employees e ON e.id = a.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE DATE(a.clock_in) = CURDATE()
     ORDER BY a.clock_in ASC`,
  );
  res.json(rows);
});

// =============================
// Leave
// =============================

app.post('/leave', authRequired, async (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;
  const empId = employee_id || req.user.employeeId;
  if (!empId) return res.status(400).json({ message: 'employee_id wajib diisi' });
  const inserted = await query(
    `INSERT INTO leave_request(employee_id, leave_type, start_date, end_date, reason, status)
     VALUES(?, ?, ?, ?, ?, 'Pending')`,
    [empId, leave_type, start_date, end_date, reason],
  );
  const created = await query('SELECT * FROM leave_request WHERE id = ?', [inserted.insertId]);
  res.status(201).json(created[0]);
});

app.get('/leave/my', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' });
  const rows = await query(
    `SELECT lr.id, lr.employee_id, e.name AS employee_name, d.name AS department,
            lr.leave_type, lr.start_date, lr.end_date, lr.reason, lr.status, lr.created_at
     FROM leave_request lr
     JOIN employees e ON e.id = lr.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE lr.employee_id = ?
     ORDER BY lr.id DESC`,
    [employeeId],
  );
  res.json(rows);
});

// =============================
// Payroll (employee self-service)
// =============================

async function getSalaryProfileWithComponents(employeeId) {
  const profileRows = await query(
    `SELECT * FROM employee_salary_profiles WHERE employee_id = ? AND is_active = 1 ORDER BY effective_date DESC LIMIT 1`,
    [employeeId],
  );
  if (profileRows.length === 0) return null;
  const profile = profileRows[0];

  const componentValues = await query(
    `SELECT escv.*, pc.code, pc.name, pc.type, pc.taxable
     FROM employee_salary_component_values escv
     JOIN payroll_components pc ON pc.id = escv.component_id
     WHERE escv.salary_profile_id = ?`,
    [profile.id],
  );

  return { profile, componentValues };
}

app.get('/payroll/my', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' });
  const profile = await getSalaryProfileWithComponents(employeeId);
  if (!profile) return res.status(404).json({ message: 'Profil gaji belum diset' });
  const earnings = profile.componentValues.filter(c => c.type === 'earning').reduce((s, c) => s + Number(c.amount), 0);
  const deductions = profile.componentValues.filter(c => c.type === 'deduction').reduce((s, c) => s + Number(c.amount), 0);
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
  });
});

app.get('/payroll/my-runs', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' });
  const rows = await query(
    `SELECT pri.*, e.name AS employee_name, d.name AS department
     FROM payroll_run_items pri
     JOIN payroll_runs pr ON pr.id = pri.payroll_run_id
     JOIN employees e ON e.id = pri.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE pri.employee_id = ?
     ORDER BY pri.created_at DESC`,
    [employeeId],
  );
  const periods = await query(
    `SELECT pr.id, pr.period_month, pr.status, pri.gross_amount, pri.deduction_amount, pri.net_amount
     FROM payroll_runs pr
     JOIN payroll_run_items pri ON pri.payroll_run_id = pr.id
     WHERE pri.employee_id = ?
     ORDER BY pr.period_month DESC`,
    [employeeId],
  );
  res.json({ items: rows, periods });
});

app.get('/payroll/my-runs/:runId', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' });
  const { runId } = req.params;

  const itemRows = await query(
    `SELECT pri.*, e.name AS employee_name, d.name AS department
     FROM payroll_run_items pri
     JOIN payroll_runs pr ON pr.id = pri.payroll_run_id
     JOIN employees e ON e.id = pri.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE pri.employee_id = ? AND pri.payroll_run_id = ?`,
    [employeeId, runId],
  );
  if (itemRows.length === 0) return res.status(404).json({ message: 'Data payroll tidak ditemukan' });

  const components = await query(
    `SELECT prc.*
     FROM payroll_run_item_components prc
     JOIN payroll_run_items pri ON pri.id = prc.payroll_run_item_id
     WHERE pri.employee_id = ? AND pri.payroll_run_id = ?`,
    [employeeId, runId],
  );

  const salaryData = await getSalaryProfileWithComponents(employeeId);
  const baseSalary = salaryData ? Number(salaryData.profile.base_salary) : 0;

  res.json({
    ...itemRows[0],
    base_salary: baseSalary,
    components: components.map(c => ({
      componentId: c.component_id,
      name: c.component_name_snapshot,
      type: c.component_type,
      amount: Number(c.amount),
    })),
  });
});

// =============================
// Dashboard (Mobile)
// =============================

app.get('/dashboard/mobile', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId;
  let attendanceStatus = null;
  if (employeeId) {
    const todayAtt = await query(
      "SELECT * FROM attendance WHERE employee_id = ? AND DATE(clock_in) = CURDATE()",
      [employeeId],
    );
    attendanceStatus = todayAtt.length > 0 ? todayAtt[0] : null;
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
  ]);
  let myLeaveCount = 0;
  if (employeeId) {
    const ml = await query(
      "SELECT COUNT(*) AS total FROM leave_request WHERE employee_id = ? AND status='Pending'",
      [employeeId],
    );
    myLeaveCount = Number(ml[0].total);
  }
  res.json({
    totalEmployees: Number(totalEmployees[0].total),
    attendanceRate: Number(todayAttendance[0].percentage),
    pendingLeave: Number(pendingLeave[0].total),
    myPendingLeave: myLeaveCount,
    todayClockIn: attendanceStatus ? { clock_in: attendanceStatus.clock_in, clock_out: attendanceStatus.clock_out } : null,
  });
});

// =============================
// Expenses
// =============================

app.post('/expenses', authRequired, async (req, res) => {
  const { title, amount, category, description } = req.body;
  const employeeId = req.user.employeeId || req.body.employee_id;
  if (!employeeId) return res.status(400).json({ message: 'employee_id wajib diisi' });
  if (!title || amount === undefined) return res.status(400).json({ message: 'title dan amount wajib diisi' });
  const inserted = await query(
    `INSERT INTO expenses(employee_id, title, amount, category, description, status)
     VALUES (?, ?, ?, ?, ?, 'Pending')`,
    [employeeId, title, Number(amount), category || 'Other', description || null],
  );
  const created = await query('SELECT * FROM expenses WHERE id = ?', [inserted.insertId]);
  res.status(201).json(created[0]);
});

app.get('/expenses/my', authRequired, async (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) return res.status(404).json({ message: 'User tidak memiliki data karyawan' });
  const rows = await query(
    'SELECT * FROM expenses WHERE employee_id = ? ORDER BY created_at DESC',
    [employeeId],
  );
  res.json(rows);
});

// =============================
// Error handler
// =============================

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token tidak valid atau telah kadaluarsa. Silakan login kembali.' });
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({ message: 'Database tidak tersedia. Hubungi administrator.' });
  }
  res.status(500).json({ message: 'Terjadi kesalahan server. Coba lagi nanti.' });
});

app.listen(PORT, () => {
  console.log(`Mobile HRIS API running on port ${PORT}`);
});