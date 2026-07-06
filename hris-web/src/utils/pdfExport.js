import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatRupiah } from './formatters'
import { LOGO_BASE64 } from './logoBase64'

// Tambahkan logo ke halaman yang diberikan
function addPageWithLogo(doc) {
  doc.addImage(LOGO_BASE64, 'PNG', 15, 10, 20, 20)
}

export function exportReportsToPDF(report, salaryDistribution, leaveStats) {
  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPos = margin + 25

  // Logo di halaman pertama
  addPageWithLogo(doc)

  // Title
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text('Laporan HR & Analitik', margin, yPos)
  yPos += 10

  // Date
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, margin, yPos)
  yPos += 15

  // Summary Section
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Ringkasan', margin, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  const summaryData = [
    ['Metrik', 'Nilai'],
    ['Total Karyawan', `${report.totalEmployees}`],
    ['Kehadiran Hari Ini', `${report.attendanceRate}%`],
    ['Cuti Menunggu Approval', `${report.pendingLeave}`],
    ['Total Payroll Bulan Ini', formatRupiah(report.payrollTotal)],
  ]
  autoTable(doc, {
    startY: yPos,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: [31, 49, 113], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { textColor: [29, 35, 64] },
    alternateRowStyles: { fillColor: [240, 243, 249] },
  })
  yPos = doc.lastAutoTable.finalY + 12

  // Salary Distribution by Department
  if (salaryDistribution.byDepartment && salaryDistribution.byDepartment.length > 0) {
    if (yPos > pageHeight - 40) {
      doc.addPage()
      addPageWithLogo(doc)
      yPos = margin + 25
    }
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Distribusi Gaji per Departemen', margin, yPos)
    yPos += 8

    const departmentData = [
      ['Departemen', 'Jumlah Karyawan', 'Total Gaji', 'Rata-rata Gaji'],
      ...salaryDistribution.byDepartment.map((dept) => [
        dept.label,
        `${dept.count}`,
        formatRupiah(dept.total_salary),
        formatRupiah(dept.avg_salary),
      ]),
    ]
    autoTable(doc, {
      startY: yPos,
      head: [departmentData[0]],
      body: departmentData.slice(1),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [31, 49, 113], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { textColor: [29, 35, 64] },
      alternateRowStyles: { fillColor: [240, 243, 249] },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
      },
    })
    yPos = doc.lastAutoTable.finalY + 12
  }

  // Leave Statistics by Type
  if (leaveStats.byType && leaveStats.byType.length > 0) {
    if (yPos > pageHeight - 40) {
      doc.addPage()
      addPageWithLogo(doc)
      yPos = margin + 25
    }
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Statistik Cuti per Tipe', margin, yPos)
    yPos += 8

    const leaveTypeData = [
      ['Tipe Cuti', 'Total', 'Disetujui', 'Ditolak', 'Pending'],
      ...leaveStats.byType.map((leave) => [
        leave.label,
        `${leave.total}`,
        `${leave.approved}`,
        `${leave.rejected}`,
        `${leave.pending}`,
      ]),
    ]
    autoTable(doc, {
      startY: yPos,
      head: [leaveTypeData[0]],
      body: leaveTypeData.slice(1),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [31, 49, 113], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { textColor: [29, 35, 64] },
      alternateRowStyles: { fillColor: [240, 243, 249] },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
      },
    })
    yPos = doc.lastAutoTable.finalY + 12
  }

  // Payroll Cost Breakdown
  if (report.payrollCostBreakdown && report.payrollCostBreakdown.length > 0) {
    if (yPos > pageHeight - 40) {
      doc.addPage()
      addPageWithLogo(doc)
      yPos = margin + 25
    }
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Biaya Payroll per Departemen', margin, yPos)
    yPos += 8

    const payrollData = [
      ['Departemen', 'Jumlah Karyawan', 'Total Gaji Bruto'],
      ...report.payrollCostBreakdown.map((pb) => [
        pb.department || '-',
        `${pb.employee_count || 0}`,
        formatRupiah(pb.total_gross || 0),
      ]),
    ]
    autoTable(doc, {
      startY: yPos,
      head: [payrollData[0]],
      body: payrollData.slice(1),
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [31, 49, 113], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { textColor: [29, 35, 64] },
      alternateRowStyles: { fillColor: [240, 243, 249] },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
      },
    })
  }

  const filename = `Laporan_HR_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}
