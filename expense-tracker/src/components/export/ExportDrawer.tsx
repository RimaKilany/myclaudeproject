'use client'

import { useState, useMemo, useEffect } from 'react'
import { format as dateFmt } from 'date-fns'
import { Expense, Category } from '@/types'
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants'
import { ExportFormat, DatePreset, getDatePresets, filterForExport, runExport } from '@/lib/export'

interface ExportDrawerProps {
  open: boolean
  onClose: () => void
  expenses: Expense[]
}

const FORMATS: { value: ExportFormat; label: string; icon: string; hint: string }[] = [
  { value: 'csv', label: 'CSV', icon: '📊', hint: 'Excel / Sheets' },
  { value: 'json', label: 'JSON', icon: '{ }', hint: 'Developers' },
  { value: 'pdf', label: 'PDF', icon: '📄', hint: 'Print / share' },
]

type QuickState = { format: ExportFormat; status: 'idle' | 'loading' | 'done' } | null
type CustomState = 'idle' | 'exporting' | 'done'

export function ExportDrawer({ open, onClose, expenses }: ExportDrawerProps) {
  const today = dateFmt(new Date(), 'yyyy-MM-dd')
  const presets = useMemo(() => getDatePresets(), [])

  // Quick export state
  const [quickState, setQuickState] = useState<QuickState>(null)

  // Custom export state
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [activePreset, setActivePreset] = useState<string>('All time')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([...CATEGORIES])
  const [filename, setFilename] = useState(`expenses_${today}`)
  const [customState, setCustomState] = useState<CustomState>('idle')

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuickState(null)
      setCustomState('idle')
    }
  }, [open])

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const filtered = useMemo(
    () => filterForExport(expenses, dateFrom, dateTo, selectedCategories),
    [expenses, dateFrom, dateTo, selectedCategories]
  )

  const totalAmount = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered])
  const previewRows = filtered.slice(0, 5)
  const currentExt = FORMATS.find((f) => f.value === exportFormat)!.label.toLowerCase()

  function applyPreset(preset: DatePreset) {
    setActivePreset(preset.label)
    setDateFrom(preset.dateFrom)
    setDateTo(preset.dateTo)
  }

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  async function handleQuickExport(format: ExportFormat) {
    setQuickState({ format, status: 'loading' })
    await new Promise((r) => setTimeout(r, 600))
    await runExport(expenses, format, `expenses_${today}`)
    setQuickState({ format, status: 'done' })
    setTimeout(() => setQuickState(null), 2000)
  }

  async function handleCustomExport() {
    if (filtered.length === 0 || customState !== 'idle') return
    setCustomState('exporting')
    await new Promise((r) => setTimeout(r, 700))
    await runExport(filtered, exportFormat, filename || `expenses_${today}`)
    setCustomState('done')
    setTimeout(() => setCustomState('idle'), 2500)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={[
          'fixed right-0 top-0 bottom-0 z-50 flex w-[420px] flex-col bg-white shadow-2xl',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Drawer header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Export Expenses</h2>
            <p className="text-xs text-gray-400 mt-0.5">{expenses.length} total records available</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── QUICK EXPORT ── */}
          <div className="px-5 pt-5 pb-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Quick Export · All {expenses.length} records
            </p>
            <div className="flex gap-2">
              {FORMATS.map(({ value, label, icon, hint }) => {
                const isThis = quickState?.format === value
                const loading = isThis && quickState?.status === 'loading'
                const done = isThis && quickState?.status === 'done'
                const busy = quickState !== null && !done
                return (
                  <button
                    key={value}
                    onClick={() => !busy && handleQuickExport(value)}
                    disabled={busy}
                    className={[
                      'flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 py-3.5 px-2 text-center',
                      'transition-all duration-150 disabled:opacity-60',
                      done
                        ? 'border-emerald-400 bg-emerald-50'
                        : loading
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 bg-white',
                    ].join(' ')}
                  >
                    {loading ? (
                      <svg className="h-5 w-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : done ? (
                      <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xl leading-none">{icon}</span>
                    )}
                    <span className={`text-xs font-bold ${done ? 'text-emerald-600' : loading ? 'text-indigo-600' : 'text-gray-700'}`}>
                      {done ? 'Saved!' : label}
                    </span>
                    <span className="text-[10px] text-gray-400">{hint}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── DIVIDER ── */}
          <div className="mx-5 flex items-center gap-3 pb-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-400 whitespace-nowrap">or customize your export</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* ── CUSTOM EXPORT ── */}
          <div className="px-5 space-y-5 pb-6">

            {/* Format */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Format</p>
              <div className="flex gap-2">
                {FORMATS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => setExportFormat(value)}
                    className={[
                      'flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-all duration-150',
                      exportFormat === value
                        ? 'border-indigo-500 bg-indigo-500 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                    ].join(' ')}
                  >
                    <span className="text-base leading-none">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Presets + Range */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Date Range</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={[
                      'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150',
                      activePreset === preset.label
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600',
                    ].join(' ')}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => { setDateFrom(e.target.value); setActivePreset('') }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-gray-300">—</span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => { setDateTo(e.target.value); setActivePreset('') }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Categories</p>
                <button
                  onClick={() =>
                    setSelectedCategories(
                      selectedCategories.length === CATEGORIES.length ? [] : [...CATEGORIES]
                    )
                  }
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {selectedCategories.length === CATEGORIES.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const on = selectedCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      style={on ? { backgroundColor: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] } : {}}
                      className={[
                        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150',
                        on ? 'text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300',
                      ].join(' ')}
                    >
                      <span>{CATEGORY_ICONS[cat]}</span>
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filename */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Filename</p>
              <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder={`expenses_${today}`}
                  className="flex-1 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
                <span className="flex items-center border-l border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-500">
                  .{currentExt}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div
              className={[
                'flex items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-200',
                filtered.length > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50',
              ].join(' ')}
            >
              <div className="flex items-center gap-2.5">
                <div className={`h-2 w-2 rounded-full ${filtered.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600">
                  <span className={`font-bold ${filtered.length > 0 ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {filtered.length}
                  </span>{' '}
                  record{filtered.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              {filtered.length > 0 && (
                <span className="text-sm font-semibold text-emerald-700">${totalAmount.toFixed(2)}</span>
              )}
            </div>

            {/* Preview */}
            {filtered.length > 0 ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Preview</p>
                  <span className="text-xs text-gray-400">
                    {previewRows.length < filtered.length
                      ? `First ${previewRows.length} of ${filtered.length}`
                      : `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Date</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Category</th>
                        <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Amount</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {previewRows.map((e) => (
                        <tr key={e.id} className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 text-gray-500">{e.date}</td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1">
                              <span>{CATEGORY_ICONS[e.category]}</span>
                              <span
                                className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                                style={{ backgroundColor: CATEGORY_COLORS[e.category] }}
                              >
                                {e.category}
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-900">
                            ${e.amount.toFixed(2)}
                          </td>
                          <td className="max-w-[90px] truncate px-3 py-2 text-gray-500">
                            {e.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length > 5 && (
                    <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 text-center text-xs text-gray-400">
                      +{filtered.length - 5} more included in export
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 py-8 text-center">
                <div className="mb-2 text-3xl">🔍</div>
                <p className="text-sm font-semibold text-amber-700">No records match your filters</p>
                <p className="mt-1 text-xs text-amber-500">Try a different date range or add more categories</p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4">
          <button
            onClick={handleCustomExport}
            disabled={filtered.length === 0 || customState !== 'idle' || !filename.trim()}
            className={[
              'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold',
              'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
              customState === 'done'
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
            ].join(' ')}
          >
            {customState === 'exporting' && (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Preparing export…
              </>
            )}
            {customState === 'done' && (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Export complete!
              </>
            )}
            {customState === 'idle' && (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export {filtered.length} record{filtered.length !== 1 ? 's' : ''} as {exportFormat.toUpperCase()}
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            {customState === 'idle' && filtered.length > 0
              ? `Saves as "${filename || `expenses_${today}`}.${currentExt}"`
              : customState === 'idle'
              ? 'Adjust filters above to select records'
              : ''}
          </p>
        </div>
      </div>
    </>
  )
}
