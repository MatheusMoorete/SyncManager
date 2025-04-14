'use client'

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Customer } from '@/types/customer'
import { Badge } from '@/components/ui/badge'

interface CustomerHeaderProps {
  customer: Customer
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  // Função para formatar data de nascimento
  const formatBirthDate = (birthDate: string | null) => {
    if (!birthDate) return null
    try {
      const date = birthDate.includes('-')
        ? parseISO(birthDate)
        : new Date(birthDate.split('/').reverse().join('-'))

      return format(date, "d 'de' MMMM", { locale: ptBR })
    } catch (error) {
      console.error('Erro ao formatar data de nascimento:', error)
      return null
    }
  }

  // Data de nascimento formatada
  const formattedBirthDate = formatBirthDate(customer.birth_date)

  // Data de cadastro formatada
  const createdAt = customer.createdAt?.toDate?.()
    ? format(customer.createdAt.toDate(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null

  return (
    <div className="py-2">
      <div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{customer.full_name}</h1>
            {customer.points > 0 && (
              <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                {customer.points} pontos
              </Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-muted-foreground">
            {customer.phone && <span className="flex items-center gap-1">{customer.phone}</span>}

            {customer.email && (
              <>
                <span className="hidden sm:block">•</span>
                <span className="flex items-center gap-1">{customer.email}</span>
              </>
            )}

            {formattedBirthDate && (
              <>
                <span className="hidden sm:block">•</span>
                <span className="flex items-center gap-1">Aniversário: {formattedBirthDate}</span>
              </>
            )}
          </div>

          {createdAt && <p className="text-xs text-muted-foreground">Cliente desde {createdAt}</p>}
        </div>
      </div>
    </div>
  )
}
