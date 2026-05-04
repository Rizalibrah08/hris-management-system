import { useEmployees } from '../hooks/useEmployees'
import '../styles/global.css'
import '../styles/karyawan.css'

export default function Karyawan() {
  const { employees, loading } = useEmployees()

  return (
    <section className="feature-layout">
      <article className="panel">
        <h3>Directory Karyawan</h3>
        {loading ? <p>Memuat data karyawan...</p> : null}
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Departemen</th>
              <th>Jabatan</th>
              <th>Akhir Kontrak</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>{employee.department || '-'}</td>
                <td>{employee.position || '-'}</td>
                <td>{employee.contract_end ? employee.contract_end.slice(0, 10) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  )
}
