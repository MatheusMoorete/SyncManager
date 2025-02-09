'use client'

import { useState, useEffect } from 'react'
import { Service, ServiceFormValues } from '@/types/service'
import { ServiceDialog } from './service-dialog'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { SearchBar } from '@/components/ui/data-list/search-bar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useServiceStore } from '@/store/service-store'

interface ServiceListProps {
  services: Service[]
  onUpdate: (id: string, data: ServiceFormValues) => Promise<void>
  onDelete: (id: string) => Promise<void>
  loading?: boolean
}

export function ServiceList({ services, onUpdate, onDelete, loading }: ServiceListProps) {
  const { filters, actions } = useServiceStore()
  const [search, setSearch] = useState('')
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null)

  // Opções de ordenação
  const sortOptions = [
    { label: 'Nome', value: 'name' },
    { label: 'Preço', value: 'price' },
    { label: 'Mais recentes', value: 'createdAt' },
  ]

  // Opções de filtro
  const filterOptions = [
    {
      label: 'Serviços ativos',
      value: 'active',
      checked: filters.onlyActive ?? true,
      onCheckedChange: (checked: boolean) => {
        actions.updateFilters({ onlyActive: checked })
      },
    },
  ]

  // Carregar serviços quando o componente montar
  useEffect(() => {
    actions.fetchServices()
  }, [actions])

  // Atualizar filtros quando a busca mudar
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      actions.updateFilters({ search })
    }, 300)

    return () => clearTimeout(debounceTimeout)
  }, [search, actions])

  const handleDelete = (id: string, name: string) => {
    toast.custom(
      t => (
        <div className="p-4 bg-white rounded-lg shadow-lg border border-charcoal/10">
          <h3 className="font-medium text-heading mb-2">Confirmar exclusão</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Tem certeza que deseja excluir o serviço{' '}
            <span className="font-medium text-heading">{name}</span>?
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
      ),
      {
        duration: Infinity,
      }
    )
  }

  const handleEdit = (service: Service) => {
    setServiceToEdit(service)
  }

  const filteredServices = services

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const truncateDescription = (description: string) => {
    if (description.length > 20) {
      return description.substring(0, 20) + '...'
    }
    return description
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar serviços..."
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          currentSortBy={filters.sortBy || 'name'}
          currentSortOrder={filters.sortOrder || 'asc'}
          onSortByChange={value => actions.updateFilters({ sortBy: value as any })}
          onSortOrderChange={value => actions.updateFilters({ sortOrder: value })}
        />
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader className="bg-neutral-cream/30">
            <TableRow>
              <TableHead className="w-[250px] text-heading font-heading">NOME</TableHead>
              <TableHead className="w-[150px] text-heading font-heading">PREÇO</TableHead>
              <TableHead className="w-[150px] text-heading font-heading">DURAÇÃO</TableHead>
              <TableHead className="w-[70px] text-heading font-heading"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Nenhum serviço encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map(service => (
                <TableRow key={service.id} className="hover:bg-neutral-cream/10 group">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-heading group-hover:text-terracotta transition-colors">
                        {service.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="font-medium text-heading">{formatPrice(service.price)}</p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="font-medium text-heading">{service.duration} minutos</p>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex justify-end gap-2">
                      <ServiceDialog
                        trigger={
                          <Button variant="ghost" size="icon" className="hover:bg-neutral-cream/50">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                        title="Editar Serviço"
                        initialData={{
                          name: service.name,
                          description: service.description || '',
                          price: service.price,
                          duration: service.duration,
                          active: service.active,
                        }}
                        onSubmit={data => onUpdate(service.id, data)}
                        loading={loading}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(service.id, service.name)}
                        className="hover:bg-neutral-cream/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
