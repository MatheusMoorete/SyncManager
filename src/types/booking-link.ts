import { z } from 'zod'
import { Timestamp } from 'firebase/firestore'

// Schema para validação do formulário de criação de link de agendamento
export const bookingLinkFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  active: z.boolean().default(true),
  services: z.array(z.string()).min(1, 'Selecione pelo menos um serviço'),
  daysInAdvance: z.number().int().min(1).default(30),
  redirectUrl: z.string().url().optional().nullable(),
})

// Tipo para os valores do formulário
export type BookingLinkFormValues = z.infer<typeof bookingLinkFormSchema>

// Tipo para o link de agendamento completo
export type BookingLink = {
  id: string
  ownerId: string
  name: string
  description: string | null
  slug: string
  active: boolean
  services: string[]
  daysInAdvance: number
  redirectUrl: string | null
  createdAt: Timestamp
  updatedAt: Timestamp

  // Campos de estatísticas
  views?: number
  appointments?: number
}

// Interface para filtros de links de agendamento
export interface BookingLinkFilters {
  search?: string
  sortBy?: 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  onlyActive?: boolean
  perPage?: number
}

// Tipo para o formulário preenchido pelo cliente
export const clientBookingFormSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').optional().nullable(),
  service_id: z.string().min(1, 'Selecione um serviço'),
  date: z.string().min(1, 'Selecione uma data'),
  time: z.string().min(1, 'Selecione um horário'),
  notes: z.string().optional(),
})

// Tipo para os valores do formulário de cliente
export type ClientBookingFormValues = z.infer<typeof clientBookingFormSchema>
