'use client'

import { FilterState } from '@/types'
import { CATEGORIES } from '@/lib/constants'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface ExpenseFiltersProps {
  filters: FilterState
  onChange: (f: FilterState) => void
  onReset: () => void
}

const categoryOptions = [
  { value: 'All', label: 'All Categories' },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
]

export function ExpenseFilters({ filters, onChange, onReset }: ExpenseFiltersProps) {
  const update = (key: keyof FilterState, value: string) =>
    onChange({ ...filters, [key]: value })

  const hasActive =
    filters.search || filters.category !== 'All' || filters.dateFrom || filters.dateTo

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-1">
          <Input
            label="Search"
            placeholder="Search description or category…"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            label="Category"
            options={categoryOptions}
            value={filters.category}
            onChange={(e) => update('category', e.target.value)}
          />
        </div>
        <div className="w-full sm:w-36">
          <Input
            label="From"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update('dateFrom', e.target.value)}
          />
        </div>
        <div className="w-full sm:w-36">
          <Input
            label="To"
            type="date"
            value={filters.dateTo}
            onChange={(e) => update('dateTo', e.target.value)}
          />
        </div>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onReset} className="whitespace-nowrap">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
