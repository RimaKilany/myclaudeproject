'use client'

import { useState } from 'react'
import { useExpenses } from '@/hooks/useExpenses'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

type Tab = 'dashboard' | 'expenses'

export default function Home() {
  const { expenses, isLoaded, addExpense, updateExpense, deleteExpense } = useExpenses()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [showAdd, setShowAdd] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (data: any) => {
    setIsSubmitting(true)
    addExpense(data)
    await new Promise((r) => setTimeout(r, 300))
    setIsSubmitting(false)
    setShowAdd(false)
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm">Loading your expenses…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold shadow-sm">
              💸
            </div>
            <span className="text-lg font-bold text-gray-900">ExpenseTracker</span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            {(['dashboard', 'expenses'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-all duration-150 ${
                  tab === t
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>

          <Button onClick={() => setShowAdd(true)} size="sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Expense
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === 'dashboard' ? (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Your spending overview at a glance</p>
            </div>
            <SummaryCards expenses={expenses} />
            <SpendingChart expenses={expenses} />
            <CategoryBreakdown expenses={expenses} />
          </div>
        ) : (
          <ExpenseList
            expenses={expenses}
            onUpdate={updateExpense}
            onDelete={deleteExpense}
          />
        )}
      </main>

      {/* Add Expense Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Expense">
        <ExpenseForm
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  )
}
