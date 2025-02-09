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
    .email('Email inválido')
    .optional()
    .nullable()
    .transform(value => (value === '' ? null : value)),
  birthDate: z
    .string()
    .regex(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
      'Data inválida. Use o formato DD/MM/AAAA'
    )
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
