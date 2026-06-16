import { format as dateFmt, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Expense, Category } from '@/types'

export type ExportFormat = 'csv' | 'json' | 'pdf'

export interface DatePreset {
  label: string
  dateFrom: string
  dateTo: string
}

export function getDatePresets(): DatePreset[] {
  const now = new Date()
  const fmt = (d: Date) => dateFmt(d, 'yyyy-MM-dd')
  return [
    {
      label: 'This month',
      dateFrom: fmt(startOfMonth(now)),
      dateTo: fmt(endOfMonth(now)),
    },
    {
      label: 'Last month',
      dateFrom: fmt(startOfMonth(subMonths(now, 1))),
      dateTo: fmt(endOfMonth(subMonths(now, 1))),
    },
    {
      label: 'Last 3 months',
      dateFrom: fmt(startOfMonth(subMonths(now, 2))),
      dateTo: fmt(endOfMonth(now)),
    },
    {
      label: 'This year',
      dateFrom: fmt(startOfYear(now)),
      dateTo: fmt(endOfMonth(now)),
    },
    { label: 'All time', dateFrom: '', dateTo: '' },
  ]
}

export function filterForExport(
  expenses: Expense[],
  dateFrom: string,
  dateTo: string,
  categories: Category[]
): Expense[] {
  return expenses.filter((e) => {
    const inRange = (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo)
    const inCategory = categories.length === 0 || categories.includes(e.category)
    return inRange && inCategory
  })
}

export async function runExport(
  expenses: Expense[],
  format: ExportFormat,
  filename: string
): Promise<void> {
  if (format === 'csv') downloadCSV(expenses, filename)
  else if (format === 'json') downloadJSON(expenses, filename)
  else await downloadPDF(expenses, filename)
}

function downloadCSV(expenses: Expense[], filename: string): void {
  const header = ['Date', 'Category', 'Amount', 'Description'].join(',')
  const rows = expenses.map((e) =>
    [e.date, e.category, e.amount.toFixed(2), `"${e.description.replace(/"/g, '""')}"`].join(',')
  )
  triggerDownload([header, ...rows].join('\n'), `${filename}.csv`, 'text/csv;charset=utf-8;')
}

function downloadJSON(expenses: Expense[], filename: string): void {
  const payload = expenses.map(({ date, category, amount, description }) => ({
    date,
    category,
    amount,
    description,
  }))
  triggerDownload(JSON.stringify(payload, null, 2), `${filename}.json`, 'application/json')
}

async function downloadPDF(expenses: Expense[], filename: string): Promise<void> {
  const doc = new jsPDF()
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const now = dateFmt(new Date(), 'MMMM d, yyyy')

  doc.setFillColor(79, 70, 229)
  doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Expense Report', 14, 14)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated ${now}`, 14, 23)

  doc.setTextColor(50, 50, 50)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`${expenses.length}`, 148, 44)
  doc.text(`$${total.toFixed(2)}`, 148, 53)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text('records exported', 160, 44)
  doc.text('total amount', 160, 53)

  autoTable(doc, {
    startY: 62,
    head: [['Date', 'Category', 'Amount', 'Description']],
    body: expenses.map((e) => [e.date, e.category, `$${e.amount.toFixed(2)}`, e.description]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    columnStyles: { 2: { halign: 'right' } },
  })

  doc.save(`${filename}.pdf`)
}

function triggerDownload(content: string, filename: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  Object.assign(document.createElement('a'), { href: url, download: filename }).click()
  URL.revokeObjectURL(url)
}
