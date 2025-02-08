import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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

interface LoyaltyStore {
  config: LoyaltyConfig | null
  isLoading: boolean
  error: string | null
  actions: {
    fetchConfig: () => Promise<void>
    updateConfig: (config: LoyaltyConfig) => Promise<void>
    calculatePoints: (serviceId: string, amount: number) => number
    getLevelByPoints: (points: number) => LoyaltyLevel | null
    recalculateHistoricalPoints: () => Promise<void>
  }
}

const supabase = createClient()

export const useLoyaltyStore = create<LoyaltyStore>((set, get) => ({
  config: null,
  isLoading: false,
  error: null,
  actions: {
    fetchConfig: async () => {
      set({ isLoading: true, error: null })
      try {
        // Obter o usuário atual
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('Usuário não autenticado')

        const { data, error } = await supabase
          .from('loyalty_config')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (error) {
          // Se não encontrar configuração, retornar configuração padrão
          if (error.code === 'PGRST116') {
            const defaultConfig = {
              enabled: false,
              pointsPerCurrency: 1,
              minimumForPoints: 0,
              serviceRules: [],
              levels: [],
            }
            set({ config: defaultConfig })
            return
          }
          throw error
        }

        // Garantir que os arrays estejam definidos
        const config = {
          ...data,
          serviceRules: data.serviceRules || [],
          levels: data.levels || [],
        }

        set({ config })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao carregar configurações'
        set({ error: errorMessage })
        console.error('Error fetching loyalty config:', error)
      } finally {
        set({ isLoading: false })
      }
    },

    updateConfig: async (config: LoyaltyConfig) => {
      set({ isLoading: true, error: null })
      try {
        // Obter o usuário atual
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('Usuário não autenticado')

        const { error } = await supabase.from('loyalty_config').upsert({
          id: 1,
          owner_id: user.id,
          ...config,
        })

        if (error) throw error

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
        set({ isLoading: false })
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
      try {
        const { config } = get()
        if (!config || !config.enabled) return

        // Obter o usuário atual
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('Usuário não autenticado')

        // Buscar todos os atendimentos concluídos
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select(
            `
            id,
            client_id,
            service_id,
            final_price,
            status
          `
          )
          .eq('status', 'completed')

        if (appointmentsError) throw appointmentsError

        // Se não houver atendimentos, não precisa recalcular
        if (!appointments || appointments.length === 0) {
          return
        }

        // Agrupar atendimentos por cliente
        const clientAppointments = appointments.reduce((acc, appointment) => {
          if (!acc[appointment.client_id]) {
            acc[appointment.client_id] = []
          }
          acc[appointment.client_id].push(appointment)
          return acc
        }, {} as Record<string, any[]>)

        // Recalcular pontos para cada cliente
        for (const [clientId, clientAppts] of Object.entries(clientAppointments)) {
          try {
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
            const { data: currentPoints } = await supabase
              .from('loyalty_points')
              .select('points_spent')
              .eq('client_id', clientId)
              .maybeSingle()

            // Atualizar pontos do cliente usando upsert com onConflict
            const { error: updateError } = await supabase.from('loyalty_points').upsert(
              {
                owner_id: user.id,
                client_id: clientId,
                points_earned: totalPoints,
                points_spent: currentPoints?.points_spent || 0,
              },
              {
                onConflict: 'client_id',
                ignoreDuplicates: false,
              }
            )

            if (updateError) throw updateError

            // Limpar histórico antigo
            await supabase
              .from('points_history')
              .delete()
              .eq('client_id', clientId)
              .eq('type', 'earned')

            // Registrar novo histórico em lote
            const historyRecords = clientAppts.map(appointment => ({
              owner_id: user.id,
              client_id: clientId,
              appointment_id: appointment.id,
              points: get().actions.calculatePoints(
                appointment.service_id,
                appointment.final_price
              ),
              type: 'earned',
              description: `Pontos recalculados - Atendimento ID: ${appointment.id}`,
            }))

            const { error: historyError } = await supabase
              .from('points_history')
              .insert(historyRecords)

            if (historyError) throw historyError
          } catch (error) {
            console.error(`Error processing client ${clientId}:`, error)
            continue // Continua com o próximo cliente mesmo se houver erro
          }
        }

        toast.success('Pontos recalculados com sucesso!')
      } catch (error) {
        console.error('Error recalculating points:', error)
        toast.error('Erro ao recalcular pontos')
        throw error
      }
    },
  },
}))
