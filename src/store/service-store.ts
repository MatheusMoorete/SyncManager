import { create } from 'zustand'
import { toast } from 'sonner'
import { Service, ServiceFormValues, ServiceFilters } from '@/types/service'
import { supabase } from '@/lib/supabase'

interface ServiceState {
  services: Service[]
  isLoading: boolean
  filters: ServiceFilters
  actions: {
    fetchServices: () => Promise<void>
    createService: (data: ServiceFormValues) => Promise<void>
    updateService: (id: string, data: ServiceFormValues) => Promise<void>
    deleteService: (id: string) => Promise<void>
    toggleServiceStatus: (id: string, isActive: boolean) => Promise<void>
    updateFilters: (filters: Partial<ServiceFilters>) => void
  }
}

const mapFormToDb = (data: ServiceFormValues): Partial<Service> => {
  return {
    name: data.name,
    description: data.description || null,
    base_price: data.base_price,
    duration: data.duration,
    is_active: data.is_active,
  }
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  isLoading: false,
  filters: {
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    isActive: undefined,
  },
  actions: {
    fetchServices: async () => {
      try {
        set({ isLoading: true })
        const { filters } = get()
        
        let query = supabase.from('services').select('*')

        // Aplicar filtros
        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`)
        }

        if (filters.isActive !== undefined) {
          query = query.eq('is_active', filters.isActive)
        }

        // Aplicar ordenação
        switch (filters.sortBy) {
          case 'name':
            query = query.order('name', { ascending: filters.sortOrder === 'asc' })
            break
          case 'base_price':
            query = query.order('base_price', { ascending: filters.sortOrder === 'asc' })
            break
          case 'recent':
            query = query.order('created_at', { ascending: filters.sortOrder === 'asc' })
            break
        }

        const { data, error } = await query

        if (error) throw error

        set({ services: data || [] })
      } catch (error) {
        console.error('Error fetching services:', error)
        toast.error('Erro ao carregar serviços')
      } finally {
        set({ isLoading: false })
      }
    },

    createService: async (data: ServiceFormValues) => {
      try {
        set({ isLoading: true })
        const userResponse = await supabase.auth.getUser()
        if (!userResponse.data.user?.id) {
          throw new Error('Usuário não autenticado')
        }

        const { data: newService, error } = await supabase
          .from('services')
          .insert([{
            ...mapFormToDb(data),
            owner_id: userResponse.data.user.id
          }])
          .select()
          .single()

        if (error) throw error

        set((state) => ({
          services: [...state.services, newService]
        }))
        
        toast.success('Serviço adicionado com sucesso!')
      } catch (error) {
        console.error('Error creating service:', error)
        toast.error('Erro ao criar serviço')
      } finally {
        set({ isLoading: false })
      }
    },

    updateService: async (id: string, data: ServiceFormValues) => {
      try {
        set({ isLoading: true })

        const { error } = await supabase
          .from('services')
          .update(mapFormToDb(data))
          .eq('id', id)

        if (error) throw error

        set((state) => ({
          services: state.services.map(service =>
            service.id === id ? {
              ...service,
              ...mapFormToDb(data),
              updated_at: new Date().toISOString()
            } : service
          )
        }))

        toast.success('Serviço atualizado com sucesso!')
      } catch (error) {
        console.error('Error updating service:', error)
        toast.error('Erro ao atualizar serviço')
      } finally {
        set({ isLoading: false })
      }
    },

    deleteService: async (id: string) => {
      try {
        set({ isLoading: true })

        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', id)

        if (error) throw error

        set((state) => ({
          services: state.services.filter(service => service.id !== id)
        }))

        toast.success('Serviço excluído com sucesso!')
      } catch (error) {
        console.error('Error deleting service:', error)
        toast.error('Erro ao excluir serviço')
      } finally {
        set({ isLoading: false })
      }
    },

    toggleServiceStatus: async (id: string, isActive: boolean) => {
      try {
        set({ isLoading: true })

        const { error } = await supabase
          .from('services')
          .update({ is_active: isActive })
          .eq('id', id)

        if (error) throw error

        set((state) => ({
          services: state.services.map(service =>
            service.id === id ? {
              ...service,
              is_active: isActive,
              updated_at: new Date().toISOString()
            } : service
          )
        }))

        toast.success(
          isActive ? 'Serviço ativado com sucesso!' : 'Serviço desativado com sucesso!'
        )
      } catch (error) {
        console.error('Error toggling service status:', error)
        toast.error('Erro ao alterar status do serviço')
      } finally {
        set({ isLoading: false })
      }
    },

    updateFilters: (filters: Partial<ServiceFilters>) => {
      set((state) => ({
        filters: {
          ...state.filters,
          ...filters,
        },
      }))
    },
  },
})) 