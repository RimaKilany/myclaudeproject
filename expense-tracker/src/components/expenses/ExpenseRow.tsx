'use client'

import { useState } from 'react'
import { Expense } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CategoryBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface ExpenseRowProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseRow({ expense, onEdit, onDelete }: ExpenseRowProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">{expense.description}</p>
        <div className="mt-1 flex items-center gap-2">
          <CategoryBadge category={expense.category} />
          <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base font-semibold text-gray-900">
          {formatCurrency(expense.amount)}
        </span>

        {confirming ? (
          <div className="flex gap-1">
            <Button size="sm" variant="danger" onClick={() => onDelete(expense.id)}>
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(expense)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="Edit"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
