import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

interface Transaction {
  id: string
  owner_id: string
  client_id: string | null
  type: 'income' | 'expense'
  category: string
  amount: number
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'pix' | null
  receipt_url: string | null
  transaction_date: string
  notes: string | null | undefined
  created_at: string
}

interface Expense {
  id: string
  owner_id: string
  name: string
  category: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'once' | null
  next_payment_date: string | null
  created_at: string
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
  isLoading: boolean
  error: string | null
  actions: {
    fetchTransactions: () => Promise<void>
    fetchExpenses: () => Promise<void>
    calculateStats: () => Promise<void>
    addTransaction: (
      transaction: Omit<Transaction, 'id' | 'created_at' | 'owner_id'>
    ) => Promise<void>
    addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>
    deleteTransaction: (id: string) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
  }
}

const supabase = createClient()

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  transactions: [],
  expenses: [],
  stats: null,
  isLoading: false,
  error: null,
  actions: {
    fetchTransactions: async () => {
      set({ isLoading: true, error: null })
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('transaction_date', { ascending: false })

        if (error) throw error

        set({ transactions: data })
        await get().actions.calculateStats()
      } catch (error) {
        set({ error: (error as Error).message })
      } finally {
        set({ isLoading: false })
      }
    },

    fetchExpenses: async () => {
      set({ isLoading: true, error: null })
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        set({ expenses: data })
        await get().actions.calculateStats()
      } catch (error) {
        set({ error: (error as Error).message })
      } finally {
        set({ isLoading: false })
      }
    },

    calculateStats: async () => {
      const { transactions } = get()
      const currentDate = new Date()
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      // Filtrar transações do mês atual
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transaction_date)
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

      // Nova lógica de projeção mensal
      const calculateMonthlyProjection = () => {
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

        // Agrupa transações por mês
        const monthlyTransactions = transactions.reduce((acc, t) => {
          const date = new Date(t.transaction_date)
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

        // Se não tiver dados suficientes
        if (months.length === 0) {
          return 0
        }

        if (months.length === 1) {
          // Com apenas 1 mês, projeta baseado no mês atual
          return months[0].netProfit
        }

        if (months.length === 2) {
          // Com 2 meses, faz uma média simples
          const average = months.reduce((sum, month) => sum + month.netProfit, 0) / months.length
          return average
        }

        // Com 3 ou mais meses, calcula tendência com média ponderada
        const recentMonths = months.slice(0, 3)
        const weightedAverage =
          recentMonths[0].netProfit * 0.5 + // Mês mais recente: peso 50%
          recentMonths[1].netProfit * 0.3 + // Mês anterior: peso 30%
          recentMonths[2].netProfit * 0.2 // Mês mais antigo: peso 20%

        return weightedAverage
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
      set({ isLoading: true, error: null })
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuário não autenticado')

        console.log('Data recebida na store:', transaction.transaction_date)

        const { data, error } = await supabase
          .from('transactions')
          .insert([
            {
              ...transaction,
              owner_id: user.id,
              created_at: new Date().toISOString(),
            },
          ])
          .select('*')
          .single()

        if (error) throw error

        console.log('Data retornada do Supabase:', data.transaction_date)

        // Atualiza o estado de forma otimista
        set(state => ({
          transactions: [data, ...state.transactions],
          stats: {
            ...state.stats!,
            totalIncome:
              transaction.type === 'income'
                ? state.stats!.totalIncome + transaction.amount
                : state.stats!.totalIncome,
            totalExpenses:
              transaction.type === 'expense'
                ? state.stats!.totalExpenses + transaction.amount
                : state.stats!.totalExpenses,
            netProfit:
              transaction.type === 'income'
                ? state.stats!.netProfit + transaction.amount
                : state.stats!.netProfit - transaction.amount,
          },
        }))

        // Atualiza as estatísticas em segundo plano
        get().actions.calculateStats()
      } catch (error) {
        set({ error: (error as Error).message })
      } finally {
        set({ isLoading: false })
      }
    },

    addExpense: async expense => {
      set({ isLoading: true, error: null })
      try {
        const { data, error } = await supabase.from('expenses').insert([expense]).select()

        if (error) throw error

        set(state => ({
          expenses: [...state.expenses, data[0]],
        }))
        await get().actions.calculateStats()
      } catch (error) {
        set({ error: (error as Error).message })
      } finally {
        set({ isLoading: false })
      }
    },

    deleteTransaction: async id => {
      set({ isLoading: true, error: null })
      try {
        const { error } = await supabase.from('transactions').delete().eq('id', id)

        if (error) throw error

        set(state => ({
          transactions: state.transactions.filter(t => t.id !== id),
        }))
        await get().actions.calculateStats()
      } catch (error) {
        set({ error: (error as Error).message })
      } finally {
        set({ isLoading: false })
      }
    },

    deleteExpense: async id => {
      set({ isLoading: true, error: null })
      try {
        const { error } = await supabase.from('expenses').delete().eq('id', id)

        if (error) throw error

        set(state => ({
          expenses: state.expenses.filter(e => e.id !== id),
        }))
        await get().actions.calculateStats()
      } catch (error) {
        set({ error: (error as Error).message })
      } finally {
        set({ isLoading: false })
      }
    },
  },
}))
