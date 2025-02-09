'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, MoreHorizontal, Search, Star, Filter, ArrowUpDown } from 'lucide-react'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useCustomerStore } from '@/store/customer-store'
import { CustomerFormValues, Customer } from '@/types/customer'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CustomerForm } from '@/components/customers/forms/customer-form'
import { CustomerDialog } from '@/components/customers/dialogs/customer-dialog'
import { CustomerListItem } from './cards/customer-list-item'
import { SearchBar } from '@/components/ui/data-list/search-bar'

export interface CustomerListProps {
  customers: Customer[]
  onUpdate: (id: string, data: CustomerFormValues) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function CustomerList({ customers, onUpdate, onDelete, isLoading }: CustomerListProps) {
  const { filters, actions } = useCustomerStore()
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Opções de ordenação
  const sortOptions = [
    { label: 'Nome', value: 'full_name' },
    { label: 'Mais recentes', value: 'recent' },
    { label: 'Pontos', value: 'points' },
  ]

  // Opções de filtro
  const filterOptions = [
    {
      label: 'Com e-mail',
      value: 'hasEmail',
      checked: filters.hasEmail === true,
      onCheckedChange: (checked: boolean) =>
        actions.updateFilters({ hasEmail: checked || undefined }),
    },
    {
      label: 'Com observações',
      value: 'hasNotes',
      checked: filters.hasNotes === true,
      onCheckedChange: (checked: boolean) =>
        actions.updateFilters({ hasNotes: checked || undefined }),
    },
  ]

  // Atualizar filtros quando a busca mudar
  useEffect(() => {
    actions.updateFilters({ search })
  }, [search, actions])

  // Filtrar clientes localmente para busca instantânea
  const filteredCustomers = useMemo(() => {
    if (!search) return customers

    const searchLower = search.toLowerCase()
    return customers.filter(customer => {
      return (
        customer.full_name.toLowerCase().includes(searchLower) ||
        customer.phone.includes(search) ||
        customer.email?.toLowerCase().includes(searchLower)
      )
    })
  }, [customers, search])

  const handleUpdateCustomer = async (id: string, data: CustomerFormValues) => {
    await onUpdate(id, data)
  }

  const handleDeleteCustomer = async (id: string, name: string) => {
    toast.custom(
      t => (
        <div className="p-4 bg-white rounded-lg shadow-lg border border-charcoal/10">
          <h3 className="font-medium text-charcoal mb-2">Confirmar exclusão</h3>
          <p className="text-sm text-charcoal/60 mb-4">
            Tem certeza que deseja excluir o cliente{' '}
            <span className="font-medium text-charcoal">{name}</span>?
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
              className="bg-red-500 hover:bg-red-600 text-white"
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

  const formatBirthDate = (date: string | null | undefined) => {
    if (!date) return undefined
    try {
      // Se a data já estiver no formato DD/MM/YYYY, retorna como está
      if (date.includes('/')) {
        return date
      }
      // Se estiver no formato YYYY-MM-DD, converte para DD/MM/YYYY
      const parsedDate = parse(date, 'yyyy-MM-dd', new Date())
      return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return date
    }
  }

  // Função para navegar para os detalhes do cliente
  const handleCustomerClick = (id: string) => {
    router.push(`/customers/${id}`)
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar clientes..."
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        currentSortBy={filters.sortBy}
        currentSortOrder={filters.sortOrder}
        onSortByChange={value =>
          actions.updateFilters({ sortBy: value as 'full_name' | 'recent' | 'points' })
        }
        onSortOrderChange={value => actions.updateFilters({ sortOrder: value })}
      />

      {/* Versão Desktop */}
      <div className="rounded-lg border bg-white hidden md:block">
        <Table>
          <TableHeader className="bg-neutral-cream/30">
            <TableRow>
              <TableHead className="w-[250px] text-heading font-heading">CLIENTE</TableHead>
              <TableHead className="w-[250px] text-heading font-heading">EMAIL</TableHead>
              <TableHead className="w-[180px] text-heading font-heading">TELEFONE</TableHead>
              <TableHead className="w-[150px] text-heading font-heading text-center">
                ANIVERSÁRIO
              </TableHead>
              <TableHead className="w-[100px] text-heading font-heading text-center">
                PONTOS
              </TableHead>
              <TableHead className="w-[70px] text-heading font-heading"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map(customer => (
                <TableRow
                  key={`desktop-${customer.id}`}
                  className="hover:bg-neutral-cream/10 cursor-pointer group"
                  onClick={() => handleCustomerClick(customer.id!)}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-heading group-hover:text-terracotta transition-colors">
                        {customer.full_name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="font-medium text-heading">{customer.email || 'Sem e-mail'}</p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="font-medium text-heading">{customer.phone}</p>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <p className="font-medium text-heading">
                      {customer.birth_date ? formatBirthDate(customer.birth_date) : 'Não informado'}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="h-4 w-4 text-terracotta" />
                      <span className="font-medium text-heading">{customer.points}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-neutral-cream/50"
                          onClick={e => e.stopPropagation()}
                        >
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[160px]"
                        onClick={e => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation()
                            handleCustomerClick(customer.id!)
                          }}
                          className="hover:bg-neutral-cream/50"
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Detalhes
                        </DropdownMenuItem>
                        <CustomerDialog
                          trigger={
                            <div onClick={e => e.stopPropagation()}>
                              <DropdownMenuItem
                                onSelect={e => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                                className="hover:bg-neutral-cream/50"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </div>
                          }
                          title="Editar Cliente"
                          initialData={{
                            fullName: customer.full_name,
                            phone: customer.phone,
                            email: customer.email || '',
                            birthDate: customer.birth_date || '',
                            notes: customer.notes || '',
                          }}
                          onSubmit={async data => {
                            await handleUpdateCustomer(customer.id!, data)
                          }}
                          isLoading={isLoading}
                        />
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation()
                            handleDeleteCustomer(customer.id!, customer.full_name)
                          }}
                          className="text-red-600 hover:bg-red-100"
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

      {/* Versão Mobile */}
      <div className="md:hidden space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">Nenhum cliente encontrado</div>
        ) : (
          filteredCustomers.map(customer => (
            <div
              key={`mobile-${customer.id}`}
              className="bg-white rounded-lg border p-4 space-y-3 cursor-pointer group active:bg-neutral-cream/30 hover:border-terracotta/20 hover:shadow-md transition-all duration-200"
              onClick={() => handleCustomerClick(customer.id!)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-heading group-hover:text-terracotta transition-colors">
                    {customer.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-terracotta" />
                    <span className="font-medium text-heading">{customer.points}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-neutral-cream/50"
                        onClick={e => e.stopPropagation()}
                      >
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[160px]"
                      onClick={e => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation()
                          handleCustomerClick(customer.id!)
                        }}
                        className="hover:bg-neutral-cream/50"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Detalhes
                      </DropdownMenuItem>
                      <CustomerDialog
                        trigger={
                          <div onClick={e => e.stopPropagation()}>
                            <DropdownMenuItem
                              onSelect={e => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              className="hover:bg-neutral-cream/50"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          </div>
                        }
                        title="Editar Cliente"
                        initialData={{
                          fullName: customer.full_name,
                          phone: customer.phone,
                          email: customer.email || '',
                          birthDate: customer.birth_date || '',
                          notes: customer.notes || '',
                        }}
                        onSubmit={async data => {
                          await handleUpdateCustomer(customer.id!, data)
                        }}
                        isLoading={isLoading}
                      />
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation()
                          handleDeleteCustomer(customer.id!, customer.full_name)
                        }}
                        className="text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {customer.birth_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Aniversário:</span>
                  <span>{formatBirthDate(customer.birth_date)}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
