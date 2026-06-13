'use client'

import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Expense, ExpenseFormData } from '@/types'
import { loadExpenses, saveExpenses } from '@/lib/storage'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setExpenses(loadExpenses())
    setIsLoaded(true)
  }, [])

  const persist = useCallback((updated: Expense[]) => {
    setExpenses(updated)
    saveExpenses(updated)
  }, [])

  const addExpense = useCallback(
    (data: ExpenseFormData) => {
      const expense: Expense = {
        id: uuidv4(),
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description.trim(),
        date: data.date,
        createdAt: new Date().toISOString(),
      }
      persist([expense, ...expenses])
    },
    [expenses, persist]
  )

  const updateExpense = useCallback(
    (id: string, data: ExpenseFormData) => {
      persist(
        expenses.map((e) =>
          e.id === id
            ? {
                ...e,
                amount: parseFloat(data.amount),
                category: data.category,
                description: data.description.trim(),
                date: data.date,
              }
            : e
        )
      )
    },
    [expenses, persist]
  )

  const deleteExpense = useCallback(
    (id: string) => {
      persist(expenses.filter((e) => e.id !== id))
    },
    [expenses, persist]
  )

  return { expenses, isLoaded, addExpense, updateExpense, deleteExpense }
}
