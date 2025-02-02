import { z } from "zod"

export const customerSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(14, "Telefone inválido").max(15, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  birth_date: z.string()
    .regex(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, "Data inválida (use DD/MM/AAAA)")
    .refine((date) => {
      if (!date) return true;
      const [day, month, year] = date.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.getDate() === day && 
             dateObj.getMonth() === month - 1 && 
             dateObj.getFullYear() === year &&
             dateObj <= new Date();
    }, "Data de nascimento inválida")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  points: z.number().default(0),
  loyalty_points: z.object({
    points_earned: z.number()
  }).optional(),
})

export type Customer = z.infer<typeof customerSchema>

export const customerFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(14, "Telefone inválido").max(15, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  birthDate: z.string()
    .regex(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, "Data inválida (use DD/MM/AAAA)")
    .refine((date) => {
      if (!date) return true;
      const [day, month, year] = date.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.getDate() === day && 
             dateObj.getMonth() === month - 1 && 
             dateObj.getFullYear() === year &&
             dateObj <= new Date();
    }, "Data de nascimento inválida")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional().or(z.literal(""))
})

export type CustomerFormValues = {
  name: string
  phone: string
  email?: string
  birthDate?: string
  notes?: string
}

export type CustomerWithHistory = Customer & {
  appointments: {
    id: string
    date: Date
    service: string
    value: number
    status: "completed" | "cancelled" | "scheduled"
  }[]
}

export interface CustomerFilters {
  search: string
  sortBy: 'name' | 'recent' | 'points'
  sortOrder: 'asc' | 'desc'
  birthMonth?: number
  hasEmail?: boolean
  hasNotes?: boolean
} 