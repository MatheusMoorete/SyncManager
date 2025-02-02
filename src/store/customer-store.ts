import { create } from 'zustand'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/index'
import { Customer, CustomerFormValues, CustomerFilters } from '@/types/customer'

interface CustomerState {
  customers: Customer[]
  isLoading: boolean
  filters: CustomerFilters
  actions: {
    fetchCustomers: () => Promise<void>
    createCustomer: (data: CustomerFormValues) => Promise<void>
    updateCustomer: (id: string, data: CustomerFormValues) => Promise<void>
    deleteCustomer: (id: string) => Promise<void>
    restoreCustomer: (id: string) => Promise<void>
    updateFilters: (filters: Partial<CustomerFilters>) => void
  }
}

const mapFormToDb = (data: CustomerFormValues) => {
  // Converte a data do formato DD/MM/YYYY para YYYY-MM-DD
  let birthDate = null;
  if (data.birthDate) {
    const [day, month, year] = data.birthDate.split('/');
    birthDate = `${year}-${month}-${day}`;
  }

  return {
    full_name: data.name,
    phone: data.phone,
    email: data.email || null,
    birth_date: birthDate,
    notes: data.notes || null,
  }
}

const mapDbToForm = (data: Customer): CustomerFormValues => {
  // Converte a data do formato YYYY-MM-DD para DD/MM/YYYY
  let birthDate = undefined;
  if (data.birth_date) {
    // Se a data já estiver no formato DD/MM/YYYY, mantém como está
    if (data.birth_date.includes('/')) {
      birthDate = data.birth_date;
    } else {
      // Se estiver no formato YYYY-MM-DD, converte
      const [year, month, day] = data.birth_date.split('-');
      birthDate = `${day}/${month}/${year}`;
    }
  }

  return {
    name: data.full_name,
    phone: data.phone,
    email: data.email || undefined,
    birthDate: birthDate,
    notes: data.notes || undefined,
  }
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  isLoading: false,
  filters: {
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    birthMonth: undefined,
    hasEmail: undefined,
    hasNotes: undefined,
  },
  actions: {
    fetchCustomers: async () => {
      try {
        set({ isLoading: true })

        // Verificar autenticação
        const { data: session } = await supabase.auth.getSession()
        if (!session.session) {
          throw new Error('Não autorizado. Por favor, faça login novamente.')
        }

        const { filters } = get()
        
        let query = supabase
          .from('clients')
          .select('*, loyalty_points(points_earned)')
          .is('deleted_at', null)

        // Aplicar filtros
        if (filters.search) {
          query = query.ilike('full_name', `%${filters.search}%`)
        }

        if (filters.hasEmail !== undefined) {
          if (filters.hasEmail) {
            query = query.not('email', 'is', null)
          } else {
            query = query.is('email', null)
          }
        }

        if (filters.hasNotes !== undefined) {
          if (filters.hasNotes) {
            query = query.not('notes', 'is', null)
          } else {
            query = query.is('notes', null)
          }
        }

        if (filters.birthMonth !== undefined) {
          query = query.like('birth_date', `%-${String(filters.birthMonth).padStart(2, '0')}-%`)
        }

        // Aplicar ordenação
        switch (filters.sortBy) {
          case 'name':
            query = query.order('full_name', { ascending: filters.sortOrder === 'asc' })
            break
          case 'recent':
            query = query.order('created_at', { ascending: filters.sortOrder === 'asc' })
            break
          case 'points':
            query = query.order('loyalty_points(points_earned)', { ascending: filters.sortOrder === 'asc', nullsFirst: filters.sortOrder === 'asc' })
            break
        }

        const { data, error } = await query

        if (error) {
          if (error.code === 'PGRST301') {
            throw new Error('Não autorizado. Por favor, faça login novamente.')
          }
          throw error
        }

        // Mapear os dados para incluir os pontos
        const customersWithPoints = data.map(customer => ({
          ...customer,
          points: customer.loyalty_points?.points_earned || 0
        }))

        set({ customers: customersWithPoints })
      } catch (error: any) {
        console.error('Error fetching customers:', error)
        if (error.message.includes('Não autorizado')) {
          // Redirecionar para login
          window.location.href = '/auth/login'
        } else {
          toast.error('Erro ao carregar clientes. Por favor, tente novamente.')
        }
      } finally {
        set({ isLoading: false })
      }
    },

    createCustomer: async (data: CustomerFormValues) => {
      try {
        set({ isLoading: true })
        const userResponse = await supabase.auth.getUser()
        
        if (!userResponse.data.user?.id) {
          throw new Error('Usuário não autenticado')
        }

        const mappedData = mapFormToDb(data)
        console.log('Dados mapeados:', mappedData) // Debug

        const { error } = await supabase.from('clients').insert([{
          ...mappedData,
          owner_id: userResponse.data.user.id
        }])

        if (error) {
          console.error('Detalhes do erro:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          throw error
        }

        get().actions.fetchCustomers()
        toast.success('Cliente adicionado com sucesso!', {
          duration: 1500,
        })
      } catch (error: any) {
        console.error('Error creating customer:', {
          error,
          message: error.message,
          details: error.details,
          code: error.code
        })
        
        // Mensagens de erro mais específicas
        if (error.code === '23505') {
          toast.error('Já existe um cliente com este telefone', {
            duration: 3000,
          })
        } else if (error.message?.includes('auth')) {
          toast.error('Erro de autenticação. Por favor, faça login novamente', {
            duration: 3000,
          })
        } else {
          toast.error(`Erro ao criar cliente: ${error.message || 'Erro desconhecido'}`, {
            duration: 3000,
          })
        }
      } finally {
        set({ isLoading: false })
      }
    },

    updateCustomer: async (id: string, data: CustomerFormValues) => {
      try {
        set({ isLoading: true })
        const { error } = await supabase
          .from('clients')
          .update(mapFormToDb(data))
          .eq('id', id)

        if (error) throw error

        get().actions.fetchCustomers()
        toast.success('Cliente atualizado com sucesso!', {
          duration: 1500,
        })
      } catch (error) {
        console.error('Error updating customer:', error)
        toast.error('Erro ao atualizar cliente', {
          duration: 2000,
        })
      } finally {
        set({ isLoading: false })
      }
    },

    deleteCustomer: async (id: string) => {
      try {
        set({ isLoading: true })
        const { customers } = get()
        
        // Guardar o cliente que está sendo excluído para mostrar na mensagem
        const customerToDelete = customers.find(c => c.id === id)
        
        const { data, error } = await supabase
          .rpc('soft_delete_client', { client_id: id })

        if (error) throw error
        if (!data) throw new Error('Cliente não encontrado')

        // Atualizar a lista imediatamente
        get().actions.fetchCustomers()

        // Mostrar toast com mais informações e tempo maior para desfazer
        toast.success(`Cliente ${customerToDelete?.full_name} excluído\nVocê tem 10 segundos para desfazer esta ação`, {
          duration: 10000, // 10 segundos
          action: {
            label: 'Desfazer',
            onClick: async () => {
              try {
                await get().actions.restoreCustomer(id)
              } catch (error) {
                console.error('Error restoring customer:', error)
                toast.error('Não foi possível desfazer. Tente novamente.', {
                  duration: 3000,
                })
              }
            },
          },
        })
      } catch (error) {
        console.error('Error deleting customer:', error)
        toast.error('Erro ao excluir cliente. Tente novamente.', {
          duration: 3000,
        })
      } finally {
        set({ isLoading: false })
      }
    },

    restoreCustomer: async (id: string) => {
      try {
        set({ isLoading: true })
        const { data, error } = await supabase
          .rpc('restore_client', { client_id: id })

        if (error) throw error
        if (!data) throw new Error('Cliente não encontrado')

        // Atualizar a lista
        await get().actions.fetchCustomers()
        
        // Mostrar confirmação de restauração
        toast.success('Cliente restaurado com sucesso!', {
          duration: 3000,
        })
      } catch (error) {
        console.error('Error restoring customer:', error)
        toast.error('Erro ao restaurar cliente. Tente novamente.', {
          duration: 3000,
        })
        throw error // Re-throw para ser tratado no deleteCustomer
      } finally {
        set({ isLoading: false })
      }
    },

    updateFilters: (filters: Partial<CustomerFilters>) => {
      set((state) => ({
        filters: {
          ...state.filters,
          ...filters,
        },
      }))
    },
  },
})) 