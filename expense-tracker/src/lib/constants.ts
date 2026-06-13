import { Category } from '@/types'

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
]

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f59e0b',
  Transportation: '#3b82f6',
  Entertainment: '#8b5cf6',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Other: '#6b7280',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: '🍔',
  Transportation: '🚗',
  Entertainment: '🎭',
  Shopping: '🛍️',
  Bills: '📄',
  Other: '📦',
}

export const STORAGE_KEY = 'expense_tracker_data'
