'use client'

import { Expense } from '@/types'
import { formatCurrency, getTotalSpending, getCurrentMonthTotal, getCategorySummaries } from '@/lib/utils'
import { CATEGORY_ICONS } from '@/lib/constants'

interface SummaryCardsProps {
  expenses: Expense[]
}

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

export function SummaryCards({ expenses }: SummaryCardsProps) {
  const total = getTotalSpending(expenses)
  const monthly = getCurrentMonthTotal(expenses)
  const summaries = getCategorySummaries(expenses)
  const top = summaries[0]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Spending"
        value={formatCurrency(total)}
        sub={`${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`}
        icon="💰"
      />
      <StatCard
        label="This Month"
        value={formatCurrency(monthly)}
        sub={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        icon="📅"
      />
      <StatCard
        label="Top Category"
        value={top ? top.category : '—'}
        sub={top ? formatCurrency(top.total) : 'No data yet'}
        icon={top ? CATEGORY_ICONS[top.category] : '📊'}
      />
      <StatCard
        label="Avg per Expense"
        value={expenses.length > 0 ? formatCurrency(total / expenses.length) : '$0.00'}
        sub={expenses.length > 0 ? `across ${expenses.length} items` : 'No data yet'}
        icon="📈"
      />
    </div>
  )
}
