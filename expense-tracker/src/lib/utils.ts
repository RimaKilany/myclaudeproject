import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { Expense, Category, CategorySummary, MonthlyData, FilterState } from '@/types'
import { CATEGORY_COLORS } from './constants'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy')
}

export function formatMonth(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM yyyy')
}

export function getCurrentMonthTotal(expenses: Expense[]): number {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)
  return expenses
    .filter((e) => {
      const d = parseISO(e.date)
      return isWithinInterval(d, { start, end })
    })
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getTotalSpending(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

export function getCategorySummaries(expenses: Expense[]): CategorySummary[] {
  const total = getTotalSpending(expenses)
  const map: Partial<Record<Category, { total: number; count: number }>> = {}

  for (const e of expenses) {
    if (!map[e.category]) map[e.category] = { total: 0, count: 0 }
    map[e.category]!.total += e.amount
    map[e.category]!.count += 1
  }

  return Object.entries(map)
    .map(([cat, data]) => ({
      category: cat as Category,
      total: data!.total,
      count: data!.count,
      percentage: total > 0 ? (data!.total / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

export function getMonthlyData(expenses: Expense[]): MonthlyData[] {
  const map: Record<string, number> = {}
  for (const e of expenses) {
    const key = format(parseISO(e.date), 'yyyy-MM')
    map[key] = (map[key] ?? 0) + e.amount
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, total]) => ({
      month: format(parseISO(`${key}-01`), 'MMM yy'),
      total,
    }))
}

export function getPieChartData(expenses: Expense[]) {
  const summaries = getCategorySummaries(expenses)
  return summaries.map((s) => ({
    name: s.category,
    value: s.total,
    color: CATEGORY_COLORS[s.category],
  }))
}

export function filterExpenses(expenses: Expense[], filters: FilterState): Expense[] {
  return expenses.filter((e) => {
    const matchesSearch =
      !filters.search ||
      e.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      e.category.toLowerCase().includes(filters.search.toLowerCase())

    const matchesCategory = filters.category === 'All' || e.category === filters.category

    const matchesDateFrom = !filters.dateFrom || e.date >= filters.dateFrom
    const matchesDateTo = !filters.dateTo || e.date <= filters.dateTo

    return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo
  })
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Category', 'Amount', 'Description']
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
