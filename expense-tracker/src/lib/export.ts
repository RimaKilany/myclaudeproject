import { format } from 'date-fns'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Expense, Category } from '@/types'

export type ExportFormat = 'csv' | 'json' | 'pdf'

export interface ExportConfig {
  exportFormat: ExportFormat
  filename: string
  dateFrom: string
  dateTo: string
  categories: Category[]
}

export function filterForExport(
  expenses: Expense[],
  dateFrom: string,
  dateTo: string,
  categories: Category[]
): Expense[] {
  return expenses.filter((e) => {
    const matchesDate = (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo)
    const matchesCategory = categories.length === 0 || categories.includes(e.category)
    return matchesDate && matchesCategory
  })
}

export async function runExport(expenses: Expense[], config: ExportConfig): Promise<void> {
  const { exportFormat, filename } = config
  if (exportFormat === 'csv') downloadCSV(expenses, filename)
  else if (exportFormat === 'json') downloadJSON(expenses, filename)
  else await downloadPDF(expenses, filename)
}

function downloadCSV(expenses: Expense[], filename: string): void {
  const headers = ['Date', 'Category', 'Amount', 'Description']
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  triggerDownload(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

function downloadJSON(expenses: Expense[], filename: string): void {
  const payload = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }))
  triggerDownload(JSON.stringify(payload, null, 2), `${filename}.json`, 'application/json')
}

async function downloadPDF(expenses: Expense[], filename: string): Promise<void> {
  const doc = new jsPDF()
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const generated = format(new Date(), 'MMMM d, yyyy')

  doc.setFillColor(79, 70, 229)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Expense Report', 14, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated ${generated}`, 14, 21)

  doc.setTextColor(60, 60, 60)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`${expenses.length} records`, 140, 40)
  doc.text(`$${total.toFixed(2)} total`, 140, 48)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text('Records', 162, 40)
  doc.text('Amount', 162, 48)

  autoTable(doc, {
    startY: 58,
    head: [['Date', 'Category', 'Amount', 'Description']],
    body: expenses.map((e) => [e.date, e.category, `$${e.amount.toFixed(2)}`, e.description]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold', textColor: 255 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    columnStyles: { 2: { halign: 'right' } },
  })

  doc.save(`${filename}.pdf`)
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
