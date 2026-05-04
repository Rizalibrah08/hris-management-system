import { useEffect } from 'react'
import { usePayroll } from '../hooks/usePayroll'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import PayrollItemBreakdown from '../components/PayrollItemBreakdown'
import '../styles/global.css'
import '../styles/payroll.css'

function formatRupiah(n) {
  if (n == null || isNaN(Number(n))) return '0'
  return Number(n).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
}

function RunTab({ payrollRuns, selectedRunId, loadPayrollDetail, payrollDetail, selectedPayrollItemId, payrollDetailSearch, setPayrollDetailSearch, runningPayroll, role }) {
  return (
    <section className="panel payroll-run-section">
      <div className="panel-head">
        <h3>Payroll Runs</h3>
        {role && (
          <div className="payroll-actions">
            <button className="primary-btn" disabled={!!runningPayroll}>Run Payroll</button>
          </div>
        )}
      </div>
      <div className="panel-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="table-wrap">
          <table className="datatable">
            <thead>
              <tr>
                <th>Periode</th>
                <th>Status</th>
                <th>Total Net</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payrollRuns?.length > 0 ? (
                payrollRuns.map((r) => (
                  <tr key={r.id} className={selectedRunId === r.id ? 'selected' : ''} onClick={() => loadPayrollDetail?.(r.id)}>
                    <td>{r.period_month}</td>
                    <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                    <td>{formatRupiah(r.total_net)}</td>
                    <td>
                      <button className="small-btn" onClick={(e) => { e.stopPropagation(); loadPayrollDetail?.(r.id) }}>Detail</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4}>Tidak ada payroll run untuk saat ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="detail-panel">
          {payrollDetail ? (
            <div className="payroll-run-detail">
              <h4>Run Detail #{selectedRunId}</h4>
              <div className="quick-grid" style={{ marginBottom: 12 }}>
                <div className="quick-card"><span>Periode</span><strong>{payrollDetail.run?.period_month || '-'}</strong></div>
                <div className="quick-card"><span>Jumlah Karyawan</span><strong>{payrollDetail.run?.employee_count ?? 0}</strong></div>
                <div className="quick-card"><span>Total Net</span><strong>{formatRupiah(payrollDetail.run?.total_net)}</strong></div>
              </div>
              <div className="detail-toolbar" style={{ marginBottom: 8 }}>
                <input className="detail-search" placeholder="Cari karyawan..." value={payrollDetailSearch} onChange={(e) => setPayrollDetailSearch?.(e.target.value)} />
                <button className="small-btn">Export CSV</button>
              </div>
              <table className="datatable">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Departemen</th>
                    <th>Gross</th>
                    <th>Potongan</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollDetail.items?.filter((it) => (it.employee_name || '').toLowerCase().includes((payrollDetailSearch||'').toLowerCase())).map((it) => (
                    <tr key={it.id}>
                      <td>{it.employee_name}</td>
                      <td>{it.department || '-'}</td>
                      <td>{formatRupiah(it.gross_amount)}</td>
                      <td>{formatRupiah(it.deduction_amount)}</td>
                      <td>{formatRupiah(it.net_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PayrollItemBreakdown item={payrollDetail.items?.find((i) => i.id === selectedPayrollItemId)} />
            </div>
          ) : (
            <p>Pilih run untuk melihat detailnya.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function StructureTab({ salaryStructures, salaryForm, onSalaryFormChange, onSaveSalaryStructure, onEditSalaryStructure, onDeleteSalaryStructure }) {
  return (
    <section className="panel salary-structure-section">
      <div className="panel-head">
        <h3>Salary Structure</h3>
      </div>
      <div className="panel-content">
        <div className="salary-form">
          <select value={salaryForm.employeeId} onChange={(e) => onSalaryFormChange?.((p) => ({ ...p, employeeId: e.target.value }))}>
          </select>
          <input type="number" placeholder="Gaji Pokok" value={salaryForm.baseSalary ?? 0} onChange={(e) => onSalaryFormChange?.((p) => ({ ...p, baseSalary: Number(e.target.value) }))} />
          <input type="number" placeholder="Tunjangan" value={salaryForm.allowance ?? 0} onChange={(e) => onSalaryFormChange?.((p) => ({ ...p, allowance: Number(e.target.value) }))} />
          <input type="number" placeholder="Potongan" value={salaryForm.deduction ?? 0} onChange={(e) => onSalaryFormChange?.((p) => ({ ...p, deduction: Number(e.target.value) }))} />
          <button className="primary-btn" onClick={onSaveSalaryStructure}>Simpan Struktur</button>
        </div>
        <div className="structure-table-wrap">
          <table className="datatable">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Departemen</th>
                <th>Gaji Pokok</th>
                <th>Tunjangan</th>
                <th>Potongan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {salaryStructures?.map((s) => (
                <tr key={s.employeeId}>
                  <td>{s.employeeName}</td>
                  <td>{s.department || '-'}</td>
                  <td>{formatRupiah(s.baseSalary)}</td>
                  <td>{formatRupiah(s.allowance)}</td>
                  <td>{formatRupiah(s.deduction)}</td>
                  <td>
                    <button className="small-btn" onClick={() => onEditSalaryStructure?.(s)}>Edit</button>
                    <button className="small-btn cancel-btn" onClick={() => onDeleteSalaryStructure?.(s.employeeId)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function EditSalaryModal({ editSalaryModal, onCancelEditSalary, onEditSalaryModalChange, onSaveEditedSalary }) {
  if (!editSalaryModal?.open) return null
  return (
    <Modal onClose={onCancelEditSalary} title="Edit Salary Structure">
      <div className="modal-form">
        <div>
          <label>Gaji Pokok</label>
          <input type="number" value={editSalaryModal.baseSalary} onChange={(e) => onEditSalaryModalChange?.((p) => ({ ...p, baseSalary: Number(e.target.value) }))} />
        </div>
        <div>
          <label>Tunjangan</label>
          <input type="number" value={editSalaryModal.allowance} onChange={(e) => onEditSalaryModalChange?.((p) => ({ ...p, allowance: Number(e.target.value) }))} />
        </div>
        <div>
          <label>Potongan</label>
          <input type="number" value={editSalaryModal.deduction} onChange={(e) => onEditSalaryModalChange?.((p) => ({ ...p, deduction: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="modal-actions">
        <button className="small-btn cancel-btn" onClick={onCancelEditSalary}>Batal</button>
        <button className="primary-btn" onClick={onSaveEditedSalary}>Simpan</button>
      </div>
    </Modal>
  )
}

export default function Payroll() {
  const { role } = useAuth()
  const {
    payrollTab, setPayrollTab,
    payrollRuns, loadPayrollDetail,
    selectedRunId, payrollDetail, selectedPayrollItemId, payrollDetailSearch, setPayrollDetailSearch,
    runningPayroll,
    salaryStructures, salaryForm,
    editSalaryModal,
    onSalaryFormChange, onSaveSalaryStructure, onEditSalaryStructure,
    onCancelEditSalary, onEditSalaryModalChange, onSaveEditedSalary, onDeleteSalaryStructure
  } = usePayroll()

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && editSalaryModal?.open) {
        onCancelEditSalary?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editSalaryModal?.open, onCancelEditSalary])

  useEffect(() => {
    if (selectedRunId && !payrollDetail) {
      loadPayrollDetail?.(selectedRunId)
    }
  }, [selectedRunId, payrollDetail, loadPayrollDetail])

  return (
    <section className="payroll-layout">
      <div className="payroll-header"><h2>Payroll</h2></div>
      <div className="payroll-tabs">
        <button className={`tab-btn ${payrollTab === 'run' ? 'active' : ''}`} onClick={() => setPayrollTab?.('run')}>Run</button>
        <button className={`tab-btn ${payrollTab === 'structure' ? 'active' : ''}`} onClick={() => setPayrollTab?.('structure')}>Struktur Gaji</button>
      </div>
      {payrollTab === 'run' ? (
        <RunTab
          payrollRuns={payrollRuns}
          selectedRunId={selectedRunId}
          loadPayrollDetail={loadPayrollDetail}
          payrollDetail={payrollDetail}
          selectedPayrollItemId={selectedPayrollItemId}
          payrollDetailSearch={payrollDetailSearch}
          setPayrollDetailSearch={setPayrollDetailSearch}
          runningPayroll={runningPayroll}
          role={role}
        />
      ) : (
        <StructureTab
          salaryStructures={salaryStructures}
          salaryForm={salaryForm}
          onSalaryFormChange={onSalaryFormChange}
          onSaveSalaryStructure={onSaveSalaryStructure}
          onEditSalaryStructure={onEditSalaryStructure}
          onDeleteSalaryStructure={onDeleteSalaryStructure}
        />
      )}
      <EditSalaryModal
        editSalaryModal={editSalaryModal}
        onCancelEditSalary={onCancelEditSalary}
        onEditSalaryModalChange={onEditSalaryModalChange}
        onSaveEditedSalary={onSaveEditedSalary}
      />
    </section>
  )
}