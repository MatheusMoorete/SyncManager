import { create } from 'zustand'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
  getDoc,
  doc,
} from 'firebase/firestore'
import { DashboardData, TimeRange } from '@/types/dashboard'
import { useAuthStore } from './auth-store'

interface DashboardState {
  data: DashboardData | null
  loading: boolean
  error: string | null
  selectedTimeRange: TimeRange
  actions: {
    fetchDashboardData: (timeRange?: TimeRange) => Promise<void>
    setTimeRange: (range: TimeRange) => void
  }
}

interface FirestoreTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  transactionDate: Timestamp
  ownerId: string
}

interface FirestoreAppointment {
  id: string
  client_id: string
  service_id: string
  scheduled_time: Timestamp
  final_price: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  ownerId: string
}

interface FirestoreCustomer {
  id: string
  full_name: string
  birth_date?: string
  points?: number
  ownerId: string
}

interface FirestoreService {
  id: string
  name: string
  ownerId: string
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  selectedTimeRange: '30d',
  actions: {
    setTimeRange: (range: TimeRange) => {
      set({ selectedTimeRange: range })
      get().actions.fetchDashboardData(range)
    },
    fetchDashboardData: async (timeRange?: TimeRange) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })
      try {
        const range = timeRange || get().selectedTimeRange
        const endDate = new Date()
        const startDate = new Date()

        // Ajustar para início do dia
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)

        switch (range) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7)
            break
          case '30d':
            startDate.setDate(endDate.getDate() - 30)
            break
          case '90d':
            startDate.setDate(endDate.getDate() - 90)
            break
          case '365d':
            startDate.setDate(endDate.getDate() - 365)
            break
        }

        // Buscar dados necessários do Firestore
        const [transactionsSnapshot, appointmentsSnapshot, customersSnapshot, servicesSnapshot] =
          await Promise.all([
            getDocs(
              query(
                collection(db, 'transactions'),
                where('ownerId', '==', user.uid),
                where('transactionDate', '>=', Timestamp.fromDate(startDate)),
                where('transactionDate', '<=', Timestamp.fromDate(endDate)),
                orderBy('transactionDate', 'desc')
              )
            ),
            getDocs(
              query(
                collection(db, 'appointments'),
                where('ownerId', '==', user.uid),
                where('scheduled_time', '>=', Timestamp.fromDate(startDate)),
                where('scheduled_time', '<=', Timestamp.fromDate(endDate)),
                orderBy('scheduled_time', 'desc')
              )
            ),
            getDocs(
              query(
                collection(db, 'customers'),
                where('ownerId', '==', user.uid),
                where('active', '==', true)
              )
            ),
            getDocs(
              query(
                collection(db, 'services'),
                where('ownerId', '==', user.uid),
                where('active', '==', true)
              )
            ),
          ])

        // Mapear dados
        const transactions = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreTransaction[]

        const appointments = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreAppointment[]

        const customers = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreCustomer[]

        const services = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreService[]

        // Calcular métricas
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
        const activeCustomers = customers.length
        const totalAppointments = appointments.length

        // Calcular dados do período anterior
        const previousStartDate = new Date(startDate)
        const previousEndDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - getDaysForRange(range))

        const [previousTransactions, previousAppointments, previousCustomers] = await Promise.all([
          getDocs(
            query(
              collection(db, 'transactions'),
              where('ownerId', '==', user.uid),
              where('transactionDate', '>=', Timestamp.fromDate(previousStartDate)),
              where('transactionDate', '<=', Timestamp.fromDate(previousEndDate))
            )
          ),
          getDocs(
            query(
              collection(db, 'appointments'),
              where('ownerId', '==', user.uid),
              where('scheduled_time', '>=', Timestamp.fromDate(previousStartDate)),
              where('scheduled_time', '<=', Timestamp.fromDate(previousEndDate))
            )
          ),
          getDocs(
            query(
              collection(db, 'customers'),
              where('ownerId', '==', user.uid),
              where('createdAt', '>=', Timestamp.fromDate(previousStartDate)),
              where('createdAt', '<=', Timestamp.fromDate(previousEndDate))
            )
          ),
        ])

        const previousTransactionsData = previousTransactions.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreTransaction[]

        const previousIncome = previousTransactionsData
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
        const previousExpenses = previousTransactionsData
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
        const previousAppointmentsCount = previousAppointments.docs.length
        const previousCustomersCount = previousCustomers.docs.length

        // Calcular tendências
        const calculateTrend = (current: number, previous: number) =>
          previous === 0 ? null : ((current - previous) / previous) * 100

        // Mapear atividades recentes
        const recentActivities = await Promise.all(
          appointments.slice(0, 5).map(async appointment => {
            const [clientDoc, serviceDoc] = await Promise.all([
              getDoc(doc(db, 'customers', appointment.client_id)),
              getDoc(doc(db, 'services', appointment.service_id)),
            ])

            return {
              id: appointment.id,
              type: appointment.status,
              title: clientDoc.data()?.full_name || 'Cliente não encontrado',
              description: serviceDoc.data()?.name || 'Serviço não encontrado',
              date: appointment.scheduled_time.toDate().toISOString(),
              value: appointment.final_price || 0,
              status: appointment.status,
            }
          })
        )

        // Montar objeto final
        const dashboardData: DashboardData = {
          kpis: {
            appointments: {
              title: 'Agendamentos',
              value: totalAppointments,
              trend: calculateTrend(totalAppointments, previousAppointmentsCount),
              formatter: 'number',
            },
            clients: {
              title: 'Clientes Ativos',
              value: activeCustomers,
              trend: calculateTrend(activeCustomers, previousCustomersCount),
              formatter: 'number',
            },
            revenue: {
              title: 'Faturamento',
              value: totalIncome,
              trend: calculateTrend(totalIncome, previousIncome),
              formatter: 'currency',
            },
            expenses: {
              title: 'Despesas',
              value: totalExpenses,
              trend: calculateTrend(totalExpenses, previousExpenses),
              formatter: 'currency',
            },
          },
          servicesChart: getServicesChartData(appointments, services),
          birthdays: getBirthdaysData(customers),
          revenueChart: getRevenueChartData(transactions),
          recentActivities,
          lastUpdate: new Date().toISOString(),
        }

        set({ data: dashboardData, loading: false })
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        set({ error: 'Erro ao carregar dados do dashboard', loading: false })
      }
    },
  },
}))

