import { create } from 'zustand'
import { toast } from 'sonner'
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
  Timestamp,
  orderBy,
  getDoc,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { useAuthStore } from './auth-store'

interface LoyaltyLevel {
  name: string
  minPoints: number
  discount: number
}

interface ServiceRule {
  service_id: string
  multiplier: number
}

interface LoyaltyConfig {
  enabled: boolean
  pointsPerCurrency: number
  minimumForPoints: number
  serviceRules: ServiceRule[]
  levels: LoyaltyLevel[]
}

interface AppointmentDoc {
  id: string
  client_id: string
  service_id: string
  final_price: number
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show'
  service?: {
    name: string
  }
}

interface LoyaltyStore {
  config: LoyaltyConfig | null
  loading: boolean
  error: string | null
  actions: {
    fetchConfig: () => Promise<void>
    updateConfig: (config: LoyaltyConfig) => Promise<void>
    calculatePoints: (serviceId: string, amount: number) => number
    getLevelByPoints: (points: number) => LoyaltyLevel | null
    recalculateHistoricalPoints: () => Promise<void>
  }
}

const defaultConfig: LoyaltyConfig = {
  enabled: false,
  pointsPerCurrency: 1,
  minimumForPoints: 0,
  serviceRules: [],
  levels: [],
}

export const useLoyaltyStore = create<LoyaltyStore>((set, get) => ({
  config: null,
  loading: false,
  error: null,
  actions: {
    fetchConfig: async () => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })
      try {
        const docRef = doc(db, 'loyalty_config', user.uid)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          set({ config: defaultConfig })
          return
        }

        const data = docSnap.data()
        const config = {
          ...data,
          serviceRules: data.serviceRules || [],
          levels: data.levels || [],
        } as LoyaltyConfig

        set({ config })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao carregar configurações'
        set({ error: errorMessage })
        console.error('Error fetching loyalty config:', error)
      } finally {
        set({ loading: false })
      }
    },

    updateConfig: async (config: LoyaltyConfig) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })
      try {
        const docRef = doc(db, 'loyalty_config', user.uid)
        await setDoc(docRef, {
          ...config,
          updated_at: Timestamp.now(),
        })

        set({ config })

        // Recalcular pontos históricos com as novas regras
        await get().actions.recalculateHistoricalPoints()
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao atualizar configurações'
        set({ error: errorMessage })
        console.error('Error updating loyalty config:', error)
        throw error
      } finally {
        set({ loading: false })
      }
    },

    calculatePoints: (serviceId: string, amount: number) => {
      const { config } = get()
      if (!config || !config.enabled || amount < config.minimumForPoints) return 0

      // Encontrar regra específica para o serviço
      const serviceRule = config.serviceRules.find(rule => rule.service_id === serviceId)
      const multiplier = serviceRule?.multiplier || 1

      // Calcular pontos base e aplicar multiplicador
      const basePoints = Math.floor(amount * config.pointsPerCurrency)
      return Math.floor(basePoints * multiplier)
    },

    getLevelByPoints: (points: number) => {
      const { config } = get()
      if (!config || !config.enabled) return null

      // Encontrar o nível mais alto que o cliente alcançou
      return (
        [...config.levels]
          .sort((a, b) => b.minPoints - a.minPoints)
          .find(level => points >= level.minPoints) || null
      )
    },

    recalculateHistoricalPoints: async () => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      const { config } = get()
      if (!config || !config.enabled) return

      try {
        // Buscar todos os atendimentos concluídos
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('owner_id', '==', user.uid),
          where('status', '==', 'completed')
        )

        const appointmentsSnap = await getDocs(appointmentsQuery)
        const appointments = appointmentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as AppointmentDoc[]

        // Se não houver atendimentos, não precisa recalcular
        if (appointments.length === 0) return

        // Agrupar atendimentos por cliente
        const clientAppointments = appointments.reduce((acc, appointment) => {
          if (!acc[appointment.client_id]) {
            acc[appointment.client_id] = []
          }
          acc[appointment.client_id].push(appointment)
          return acc
        }, {} as Record<string, any[]>)

        const batch = writeBatch(db)

        // Recalcular pontos para cada cliente
        for (const [clientId, clientAppts] of Object.entries(clientAppointments)) {
          let totalPoints = 0

          // Calcular pontos para cada atendimento
          for (const appointment of clientAppts) {
            const points = get().actions.calculatePoints(
              appointment.service_id,
              appointment.final_price
            )
            totalPoints += points
          }

          // Buscar registro atual de pontos do cliente
          const pointsRef = doc(db, 'loyalty_points', clientId)
          const pointsSnap = await getDoc(pointsRef)
          const currentPoints = pointsSnap.exists() ? pointsSnap.data().points_spent : 0

          // Atualizar pontos do cliente
          batch.set(
            pointsRef,
            {
              owner_id: user.uid,
              client_id: clientId,
              points_earned: totalPoints,
              points_spent: currentPoints,
              updated_at: Timestamp.now(),
            },
            { merge: true }
          )

          // Limpar histórico antigo e criar novo
          const historyQuery = query(
            collection(db, 'points_history'),
            where('client_id', '==', clientId),
            where('type', '==', 'earned')
          )
          const historySnap = await getDocs(historyQuery)
          historySnap.docs.forEach(doc => {
            batch.delete(doc.ref)
          })

          // Criar novos registros de histórico
          for (const appointment of clientAppts) {
            const points = get().actions.calculatePoints(
              appointment.service_id,
              appointment.final_price
            )

            const historyRef = doc(collection(db, 'points_history'))
            batch.set(historyRef, {
              owner_id: user.uid,
              client_id: clientId,
              appointment_id: appointment.id,
              points,
              type: 'earned',
              description: `Pontos ganhos pelo serviço: ${appointment.service?.name || 'Serviço'}`,
              createdAt: Timestamp.now(),
            })
          }
        }

        await batch.commit()
        toast.success('Pontos recalculados com sucesso!')
      } catch (error) {
        console.error('Error recalculating points:', error)
        toast.error('Erro ao recalcular pontos')
      }
    },
  },
}))
