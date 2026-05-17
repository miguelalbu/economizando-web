import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import api from '../services/api'

// ── Tipos exportados (usados pelas seções) ────────────────────────────────────

export interface Income {
  id: number; description: string; amount: number; received_at: string; notes: string | null
}
export interface Expense {
  id: number; description: string; amount: number; spent_at: string
  payment_method: string; category: string; credit_card_id: number | null
  installments: number; installment_number: number; notes: string | null
}
export interface Bill {
  id: number; description: string; amount: number; due_date: string
  status: string; recurrence: string; is_essential: boolean; notes: string | null; barcode: string | null
}
export interface CreditCard {
  id: number; name: string; last_four_digits: string | null
  credit_limit: number | null; closing_day: number; due_day: number
}
export interface Transaction {
  id: number; type: 'deposit' | 'withdrawal'; amount: number
  transaction_date: string; notes: string | null; created_at: string
}
export interface Investment {
  id: number; name: string; type: string; current_value: number | null
  maturity_date: string | null; institution: string | null; notes: string | null
  transactions: Transaction[]; total_deposited: number; total_withdrawn: number; net_invested: number
}

export type Entity = 'incomes' | 'expenses' | 'bills' | 'cards' | 'investments'

// ── Contexto ──────────────────────────────────────────────────────────────────

interface DataContextValue {
  incomes:     Income[]
  expenses:    Expense[]
  bills:       Bill[]
  creditCards: CreditCard[]
  investments: Investment[]
  loading:     boolean
  refresh:     (...entities: Entity[]) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [incomes,     setIncomes]     = useState<Income[]>([])
  const [expenses,    setExpenses]    = useState<Expense[]>([])
  const [bills,       setBills]       = useState<Bill[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading,     setLoading]     = useState(true)

  const refresh = useCallback(async (...entities: Entity[]) => {
    const all: Entity[] = ['incomes', 'expenses', 'bills', 'cards', 'investments']
    const targets = entities.length > 0 ? entities : all
    const fetches: Promise<void>[] = []
    if (targets.includes('incomes'))     fetches.push(api.get('/incomes',      { params: { limit: 1000 } }).then(r => setIncomes(r.data)))
    if (targets.includes('expenses'))    fetches.push(api.get('/expenses',     { params: { limit: 1000 } }).then(r => setExpenses(r.data)))
    if (targets.includes('bills'))       fetches.push(api.get('/bills',        { params: { limit: 1000 } }).then(r => setBills(r.data)))
    if (targets.includes('cards'))       fetches.push(api.get('/credit-cards').then(r => setCreditCards(r.data)))
    if (targets.includes('investments')) fetches.push(api.get('/investments').then(r => setInvestments(r.data)))
    await Promise.all(fetches)
  }, [])

  useEffect(() => {
    setLoading(true)
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return (
    <DataContext.Provider value={{ incomes, expenses, bills, creditCards, investments, loading, refresh }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
