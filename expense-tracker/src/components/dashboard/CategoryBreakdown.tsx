'use client'

import { Expense } from '@/types'
import { getCategorySummaries, formatCurrency } from '@/lib/utils'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants'

interface CategoryBreakdownProps {
  expenses: Expense[]
}

export function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  const summaries = getCategorySummaries(expenses)

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Category Breakdown</h3>
      {summaries.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No data yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {summaries.map((s) => (
            <div key={s.category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-gray-700">
                  <span>{CATEGORY_ICONS[s.category]}</span>
                  {s.category}
                  <span className="text-xs text-gray-400">({s.count})</span>
                </span>
                <span className="font-semibold text-gray-900">{formatCurrency(s.total)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${s.percentage}%`,
                    backgroundColor: CATEGORY_COLORS[s.category],
                  }}
                />
              </div>
              <p className="mt-0.5 text-right text-xs text-gray-400">{s.percentage.toFixed(1)}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
