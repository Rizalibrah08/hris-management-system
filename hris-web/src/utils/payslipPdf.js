import jsPDF from 'jspdf'
import { LOGO_BASE64 } from './logoBase64'

// Format angka ribuan tanpa "Rp" prefix (seperti di gambar: 5,600,000)
function fmtNum(val) {
  return Number(val || 0).toLocaleString('id-ID')
}

// Format periode: "2022/03" dari date string
function fmtPeriod(d) {
  if (!d) return '-'
  try {
    const dt = new Date(d)
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    return `${y}/${m}`
  } catch {
    return String(d).slice(0, 7)
  }
}

// Format date: "22/01/2022"
function fmtDate(d) {
  if (!d) return '-'
  try {
    const dt = new Date(d)
    const day = String(dt.getDate()).padStart(2, '0')
    const mon = String(dt.getMonth() + 1).padStart(2, '0')
    const yr = dt.getFullYear()
    return `${day}/${mon}/${yr}`
  } catch {
    return '-'
  }
}

export function generatePayslipPDF(payslip) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()   // 210
  const pageH = doc.internal.pageSize.getHeight()  // 297
  const marginL = 14
  const marginR = 14
  const contentW = pageW - marginL - marginR       // 182

  const components = payslip.components || []
  const earnings   = components.filter(c => c.component_type === 'earning')
  const deductions = components.filter(c => c.component_type === 'deduction')

  const grossAmount    = Number(payslip.gross_amount    || 0)
  const deductionTotal = Number(payslip.deduction_amount || 0)
  const netAmount      = Number(payslip.net_amount      || 0)

  // ─── WARNA TEMA ──────────────────────────────────────────────────────────
  const COLOR_DARK   = [30, 30, 30]
  const COLOR_GRAY   = [100, 100, 100]
  const COLOR_HEADER = [230, 230, 230]   // abu-abu terang untuk header kolom
  const COLOR_BORDER = [180, 180, 180]
  const COLOR_RED    = [180, 0, 0]

  // ─── HELPER: garis horizontal ────────────────────────────────────────────
  function hLine(y, x1 = marginL, x2 = pageW - marginR, r = 0, g = 0, b = 0, w = 0.3) {
    doc.setDrawColor(r, g, b)
    doc.setLineWidth(w)
    doc.line(x1, y, x2, y)
  }

  // ─── HELPER: teks dengan warna & font ────────────────────────────────────
  function txt(text, x, y, { size = 10, bold = false, color = COLOR_DARK, align = 'left' } = {}) {
    doc.setFontSize(size)
    doc.setFont(undefined, bold ? 'bold' : 'normal')
    doc.setTextColor(...color)
    doc.text(String(text ?? ''), x, y, { align })
  }

  // ─── HELPER: kotak (rect) dengan fill ────────────────────────────────────
  function fillRect(x, y, w, h, r, g, b) {
    doc.setFillColor(r, g, b)
    doc.rect(x, y, w, h, 'F')
  }

  // =========================================================================
  // BAGIAN 1: HEADER — Logo kiri, "Slip Gaji" kanan
  // =========================================================================
  const headerH = 28
  const logoX = marginL, logoY = 8, logoW = 22, logoH = 22

  // Logo perusahaan
  doc.addImage(LOGO_BASE64, 'PNG', logoX, logoY, logoW, logoH)

  // Judul "Slip Gaji" — bold, besar, rata kanan
  txt('Slip Gaji', pageW - marginR, 24, { size: 26, bold: true, align: 'right' })

  // Garis bawah header
  hLine(headerH + 6, marginL, pageW - marginR, 160, 160, 160, 0.5)

  // =========================================================================
  // BAGIAN 2: INFO PERUSAHAAN (kiri) & INFO KARYAWAN (kanan)
  // =========================================================================
  let y = headerH + 14

  const colMid = pageW / 2 + 4   // tengah halaman sedikit ke kanan
  const leftColMaxW = colMid - marginL - 6  // lebar max kolom kiri (agar tidak nabrak kolom kanan)

  // Kolom kiri: info perusahaan
  const companyName    = payslip.companyName    || payslip.company_name    || 'PT HRIS Indonesia'
  const companyAddress = payslip.companyAddress || payslip.company_address || ''
  const companyCity    = payslip.companyCity    || payslip.company_city    || ''

  // Nama perusahaan (bold)
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(...COLOR_DARK)
  doc.text(companyName, marginL, y)

  // Alamat — auto wrap dalam batas kolom kiri
  let leftBottomY = y + 5
  if (companyAddress) {
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(...COLOR_GRAY)
    const addrLines = doc.splitTextToSize(companyAddress, leftColMaxW)
    addrLines.forEach((line, i) => {
      doc.text(line, marginL, leftBottomY + i * 5)
    })
    leftBottomY += addrLines.length * 5
  }
  if (companyCity) {
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(...COLOR_GRAY)
    const cityLines = doc.splitTextToSize(companyCity, leftColMaxW)
    cityLines.forEach((line, i) => {
      doc.text(line, marginL, leftBottomY + i * 5)
    })
    leftBottomY += cityLines.length * 5
  }

  // Kolom kanan: info karyawan — selalu mulai dari y awal, tidak tergantung kolom kiri
  const empName    = payslip.employee_name || '-'
  const empNik     = payslip.nik           || '-'
  const empDept    = payslip.department    || '-'
  const empPos     = payslip.position      || '-'
  const empStart   = fmtDate(payslip.join_date)
  const period     = fmtPeriod(payslip.period_month)

  const labelX = colMid
  const valX   = pageW - marginR

  // Baris 1: Nama / NIK
  txt('Nama / NIK',             labelX, y,      { size: 9, color: COLOR_GRAY })
  txt(`${empName} (${empNik})`, valX,   y,      { size: 9, bold: true, align: 'right' })

  // Baris 2: Dept / Jabatan
  txt('Dept / Jabatan',         labelX, y + 6,  { size: 9, color: COLOR_GRAY })
  txt(`${empDept} / ${empPos}`, valX,   y + 6,  { size: 9, bold: true, align: 'right' })

  // Baris 3: Tgl Mulai Bekerja
  txt('Tgl Mulai Bekerja',      labelX, y + 12, { size: 9, color: COLOR_GRAY })
  txt(empStart,                 valX,   y + 12, { size: 9, bold: true, align: 'right' })

  // Baris 4: Periode Gaji
  txt('Periode Gaji',           labelX, y + 18, { size: 9, color: COLOR_GRAY })
  txt(period,                   valX,   y + 18, { size: 9, bold: true, align: 'right' })

  // y maju sesuai kolom yang lebih panjang (kiri atau kanan)
  const rightBottomY = y + 24
  y = Math.max(leftBottomY, rightBottomY) + 4

  // Garis pemisah
  hLine(y, marginL, pageW - marginR, ...COLOR_BORDER, 0.4)
  y += 6

  // =========================================================================
  // BAGIAN 3: HEADER TABEL (Pendapatan | Potongan) — abu-abu
  // =========================================================================
  const colW = (contentW - 4) / 2    // lebar masing-masing kolom
  const col1X = marginL              // kolom Pendapatan mulai X
  const col2X = marginL + colW + 4   // kolom Potongan mulai X

  // Background header abu-abu
  fillRect(marginL, y, contentW, 7, ...COLOR_HEADER)

  txt('Pendapatan', col1X + 2, y + 5, { size: 10, bold: true })
  txt('Potongan',   col2X + 2, y + 5, { size: 10, bold: true })

  y += 10

  // =========================================================================
  // BAGIAN 4: ROWS Pendapatan (kiri) & Potongan (kanan) — side by side
  // =========================================================================
  const rowH = 6.5
  const maxRows = Math.max(earnings.length, deductions.length)

  for (let i = 0; i < maxRows; i++) {
    // Zebra striping setiap 2 baris
    if (i % 2 === 1) {
      fillRect(marginL,  y - 1, colW,     rowH, 248, 248, 248)
      fillRect(col2X,    y - 1, colW,     rowH, 248, 248, 248)
    }

    // Kolom kiri: Pendapatan
    if (i < earnings.length) {
      const e = earnings[i]
      const name = e.component_name_snapshot || e.name || '-'
      txt(name,              col1X + 2,           y + 4, { size: 9 })
      txt(fmtNum(e.amount),  col1X + colW - 2,    y + 4, { size: 9, align: 'right' })
    }

    // Kolom kanan: Potongan
    if (i < deductions.length) {
      const d = deductions[i]
      const name = d.component_name_snapshot || d.name || '-'
      txt(name,              col2X + 2,           y + 4, { size: 9 })
      txt(fmtNum(Math.abs(d.amount)), col2X + colW - 2, y + 4, { size: 9, align: 'right' })
    }

    y += rowH
  }

  // Garis bawah rows
  hLine(y + 1, marginL, pageW - marginR, ...COLOR_BORDER, 0.3)
  y += 6

  // =========================================================================
  // BAGIAN 5: TOTAL PENDAPATAN & TOTAL POTONGAN — bold
  // =========================================================================
  txt('Total Pendapatan',    col1X + 2,         y + 4, { size: 10, bold: true })
  txt(fmtNum(grossAmount),   col1X + colW - 2,  y + 4, { size: 10, bold: true, align: 'right' })

  txt('Total Potongan',      col2X + 2,         y + 4, { size: 10, bold: true })
  txt(fmtNum(deductionTotal), col2X + colW - 2, y + 4, { size: 10, bold: true, align: 'right' })

  // Garis bawah total
  hLine(y + 7, marginL, pageW - marginR, ...COLOR_BORDER, 0.4)
  y += 18

  // =========================================================================
  // BAGIAN 6: FOOTER — Catatan kiri, Box Total Penerimaan kanan
  // =========================================================================
  const footerY = y
  const boxW    = 82
  const boxH    = 24
  const boxX    = pageW - marginR - boxW

  // Catatan pembayaran (kiri bawah) — teks merah seperti gambar
  const noteLines = [
    'Pembayaran gaji telah dilakukan oleh perusahaan',
    'secara transfer ke rekening karyawan.',
  ]
  noteLines.forEach((line, i) => {
    txt(line, marginL, footerY + 5 + i * 5.5, { size: 8.5, color: COLOR_RED })
  })

  // Info bank (jika ada) — hitam
  if (payslip.bank_account) {
    txt(payslip.bank_account, marginL, footerY + 17, { size: 8.5 })
  }

  // Kotak "Total Penerimaan Bulan Ini" — border kotak
  doc.setDrawColor(...COLOR_BORDER)
  doc.setLineWidth(0.5)
  doc.rect(boxX, footerY - 2, boxW, boxH)

  txt('Total Penerimaan Bulan Ini', boxX + boxW / 2, footerY + 5, {
    size: 8.5, color: COLOR_GRAY, align: 'center'
  })

  txt(fmtNum(netAmount), boxX + boxW / 2, footerY + 18, {
    size: 20, bold: true, align: 'center'
  })

  y = footerY + boxH + 8

  // =========================================================================
  // BAGIAN 7: FOOTER BAWAH — disclaimer
  // =========================================================================
  hLine(y, marginL, pageW - marginR, ...COLOR_BORDER, 0.3)
  y += 5
  txt(
    `Dokumen ini dicetak secara digital pada ${new Date().toLocaleString('id-ID')}. Sah tanpa tanda tangan.`,
    pageW / 2, y, { size: 7.5, color: [150, 150, 150], align: 'center' }
  )

  // =========================================================================
  // Simpan PDF
  // =========================================================================
  const safeName   = (payslip.employee_name || 'karyawan').replace(/\s+/g, '_')
  const safePeriod = fmtPeriod(payslip.period_month).replace('/', '-')
  doc.save(`Slip_Gaji_${safeName}_${safePeriod}.pdf`)
}
