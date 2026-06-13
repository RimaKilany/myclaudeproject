'use client'

import { useState } from 'react'
import { Expense, FilterState } from '@/types'
import { filterExpenses, exportToCSV } from '@/lib/utils'
import { ExpenseRow } from './ExpenseRow'
import { ExpenseFilters } from './ExpenseFilters'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ExpenseForm } from './ExpenseForm'

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: 'All',
  dateFrom: '',
  dateTo: '',
}

interface ExpenseListProps {
  expenses: Expense[]
  onUpdate: (id: string, data: any) => void
  onDelete: (id: string) => void
}

export function ExpenseList({ expenses, onUpdate, onDelete }: ExpenseListProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [editing, setEditing] = useState<Expense | null>(null)

  const filtered = filterExpenses(expenses, filters)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Expenses
          {filtered.length !== expenses.length && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filtered.length} of {expenses.length})
            </span>
          )}
        </h2>
        {expenses.length > 0 && (
          <Button variant="secondary" size="sm" onClick={() => exportToCSV(expenses)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </Button>
        )}
      </div>

      <ExpenseFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <span className="text-4xl">📭</span>
          <p className="mt-3 text-sm text-gray-500">
            {expenses.length === 0 ? 'No expenses yet. Add your first one!' : 'No expenses match your filters.'}
          </p>
        </div>
      ) : (
        <div className="group flex flex-col gap-2">
          {filtered.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onEdit={setEditing}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Expense"
      >
        {editing && (
          <ExpenseForm
            initialValues={editing}
            onSubmit={(data) => {
              onUpdate(editing.id, data)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