// Funções auxiliares
function getDaysForRange(range: TimeRange): number {
  switch (range) {
    case '7d':
      return 7
    case '30d':
      return 30
    case '90d':
      return 90
    case '365d':
      return 365
  }
}

function getServicesChartData(appointments: FirestoreAppointment[], services: FirestoreService[]) {
  const serviceCount = appointments.reduce((acc, appointment) => {
    acc[appointment.service_id] = (acc[appointment.service_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(serviceCount)
    .map(([serviceId, count]) => ({
      name: services.find(s => s.id === serviceId)?.name || 'Serviço Desconhecido',
      value: count,
      percentage: (count / appointments.length) * 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
}

function getBirthdaysData(customers: FirestoreCustomer[]) {
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  return customers
    .filter(customer => customer.birth_date)
    .map(customer => ({
      id: customer.id,
      name: customer.full_name,
      date: customer.birth_date!,
    }))
    .filter(customer => {
      const [day, month] = customer.date.split('/')
      const birthDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day))
      return birthDate >= today && birthDate <= nextWeek
    })
}

function getRevenueChartData(transactions: FirestoreTransaction[]) {
  return transactions
    .filter(t => t.type === 'income')
    .map(t => ({
      date: t.transactionDate.toDate().toLocaleDateString('pt-BR'),
      revenue: t.amount,
    }))
}
