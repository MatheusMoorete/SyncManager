import { Customer } from '@/types/customer'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface CustomerListItemProps {
  customer: Customer
  onEdit?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
}

export function CustomerListItem({
  customer,
  onEdit,
  onDelete,
}: CustomerListItemProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-neutral-cream/30 flex items-center justify-center">
            <span className="text-lg font-medium text-heading">
              {customer.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-heading">{customer.full_name}</p>
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {customer.points || 0} pontos
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-neutral-cream/50"
            >
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem
              onClick={() => onEdit?.(customer)}
              className="hover:bg-neutral-cream/50"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(customer)}
              className="text-error hover:bg-error/10 hover:text-error"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 