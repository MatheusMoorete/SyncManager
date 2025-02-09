import { z } from 'zod'
import { Timestamp } from 'firebase/firestore'

// Schema para validação do formulário
export const serviceFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  duration: z.number().min(1, 'Duração deve ser maior que 0'),
  active: z.boolean().default(true),
})

// Tipo para os valores do formulário
export type ServiceFormValues = z.infer<typeof serviceFormSchema>

// Tipo para o serviço completo (incluindo campos do banco de dados)
export type Service = {
  id: string
  ownerId: string
  name: string
  description: string | null
  price: number
  duration: number // duração em minutos
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Interface para filtros de serviço
export interface ServiceFilters {
  search?: string
  sortBy?: 'name' | 'price' | 'duration' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  onlyActive?: boolean
  perPage?: number
}
