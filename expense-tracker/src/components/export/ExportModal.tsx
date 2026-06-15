'use client'

import { useState, useMemo } from 'react'
import { format as dateFormat } from 'date-fns'
import { Expense, Category } from '@/types'
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants'
import { ExportFormat, ExportConfig, filterForExport, runExport } from '@/lib/export'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ExportModalProps {
  open: boolean
  onClose: () => void
  expenses: Expense[]
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; ext: string; desc: string; icon: string }[] = [
  { value: 'csv', label: 'CSV', ext: '.csv', desc: 'Spreadsheet compatible', icon: '📊' },
  { value: 'json', label: 'JSON', ext: '.json', desc: 'Structured data', icon: '{ }' },
  { value: 'pdf', label: 'PDF', ext: '.pdf', desc: 'Print-ready report', icon: '📄' },
]

type ExportState = 'idle' | 'exporting' | 'done'

export function ExportModal({ open, onClose, expenses }: ExportModalProps) {
  const today = dateFormat(new Date(), 'yyyy-MM-dd')

  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([...CATEGORIES])
  const [filename, setFilename] = useState(`expenses_${today}`)
  const [exportState, setExportState] = useState<ExportState>('idle')

  const filtered = useMemo(
    () => filterForExport(expenses, dateFrom, dateTo, selectedCategories),
    [expenses, dateFrom, dateTo, selectedCategories]
  )

  const totalAmount = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered])
  const previewRows = filtered.slice(0, 8)
  const ext = FORMAT_OPTIONS.find((f) => f.value === exportFormat)!.ext

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  function toggleAll() {
    setSelectedCategories((prev) =>
      prev.length === CATEGORIES.length ? [] : [...CATEGORIES]
    )
  }

  async function handleExport() {
    if (filtered.length === 0 || exportState === 'exporting') return
    setExportState('exporting')
    const config: ExportConfig = { exportFormat, filename, dateFrom, dateTo, categories: selectedCategories }
    await new Promise((r) => setTimeout(r, 700))
    await runExport(filtered, config)
    setExportState('done')
    setTimeout(() => setExportState('idle'), 2500)
  }

  function handleClose() {
    setExportState('idle')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Export Expenses" className="max-w-2xl">
      <div className="max-h-[78vh] overflow-y-auto -mx-6 px-6 pb-1">

        {/* Format Picker */}
        <div className="flex gap-2.5 mb-5">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setExportFormat(opt.value)}
              className={[
                'flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3.5 text-center transition-all duration-150',
                exportFormat === opt.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white',
              ].join(' ')}
            >
              <span className="text-2xl leading-none">{opt.icon}</span>
              <span className={`text-sm font-bold ${exportFormat === opt.value ? 'text-indigo-700' : 'text-gray-700'}`}>
                {opt.label}
              </span>
              <span className="text-xs text-gray-400">{opt.desc}</span>
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="space-y-4">

          {/* Date Range */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Date Range</p>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo || undefined}
                className="flex-1"
              />
              <span className="text-gray-300 font-light text-lg">—</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="flex-1"
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo('') }}
                  className="shrink-0 rounded-md px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Categories</p>
              <button
                onClick={toggleAll}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {selectedCategories.length === CATEGORIES.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const selected = selectedCategories.includes(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    style={selected ? { backgroundColor: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] } : {}}
                    className={[
                      'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-all duration-150',
                      selected ? 'text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300',
                    ].join(' ')}
                  >
                    <span className="text-sm leading-none">{CATEGORY_ICONS[cat]}</span>
                    {cat}
                  </button>
                )
              })}
            </div>
            {selectedCategories.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">Select at least one category</p>
            )}
          </div>

          {/* Filename */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Filename</p>
            <div className="flex items-center gap-0">
              <Input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="rounded-r-none border-r-0 flex-1"
                placeholder="my-expenses"
              />
              <span className="inline-flex h-[38px] items-center rounded-r-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 shrink-0">
                {ext}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Strip */}
        <div className={[
          'mt-5 flex items-center justify-between rounded-xl px-4 py-3 border transition-colors',
          filtered.length > 0
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-gray-50 border-gray-200',
        ].join(' ')}>
          <div className="flex items-center gap-2.5">
            <div className={`h-2.5 w-2.5 rounded-full ${filtered.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600">
              <span className={`font-bold ${filtered.length > 0 ? 'text-emerald-700' : 'text-gray-700'}`}>
                {filtered.length}
              </span>
              {' '}record{filtered.length !== 1 ? 's' : ''} match your filters
            </span>
          </div>
          {filtered.length > 0 && (
            <span className="text-sm font-semibold text-emerald-700">
              ${totalAmount.toFixed(2)}
            </span>
          )}
        </div>

        {/* Preview Table */}
        {filtered.length > 0 ? (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Preview</p>
              <span className="text-xs text-gray-400">
                {previewRows.length < filtered.length
                  ? `Showing first ${previewRows.length} of ${filtered.length}`
                  : `All ${filtered.length} record${filtered.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewRows.map((e) => (
                    <tr key={e.id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-gray-500">{e.date}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span>{CATEGORY_ICONS[e.category]}</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                            style={{ backgroundColor: CATEGORY_COLORS[e.category] }}
                          >
                            {e.category}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-900">
                        ${e.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 max-w-[140px] truncate text-gray-600">{e.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 8 && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-center text-xs text-gray-400">
                  + {filtered.length - 8} more records included in export
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 py-8 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm font-semibold text-amber-700">No records match your filters</p>
            <p className="mt-1 text-xs text-amber-500">Try adjusting the date range or selecting more categories</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400">
            {filtered.length > 0
              ? `Will save as "${filename}${ext}"`
              : 'No data to export'}
          </p>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              disabled={filtered.length === 0 || exportState === 'exporting' || !filename.trim()}
              className="min-w-[160px]"
            >
              {exportState === 'exporting' && (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Exporting…
                </>
              )}
              {exportState === 'done' && (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Done!
                </>
              )}
              {exportState === 'idle' && (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export {filtered.length} Record{filtered.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  )
}
