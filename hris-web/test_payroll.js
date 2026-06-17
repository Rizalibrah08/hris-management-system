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

  function assertEq(actual, expected, testName) {
    if (actual === expected) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - Expected ${expected}, got ${actual}`);
      failed++;
    }
  }

  console.log("Starting Payroll Test...");
  
  // 1. Login Admin
  const adminLogin = await req('POST', '/auth/login', { nik: 'ADM001', password: 'admin123' });
  const adminToken = adminLogin.data.token;

  // 2. Register Employee
  const empNik = 'EMPPY' + Date.now();
  const empReg = await req('POST', '/auth/register', {
    nik: empNik,
    name: 'Test Payroll Employee',
    password: 'password123',
    department_id: 1,
    position_id: 1,
  });
  const empToken = empReg.data.token;
  const empId = empReg.data.employeeId;

  // 3. Create Salary Profile for Employee (As Admin/HRD)
  const salaryProfile = await req('POST', '/salary-profiles', {
    employeeId: empId,
    baseSalary: 5000000,
    allowance: 1000000,
    deduction: 200000,
    paymentMethod: 'bank_transfer',
    bankName: 'BCA',
    bankAccountName: 'Test Employee',
    bankAccountNumber: '1234567890'
  }, adminToken);
  assertEq(salaryProfile.status, 200, "Create Salary Profile");

  // 4. Generate Payroll Run
  const period = `2027-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`; // random month 2027
  const genPayroll = await req('POST', '/payroll/runs/generate', {
    periodMonth: period + '-01'
  }, adminToken);
  console.log('Generate Payroll Run Response:', genPayroll.data);
  assertEq(genPayroll.status, 201, "Generate Payroll Run");

  // 5. Get Payroll Runs
  const payrollRuns = await req('GET', '/payroll/runs', null, adminToken);
  assertEq(payrollRuns.status, 200, "Get Payroll Runs");
  let runId = null;
  if (payrollRuns.data && payrollRuns.data.length > 0) {
    runId = payrollRuns.data[0].id;
    assertEq(true, true, "Found generated payroll run");
  } else {
    assertEq(false, true, "Generated payroll run not found");
  }

  if (runId) {
    // 5.5 Review Payroll Run
    const review = await req('POST', `/payroll/runs/${runId}/review`, {}, adminToken);
    console.log('Review Payroll Run Response:', review.data);
    assertEq(review.status, 200, "Review Payroll Run");

    // 6. Approve Payroll
    const approve = await req('POST', `/payroll/runs/${runId}/approve`, {
      status: 'Approved'
    }, adminToken);
    console.log('Approve Payroll Run Response:', approve.data);
    assertEq(approve.status, 200, "Approve Payroll Run");

    // 7. Get My Payroll Runs (as employee)
    const myPayroll = await req('GET', '/payroll/my-runs', null, empToken);
    assertEq(myPayroll.status, 200, "Get My Payroll Runs");
    if (myPayroll.data && myPayroll.data.periods && myPayroll.data.periods.length > 0) {
      assertEq(myPayroll.data.periods[0].status, 'approved', "My Payroll Run Status is Approved");
    } else {
      assertEq(false, true, "My Payroll Run not found");
    }
  }

  console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
}
test();
