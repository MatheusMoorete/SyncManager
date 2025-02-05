import { create } from 'zustand'
import { toast } from 'sonner'
import { addDays, format, parse, isWithinInterval, areIntervalsOverlapping, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Appointment, 
  AppointmentFormValues, 
  ScheduleFilters,
  TimeSlot,
  BusinessHours 
} from '@/types/schedule'
import { useServiceStore } from '@/store/service-store'
import { useCustomerStore } from '@/store/customer-store'
import { supabase } from '@/lib/supabase'

// Horário de funcionamento
const businessHours: BusinessHours = {
  start: '09:00',
  end: '18:00',
  interval: 30, // 30 minutos
  daysOff: [0] // domingo
}

interface ScheduleState {
  appointments: Appointment[]
  selectedDate: Date
  isLoading: boolean
  filters: ScheduleFilters
  businessHours: BusinessHours
  actions: {
    fetchAppointments: () => Promise<void>
    createAppointment: (data: AppointmentFormValues) => Promise<void>
    updateAppointment: (id: string, data: AppointmentFormValues) => Promise<void>
    deleteAppointment: (id: string) => Promise<void>
    updateFilters: (filters: Partial<ScheduleFilters>) => void
    setSelectedDate: (date: Date) => void
    getAvailableTimeSlots: (date: Date, duration: string) => TimeSlot[]
    checkAvailability: (date: Date, time: string, duration: string, currentAppointmentId?: string) => boolean
  }
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  appointments: [],
  selectedDate: new Date(),
  isLoading: false,
  filters: {
    search: '',
    date: new Date(),
  },
  businessHours,
  actions: {
    fetchAppointments: async () => {
      try {
        set({ isLoading: true })
        const { filters } = get()
        
        let query = supabase.from('appointments').select(`
          *,
          client:clients(full_name, phone),
          service:services(name, duration, base_price)
        `)

        // Aplicar filtros
        if (filters.search) {
          query = query.or(`client.full_name.ilike.%${filters.search}%,service.name.ilike.%${filters.search}%`)
        }

        // Filtrar por intervalo de datas ou data específica
        if (filters.startDate && filters.endDate) {
          query = query
            .gte('scheduled_time', filters.startDate.toISOString())
            .lt('scheduled_time', filters.endDate.toISOString())
        } else if (filters.date) {
          // Filtrar por data específica (ignorando a hora)
          const startOfDay = new Date(filters.date)
          startOfDay.setHours(0, 0, 0, 0)
          const endOfDay = new Date(filters.date)
          endOfDay.setHours(23, 59, 59, 999)
          
          query = query
            .gte('scheduled_time', startOfDay.toISOString())
            .lte('scheduled_time', endOfDay.toISOString())
        }

        if (filters.status) {
          query = query.eq('status', filters.status.toLowerCase())
        }

        if (filters.clientId) {
          query = query.eq('client_id', filters.clientId)
        }

        if (filters.serviceId) {
          query = query.eq('service_id', filters.serviceId)
        }

        const { data, error } = await query

        if (error) throw error

        set({ appointments: data || [] })
      } catch (error) {
        console.error('Error fetching appointments:', error)
        toast.error('Erro ao carregar agendamentos')
      } finally {
        set({ isLoading: false })
      }
    },

    createAppointment: async (data: AppointmentFormValues) => {
      try {
        set({ isLoading: true })

        // Buscar o serviço
        const serviceStore = useServiceStore.getState()
        const service = serviceStore.services.find(s => s.id === data.service_id)
        if (!service) {
          throw new Error('Serviço não encontrado')
        }

        // Buscar o cliente
        const customerStore = useCustomerStore.getState()
        const client = customerStore.customers.find(c => c.id === data.client_id)
        if (!client) {
          throw new Error('Cliente não encontrado')
        }

        // Verificar disponibilidade
        const appointmentDate = new Date(data.scheduled_time)
        const isAvailable = get().actions.checkAvailability(
          appointmentDate,
          format(appointmentDate, 'HH:mm'),
          service.duration
        )

        if (!isAvailable) {
          throw new Error('Horário indisponível')
        }

        // Criar o agendamento no Supabase
        const { data: newAppointment, error } = await supabase
          .from('appointments')
          .insert([data])
          .select(`
            *,
            client:clients(full_name, phone),
            service:services(name, duration, base_price)
          `)
          .single()

        if (error) throw error

        set((state) => ({
          appointments: [...state.appointments, newAppointment]
        }))
      } catch (error: any) {
        console.error('Error creating appointment:', error)
        toast.error(error.message || 'Erro ao criar agendamento')
      } finally {
        set({ isLoading: false })
      }
    },

    updateAppointment: async (id: string, data: AppointmentFormValues) => {
      try {
        set({ isLoading: true })

        // Buscar o serviço
        const serviceStore = useServiceStore.getState()
        const service = serviceStore.services.find(s => s.id === data.service_id)
        if (!service) {
          throw new Error('Serviço não encontrado')
        }

        // Verificar disponibilidade se a data ou hora mudou
        const currentAppointment = get().appointments.find(a => a.id === id)
        if (!currentAppointment) {
          throw new Error('Agendamento não encontrado')
        }

        if (data.scheduled_time !== currentAppointment.scheduled_time) {
          const appointmentDate = new Date(data.scheduled_time)
          const isAvailable = get().actions.checkAvailability(
            appointmentDate,
            format(appointmentDate, 'HH:mm'),
            service.duration,
            id
          )

          if (!isAvailable) {
            throw new Error('Horário indisponível')
          }
        }

        // Atualizar o agendamento no Supabase
        const { data: updatedAppointment, error } = await supabase
          .from('appointments')
          .update(data)
          .eq('id', id)
          .select(`
            *,
            client:clients(full_name, phone),
            service:services(name, duration, base_price)
          `)
          .single()

        if (error) throw error

        set((state) => ({
          appointments: state.appointments.map(appointment =>
            appointment.id === id ? updatedAppointment : appointment
          )
        }))

        toast.success('Agendamento atualizado com sucesso!')
      } catch (error: any) {
        console.error('Error updating appointment:', error)
        toast.error(error.message || 'Erro ao atualizar agendamento')
      } finally {
        set({ isLoading: false })
      }
    },

    deleteAppointment: async (id: string) => {
      try {
        set({ isLoading: true })

        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id)

        if (error) throw error

        set((state) => ({
          appointments: state.appointments.filter(appointment => appointment.id !== id)
        }))

        toast.success('Agendamento excluído com sucesso!')
      } catch (error) {
        console.error('Error deleting appointment:', error)
        toast.error('Erro ao excluir agendamento')
      } finally {
        set({ isLoading: false })
      }
    },

