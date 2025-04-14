import { create } from 'zustand'
import { toast } from 'sonner'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
  getDoc,
  limit,
  startAfter,
} from 'firebase/firestore'
import { useAuthStore } from './auth-store'
import { Service, ServiceFormValues, ServiceFilters } from '@/types/service'
import { getMockServices, mockServices } from '@/lib/mock-data'
import { isDevelopment } from '@/lib/utils'

interface ServiceState {
  services: Service[]
  loading: boolean
  error: string | null
  filters: ServiceFilters
  selectedService?: Service
  lastVisible: any
  hasMore: boolean
  actions: {
    fetchServices: () => Promise<void>
    createService: (data: ServiceFormValues) => Promise<void>
    updateService: (id: string, data: Partial<ServiceFormValues>) => Promise<void>
    deleteService: (id: string) => Promise<void>
    updateFilters: (filters: Partial<ServiceFilters>) => void
    getServiceById: (id: string) => Promise<Service | null>
  }
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  loading: false,
  error: null,
  filters: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
    onlyActive: true,
    perPage: 10,
  },
  selectedService: undefined,
  lastVisible: null,
  hasMore: true,

  actions: {
    fetchServices: async () => {
      const { user } = useAuthStore.getState()
      if (!user && !isDevelopment()) {
        throw new Error('Usuário não autenticado')
      }

      try {
        set({ loading: true })

        // Em desenvolvimento, podemos usar dados mockados
        if (isDevelopment()) {
          console.log('🧪 Usando dados mockados para serviços')

          // Simula um atraso de rede para testar loading states
          await new Promise(resolve => setTimeout(resolve, 500))

          set({
            services: getMockServices(),
            loading: false,
          })
          return
        }

        // Em produção, busca no Firestore
        const { filters } = get()

        let q = query(
          collection(db, 'services'),
          where('ownerId', '==', user.uid),
          where('active', '==', filters.onlyActive)
        )

        if (filters.sortBy) {
          q = query(q, orderBy(filters.sortBy, filters.sortOrder || 'desc'))
        }

        const snapshot = await getDocs(q)
        const services = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[]

        // Filtragem por busca no client-side
        const filteredServices = filters.search
          ? services.filter(
              service =>
                service.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
                service.description?.toLowerCase().includes(filters.search!.toLowerCase())
            )
          : services

        set({
          services: filteredServices,
          loading: false,
          lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
          hasMore: snapshot.docs.length === (filters.perPage || 10),
        })
      } catch (error) {
        console.error('Erro ao carregar serviços:', error)
        set({
          error: 'Erro ao carregar serviços',
          loading: false,
        })
      }
    },

    createService: async (data: ServiceFormValues) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })

      try {
        const now = Timestamp.now()
        const newService = {
          ...data,
          active: true, // Sempre criar como ativo
          ownerId: user.uid,
          createdAt: now,
          updatedAt: now,
        }

        const docRef = await addDoc(collection(db, 'services'), newService)

        // Após criar o serviço, recarregar a lista completa
        await get().actions.fetchServices()

        toast.success('Serviço criado com sucesso!')
      } catch (error) {
        console.error('Erro ao criar serviço:', error)
        toast.error('Erro ao criar serviço')
        set({ error: 'Erro ao criar serviço' })
      } finally {
        set({ loading: false })
      }
    },

    updateService: async (id: string, data: Partial<ServiceFormValues>) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })

      try {
        const updateData = {
          ...data,
          updatedAt: Timestamp.now(),
        }

        await updateDoc(doc(db, 'services', id), updateData)

        set(state => ({
          services: state.services.map(service =>
            service.id === id ? { ...service, ...updateData } : service
          ),
        }))

        toast.success('Serviço atualizado com sucesso!')
      } catch (error) {
        console.error('Erro ao atualizar serviço:', error)
        toast.error('Erro ao atualizar serviço')
        set({ error: 'Erro ao atualizar serviço' })
      } finally {
        set({ loading: false })
      }
    },

    deleteService: async (id: string) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      set({ loading: true, error: null })

      try {
        await deleteDoc(doc(db, 'services', id))

        set(state => ({
          services: state.services.filter(service => service.id !== id),
        }))

        toast.success('Serviço excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir serviço:', error)
        toast.error('Erro ao excluir serviço')
        set({ error: 'Erro ao excluir serviço' })
      } finally {
        set({ loading: false })
      }
    },

    updateFilters: (filters: Partial<ServiceFilters>) => {
      set(state => ({
        filters: {
          ...state.filters,
          ...filters,
        },
      }))
      if (filters.onlyActive !== undefined || filters.sortBy || filters.sortOrder) {
        get().actions.fetchServices()
      }
    },

    getServiceById: async (id: string) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        const docRef = doc(db, 'services', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const service = { id: docSnap.id, ...docSnap.data() } as Service
          set({ selectedService: service })
          return service
        }
        return null
      } catch (error) {
        console.error('Erro ao buscar serviço:', error)
        set({ error: 'Erro ao buscar serviço' })
        return null
      }
    },
  },
}))
