import { create } from 'zustand'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { useAuthStore } from './auth-store'
import { toast } from 'sonner'

export interface Transaction {
  id: string
  ownerId: string
  clientId: string | null
  type: 'income' | 'expense'
  category: string
  amount: number
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'pix' | null
  receiptUrl: string | null
  transactionDate: Timestamp
  notes: string | null
  createdAt: Timestamp
  appointmentId?: string
}

interface Expense {
  id: string
  ownerId: string
  name: string
  category: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'once' | null
  nextPaymentDate: Timestamp | null
  createdAt: Timestamp
}

interface FinanceStats {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  monthlyProjection: number
  incomeByCategory: { category: string; total: number }[]
  expensesByCategory: { category: string; total: number }[]
}

interface FinanceStore {
  transactions: Transaction[]
  expenses: Expense[]
  stats: FinanceStats | null
  loading: boolean
  error: string | null
  actions: {
    fetchTransactions: () => Promise<void>
    fetchExpenses: () => Promise<void>
    calculateStats: () => Promise<void>
    addTransaction: (
      transaction: Omit<Transaction, 'id' | 'createdAt' | 'ownerId'>
    ) => Promise<void>
    addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'ownerId'>) => Promise<void>
    deleteTransaction: (id: string) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    updateTransaction: (
      id: string,
      transaction: Omit<Transaction, 'id' | 'createdAt' | 'ownerId'>
    ) => Promise<void>
  }
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  transactions: [],
  expenses: [],
  stats: null,
  loading: false,
  error: null,
  actions: {
    fetchTransactions: async () => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })
      try {
        const q = query(
          collection(db, 'transactions'),
          where('ownerId', '==', user.uid),
          orderBy('transactionDate', 'desc')
        )

        const snapshot = await getDocs(q)
        const transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[]

        set({ transactions })
        await get().actions.calculateStats()
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Erro desconhecido' })
      } finally {
        set({ loading: false })
      }
    },

    fetchExpenses: async () => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })
      try {
        const q = query(
          collection(db, 'expenses'),
          where('ownerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(q)
        const expenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[]

        set({ expenses })
        await get().actions.calculateStats()
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Erro desconhecido' })
      } finally {
        set({ loading: false })
      }
    },

    calculateStats: async () => {
      const { transactions } = get()
      const currentDate = new Date()
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      // Filtrar transações do mês atual
      const monthTransactions = transactions.filter(t => {
        const transactionDate = t.transactionDate.toDate()
        return transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth
      })

      // Calcular totais
      const totalIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const totalExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      // Calcular por categoria
      const incomeByCategory = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.category === t.category)
          if (existing) {
            existing.total += t.amount
          } else {
            acc.push({ category: t.category, total: t.amount })
          }
          return acc
        }, [] as { category: string; total: number }[])

      const expensesByCategory = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.category === t.category)
          if (existing) {
            existing.total += t.amount
          } else {
            acc.push({ category: t.category, total: t.amount })
          }
          return acc
        }, [] as { category: string; total: number }[])

      // Projeção mensal
      const calculateMonthlyProjection = () => {
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

        // Agrupa transações por mês
        const monthlyTransactions = transactions.reduce((acc, t) => {
          const date = t.transactionDate.toDate()
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`

          if (!acc[monthKey]) {
            acc[monthKey] = {
              income: 0,
              expenses: 0,
              netProfit: 0,
              date: date,
            }
          }

          if (t.type === 'income') {
            acc[monthKey].income += t.amount
          } else {
            acc[monthKey].expenses += t.amount
          }

          acc[monthKey].netProfit = acc[monthKey].income - acc[monthKey].expenses

          return acc
        }, {} as Record<string, { income: number; expenses: number; netProfit: number; date: Date }>)

        const months = Object.values(monthlyTransactions).sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        )

        if (months.length === 0) return 0
        if (months.length === 1) return months[0].netProfit
        if (months.length === 2) {
          return months.reduce((sum, month) => sum + month.netProfit, 0) / months.length
        }

        // Com 3 ou mais meses, calcula tendência com média ponderada
        const recentMonths = months.slice(0, 3)
        return (
          recentMonths[0].netProfit * 0.5 + // Mês mais recente: peso 50%
          recentMonths[1].netProfit * 0.3 + // Mês anterior: peso 30%
          recentMonths[2].netProfit * 0.2 // Mês mais antigo: peso 20%
        )
      }

      const monthlyProjection = calculateMonthlyProjection()

      set({
        stats: {
          totalIncome,
          totalExpenses,
          netProfit: totalIncome - totalExpenses,
          monthlyProjection,
          incomeByCategory,
          expensesByCategory,
        },
      })
    },

    addTransaction: async transaction => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })
      try {
        const now = Timestamp.now()
        const newTransaction = {
          ...transaction,
          ownerId: user.uid,
          createdAt: now,
        }

        const docRef = await addDoc(collection(db, 'transactions'), newTransaction)
        const addedTransaction = { id: docRef.id, ...newTransaction }

        set(state => ({
          transactions: [addedTransaction, ...state.transactions],
        }))

        await get().actions.calculateStats()
      } catch (error) {
        console.error('Erro ao adicionar transação:', error)
        throw error
      } finally {
        set({ loading: false })
      }
    },

    addExpense: async expense => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })
      try {
        const now = Timestamp.now()
        const newExpense = {
          ...expense,
          ownerId: user.uid,
          createdAt: now,
        }

        const docRef = await addDoc(collection(db, 'expenses'), newExpense)
        const addedExpense = { id: docRef.id, ...newExpense }

        set(state => ({
          expenses: [addedExpense, ...state.expenses],
        }))

        await get().actions.calculateStats()
      } catch (error) {
        console.error('Erro ao adicionar despesa:', error)
        throw error
      } finally {
        set({ loading: false })
      }
    },

    updateTransaction: async (id, transaction) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })
      try {
        const updateData = {
          ...transaction,
          updatedAt: Timestamp.now(),
        }

        await updateDoc(doc(db, 'transactions', id), updateData)

        set(state => ({
          transactions: state.transactions.map(t => (t.id === id ? { ...t, ...updateData } : t)),
        }))

        await get().actions.calculateStats()
      } catch (error) {
        console.error('Erro ao atualizar transação:', error)
        throw error
      } finally {
        set({ loading: false })
      }
    },

    deleteTransaction: async (id: string) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })

        await deleteDoc(doc(db, 'transactions', id))

        set(state => ({
          transactions: state.transactions.filter(t => t.id !== id),
        }))
      } catch (error) {
        console.error('Error deleting transaction:', error)
        throw error
      } finally {
        set({ loading: false })
      }
    },

    deleteExpense: async id => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })
      try {
        await deleteDoc(doc(db, 'expenses', id))

        set(state => ({
          expenses: state.expenses.filter(e => e.id !== id),
        }))

        await get().actions.calculateStats()
      } catch (error) {
        console.error('Erro ao excluir despesa:', error)
        throw error
      } finally {
        set({ loading: false })
      }
    },
  },
}))
