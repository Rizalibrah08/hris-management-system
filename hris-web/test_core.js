async function test() {
  const baseUrl = 'http://localhost:5000'
  let passed = 0;
  let failed = 0;

  async function req(method, endpoint, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, opts);
      const data = await res.json().catch(() => null);
      return { status: res.status, data };
    } catch(e) {
      return { status: 500, error: e.message };
    }
  }

  function assertEq(actual, expected, testName, data) {
    if (actual === expected) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - Expected ${expected}, got ${actual}`, data);
      failed++;
    }
  }

  console.log("Starting Core Features Test...");
  
  // 1. Health check
  const h = await req('GET', '/health');
  assertEq(h.status, 200, "Health Check");

  // 2. Login Admin
  const adminLogin = await req('POST', '/auth/login', { nik: 'ADM001', password: 'admin123' });
  assertEq(adminLogin.status, 200, "Admin Login");
  const adminToken = adminLogin.data.token;

  // 3. Register Employee
  const empNik = 'EMP' + Date.now();
  const empReg = await req('POST', '/auth/register', {
    nik: empNik,
    name: 'Test Employee',
    password: 'password123',
    department_id: 1,
    position_id: 1,
  });
  assertEq(empReg.status, 201, "Employee Register", empReg.data);
  const empToken = empReg.data?.token;
  const empId = empReg.data?.employeeId;

  // 3.5 Create Salary Profile
  await req('POST', '/salary-profiles', {
    employeeId: empId,
    baseSalary: 5000000,
    allowance: 0,
    deduction: 0,
    paymentMethod: 'bank_transfer',
    bankName: 'BCA',
    bankAccountName: 'Test Employee',
    bankAccountNumber: '1234567890'
  }, adminToken);

  // 4. Employee Me
  const empMe = await req('GET', '/auth/me', null, empToken);
  assertEq(empMe.status, 200, "Employee Profile Me");
  
  // 5. Attendance Clock In
  const clockIn = await req('POST', '/attendance/clockin', { employee_id: empId }, empToken);
  assertEq(clockIn.status, 201, "Attendance Clock In");
  
  // 5b. Clock In again should fail
  const clockIn2 = await req('POST', '/attendance/clockin', { employee_id: empId }, empToken);
  assertEq(clockIn2.status, 409, "Attendance Clock In (Double)");

  // 6. Attendance Clock Out
  const clockOut = await req('POST', '/attendance/clockout', { attendance_id: clockIn.data.id }, empToken);
  assertEq(clockOut.status, 200, "Attendance Clock Out");

  // 7. Request Leave
  const today = new Date();
  const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
  const leave = await req('POST', '/leave', {
    employee_id: empId,
    leave_type: 'Cuti Tahunan',
    start_date: today.toISOString().split('T')[0],
    end_date: tmr.toISOString().split('T')[0],
    reason: 'Test Leave'
  }, empToken);
  assertEq(leave.status, 201, "Request Leave");
  
  // 8. Approve Leave (as Admin)
  const approve = await req('PUT', '/leave/approve', {
    leave_id: leave.data.id,
    status: 'Approved'
  }, adminToken);
  assertEq(approve.status, 200, "Approve Leave");

  // 9. Check My Leaves
  const myLeaves = await req('GET', '/leave/my', null, empToken);
  assertEq(myLeaves.status, 200, "Get My Leaves");
  if (myLeaves.data && myLeaves.data.length > 0) {
    assertEq(myLeaves.data[0].status, 'Approved', "Leave Status is Approved");
  } else {
    assertEq(false, true, "Leaves list is empty");
  }

  console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
}
test();
