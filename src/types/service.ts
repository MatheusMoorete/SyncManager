import { z } from "zod"

// Schema para validação do formulário
export const serviceFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  base_price: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  duration: z.string().default("01:00:00"),
  is_active: z.boolean().default(true),
})

// Tipo para os valores do formulário
export type ServiceFormValues = z.infer<typeof serviceFormSchema>

// Tipo para o serviço completo (incluindo campos do banco de dados)
export type Service = {
  id: string
  owner_id: string
  name: string
  description: string | null
  base_price: number
  duration: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Interface para filtros de serviço
export interface ServiceFilters {
  search: string
  sortBy: 'name' | 'base_price' | 'recent'
  sortOrder: 'asc' | 'desc'
  isActive?: boolean
} 