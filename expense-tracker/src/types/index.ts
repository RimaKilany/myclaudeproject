export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other'

export interface Expense {
  id: string
  amount: number
  category: Category
  description: string
  date: string // ISO date string YYYY-MM-DD
  createdAt: string // ISO timestamp
}

export interface ExpenseFormData {
  amount: string
  category: Category
  description: string
  date: string
}

export interface FilterState {
  search: string
  category: Category | 'All'
  dateFrom: string
  dateTo: string
}

export interface CategorySummary {
  category: Category
  total: number
  count: number
  percentage: number
}

export interface MonthlyData {
  month: string
  total: number
}
