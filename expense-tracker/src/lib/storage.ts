import { Expense } from '@/types'
import { STORAGE_KEY } from './constants'

export function loadExpenses(): Expense[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Expense[]
  } catch {
    return []
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}
