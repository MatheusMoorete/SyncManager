import { z } from 'zod'

// Schema para validação do formulário de agendamento
export const appointmentFormSchema = z.object({
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  service_id: z.string().min(1, 'Serviço é obrigatório'),
  scheduled_time: z.string().min(1, 'Data e hora são obrigatórios'),
  actual_duration: z.string().optional(),
  final_price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  discount: z.number().min(0).max(1).optional(), // 0-1 representando %
  status: z.enum(['scheduled', 'completed', 'canceled', 'no_show']).default('scheduled'),
  notes: z.string().optional(),
})

// Tipo para os valores do formulário
export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>

// Tipo para o agendamento completo
export type Appointment = {
  id: string
  client_id: string
  service_id: string
  scheduled_time: string
  actual_duration: string | null
  final_price: number
  discount: number | null
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show'
  notes: string | null
  created_at: string
  // Dados relacionados
  client: {
    full_name: string
    phone: string
  }
  service: {
    name: string
    duration: string
    base_price: number
  }
}

// Interface para filtros de agendamento
export interface ScheduleFilters {
  search: string
  date?: Date
  startDate?: Date
  endDate?: Date
  status?: 'scheduled' | 'completed' | 'canceled' | 'no_show'
  clientId?: string
  serviceId?: string
}

// Tipo para horários disponíveis
export type TimeSlot = {
  time: string
  available: boolean
  appointment?: Appointment
}

// Tipo para configurações de horário de funcionamento
export type BusinessHours = {
  start: string // formato HH:mm
  end: string // formato HH:mm
  interval: number // em minutos
  daysOff: number[] // 0 = domingo, 6 = sábado
}

// Tipo para notificações de agendamento
export type AppointmentNotification = {
  id: string
  appointmentId: string
  type: 'REMINDER' | 'CONFIRMATION' | 'CANCELLATION'
  status: 'PENDING' | 'SENT' | 'FAILED'
  scheduledFor: string
  sentAt?: string
  message: string
}

export interface BusinessHoursConfig {
  starttime: string // formato HH:mm
  endtime: string // formato HH:mm
  daysoff: number[] // 0 = domingo, 1 = segunda, etc
  lunchbreak?: {
    start: string // formato HH:mm
    end: string // formato HH:mm
  }
  ownerId: string
}