    updateFilters: (filters: Partial<ScheduleFilters>) => {
      set((state) => ({
        filters: {
          ...state.filters,
          ...filters,
        },
      }))
    },

    setSelectedDate: (date: Date) => {
      set({ selectedDate: date })
    },

    getAvailableTimeSlots: (date: Date, duration: string) => {
      const { businessHours, appointments } = get()
      const timeSlots: TimeSlot[] = []
      
      // Converter duração para minutos
      const [hours, minutes] = duration.split(':').map(Number)
      const durationInMinutes = (hours * 60) + minutes

      // Gerar horários possíveis
      const startTime = parse(businessHours.start, 'HH:mm', date)
      const endTime = parse(businessHours.end, 'HH:mm', date)
      let currentTime = startTime

      while (currentTime < endTime) {
        const timeString = format(currentTime, 'HH:mm')
        const endTimeSlot = addDays(currentTime, 0)
        endTimeSlot.setMinutes(endTimeSlot.getMinutes() + durationInMinutes)

        // Verificar se o horário está disponível
        const isAvailable = get().actions.checkAvailability(date, timeString, duration)

        // Encontrar agendamento existente neste horário
        const existingAppointment = appointments.find(appointment => {
          const appointmentDate = new Date(appointment.scheduled_time)
          return format(appointmentDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && 
                 format(appointmentDate, 'HH:mm') === timeString
        })

        timeSlots.push({
          time: timeString,
          available: isAvailable,
          appointment: existingAppointment
        })

        // Avançar para o próximo intervalo
        currentTime.setMinutes(currentTime.getMinutes() + businessHours.interval)
      }

      return timeSlots
    },

    checkAvailability: (date: Date, time: string, duration: string, currentAppointmentId?: string) => {
      const appointments = get().appointments
      const [hours, minutes] = time.split(':').map(Number)
      const [durationHours, durationMinutes] = duration.split(':').map(Number)
      
      const startTime = new Date(date)
      startTime.setHours(hours, minutes, 0, 0)
      
      const endTime = new Date(startTime)
      endTime.setHours(endTime.getHours() + durationHours)
      endTime.setMinutes(endTime.getMinutes() + durationMinutes)

      // Verificar conflitos com outros agendamentos
      const hasConflict = appointments.some(appointment => {
        // Ignorar o agendamento atual se estiver editando
        if (currentAppointmentId && appointment.id === currentAppointmentId) {
          return false
        }

        const appointmentStart = parseISO(appointment.scheduled_time)
        const [appDurationHours, appDurationMinutes] = appointment.actual_duration?.split(':') || appointment.service.duration.split(':')
        const appointmentEnd = new Date(appointmentStart)
        appointmentEnd.setHours(appointmentEnd.getHours() + parseInt(appDurationHours))
        appointmentEnd.setMinutes(appointmentEnd.getMinutes() + parseInt(appDurationMinutes))

        // Verificar se há sobreposição de horários
        return (
          (startTime >= appointmentStart && startTime < appointmentEnd) || // Novo início durante outro agendamento
          (endTime > appointmentStart && endTime <= appointmentEnd) || // Novo fim durante outro agendamento
          (startTime <= appointmentStart && endTime >= appointmentEnd) // Novo agendamento engloba outro
        )
      })

      return !hasConflict
    }
  },
})) 