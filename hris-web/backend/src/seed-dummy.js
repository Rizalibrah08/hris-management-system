export async function seedDummyData(conn) {
  console.log('\n--- Generating Dummy Data ---')

  // Helper functions
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const getRoleId = async (name) => { const [rows] = await conn.execute('SELECT id FROM roles WHERE name=?', [name]); return rows[0]?.id }
  const getDeptId = async (name) => { const [rows] = await conn.execute('SELECT id FROM departments WHERE name=?', [name]); return rows[0]?.id }
  const getPosId = async (name) => { const [rows] = await conn.execute('SELECT id FROM positions WHERE name=?', [name]); return rows[0]?.id }

  const hash = '$2b$10$2Y8uPaG8pBSGyd7fwqcLbOY67TEKq/qjvlUr9XwJG0DP4I92G1.rW' // 'admin123'

  // 1. Employees - Data karyawan dengan NIK format real (EMP-YYYYMMDD-XXX) dan contract_end
  // Format NIK: EMP-YYYYMMDD-XXX (YYYYMMDD = tanggal bergabung)
  // contractType: 'permanent' atau 'contract' (kontrak 1-2 tahun)
  // isActive: beberapa karyawan kontrak sudah tidak aktif
  
  const employeeData = [
    // Engineering (10 orang - 5 laki-laki, 5 perempuan)
    { name: 'Budi Santoso', gender: 'L', dept: 'Engineering', pos: 'Engineering Manager', role: 'Manager', email: 'budi.santoso@hris.local', nik: 'EMP-20230115-001', joinDate: '2023-01-15', contractType: 'permanent', isActive: true },
    { name: 'Andi Pratama', gender: 'L', dept: 'Engineering', pos: 'Senior Software Engineer', role: 'Employee', email: 'andi.pratama@hris.local', nik: 'EMP-20230301-002', joinDate: '2023-03-01', contractType: 'permanent', isActive: true },
    { name: 'Siti Nurhaliza', gender: 'P', dept: 'Engineering', pos: 'Senior Software Engineer', role: 'Employee', email: 'siti.nurhaliza@hris.local', nik: 'EMP-20230501-003', joinDate: '2023-05-01', contractType: 'permanent', isActive: true },
    { name: 'Arief Rahman Hakim', gender: 'L', dept: 'Engineering', pos: 'Software Engineer', role: 'Employee', email: 'arief.rahman@hris.local', nik: 'EMP-20240201-004', joinDate: '2024-02-01', contractType: 'contract', contractEnd: '2026-01-31', isActive: false }, // Kontrak selesai, tidak aktif
    { name: 'Dina Mariana', gender: 'P', dept: 'Engineering', pos: 'Software Engineer', role: 'Employee', email: 'dina.mariana@hris.local', nik: 'EMP-20240315-005', joinDate: '2024-03-15', contractType: 'contract', contractEnd: '2026-03-14', isActive: true }, // Kontrak masih berjalan
    { name: 'Fajar Nugroho', gender: 'L', dept: 'Engineering', pos: 'DevOps Engineer', role: 'Employee', email: 'fajar.nugroho@hris.local', nik: 'EMP-20240601-006', joinDate: '2024-06-01', contractType: 'permanent', isActive: true },
    { name: 'Rina Melati', gender: 'P', dept: 'Engineering', pos: 'UI/UX Designer', role: 'Employee', email: 'rina.melati@hris.local', nik: 'EMP-20240801-007', joinDate: '2024-08-01', contractType: 'permanent', isActive: true },
    { name: 'Galih Pratama', gender: 'L', dept: 'Engineering', pos: 'Junior Software Engineer', role: 'Employee', email: 'galih.pratama@hris.local', nik: 'EMP-20250201-008', joinDate: '2025-02-01', contractType: 'contract', contractEnd: '2027-01-31', isActive: true }, // Kontrak 2 tahun
    { name: 'Putri Ayu Lestari', gender: 'P', dept: 'Engineering', pos: 'Junior Software Engineer', role: 'Employee', email: 'putri.ayu@hris.local', nik: 'EMP-20250401-009', joinDate: '2025-04-01', contractType: 'contract', contractEnd: '2026-03-31', isActive: false }, // Kontrak selesai
    { name: 'Rama Adiputra', gender: 'L', dept: 'Engineering', pos: 'Graphic Designer', role: 'Employee', email: 'rama.adiputra@hris.local', nik: 'EMP-20250701-010', joinDate: '2025-07-01', contractType: 'permanent', isActive: true },
    
    // HRD (5 orang - 2 laki-laki, 3 perempuan)
    { name: 'Dewi Lestari Putri', gender: 'P', dept: 'HRD', pos: 'HR Manager', role: 'HRD', email: 'dewi.lestari@hris.local', nik: 'EMP-20220801-011', joinDate: '2022-08-01', contractType: 'permanent', isActive: true },
    { name: 'Agus Wijaya', gender: 'L', dept: 'HRD', pos: 'Recruitment Specialist', role: 'HRD', email: 'agus.wijaya@hris.local', nik: 'EMP-20230915-012', joinDate: '2023-09-15', contractType: 'permanent', isActive: true },
    { name: 'Maya Sari Indah', gender: 'P', dept: 'HRD', pos: 'HR Specialist', role: 'HRD', email: 'maya.sari@hris.local', nik: 'EMP-20240110-013', joinDate: '2024-01-10', contractType: 'permanent', isActive: true },
    { name: 'Rudi Hermawan', gender: 'L', dept: 'HRD', pos: 'HR Admin', role: 'Employee', email: 'rudi.hermawan@hris.local', nik: 'EMP-20240501-014', joinDate: '2024-05-01', contractType: 'contract', contractEnd: '2026-04-30', isActive: true }, // Kontrak
    { name: 'Intan Permatasari', gender: 'P', dept: 'HRD', pos: 'HR Admin', role: 'Employee', email: 'intan.permata@hris.local', nik: 'EMP-20250301-015', joinDate: '2025-03-01', contractType: 'contract', contractEnd: '2027-02-28', isActive: true }, // Kontrak 2 tahun
    
    // Finance (6 orang - 3 laki-laki, 3 perempuan)
    { name: 'Hendro Prasetyo', gender: 'L', dept: 'Finance', pos: 'Finance Manager', role: 'Finance', email: 'hendro.prasetyo@hris.local', nik: 'EMP-20220501-016', joinDate: '2022-05-01', contractType: 'permanent', isActive: true },
    { name: 'Dian Kusuma Wardhani', gender: 'P', dept: 'Finance', pos: 'Payroll Analyst', role: 'Finance', email: 'dian.kusuma@hris.local', nik: 'EMP-20230701-017', joinDate: '2023-07-01', contractType: 'permanent', isActive: true },
    { name: 'Ahmad Fauzi', gender: 'L', dept: 'Finance', pos: 'Accountant', role: 'Finance', email: 'ahmad.fauzi@hris.local', nik: 'EMP-20231001-018', joinDate: '2023-10-01', contractType: 'permanent', isActive: true },
    { name: 'Lina Fitriani', gender: 'P', dept: 'Finance', pos: 'Accountant', role: 'Finance', email: 'lina.fitriani@hris.local', nik: 'EMP-20240215-019', joinDate: '2024-02-15', contractType: 'permanent', isActive: true },
    { name: 'Bambang Suryanto', gender: 'L', dept: 'Finance', pos: 'Tax Specialist', role: 'Finance', email: 'bambang.suryanto@hris.local', nik: 'EMP-20240601-020', joinDate: '2024-06-01', contractType: 'permanent', isActive: true },
    { name: 'Sari Rahayu', gender: 'P', dept: 'Finance', pos: 'Tax Specialist', role: 'Finance', email: 'sari.rahayu@hris.local', nik: 'EMP-20250101-021', joinDate: '2025-01-01', contractType: 'contract', contractEnd: '2026-12-31', isActive: true }, // Kontrak
    
    // Marketing (7 orang - 3 laki-laki, 4 perempuan)
    { name: 'Rizky Ramadhan', gender: 'L', dept: 'Marketing', pos: 'Marketing Lead', role: 'Employee', email: 'rizky.ramadhan@hris.local', nik: 'EMP-20230401-022', joinDate: '2023-04-01', contractType: 'permanent', isActive: true },
    { name: 'Tari Anjani Putri', gender: 'P', dept: 'Marketing', pos: 'Digital Marketing Specialist', role: 'Employee', email: 'tari.anjani@hris.local', nik: 'EMP-20230815-023', joinDate: '2023-08-15', contractType: 'permanent', isActive: true },
    { name: 'Kevin Aditya Putra', gender: 'L', dept: 'Marketing', pos: 'Digital Marketing Specialist', role: 'Employee', email: 'kevin.aditya@hris.local', nik: 'EMP-20240301-024', joinDate: '2024-03-01', contractType: 'contract', contractEnd: '2026-02-28', isActive: true }, // Kontrak
    { name: 'Ratih Puspitasari', gender: 'P', dept: 'Marketing', pos: 'Content Writer', role: 'Employee', email: 'ratih.puspita@hris.local', nik: 'EMP-20240601-025', joinDate: '2024-06-01', contractType: 'contract', contractEnd: '2025-12-31', isActive: false }, // Kontrak selesai
    { name: 'Anisa Rahma', gender: 'P', dept: 'Marketing', pos: 'SEO Specialist', role: 'Employee', email: 'anisa.rahma@hris.local', nik: 'EMP-20240901-026', joinDate: '2024-09-01', contractType: 'permanent', isActive: true },
    { name: 'Doni Setiawan', gender: 'L', dept: 'Marketing', pos: 'Content Writer', role: 'Employee', email: 'doni.setiawan@hris.local', nik: 'EMP-20250201-027', joinDate: '2025-02-01', contractType: 'contract', contractEnd: '2027-01-31', isActive: true }, // Kontrak 2 tahun
    { name: 'Fitria Maharani', gender: 'P', dept: 'Marketing', pos: 'Graphic Designer', role: 'Employee', email: 'fitria.maharani@hris.local', nik: 'EMP-20250501-028', joinDate: '2025-05-01', contractType: 'permanent', isActive: true },
    
    // Operations (4 orang - 2 laki-laki, 2 perempuan)
    { name: 'Yudi Setiawan', gender: 'L', dept: 'Operations', pos: 'Operations Manager', role: 'Manager', email: 'yudi.setiawan@hris.local', nik: 'EMP-20220901-029', joinDate: '2022-09-01', contractType: 'permanent', isActive: true },
    { name: 'Wulan Dari', gender: 'P', dept: 'Operations', pos: 'Admin Staff', role: 'Employee', email: 'wulan.dari@hris.local', nik: 'EMP-20240201-030', joinDate: '2024-02-01', contractType: 'contract', contractEnd: '2026-01-31', isActive: true }, // Kontrak
    { name: 'Faisal Abdullah', gender: 'L', dept: 'Operations', pos: 'Admin Staff', role: 'Employee', email: 'faisal.abdullah@hris.local', nik: 'EMP-20240701-031', joinDate: '2024-07-01', contractType: 'permanent', isActive: true },
    { name: 'Novia Anggraini', gender: 'P', dept: 'Operations', pos: 'Admin Staff', role: 'Employee', email: 'novia.anggraini@hris.local', nik: 'EMP-20250401-032', joinDate: '2025-04-01', contractType: 'contract', contractEnd: '2026-03-31', isActive: false }, // Kontrak selesai
    
    // Product (4 orang - 2 laki-laki, 2 perempuan)
    { name: 'Ivan Gunawan', gender: 'L', dept: 'Product', pos: 'Product Manager', role: 'Manager', email: 'ivan.gunawan@hris.local', nik: 'EMP-20230201-033', joinDate: '2023-02-01', contractType: 'permanent', isActive: true },
    { name: 'Sarah Amelia', gender: 'P', dept: 'Product', pos: 'Data Analyst', role: 'Employee', email: 'sarah.amelia@hris.local', nik: 'EMP-20240401-034', joinDate: '2024-04-01', contractType: 'permanent', isActive: true },
    { name: 'Bayu Aji Nugroho', gender: 'L', dept: 'Product', pos: 'Data Analyst', role: 'Employee', email: 'bayu.aji@hris.local', nik: 'EMP-20240801-035', joinDate: '2024-08-01', contractType: 'contract', contractEnd: '2026-07-31', isActive: true }, // Kontrak
    { name: 'Dwi Rahmawati', gender: 'P', dept: 'Product', pos: 'UI/UX Designer', role: 'Employee', email: 'dwi.rahmawati@hris.local', nik: 'EMP-20250301-036', joinDate: '2025-03-01', contractType: 'permanent', isActive: true },
    
    // Legal (2 orang - 1 laki-laki, 1 perempuan)
    { name: 'Reza Pahlevi', gender: 'L', dept: 'Legal', pos: 'Legal Counsel', role: 'Employee', email: 'reza.pahlevi@hris.local', nik: 'EMP-20230601-037', joinDate: '2023-06-01', contractType: 'permanent', isActive: true },
    { name: 'Kartika Sari', gender: 'P', dept: 'Legal', pos: 'Legal Counsel', role: 'Employee', email: 'kartika.sari@hris.local', nik: 'EMP-20240901-038', joinDate: '2024-09-01', contractType: 'contract', contractEnd: '2026-08-31', isActive: true }, // Kontrak
    
    // IT Support (3 orang - 2 laki-laki, 1 perempuan)
    { name: 'Toni Hidayat', gender: 'L', dept: 'IT Support', pos: 'IT Support Specialist', role: 'Employee', email: 'toni.hidayat@hris.local', nik: 'EMP-20230301-039', joinDate: '2023-03-01', contractType: 'permanent', isActive: true },
    { name: 'Joko Susilo', gender: 'L', dept: 'IT Support', pos: 'IT Support Specialist', role: 'Employee', email: 'joko.susilo@hris.local', nik: 'EMP-20240501-040', joinDate: '2024-05-01', contractType: 'contract', contractEnd: '2026-04-30', isActive: true }, // Kontrak
    { name: 'Mega Puspita', gender: 'P', dept: 'IT Support', pos: 'IT Support Specialist', role: 'Employee', email: 'mega.puspita@hris.local', nik: 'EMP-20250601-041', joinDate: '2025-06-01', contractType: 'permanent', isActive: true },
  ]

  const newEmployees = [] // Store { id, name, user_id, gender, pos, dept, nik, isActive } for later

  let contractCount = 0
  let inactiveCount = 0

  for (const emp of employeeData) {
    const deptId = await getDeptId(emp.dept)
    const posId = await getPosId(emp.pos)
    const roleId = await getRoleId(emp.role)

    // Hitung contract dan inactive
    if (emp.contractType === 'contract') contractCount++
    if (!emp.isActive) inactiveCount++

    const [empResult] = await conn.execute(
      'INSERT INTO employees(name, department_id, position_id, email, phone, contract_end, is_active) VALUES (?,?,?,?,?,?,?)',
      [emp.name, deptId, posId, emp.email, `0812${randomInt(10000000, 99999999)}`, emp.contractEnd || null, emp.isActive ? 1 : 0]
    )
    const empId = empResult.insertId

    // Only create user for active employees
    let userId = null
    if (emp.isActive) {
      const [userResult] = await conn.execute(
        'INSERT INTO users(nik, email, password, role_id, employee_id, is_active) VALUES (?,?,?,?,?,?)',
        [emp.nik, emp.email, hash, roleId, empId, 1]
      )
      userId = userResult.insertId
    }
    
    newEmployees.push({ 
      id: empId, 
      name: emp.name, 
      user_id: userId, 
      nik: emp.nik, 
      pos: emp.pos, 
      dept: emp.dept,
      gender: emp.gender,
      isActive: emp.isActive,
      contractType: emp.contractType
    })
  }
  
  const activeCount = employeeData.filter(e => e.isActive).length
  const maleCount = employeeData.filter(e => e.gender === 'L').length
  const femaleCount = employeeData.filter(e => e.gender === 'P').length
  
  console.log(`  Created ${newEmployees.length} dummy employees (${maleCount} laki-laki, ${femaleCount} perempuan)`)
  console.log(`    - ${activeCount} aktif, ${inactiveCount} tidak aktif`)
  console.log(`    - ${contractCount} kontrak (beberapa sudah selesai), ${employeeData.length - contractCount} permanen`)

  // Get all active employees (including admins)
  const [allEmps] = await conn.execute('SELECT e.id, e.name, u.id as user_id, u.nik FROM employees e JOIN users u ON e.id = u.employee_id WHERE e.is_active=1')

  // 2. Attendance dengan pola realistis (April - Juni 2026)
  const startDate = new Date('2026-04-01T00:00:00Z')
  const endDate = new Date('2026-06-30T23:59:59Z')
  let attendanceCount = 0

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue // Skip weekends

    for (const emp of allEmps) {
      // 8% chance karyawan cuti/sakit/izin (tidak masuk)
      const isAbsent = Math.random() < 0.08
      if (isAbsent) continue

      // 2% chance WFH (no selfie, different location)
      const isWFH = Math.random() < 0.02
      
      // Clock In dengan variasi realistis
      // 70% on-time (07:30-08:45), 25% terlambat (08:46-09:30), 5% sangat terlambat (09:31-10:30)
      const clockInTime = new Date(d)
      let inHour, inMin, status
      
      const lateChance = Math.random()
      if (lateChance < 0.70) {
        // On time
        inHour = randomInt(7, 8)
        inMin = inHour === 8 ? randomInt(0, 45) : randomInt(30, 59)
        status = 'Hadir'
      } else if (lateChance < 0.95) {
        // Terlambat
        inHour = randomInt(8, 9)
        inMin = inHour === 8 ? randomInt(46, 59) : randomInt(0, 30)
        status = 'Terlambat'
      } else {
        // Sangat terlambat
        inHour = randomInt(9, 10)
        inMin = randomInt(31, 59)
        status = 'Terlambat'
      }
      
      clockInTime.setHours(inHour, inMin, randomInt(0, 59), 0)
      
      // Clock Out (16:00 - 19:00, dengan variasi)
      // 60% pulang normal (16:30-17:30), 30% lembur ringan (17:31-18:30), 10% lembur berat (18:31-19:30)
      const clockOutTime = new Date(d)
      const overtimeChance = Math.random()
      let outHour, outMin
      
      if (overtimeChance < 0.60) {
        // Normal
        outHour = randomInt(16, 17)
        outMin = outHour === 16 ? randomInt(30, 59) : randomInt(0, 30)
      } else if (overtimeChance < 0.90) {
        // Lembur ringan
        outHour = randomInt(17, 18)
        outMin = outHour === 17 ? randomInt(31, 59) : randomInt(0, 30)
      } else {
        // Lembur berat
        outHour = randomInt(18, 19)
        outMin = outHour === 18 ? randomInt(31, 59) : randomInt(0, 30)
      }
      
      clockOutTime.setHours(outHour, outMin, randomInt(0, 59), 0)

      const gpsLocation = isWFH ? '-6.2500,106.8700' : '-6.2088,106.8456' // WFH dari lokasi berbeda
      const selfie = isWFH ? null : `https://cloudinary.com/hris/selfie_${emp.nik}_${d.toISOString().split('T')[0]}.jpg`

      await conn.execute(
        'INSERT INTO attendance (employee_id, clock_in, clock_out, gps_location, selfie, status) VALUES (?, ?, ?, ?, ?, ?)',
        [emp.id, clockInTime, clockOutTime, gpsLocation, selfie, status]
      )
      attendanceCount++
    }
  }
  console.log(`  Created ${attendanceCount} attendance records (dengan variasi on-time, terlambat, WFH)`)

  // 3. Leave Requests dengan distribusi yang lebih realistis
  let leaveCount = 0
  const leaveTypesDistribution = [
    { type: 'Cuti Tahunan', weight: 0.40, durationRange: [2, 5] },
    { type: 'Cuti Sakit', weight: 0.25, durationRange: [1, 3] },
    { type: 'Izin Pribadi', weight: 0.20, durationRange: [1, 2] },
    { type: 'Izin Mendadak', weight: 0.10, durationRange: [1, 1] },
    { type: 'Cuti Menikah', weight: 0.03, durationRange: [2, 3] },
    { type: 'Cuti Melahirkan', weight: 0.02, durationRange: [90, 90] }, // khusus perempuan
  ]

  // Generate ~2-3 leave request per karyawan dalam 3 bulan (Apr-Jun)
  for (const emp of allEmps) {
    const numLeaves = randomInt(1, 3)
    
    for (let i = 0; i < numLeaves; i++) {
      // Pilih tipe cuti berdasar weight
      let randWeight = Math.random()
      let selectedType = leaveTypesDistribution[0]
      
      // Skip cuti melahirkan untuk laki-laki
      const empData = newEmployees.find(e => e.id === emp.id)
      const availableTypes = empData && empData.gender === 'L' 
        ? leaveTypesDistribution.filter(t => t.type !== 'Cuti Melahirkan')
        : leaveTypesDistribution
      
      let cumWeight = 0
      for (const lt of availableTypes) {
        cumWeight += lt.weight
        if (randWeight <= cumWeight) {
          selectedType = lt
          break
        }
      }
      
      // Random date antara April dan Juni
      const startTimestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      const start = new Date(startTimestamp)
      
      // Hindari weekend sebagai start date
      while (start.getDay() === 0 || start.getDay() === 6) {
        start.setDate(start.getDate() + 1)
      }
      
      const duration = randomInt(selectedType.durationRange[0], selectedType.durationRange[1])
      const end = new Date(start)
      end.setDate(end.getDate() + duration - 1)

      // Status dengan distribusi realistis: 65% approved, 25% pending, 10% rejected
      let status
      const statusRand = Math.random()
      if (statusRand < 0.65) status = 'Approved'
      else if (statusRand < 0.90) status = 'Pending'
      else status = 'Rejected'
      
      const reasons = {
        'Cuti Tahunan': ['Liburan keluarga', 'Keperluan pribadi', 'Acara keluarga', 'Refreshing'],
        'Cuti Sakit': ['Demam', 'Flu dan batuk', 'Sakit perut', 'Periksa kesehatan', 'Istirahat sakit'],
        'Izin Pribadi': ['Urusan keluarga', 'Keperluan mendadak', 'Acara keluarga'],
        'Izin Mendadak': ['Kondisi darurat', 'Keperluan mendesak', 'Kondisi tidak fit'],
        'Cuti Menikah': ['Pernikahan sendiri', 'Persiapan pernikahan'],
        'Cuti Melahirkan': ['Cuti melahirkan'],
      }
      
      const reason = randomItem(reasons[selectedType.type] || ['Keperluan pribadi'])
      
      await conn.execute(
        'INSERT INTO leave_request (employee_id, leave_type, start_date, end_date, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [emp.id, selectedType.type, start, end, reason, status, new Date(start.getTime() - 86400000 * randomInt(1, 5))] // Created 1-5 days before start
      )
      leaveCount++
    }
  }
  console.log(`  Created ${leaveCount} leave requests (berbagai tipe dengan distribusi realistis)`)

  // 4. Payroll Data dengan struktur gaji yang realistis
  const getCompId = async (code) => { const [rows] = await conn.execute('SELECT id FROM payroll_components WHERE code=?', [code]); return rows[0]?.id }
  const gapokId = await getCompId('GAPOK')
  const tunjId = await getCompId('TUNJ')
  const transId = await getCompId('TJ_TRANSPORT')
  const makanId = await getCompId('TJ_MAKAN')
  const potId = await getCompId('POT')
  const bpjsTkId = await getCompId('BPJS_TK')
  const bpjsKesId = await getCompId('BPJS_KES')
  const pph21Id = await getCompId('PPH21')

  // Setup Salary Profiles dengan gaji standar Indonesia
  for (const emp of allEmps) {
    // Ambil info posisi
    const [[empInfo]] = await conn.execute(
      'SELECT e.name, p.name as position_name, d.name as dept_name FROM employees e JOIN positions p ON e.position_id = p.id JOIN departments d ON e.department_id = d.id WHERE e.id=?',
      [emp.id]
    )
    
    let baseSalary = 5000000 // Default UMR Jakarta
    const posName = empInfo.position_name
    const deptName = empInfo.dept_name
    
    // Struktur gaji berdasar level dan department (dalam Rupiah)
    if (posName.includes('Manager') || emp.nik.startsWith('MGR')) {
      baseSalary = randomInt(15, 25) * 1000000 // Manager: 15-25 juta
    } else if (posName.includes('Lead') || posName.includes('Senior')) {
      baseSalary = randomInt(10, 18) * 1000000 // Senior/Lead: 10-18 juta
    } else if (posName.includes('Junior')) {
      baseSalary = randomInt(5, 8) * 1000000 // Junior: 5-8 juta
    } else if (posName.includes('Specialist') || posName.includes('Analyst')) {
      baseSalary = randomInt(8, 14) * 1000000 // Specialist: 8-14 juta
    } else if (posName.includes('Admin') || posName.includes('Staff')) {
      baseSalary = randomInt(5, 9) * 1000000 // Admin/Staff: 5-9 juta
    } else if (deptName === 'Engineering' || deptName === 'Product') {
      baseSalary = randomInt(8, 15) * 1000000 // Engineering/Product: 8-15 juta
    } else if (deptName === 'Finance' || deptName === 'Legal') {
      baseSalary = randomInt(9, 16) * 1000000 // Finance/Legal: 9-16 juta
    } else {
      baseSalary = randomInt(6, 12) * 1000000 // Others: 6-12 juta
    }

    // Khusus admin/top management
    if (emp.nik.startsWith('ADM') || emp.nik.startsWith('FIN001') || emp.nik.startsWith('HRD001')) {
      baseSalary = randomInt(18, 30) * 1000000 // Top management: 18-30 juta
    }

    const [profResult] = await conn.execute(
      'INSERT INTO employee_salary_profiles (employee_id, effective_date, base_salary, payment_method, bank_name, bank_account_name, bank_account_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [emp.id, '2026-01-01', baseSalary, 'bank_transfer', randomItem(['BCA', 'Mandiri', 'BNI', 'BRI']), empInfo.name, `${randomInt(1000000000, 9999999999)}`]
    )
    const profileId = profResult.insertId

    // Komponen gaji
    const tunjangan = Math.round(baseSalary * 0.20) // 20% tunjangan tetap
    const transport = 500000 // Rp 500k per bulan (flat)
    const makan = 600000 // Rp 600k per bulan (flat)
    
    const comps = [
      [gapokId, baseSalary, 0, null],
      [tunjId, tunjangan, 0, null],
      [transId, transport, 0, null],
      [makanId, makan, 0, null],
      [bpjsTkId, 0, 1, 2.0], // BPJS TK 2% dari gaji pokok
      [bpjsKesId, 0, 1, 1.0], // BPJS Kesehatan 1% dari gaji pokok
      [pph21Id, 0, 1, 5.0], // PPh21 5% (simplified)
    ]

    for (const [cId, amount, isPerc, percVal] of comps) {
      await conn.execute(
        'INSERT INTO employee_salary_component_values (salary_profile_id, component_id, amount, is_percentage, percentage_value) VALUES (?, ?, ?, ?, ?)',
        [profileId, cId, amount, isPerc, percVal]
      )
    }
  }
  console.log(`  Created salary profiles untuk ${allEmps.length} employees (range 5-30 juta)`)

  // 5. Generate 3 Payroll Runs (April, May, June) dengan status yang konsisten
  // Status flow: draft -> reviewed -> approved -> finalized -> published
  const periods = [
    { period: '2026-04-01', status: 'published', finalizedAt: '2026-04-28 10:00:00', generateSlips: true },
    { period: '2026-05-01', status: 'finalized', finalizedAt: '2026-05-28 14:00:00', generateSlips: false },
    { period: '2026-06-01', status: 'reviewed', finalizedAt: null, generateSlips: false },
  ]

  let payslipCount = 0
  const firstAdminUserId = allEmps.find(e => e.nik.startsWith('ADM'))?.user_id || allEmps[0].user_id

  for (const { period, status, finalizedAt, generateSlips } of periods) {
    const periodDate = new Date(period)
    const periodLabel = periodDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
    
    const [runResult] = await conn.execute(
      'INSERT INTO payroll_runs (period_month, status, employee_count, created_by, finalized_at) VALUES (?, ?, ?, ?, ?)',
      [period, status, allEmps.length, firstAdminUserId, finalizedAt]
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
        
        // Fetch component details untuk snapshot
        const [[compDef]] = await conn.execute('SELECT name, type FROM payroll_components WHERE id=?', [cv.component_id])

        if (cv.component_id === bpjsKesId || cv.component_id === bpjsTkId) { 
          ded += amt
          bpjs += amt 
        } else if (cv.component_id === pph21Id) { 
          ded += amt
          tax += amt 
        } else if (cv.component_id === potId) { 
          ded += amt 
        } else { 
          gross += amt 
        }

        itemComponents.push({
          cId: cv.component_id,
          name: compDef.name,
          type: compDef.type,
          amt: amt
        })
      }

      // Hitung attendance untuk bulan ini (untuk potongan keterlambatan)
      const periodStart = new Date(period)
      const periodEnd = new Date(periodStart)
      periodEnd.setMonth(periodEnd.getMonth() + 1)
      periodEnd.setDate(0) // Last day of month
      
      const [[attInfo]] = await conn.execute(
        'SELECT COUNT(*) as late_count FROM attendance WHERE employee_id=? AND DATE(clock_in) BETWEEN ? AND ? AND status="Terlambat"',
        [emp.id, periodStart.toISOString().split('T')[0], periodEnd.toISOString().split('T')[0]]
      )
      
      // Potongan Rp 50k per keterlambatan
      const lateDed = (attInfo.late_count || 0) * 50000
      if (lateDed > 0) {
        ded += lateDed
        itemComponents.push({
          cId: potId, 
          name: 'Potongan Keterlambatan', 
          type: 'deduction', 
          amt: lateDed
        })
      }

      const net = gross - ded
      totalGrossAll += gross
      totalDedAll += ded
      totalNetAll += net

      const [itemResult] = await conn.execute(
        'INSERT INTO payroll_run_items (payroll_run_id, employee_id, gross_amount, deduction_amount, net_amount, tax_amount, bpjs_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [runId, emp.id, gross, ded, net, tax, bpjs, `Payroll ${periodLabel}`]
      )
      const itemId = itemResult.insertId

      for (const ic of itemComponents) {
        await conn.execute(
          'INSERT INTO payroll_run_item_components (payroll_run_item_id, component_id, component_name_snapshot, component_type, amount) VALUES (?, ?, ?, ?, ?)',
          [itemId, ic.cId, ic.name, ic.type, ic.amt]
        )
      }

      // Generate Payslip hanya untuk run yang sudah published
      if (generateSlips) {
        const periodCode = period.substring(0,7).replace('-','') // 202604
        const slipNo = `SLIP-${periodCode}-${emp.nik}`
        
        await conn.execute(
          'INSERT INTO payslips (employee_id, payroll_run_id, payroll_run_item_id, slip_number, period_month, gross_amount, allowance_amount, deduction_amount, net_amount, tax_amount, bpjs_amount, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [emp.id, runId, itemId, slipNo, period, gross, gross - profile.base_salary, ded, net, tax, bpjs, finalizedAt]
        )
        payslipCount++
      }
    }

    // Update run totals
    await conn.execute(
      'UPDATE payroll_runs SET total_gross=?, total_deduction=?, total_net=? WHERE id=?',
      [totalGrossAll, totalDedAll, totalNetAll, runId]
    )
  }
  console.log(`  Created ${periods.length} payroll runs (Apr: published, May: finalized, Jun: reviewed) dan ${payslipCount} payslips`)

  // 6. Tasks - relevan dengan posisi karyawan
  let taskCount = 0
  const priorities = ['Low', 'Medium', 'High']
  const taskStatuses = ['To Do', 'In Progress', 'Done']
  
  const taskTemplates = {
    'Software Engineer': [
      'Implement user authentication feature',
      'Fix bug in payment module',
      'Code review untuk PR #',
      'Update API documentation',
      'Refactor legacy code',
      'Write unit tests',
      'Optimize database queries',
      'Deploy hotfix to production'
    ],
    'Senior Software Engineer': [
      'Design system architecture',
      'Lead sprint planning',
      'Mentoring junior developers',
      'Performance optimization',
      'Security audit',
      'Technical documentation review'
    ],
    'DevOps Engineer': [
      'Setup CI/CD pipeline',
      'Monitor server performance',
      'Database backup automation',
      'Update Docker containers',
      'Configure load balancer',
      'Security patching'
    ],
    'UI/UX Designer': [
      'Design mobile app mockup',
      'User research interview',
      'Create design system',
      'Prototype new features',
      'Usability testing',
      'Update brand guidelines'
    ],
    'Product Manager': [
      'Product roadmap planning',
      'Stakeholder meeting',
      'User story prioritization',
      'Market research analysis',
      'Feature specification',
      'Sprint retrospective'
    ],
    'HR Specialist': [
      'Employee onboarding',
      'Review CV candidates',
      'Conduct interviews',
      'Update employee handbook',
      'Performance appraisal',
      'Training coordination'
    ],
    'Finance': [
      'Monthly budget report',
      'Invoice verification',
      'Expense reconciliation',
      'Tax report preparation',
      'Financial audit',
      'Vendor payment processing'
    ],
    'Marketing': [
      'Social media content plan',
      'Campaign performance analysis',
      'Email marketing setup',
      'SEO optimization',
      'Blog article writing',
      'Market competitor analysis'
    ],
    'Operations': [
      'Process documentation',
      'Inventory check',
      'Vendor coordination',
      'Office supplies procurement',
      'Facility maintenance',
      'Admin report preparation'
    ],
    'Default': [
      'Complete project report',
      'Team meeting preparation',
      'Email follow-up',
      'Document review',
      'Client presentation',
      'Monthly report submission'
    ]
  }
  
  for (const emp of newEmployees) {
    // Skip inactive employees untuk tasks
    if (!emp.isActive) continue
    
    const numTasks = randomInt(2, 5) // 2-5 tasks per karyawan
    
    // Pilih template berdasarkan posisi
    let templates = taskTemplates['Default']
    if (emp.pos.includes('Software Engineer') || emp.pos.includes('Developer')) {
      templates = emp.pos.includes('Senior') ? taskTemplates['Senior Software Engineer'] : taskTemplates['Software Engineer']
    } else if (emp.pos.includes('DevOps')) {
      templates = taskTemplates['DevOps Engineer']
    } else if (emp.pos.includes('Designer')) {
      templates = taskTemplates['UI/UX Designer']
    } else if (emp.pos.includes('Product Manager')) {
      templates = taskTemplates['Product Manager']
    } else if (emp.pos.includes('HR') || emp.pos.includes('Recruitment')) {
      templates = taskTemplates['HR Specialist']
    } else if (emp.dept === 'Finance') {
      templates = taskTemplates['Finance']
    } else if (emp.dept === 'Marketing') {
      templates = taskTemplates['Marketing']
    } else if (emp.dept === 'Operations') {
      templates = taskTemplates['Operations']
    }
    
    for (let i = 0; i < numTasks; i++) {
      const title = randomItem(templates)
      const status = randomItem(taskStatuses)
      const priority = randomItem(priorities)
      
      // Due date antara hari ini hingga 30 hari ke depan
      const dueDate = new Date('2026-07-06') // current time dari context
      dueDate.setDate(dueDate.getDate() + randomInt(1, 30))
      
      await conn.execute(
        'INSERT INTO tasks (employee_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
        [emp.id, title, `Detail: ${title}`, status, priority, dueDate.toISOString().split('T')[0]]
      )
      taskCount++
    }
  }
  console.log(`  Created ${taskCount} tasks (relevan dengan posisi masing-masing karyawan)`)

  // 7. Expenses - dengan kategori spesifik dan nominal realistis
  let expenseCount = 0
  const expenseCategories = [
    { cat: 'Transport', items: ['Taksi online ke client', 'Bensin perjalanan dinas', 'Parkir meeting', 'Tol perjalanan kerja'], range: [50000, 300000] },
    { cat: 'Meals', items: ['Makan siang dengan client', 'Coffee meeting', 'Team lunch', 'Dinner dengan vendor'], range: [100000, 500000] },
    { cat: 'Office Supplies', items: ['Kertas A4', 'Tinta printer', 'Alat tulis', 'Perlengkapan kantor'], range: [50000, 500000] },
    { cat: 'Training', items: ['Online course subscription', 'Seminar fee', 'Workshop attendance', 'Certification exam'], range: [500000, 5000000] },
    { cat: 'Communication', items: ['Pulsa internet', 'Package kurir', 'Pos dokumen'], range: [50000, 200000] },
    { cat: 'Equipment', items: ['Mouse wireless', 'Keyboard external', 'Webcam HD', 'Headset'], range: [200000, 1500000] },
    { cat: 'Other', items: ['Printing dokumen', 'Fotokopi', 'Laminating', 'Biaya administrasi'], range: [20000, 300000] },
  ]
  
  // Generate ~1-3 expenses per karyawan aktif
  for (const emp of allEmps) {
    // Skip inactive employees untuk expenses
    const empData = newEmployees.find(e => e.id === emp.id)
    if (empData && !empData.isActive) continue
    
    const numExpenses = randomInt(1, 3)
    
    for (let i = 0; i < numExpenses; i++) {
      const expType = randomItem(expenseCategories)
      const title = randomItem(expType.items)
      const amount = randomInt(expType.range[0] / 10000, expType.range[1] / 10000) * 10000 // round to 10k
      
      // Status: 70% approved, 20% pending, 10% rejected
      let status
      const statusRand = Math.random()
      if (statusRand < 0.70) status = 'Approved'
      else if (statusRand < 0.90) status = 'Pending'
      else status = 'Rejected'
      
      // Receipt URL untuk yang approved
      const receiptUrl = status === 'Approved' 
        ? `https://cloudinary.com/hris/receipts/receipt_${emp.nik}_${Date.now()}_${i}.jpg` 
        : null
      
      // Created date dalam 2 bulan terakhir
      const createdDate = new Date('2026-07-06')
      createdDate.setDate(createdDate.getDate() - randomInt(1, 60))
      
      await conn.execute(
        'INSERT INTO expenses (employee_id, title, amount, category, description, receipt_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [emp.id, title, amount, expType.cat, `Pengeluaran untuk ${title}`, receiptUrl, status, createdDate]
      )
      expenseCount++
    }
  }
  console.log(`  Created ${expenseCount} expenses (dengan nominal realistis dan bukti receipt)`)

  // 8. Office Assets - sesuai kebutuhan posisi
  let assetCount = 0
  
  const assetsByPosition = {
    'Engineering': [
      { name: 'MacBook Pro 14" M3', brand: 'Apple', warranty: true },
      { name: 'Dell UltraSharp 27" Monitor', brand: 'Dell', warranty: true },
      { name: 'Logitech MX Master 3', brand: 'Logitech', warranty: true },
      { name: 'Keychron K8 Mechanical Keyboard', brand: 'Keychron', warranty: false },
    ],
    'Design': [
      { name: 'MacBook Pro 16" M3 Max', brand: 'Apple', warranty: true },
      { name: 'LG UltraFine 32" 4K Monitor', brand: 'LG', warranty: true },
      { name: 'Wacom Intuos Pro', brand: 'Wacom', warranty: true },
      { name: 'Magic Mouse 2', brand: 'Apple', warranty: false },
    ],
    'IT': [
      { name: 'ThinkPad X1 Carbon', brand: 'Lenovo', warranty: true },
      { name: 'HP EliteDisplay 24"', brand: 'HP', warranty: true },
      { name: 'Network Tools Kit', brand: 'Generic', warranty: false },
    ],
    'Office': [
      { name: 'HP EliteBook 840', brand: 'HP', warranty: true },
      { name: 'Samsung 24" Monitor', brand: 'Samsung', warranty: true },
      { name: 'Logitech Wireless Mouse', brand: 'Logitech', warranty: false },
      { name: 'Logitech K380 Keyboard', brand: 'Logitech', warranty: false },
    ]
  }
  
  for (const emp of newEmployees) {
    // Skip inactive employees untuk office assets
    if (!emp.isActive) continue
    
    let assetList = assetsByPosition['Office'] // default
    
    if (emp.dept === 'Engineering' || emp.pos.includes('Engineer') || emp.pos.includes('Developer')) {
      assetList = assetsByPosition['Engineering']
    } else if (emp.pos.includes('Designer')) {
      assetList = assetsByPosition['Design']
    } else if (emp.dept === 'IT Support') {
      assetList = assetsByPosition['IT']
    }
    
    // Engineering/Design: 3-4 assets, IT: 2-3 assets, Office: 1-2 assets
    let numAssets = 2
    if (emp.dept === 'Engineering' || emp.pos.includes('Engineer') || emp.pos.includes('Designer')) {
      numAssets = randomInt(3, 4)
    } else if (emp.dept === 'IT Support') {
      numAssets = randomInt(2, 3)
    } else {
      numAssets = randomInt(1, 2)
    }
    
    const assignedAssets = []
    for (let i = 0; i < numAssets && i < assetList.length; i++) {
      if (assignedAssets.includes(assetList[i].name)) continue
      
      const asset = assetList[i]
      const purchaseDate = new Date('2025-01-01')
      purchaseDate.setDate(purchaseDate.getDate() + randomInt(1, 365))
      
      const receivedDate = new Date(purchaseDate)
      receivedDate.setDate(receivedDate.getDate() + randomInt(1, 14))
      
      const serialNumber = `SN-${asset.brand.substring(0, 3).toUpperCase()}-${randomInt(100000, 999999)}`
      
      const condition = Math.random() < 0.85 ? 'Good' : (Math.random() < 0.5 ? 'Fair' : 'Needs Repair')
      
      await conn.execute(
        'INSERT INTO office_assets (employee_id, asset_name, brand, serial_number, condition_status, purchase_date, received_date, warranty_status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [emp.id, asset.name, asset.brand, serialNumber, condition, purchaseDate.toISOString().split('T')[0], receivedDate.toISOString().split('T')[0], asset.warranty ? 1 : 0, `https://cloudinary.com/hris/assets/${asset.brand.toLowerCase()}_${emp.nik}.jpg`]
      )
      assignedAssets.push(asset.name)
      assetCount++
    }
  }
  console.log(`  Created ${assetCount} office assets (sesuai kebutuhan posisi)`)

  // 9. Notifications - kontekstual dengan aktivitas karyawan
  let notifCount = 0
  
  const notifTemplates = [
    { type: 'success', titleTemplate: 'Cuti Disetujui', messageTemplate: 'Pengajuan cuti {leaveType} Anda telah disetujui', relatedTo: 'leave_approved' },
    { type: 'warning', titleTemplate: 'Cuti Ditolak', messageTemplate: 'Pengajuan cuti Anda telah ditolak. Silakan hubungi HRD', relatedTo: 'leave_rejected' },
    { type: 'info', titleTemplate: 'Slip Gaji Tersedia', messageTemplate: 'Slip gaji bulan {month} sudah tersedia untuk diunduh', relatedTo: 'payslip_ready' },
    { type: 'info', titleTemplate: 'Task Baru', messageTemplate: 'Anda mendapat tugas baru: {taskTitle}', relatedTo: 'task_assigned' },
    { type: 'warning', titleTemplate: 'Reminder Absensi', messageTemplate: 'Anda belum clock out hari ini', relatedTo: 'attendance_reminder' },
    { type: 'success', titleTemplate: 'Reimbursement Disetujui', messageTemplate: 'Pengajuan reimbursement Rp {amount} telah disetujui', relatedTo: 'expense_approved' },
    { type: 'info', titleTemplate: 'Asset Diterima', messageTemplate: 'Asset {assetName} telah terdaftar atas nama Anda', relatedTo: 'asset_received' },
    { type: 'info', titleTemplate: 'Pengumuman', messageTemplate: 'Reminder: Meeting all-hands besok pukul 10:00 WIB', relatedTo: 'announcement' },
    { type: 'warning', titleTemplate: 'Perhatian Keterlambatan', messageTemplate: 'Anda sudah terlambat {count} kali bulan ini', relatedTo: 'late_warning' },
  ]
  
  for (const emp of allEmps) {
    // Skip inactive employees untuk notifications
    const empData = newEmployees.find(e => e.id === emp.id)
    if (empData && !empData.isActive) continue
    
    const numNotifs = randomInt(3, 7) // 3-7 notifikasi per karyawan
    
    for (let i = 0; i < numNotifs; i++) {
      const template = randomItem(notifTemplates)
      let title = template.titleTemplate
      let message = template.messageTemplate
      
      // Personalisasi message berdasarkan template
      if (template.relatedTo === 'leave_approved' || template.relatedTo === 'leave_rejected') {
        const leaveTypes = ['Cuti Tahunan', 'Cuti Sakit', 'Izin Pribadi']
        message = message.replace('{leaveType}', randomItem(leaveTypes))
      } else if (template.relatedTo === 'payslip_ready') {
        const months = ['April', 'Mei', 'Juni']
        message = message.replace('{month}', randomItem(months))
      } else if (template.relatedTo === 'task_assigned') {
        message = message.replace('{taskTitle}', 'Review documentation')
      } else if (template.relatedTo === 'expense_approved') {
        message = message.replace('{amount}', (randomInt(10, 50) * 10000).toLocaleString('id-ID'))
      } else if (template.relatedTo === 'asset_received') {
        const assets = ['MacBook Pro', 'Monitor Dell', 'Keyboard Mechanical', 'Mouse Wireless']
        message = message.replace('{assetName}', randomItem(assets))
      } else if (template.relatedTo === 'late_warning') {
        message = message.replace('{count}', randomInt(2, 5))
      }
      
      // Created date dalam 30 hari terakhir
      const createdDate = new Date('2026-07-06')
      createdDate.setDate(createdDate.getDate() - randomInt(1, 30))
      createdDate.setHours(randomInt(8, 17), randomInt(0, 59), 0, 0)
      
      // 60% sudah dibaca, 40% belum
      const isRead = Math.random() < 0.60 ? 1 : 0
      
      await conn.execute(
        'INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [emp.user_id, title, message, template.type, template.relatedTo, randomInt(1, 100), isRead, createdDate]
      )
      notifCount++
    }
  }
  console.log(`  Created ${notifCount} notifications (kontekstual dengan aktivitas karyawan)\n`)
}
