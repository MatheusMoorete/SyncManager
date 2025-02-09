import { Timestamp } from 'firebase/firestore'

export type TransactionType = 'receita' | 'despesa'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: string
  date: string
  createdAt: string
  updated_at: string
}

export interface TransactionFormValues {
  type: 'income' | 'expense'
  category: string
  amount: number
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'pix' | null
  clientId: string | null
  notes: string | null
  receiptUrl: string | null
  transactionDate: Timestamp
}

export interface FinanceStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  monthlyProjection: number
  revenueByCategory: {
    category: string
    amount: number
    percentage: number
  }[]
  expensesByCategory: {
    category: string
    amount: number
    percentage: number
  }[]
  comparisonWithLastMonth: {
    revenue: number
    expenses: number
    profit: number
  }
}
