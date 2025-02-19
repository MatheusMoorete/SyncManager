import { z } from 'zod'
import { Timestamp } from 'firebase/firestore'

export const customerFormSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .transform(value => value.trim()),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Telefone inválido. Use o formato (99) 99999-9999'),
  email: z
    .string()
    .optional()
    .nullable()
    .transform(value => (value === '' ? null : value))
    .refine(
      value => {
        if (!value) return true
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      },
      { message: 'Email inválido' }
    ),
  birthDate: z
    .string()
    .optional()
    .nullable()
    .transform(value => (value === '' ? null : value)),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform(value => (value === '' ? null : value)),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>

export interface Customer {
  id?: string
  full_name: string
  email: string | null
  phone: string
  birth_date: string | null
  notes: string | null
  ownerId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt?: Timestamp | null
  active: boolean
  points: number
}

export interface CustomerFilters {
  search?: string
  sortBy?: 'full_name' | 'recent' | 'points'
  sortOrder?: 'asc' | 'desc'
  perPage?: number
  hasEmail?: boolean
  hasNotes?: boolean
  onlyActive?: boolean
}
