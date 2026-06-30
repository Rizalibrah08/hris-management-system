export async function seedDummyData(conn) {
  console.log('\n--- Generating Dummy Data ---')

  // Helper functions
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const getRoleId = async (name) => { const [rows] = await conn.execute('SELECT id FROM roles WHERE name=?', [name]); return rows[0]?.id }
  const getDeptId = async (name) => { const [rows] = await conn.execute('SELECT id FROM departments WHERE name=?', [name]); return rows[0]?.id }
  const getPosId = async (name) => { const [rows] = await conn.execute('SELECT id FROM positions WHERE name=?', [name]); return rows[0]?.id }

  const hash = '$2b$10$2Y8uPaG8pBSGyd7fwqcLbOY67TEKq/qjvlUr9XwJG0DP4I92G1.rW' // 'admin123'

  // 1. Employees (21 new employees)aaa
  const employeeData = [
    // Engineering
    { name: 'Budi Santoso', dept: 'Engineering', pos: 'Senior Software Engineer', role: 'Employee', email: 'budi@hris.local', nik: 'EMP001' },
    { name: 'Andi Pratama', dept: 'Engineering', pos: 'Software Engineer', role: 'Employee', email: 'andi@hris.local', nik: 'EMP002' },
    { name: 'Siti Nurhaliza', dept: 'Engineering', pos: 'Software Engineer', role: 'Employee', email: 'siti@hris.local', nik: 'EMP003' },
    { name: 'Arief Rahman', dept: 'Engineering', pos: 'Junior Software Engineer', role: 'Employee', email: 'arief@hris.local', nik: 'EMP004' },
    { name: 'Rina Melati', dept: 'Engineering', pos: 'UI/UX Designer', role: 'Employee', email: 'rina@hris.local', nik: 'EMP005' },
    { name: 'Fajar Nugroho', dept: 'Engineering', pos: 'DevOps Engineer', role: 'Employee', email: 'fajar@hris.local', nik: 'EMP006' },
    // HRD
    { name: 'Dewi Lestari', dept: 'HRD', pos: 'HR Specialist', role: 'HRD', email: 'dewi@hris.local', nik: 'EMP007' },
    { name: 'Agus Wijaya', dept: 'HRD', pos: 'Recruitment Specialist', role: 'HRD', email: 'agus@hris.local', nik: 'EMP008' },
    { name: 'Maya Sari', dept: 'HRD', pos: 'HR Admin', role: 'Employee', email: 'maya@hris.local', nik: 'EMP009' },
    // Finance
    { name: 'Dian Kusuma', dept: 'Finance', pos: 'Payroll Analyst', role: 'Finance', email: 'dian@hris.local', nik: 'EMP010' },
    { name: 'Hendra Saputra', dept: 'Finance', pos: 'Accountant', role: 'Finance', email: 'hendra@hris.local', nik: 'EMP011' },
    { name: 'Lina Fitriani', dept: 'Finance', pos: 'Tax Specialist', role: 'Finance', email: 'lina@hris.local', nik: 'EMP012' },
    // Marketing
    { name: 'Rizky Ramadhan', dept: 'Marketing', pos: 'Marketing Lead', role: 'Employee', email: 'rizky@hris.local', nik: 'EMP013' },
    { name: 'Tari Anjani', dept: 'Marketing', pos: 'Digital Marketing Specialist', role: 'Employee', email: 'tari@hris.local', nik: 'EMP014' },
    { name: 'Kevin Aditya', dept: 'Marketing', pos: 'Content Writer', role: 'Employee', email: 'kevin@hris.local', nik: 'EMP015' },
    // Operations
    { name: 'Yudi Setiawan', dept: 'Operations', pos: 'Operations Manager', role: 'Manager', email: 'yudi@hris.local', nik: 'EMP016' },
    { name: 'Wulan Wulandari', dept: 'Operations', pos: 'Admin Staff', role: 'Employee', email: 'wulan@hris.local', nik: 'EMP017' },
    // Product
    { name: 'Ivan Gunawan', dept: 'Product', pos: 'Product Manager', role: 'Manager', email: 'ivan@hris.local', nik: 'EMP018' },
    { name: 'Sarah Amelia', dept: 'Product', pos: 'Data Analyst', role: 'Employee', email: 'sarah@hris.local', nik: 'EMP019' },
    // Legal & IT
    { name: 'Reza Pahlevi', dept: 'Legal', pos: 'Legal Counsel', role: 'Employee', email: 'reza@hris.local', nik: 'EMP020' },
    { name: 'Toni Hidayat', dept: 'IT Support', pos: 'IT Support Specialist', role: 'Employee', email: 'toni@hris.local', nik: 'EMP021' },
  ]

  const newEmployees = [] // Store { id, name, user_id } for later

  for (const emp of employeeData) {
    const deptId = await getDeptId(emp.dept)
    const posId = await getPosId(emp.pos)
    const roleId = await getRoleId(emp.role)

    const [empResult] = await conn.execute(
      'INSERT INTO employees(name, department_id, position_id, email, phone) VALUES (?,?,?,?,?)',
      [emp.name, deptId, posId, emp.email, `0812${randomInt(10000000, 99999999)}`]
    )
    const empId = empResult.insertId

    const [userResult] = await conn.execute(
      'INSERT INTO users(nik, email, password, role_id, employee_id) VALUES (?,?,?,?,?)',
      [emp.nik, emp.email, hash, roleId, empId]
    )
    
    newEmployees.push({ id: empId, name: emp.name, user_id: userResult.insertId, nik: emp.nik, pos: emp.pos })
  }
  console.log(`  Created ${newEmployees.length} dummy employees & users`)

  // Get all active employees (including admins)
  const [allEmps] = await conn.execute('SELECT e.id, e.name, u.id as user_id, u.nik FROM employees e JOIN users u ON e.id = u.employee_id WHERE e.is_active=1')

  // 2. Attendance (April - June 2026)
  const startDate = new Date('2026-04-01T00:00:00Z')
  const endDate = new Date('2026-06-30T23:59:59Z')
  let attendanceCount = 0

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue // Skip weekends

    for (const emp of allEmps) {
      // 5% chance of absence (leave or sick)
      if (Math.random() < 0.05) continue

      // Clock In (07:30 - 09:15)
      const clockInTime = new Date(d)
      const inHour = randomInt(7, 9)
      const inMin = inHour === 9 ? randomInt(0, 15) : randomInt(0, 59)
      clockInTime.setHours(inHour, inMin, 0, 0)
      
      // Clock Out (16:30 - 18:45)
      const clockOutTime = new Date(d)
      clockOutTime.setHours(randomInt(16, 18), randomInt(0, 59), 0, 0)

      const status = (inHour > 9 || (inHour === 9 && inMin > 0)) ? 'Terlambat' : 'Hadir'

      await conn.execute(
        'INSERT INTO attendance (employee_id, clock_in, clock_out, gps_location, status) VALUES (?, ?, ?, ?, ?)',
        [emp.id, clockInTime, clockOutTime, '-6.2088,106.8456', status]
      )
      attendanceCount++
    }
  }
  console.log(`  Created ${attendanceCount} attendance records`)

  // 3. Leave Requests
  let leaveCount = 0
  const leaveTypes = ['Cuti Tahunan', 'Cuti Sakit', 'Cuti Tahunan', 'Izin Pribadi']
  for (let i = 0; i < 35; i++) {
    const emp = randomItem(allEmps)
    const type = randomItem(leaveTypes)
    
    // random date between April and June
    const start = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
    const duration = randomInt(1, 3)
    const end = new Date(start)
    end.setDate(end.getDate() + duration)

    const statuses = ['Approved', 'Approved', 'Approved', 'Pending', 'Rejected']
    const status = randomItem(statuses)
    
    await conn.execute(
      'INSERT INTO leave_request (employee_id, leave_type, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
      [emp.id, type, start, end, `Keperluan ${type}`, status]
    )
    leaveCount++
  }
  console.log(`  Created ${leaveCount} leave requests`)

  // 4. Payroll Data
  const getCompId = async (code) => { const [rows] = await conn.execute('SELECT id FROM payroll_components WHERE code=?', [code]); return rows[0]?.id }
  const gapokId = await getCompId('GAPOK')
  const tunjId = await getCompId('TUNJ')
  const transId = await getCompId('TJ_TRANSPORT')
  const makanId = await getCompId('TJ_MAKAN')
  const potId = await getCompId('POT')
  const bpjsTkId = await getCompId('BPJS_TK')
  const bpjsKesId = await getCompId('BPJS_KES')
  const pph21Id = await getCompId('PPH21')

  // Setup Salary Profiles for all employees
  for (const emp of allEmps) {
    // Generate realistic base salary
    let baseSalary = 5000000
    if (emp.nik.startsWith('ADM') || emp.nik.startsWith('FIN') || emp.nik.startsWith('MGR') || emp.nik.startsWith('HRD')) {
      baseSalary = randomInt(12, 25) * 1000000
    } else {
      const posId = (await conn.execute('SELECT position_id FROM employees WHERE id=?', [emp.id]))[0][0].position_id
      const posName = (await conn.execute('SELECT name FROM positions WHERE id=?', [posId]))[0][0].name
      
      if (posName.includes('Senior') || posName.includes('Manager') || posName.includes('Lead')) {
        baseSalary = randomInt(10, 18) * 1000000
      } else if (posName.includes('Junior')) {
        baseSalary = randomInt(6, 8) * 1000000
      } else {
        baseSalary = randomInt(7, 12) * 1000000
      }
    }

    const [profResult] = await conn.execute(
      'INSERT INTO employee_salary_profiles (employee_id, effective_date, base_salary, payment_method, bank_name, bank_account_number) VALUES (?, ?, ?, ?, ?, ?)',
      [emp.id, '2026-01-01', baseSalary, 'bank_transfer', 'BCA', `0123${randomInt(100000, 999999)}`]
    )
    const profileId = profResult.insertId

    // Insert Components
    const comps = [
      [gapokId, baseSalary, 0, null],
      [tunjId, baseSalary * 0.1, 0, null], // 10% dari gapok
      [transId, 50000, 0, null], // Per kehadiran, tapi diset fixed dulu nanti bisa disesuaikan run
      [makanId, 30000, 0, null],
      [bpjsTkId, 0, 1, 2.0], // 2%
      [bpjsKesId, 0, 1, 1.0], // 1%
      [pph21Id, 0, 1, 5.0], // 5% flat (simplifikasi)
    ]

    for (const [cId, amount, isPerc, percVal] of comps) {
      await conn.execute(
        'INSERT INTO employee_salary_component_values (salary_profile_id, component_id, amount, is_percentage, percentage_value) VALUES (?, ?, ?, ?, ?)',
        [profileId, cId, amount, isPerc, percVal]
      )
    }
  }

  // Generate 3 Payroll Runs (April, May, June)
  const periods = [
    { period: '2026-04-01', status: 'finalized', pub: '2026-04-28' },
    { period: '2026-05-01', status: 'finalized', pub: '2026-05-28' },
    { period: '2026-06-01', status: 'reviewed', pub: null },
  ]

  let payslipCount = 0

  for (const { period, status, pub } of periods) {
    const [runResult] = await conn.execute(
      'INSERT INTO payroll_runs (period_month, status, employee_count, created_by) VALUES (?, ?, ?, ?)',
      [period, status, allEmps.length, allEmps[0].user_id] // assuming first user is admin
    )
    const runId = runResult.insertId

    let totalGrossAll = 0
    let totalDedAll = 0
    let totalNetAll = 0

    for (const emp of allEmps) {
      const [[profile]] = await conn.execute('SELECT id, base_salary FROM employee_salary_profiles WHERE employee_id=? AND is_active=1', [emp.id])
      const [compVals] = await conn.execute('SELECT * FROM employee_salary_component_values WHERE salary_profile_id=?', [profile.id])

      let gross = 0
      let ded = 0
      let tax = 0
      let bpjs = 0
      const itemComponents = []

      // Calculate amounts
      for (const cv of compVals) {
        let amt = cv.amount
        if (cv.is_percentage) {
          amt = Math.round((profile.base_salary * parseFloat(cv.percentage_value)) / 100)
        }
        
        if (cv.component_id === bpjsKesId || cv.component_id === bpjsTkId) { ded += amt; bpjs += amt }
        else if (cv.component_id === pph21Id) { ded += amt; tax += amt }
        else if (cv.component_id === potId) { ded += amt } // maybe random deduction
        else { gross += amt }

        // Fetch component details for snapshot
        const [[compDef]] = await conn.execute('SELECT name, type FROM payroll_components WHERE id=?', [cv.component_id])

        itemComponents.push({
          cId: cv.component_id,
          name: compDef.name,
          type: compDef.type,
          amt: amt
        })
      }

      // Add random late deduction
      const lateDed = randomInt(0, 3) * 50000
      if (lateDed > 0) {
        ded += lateDed
        itemComponents.push({
          cId: potId, name: 'Potongan Absensi', type: 'deduction', amt: lateDed
        })
      }

      const net = gross - ded
      totalGrossAll += gross
      totalDedAll += ded
      totalNetAll += net

      const [itemResult] = await conn.execute(
        'INSERT INTO payroll_run_items (payroll_run_id, employee_id, gross_amount, deduction_amount, net_amount, tax_amount, bpjs_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [runId, emp.id, gross, ded, net, tax, bpjs]
      )
      const itemId = itemResult.insertId

      for (const ic of itemComponents) {
        await conn.execute(
          'INSERT INTO payroll_run_item_components (payroll_run_item_id, component_id, component_name_snapshot, component_type, amount) VALUES (?, ?, ?, ?, ?)',
          [itemId, ic.cId, ic.name, ic.type, ic.amt]
        )
      }

      // Generate Payslip
      const slipNo = `SLIP-${emp.nik}-${period.substring(0,7).replace('-','')}`
      await conn.execute(
        'INSERT INTO payslips (employee_id, payroll_run_id, payroll_run_item_id, slip_number, period_month, gross_amount, allowance_amount, deduction_amount, net_amount, tax_amount, bpjs_amount, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [emp.id, runId, itemId, slipNo, period, gross, gross - profile.base_salary, ded, net, tax, bpjs, pub ? pub + ' 09:00:00' : null]
      )
      payslipCount++
    }

    // Update run totals
    await conn.execute(
      'UPDATE payroll_runs SET total_gross=?, total_deduction=?, total_net=? WHERE id=?',
      [totalGrossAll, totalDedAll, totalNetAll, runId]
    )
  }
  console.log(`  Created ${periods.length} payroll runs and ${payslipCount} payslips`)

  // 5. Tasks
  let taskCount = 0
  const priorities = ['Low', 'Medium', 'High']
  const taskStatuses = ['To Do', 'In Progress', 'Done']
  for (let i = 0; i < 45; i++) {
    const emp = randomItem(allEmps)
    await conn.execute(
      'INSERT INTO tasks (employee_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [emp.id, `Task ${i+1}`, `Description for task ${i+1}`, randomItem(taskStatuses), randomItem(priorities), `2026-06-${randomInt(10, 28)}`]
    )
    taskCount++
  }
  console.log(`  Created ${taskCount} tasks`)

  // 6. Expenses
  let expenseCount = 0
  const expCategories = ['Transport', 'Meals', 'Office Supplies', 'Training', 'Other']
  for (let i = 0; i < 25; i++) {
    const emp = randomItem(allEmps)
    await conn.execute(
      'INSERT INTO expenses (employee_id, title, amount, category, status) VALUES (?, ?, ?, ?, ?)',
      [emp.id, `Pengeluaran ${randomItem(expCategories)}`, randomInt(5, 50) * 10000, randomItem(expCategories), randomItem(['Approved', 'Pending'])]
    )
    expenseCount++
  }
  console.log(`  Created ${expenseCount} expenses`)

  // 7. Office Assets
  let assetCount = 0
  const assets = ['MacBook Pro 14', 'ThinkPad T14', 'Dell UltraSharp Monitor', 'Logitech MX Master 3', 'Keychron K2']
  for (let i = 0; i < 30; i++) {
    const emp = randomItem(allEmps)
    const name = randomItem(assets)
    await conn.execute(
      'INSERT INTO office_assets (employee_id, asset_name, brand, condition_status, warranty_status) VALUES (?, ?, ?, ?, ?)',
      [emp.id, name, name.split(' ')[0], randomItem(['Good', 'Fair']), randomInt(0, 1)]
    )
    assetCount++
  }
  console.log(`  Created ${assetCount} office assets`)

  // 8. Notifications
  let notifCount = 0
  for (let i = 0; i < 40; i++) {
    const emp = randomItem(allEmps)
    await conn.execute(
      'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
      [emp.user_id, 'Notifikasi Sistem', 'Pesan notifikasi sistem untuk ' + emp.name, randomItem(['info', 'warning', 'success']), randomInt(0, 1)]
    )
    notifCount++
  }
  console.log(`  Created ${notifCount} notifications\n`)
}
