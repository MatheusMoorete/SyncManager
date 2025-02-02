'use client'

import { useState, useEffect } from "react"
import { Service, ServiceFormValues } from "@/types/service"
import { ServiceDialog } from "./service-dialog"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { SearchBar } from "@/components/ui/data-list/search-bar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { useServiceStore } from "@/store/service-store"

interface ServiceListProps {
  services: Service[]
  onUpdate: (id: string, data: ServiceFormValues) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function ServiceList({
  services,
  onUpdate,
  onDelete,
  isLoading
}: ServiceListProps) {
  const { filters, actions } = useServiceStore()
  const [search, setSearch] = useState("")

  // Opções de ordenação
  const sortOptions = [
    { label: 'Nome', value: 'name' },
    { label: 'Preço', value: 'base_price' },
    { label: 'Mais recentes', value: 'recent' }
  ]

  // Opções de filtro
  const filterOptions = [
    {
      label: 'Serviços ativos',
      value: 'isActive',
      checked: filters.isActive === true,
      onCheckedChange: (checked: boolean) => actions.updateFilters({ isActive: checked || undefined })
    }
  ]

  // Atualizar filtros quando a busca mudar
  useEffect(() => {
    actions.updateFilters({ search })
  }, [search, actions])

  const handleDelete = (id: string, name: string) => {
    toast.custom((t) => (
      <div className="p-4 bg-white rounded-lg shadow-lg border border-charcoal/10">
        <h3 className="font-medium text-heading mb-2">Confirmar exclusão</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tem certeza que deseja excluir o serviço <span className="font-medium text-heading">{name}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.dismiss(t)}
            className="hover:bg-neutral-cream/50"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              await onDelete(id)
              toast.dismiss(t)
            }}
            className="bg-error hover:bg-error/90 text-white"
          >
            Excluir
          </Button>
        </div>
      </div>
    ), {
      duration: Infinity,
    })
  }

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const truncateDescription = (description: string) => {
    if (description.length > 20) {
      return description.substring(0, 20) + '...'
    }
    return description
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar serviços..."
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        currentSortBy={filters.sortBy}
        currentSortOrder={filters.sortOrder}
        onSortByChange={(value) => actions.updateFilters({ sortBy: value as 'name' | 'base_price' | 'recent' })}
        onSortOrderChange={(value) => actions.updateFilters({ sortOrder: value })}
      />

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader className="bg-neutral-cream/30">
            <TableRow>
              <TableHead className="w-[300px] text-heading font-heading">NOME</TableHead>
              <TableHead className="text-heading font-heading">PREÇO</TableHead>
              <TableHead className="w-[70px] text-heading font-heading"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Nenhum serviço encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-heading">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">
                          {truncateDescription(service.description)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-heading">{formatPrice(service.base_price)}</TableCell>
                  <TableCell>
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
                        <ServiceDialog
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              className="hover:bg-neutral-cream/50"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          }
                          title="Editar Serviço"
                          initialData={{
                            name: service.name,
                            description: service.description || '',
                            base_price: service.base_price,
                            duration: service.duration,
                            is_active: service.is_active,
                          }}
                          onSubmit={(data) => onUpdate(service.id!, data)}
                          isLoading={isLoading}
                        />
                        <DropdownMenuItem
                          className="text-error hover:bg-error/10 hover:text-error"
                          onClick={() => handleDelete(service.id!, service.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 