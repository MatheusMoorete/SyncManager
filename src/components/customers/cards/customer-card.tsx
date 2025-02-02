import { FC } from 'react'
import { cn } from '@/lib/utils'
import { Customer } from '@/types/customer'

export interface CustomerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Modo compacto para listagens móveis */
  compact?: boolean
  /** Dados do cliente com tipagem estrita */
  customer: Customer
  /** Callback para ações de swipe */
  onSwipeAction?: (action: 'EDIT' | 'DELETE') => void
}

export const CustomerCard: FC<CustomerCardProps> = ({
  compact = false,
  customer,
  onSwipeAction,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        // Base styles - Mobile first
        'w-full rounded-lg bg-white p-4 shadow-sm',
        // Touch target size
        'min-h-[48px]',
        // Compact mode
        compact ? 'space-y-1' : 'space-y-3',
        // Responsive padding
        'sm:p-6',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-heading">{customer.full_name}</h3>
        <span className="text-sm text-muted-foreground">
          {customer.points || 0} pontos
        </span>
      </div>

      {!compact && (
        <>
          <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
            <span>{customer.email}</span>
            <span>{customer.phone}</span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Aniversário: {customer.birth_date}</span>
            {customer.created_at && (
              <span>Cliente desde: {new Date(customer.created_at).toLocaleDateString('pt-BR')}</span>
            )}
          </div>
        </>
      )}
    </div>
  )
} 