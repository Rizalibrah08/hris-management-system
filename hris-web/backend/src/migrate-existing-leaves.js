import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') })

async function run() {
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.execute(
      "SELECT * FROM leave_request WHERE status = 'Approved' ORDER BY id",
    )
    if (rows.length === 0) {
      console.log('Tidak ada leave_request Approved untuk dimigrasi.')
      return
    }
    console.log(`Ditemukan ${rows.length} pengajuan cuti Approved. Mulai materialisasi...`)

    let totalInserted = 0
    let totalSkipped = 0

    for (const leave of rows) {
      const attStatus = leave.leave_type === 'Sakit' ? 'Sakit' : 'Izin'
      const start = new Date(leave.start_date)
      const end = new Date(leave.end_date)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay()
        if (dow === 0 || dow === 6) continue
        const dateStr = d.toISOString().slice(0, 10)
        const [exists] = await conn.execute(
          'SELECT id FROM attendance WHERE employee_id = ? AND DATE(clock_in) = ?',
          [leave.employee_id, dateStr],
        )
        if (exists.length > 0) {
          totalSkipped += 1
          continue
        }
        const clockInVal = `${dateStr} 00:00:00`
        await conn.execute(
          'INSERT INTO attendance(employee_id, clock_in, status) VALUES (?, ?, ?)',
          [leave.employee_id, clockInVal, attStatus],
        )
        totalInserted += 1
      }
    }

    console.log(`Migrasi selesai. Baris attendance izin/cuti dibuat: ${totalInserted}, dilewati: ${totalSkipped}`)
  } finally {
    conn.release()
    await pool.end()
  }
}

run().catch((err) => {
  console.error('Migrasi gagal:', err)
  process.exit(1)
})