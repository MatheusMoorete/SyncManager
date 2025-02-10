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

        console.log('Período de busca:', {
          range,
          startDate: startDate.toLocaleString('pt-BR'),
          endDate: endDate.toLocaleString('pt-BR'),
        })

        // Buscar transações
        const transactionsRef = collection(db, 'transactions')
        const transactionsQuery = query(
          transactionsRef,
          where('ownerId', '==', user.uid),
          where('transactionDate', '>=', Timestamp.fromDate(startDate)),
          where('transactionDate', '<=', Timestamp.fromDate(endDate)),
          orderBy('transactionDate', 'desc')
        )
        const transactionsSnapshot = await getDocs(transactionsQuery)

        // Buscar agendamentos
        const appointmentsRef = collection(db, 'appointments')
        const appointmentsQuery = query(
          appointmentsRef,
          where('ownerId', '==', user.uid),
          where('scheduled_time', '>=', Timestamp.fromDate(startDate)),
          where('scheduled_time', '<=', Timestamp.fromDate(endDate)),
          orderBy('scheduled_time', 'desc')
        )
        const appointmentsSnapshot = await getDocs(appointmentsQuery)
        console.log('Agendamentos encontrados:', appointmentsSnapshot.docs.length)
        console.log('Query params:', {
          ownerId: user.uid,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })

        // Buscar clientes
        const customersRef = collection(db, 'customers')
        const customersQuery = query(
          customersRef,
          where('ownerId', '==', user.uid),
          where('active', '==', true)
        )
        const customersSnapshot = await getDocs(customersQuery)

        // Buscar serviços
        const servicesRef = collection(db, 'services')
        const servicesQuery = query(
          servicesRef,
          where('ownerId', '==', user.uid),
          where('active', '==', true)
        )
        const servicesSnapshot = await getDocs(servicesQuery)

        // Calcular métricas
        const transactions = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Array<{
          id: string
          type: 'income' | 'expense'
          amount: number
          ownerId: string
          transactionDate: Timestamp
        }>

        const appointments = appointmentsSnapshot.docs.map(doc => {
          const data = doc.data()
          console.log('Dados do agendamento:', { id: doc.id, ...data })
          return {
            id: doc.id,
            ...data,
          }
        }) as Array<{
          id: string
          client_id: string
          service_id: string
          scheduled_time: Timestamp
          final_price: number
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          ownerId: string
        }>

        console.log('Total de agendamentos processados:', appointments.length)
        console.log(
          'Agendamentos completos:',
          appointments.filter(a => a.status === 'completed').length
        )

        const customers = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Array<{
          id: string
          full_name: string
          points: number
          birth_date: string | null
          ownerId: string
        }>

        // Filtrar aniversariantes da semana
        const today = new Date()
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)

        const birthdays = customers
          .filter(customer => customer.birth_date)
          .map(customer => {
            const [day, month] = customer.birth_date!.split('/')
            const birthDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day))
            return {
              ...customer,
              birthDate,
            }
          })
          .filter(customer => {
            const now = today.getTime()
            const next = nextWeek.getTime()
            const birth = customer.birthDate.getTime()
            return birth >= now && birth <= next
          })
          .sort((a, b) => a.birthDate.getTime() - b.birthDate.getTime())

        const services = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Array<{
          id: string
          name: string
          ownerId: string
        }>

        // Calcular receita total
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        // Calcular total de clientes ativos
        const activeCustomers = customers.length

        // Calcular total de agendamentos e taxa de conclusão
        const totalAppointments = appointments.length
        const completedAppointments = appointments.filter(a => a.status === 'completed').length

        // Calcular pontos de fidelidade totais
        const totalLoyaltyPoints = customers.reduce((sum, c) => sum + (c.points || 0), 0)

        // Calcular tendências apenas se houver dados
        const calculateTrend = (current: number, previous: number) => {
          if (previous === 0) return null
          return ((current - previous) / previous) * 100
        }

        // Buscar dados do período anterior para comparação
        const previousStartDate = new Date(startDate)
        const previousEndDate = new Date(startDate)
        previousStartDate.setHours(0, 0, 0, 0)
        previousEndDate.setHours(23, 59, 59, 999)

        switch (range) {
          case '7d':
            previousStartDate.setDate(previousStartDate.getDate() - 7)
            break
          case '30d':
            previousStartDate.setDate(previousStartDate.getDate() - 30)
            break
          case '90d':
            previousStartDate.setDate(previousStartDate.getDate() - 90)
            break
          case '365d':
            previousStartDate.setDate(previousStartDate.getDate() - 365)
            break
        }

        console.log('Período anterior:', {
          range,
          previousStartDate: previousStartDate.toLocaleString('pt-BR'),
          previousEndDate: previousEndDate.toLocaleString('pt-BR'),
        })

        // Buscar transações do período anterior
        const previousTransactionsQuery = query(
          transactionsRef,
          where('ownerId', '==', user.uid),
          where('transactionDate', '>=', Timestamp.fromDate(previousStartDate)),
          where('transactionDate', '<=', Timestamp.fromDate(previousEndDate)),
          orderBy('transactionDate', 'desc')
        )

        // Buscar agendamentos do período anterior
        const previousAppointmentsQuery = query(
          appointmentsRef,
          where('ownerId', '==', user.uid),
          where('scheduled_time', '>=', Timestamp.fromDate(previousStartDate)),
          where('scheduled_time', '<=', Timestamp.fromDate(previousEndDate)),
          orderBy('scheduled_time', 'desc')
        )

        const previousTransactionsSnapshot = await getDocs(previousTransactionsQuery)
        const previousTransactions = previousTransactionsSnapshot.docs.map(
          doc =>
            ({ ...doc.data() } as {
              id: string
              type: 'income' | 'expense'
              amount: number
              ownerId: string
              transactionDate: Timestamp
            })
        )

        const previousIncome = previousTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        const previousExpenses = previousTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        // Buscar agendamentos do período anterior
        const previousAppointmentsSnapshot = await getDocs(previousAppointmentsQuery)
        const previousAppointments = previousAppointmentsSnapshot.docs.length

        // Buscar clientes do período anterior
        const previousCustomersQuery = query(
          customersRef,
          where('ownerId', '==', user.uid),
          where('createdAt', '>=', Timestamp.fromDate(previousStartDate)),
          where('createdAt', '<=', Timestamp.fromDate(previousEndDate))
        )
        const previousCustomersSnapshot = await getDocs(previousCustomersQuery)
        const previousCustomers = previousCustomersSnapshot.docs.length

        const servicesData = Object.entries(
          appointments.reduce((acc, appointment) => {
            const serviceId = appointment.service_id
            acc[serviceId] = (acc[serviceId] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        )
          .map(([serviceId, count]: [string, number]) => {
            const service = services.find(s => s.id === serviceId)
            return {
              name: service?.name || 'Serviço Desconhecido',
              value: count,
              percentage: (count / totalAppointments) * 100,
            }
          })
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)

        const mapAppointmentToActivity = async (appointment: {
          id: string
          client_id: string
          service_id: string
          scheduled_time: Timestamp
          final_price: number
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          ownerId: string
        }) => {
          // Buscar dados do cliente
          const clientDoc = await getDoc(doc(db, 'customers', appointment.client_id))
          const clientData = clientDoc.data()

          // Buscar dados do serviço
          const serviceDoc = await getDoc(doc(db, 'services', appointment.service_id))
          const serviceData = serviceDoc.data()

          return {
            id: appointment.id,
            type: 'appointment',
            title: clientData?.full_name || 'Cliente não encontrado',
            description: serviceData?.name || 'Serviço não encontrado',
            date: appointment.scheduled_time.toDate().toISOString(),
            status: appointment.status,
            value: appointment.final_price || 0,
          }
        }

        // Buscar agendamentos recentes
        const recentActivitiesQuery = query(
          collection(db, 'appointments'),
          where('ownerId', '==', user.uid),
          orderBy('scheduled_time', 'desc'),
          limit(5)
        )
        const recentActivitiesSnapshot = await getDocs(recentActivitiesQuery)
        const recentActivities = await Promise.all(
          recentActivitiesSnapshot.docs.map(doc =>
            mapAppointmentToActivity({ id: doc.id, ...doc.data() } as {
              id: string
              client_id: string
              service_id: string
              scheduled_time: Timestamp
              final_price: number
              status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
              ownerId: string
            })
          )
        )

        const dashboardData: DashboardData = {
          kpis: {
            appointments: {
              title: 'Agendamentos',
              value: totalAppointments,
              trend: calculateTrend(totalAppointments, previousAppointments),
              formatter: 'number',
            },
            clients: {
              title: 'Clientes',
              value: activeCustomers,
              trend: calculateTrend(activeCustomers, previousCustomers),
              formatter: 'number',
            },
            expenses: {
              title: 'Despesas',
              value: totalExpenses,
              trend: calculateTrend(totalExpenses, previousExpenses),
              formatter: 'currency',
            },
            revenue: {
              title: 'Faturamento',
              value: totalIncome,
              trend: calculateTrend(totalIncome, previousIncome),
              formatter: 'currency',
            },
          },
          birthdays: birthdays.map(customer => ({
            id: customer.id,
            name: customer.full_name,
            date: customer.birth_date!,
          })),
          revenueChart: appointments
            .filter(a => a.status === 'completed')
            .map(a => ({
              date: a.scheduled_time.toDate().toISOString(),
              revenue: a.final_price || 0,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          servicesChart: servicesData,
          recentActivities,
          lastUpdate: new Date().toISOString(),
        }

        set({
          data: {
            kpis: {
              appointments: {
                value: totalAppointments,
                trend: calculateTrend(totalAppointments, previousAppointments),
                title: 'Agendamentos',
                formatter: 'number',
              },
              clients: {
                value: activeCustomers,
                trend: calculateTrend(activeCustomers, previousCustomers),
                title: 'Clientes Ativos',
                formatter: 'number',
              },
              revenue: {
                value: totalIncome,
                trend: calculateTrend(totalIncome, previousIncome),
                title: 'Faturamento',
                formatter: 'currency',
              },
              expenses: {
                value: totalExpenses,
                trend: calculateTrend(totalExpenses, previousExpenses),
                title: 'Despesas',
                formatter: 'currency',
              },
            },
            servicesChart: servicesData,
            birthdays: birthdays.map(customer => ({
              id: customer.id,
              name: customer.full_name,
              date: customer.birth_date!,
            })),
            revenueChart: transactions
              .filter(t => t.type === 'income')
              .map(t => ({
                date: t.transactionDate.toDate().toLocaleDateString('pt-BR'),
                revenue: t.amount,
              })),
            recentActivities,
            lastUpdate: new Date().toLocaleString('pt-BR'),
          },
          loading: false,
        })
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        set({
          error: 'Erro ao carregar dados do dashboard',
          loading: false,
        })
      }
    },
  },
}))
