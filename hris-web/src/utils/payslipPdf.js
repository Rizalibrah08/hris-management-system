import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatRupiah } from './formatters'

export function generatePayslipPDF(payslip) {
  const doc = new jsPDF()
  const margin = 16
  let y = margin

  // Header
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('SLIP GAJI', margin, y)
  y += 10

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`No: ${payslip.slip_number}`, margin, y)
  y += 6
  doc.text(`Periode: ${payslip.period_month?.slice(0, 7)}`, margin, y)
  y += 6
  doc.text(`Tanggal: ${new Date(payslip.published_at || payslip.created_at).toLocaleDateString('id-ID')}`, margin, y)
  y += 12

  // Employee info
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Data Karyawan', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  const empInfo = [
    ['Nama', payslip.employee_name || '-'],
    ['NIK', payslip.nik || '-'],
    ['Departemen', payslip.department || '-'],
    ['Jabatan', payslip.position || '-'],
  ]
  autoTable(doc, {
    startY: y,
    body: empInfo,
    theme: 'plain',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 32 }, 1: { cellWidth: 110 } },
    margin: { left: margin, right: margin },
    styles: { fontSize: 10, cellPadding: 2 },
  })
  y = doc.lastAutoTable.finalY + 10

  // Earnings
  const components = payslip.components || []
  const earnings = components.filter((c) => c.component_type === 'earning')
  const deductions = components.filter((c) => c.component_type === 'deduction')

  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Pendapatan', margin, y)
  y += 8

  const earningRows = earnings.map((c) => [c.component_name_snapshot, '', formatRupiah(c.amount)])
  earningRows.push(['Total Pendapatan', '', formatRupiah(payslip.gross_amount)])
  autoTable(doc, {
    startY: y,
    head: [['Komponen', '', 'Jumlah']],
    body: earningRows,
    margin: { left: margin, right: margin },
    theme: 'striped',
    headStyles: { fillColor: [31, 49, 113], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 10 }, 2: { cellWidth: 62, halign: 'right' } },
    footStyles: { fontStyle: 'bold', fillColor: [240, 243, 249] },
  })
  y = doc.lastAutoTable.finalY + 10

  // Deductions
  if (deductions.length > 0) {
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Potongan', margin, y)
    y += 8

    const deductionRows = deductions.map((c) => [c.component_name_snapshot, '', formatRupiah(c.amount)])
    deductionRows.push(['Total Potongan', '', formatRupiah(payslip.deduction_amount)])
    autoTable(doc, {
      startY: y,
      head: [['Komponen', '', 'Jumlah']],
      body: deductionRows,
      margin: { left: margin, right: margin },
      theme: 'striped',
      headStyles: { fillColor: [180, 30, 30], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 10 }, 2: { cellWidth: 62, halign: 'right' } },
      footStyles: { fontStyle: 'bold', fillColor: [255, 235, 235] },
    })
    y = doc.lastAutoTable.finalY + 12
  }

  // Net Pay
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Take Home Pay', margin, y)
  y += 8
  doc.setTextColor(6, 95, 70)
  doc.setFontSize(18)
  doc.text(formatRupiah(payslip.net_amount), margin, y)
  doc.setTextColor(0, 0, 0)
  y += 14

  // Footer
  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text(`Slip gaji ini dicetak secara digital pada ${new Date().toLocaleString('id-ID')}`, margin, doc.internal.pageSize.getHeight() - 14)
  doc.text('Dokumen ini sah tanpa tanda tangan', margin, doc.internal.pageSize.getHeight() - 10)

  doc.save(`Slip_Gaji_${payslip.employee_name}_${payslip.period_month?.slice(0, 7)}.pdf`)
}
