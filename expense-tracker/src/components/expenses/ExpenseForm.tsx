'use client'

import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { ExpenseFormData, Expense, Category } from '@/types'
import { CATEGORIES } from '@/lib/constants'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void
  onCancel: () => void
  initialValues?: Expense
  isSubmitting?: boolean
}

const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }))

export function ExpenseForm({ onSubmit, onCancel, initialValues, isSubmitting }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    defaultValues: {
      amount: initialValues ? String(initialValues.amount) : '',
      category: initialValues?.category ?? 'Food',
      description: initialValues?.description ?? '',
      date: initialValues?.date ?? format(new Date(), 'yyyy-MM-dd'),
    },
  })

  useEffect(() => {
    if (initialValues) {
      reset({
        amount: String(initialValues.amount),
        category: initialValues.category,
        description: initialValues.description,
        date: initialValues.date,
      })
    }
  }, [initialValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="amount"
          label="Amount ($)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 0.01, message: 'Must be at least $0.01' },
            pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Invalid amount' },
          })}
        />
        <Input
          id="date"
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register('date', { required: 'Date is required' })}
        />
      </div>

      <Select
        id="category"
        label="Category"
        options={categoryOptions}
        error={errors.category?.message}
        {...register('category', { required: 'Category is required' })}
      />

      <Input
        id="description"
        label="Description"
        placeholder="What did you spend on?"
        error={errors.description?.message}
        {...register('description', {
          required: 'Description is required',
          maxLength: { value: 120, message: 'Max 120 characters' },
        })}
      />

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving…' : initialValues ? 'Update Expense' : 'Add Expense'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
