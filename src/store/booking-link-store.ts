/**
 * @store BookingLinkStore
 * @description Gerenciamento centralizado de links de agendamento compartilháveis
 */

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
  Timestamp,
  orderBy,
  getDoc,
  limit,
} from 'firebase/firestore'
import { useAuthStore } from './auth-store'
import { BookingLink, BookingLinkFilters, BookingLinkFormValues } from '@/types/booking-link'
import { nanoid } from 'nanoid'

/**
 * @interface BookingLinkError
 * @description Estrutura de erro customizada para operações com links de agendamento
 */
interface BookingLinkError extends Error {
  message: string
  code?: string
}

/**
 * @interface BookingLinkState
 * @description Estado global do gerenciamento de links de agendamento
 */
interface BookingLinkState {
  bookingLinks: BookingLink[]
  loading: boolean
  filters: BookingLinkFilters
  actions: {
    /** Busca todos os links de agendamento aplicando os filtros atuais */
    fetchBookingLinks: () => Promise<void>
    /** Busca um link de agendamento específico pelo ID */
    fetchBookingLinkById: (id: string) => Promise<BookingLink | null>
    /** Busca um link de agendamento específico pelo slug */
    fetchBookingLinkBySlug: (slug: string) => Promise<BookingLink | null>
    /** Cria um novo link de agendamento */
    createBookingLink: (data: BookingLinkFormValues) => Promise<string>
    /** Atualiza os dados de um link de agendamento existente */
    updateBookingLink: (id: string, data: Partial<BookingLinkFormValues>) => Promise<void>
    /** Remove um link de agendamento */
    deleteBookingLink: (id: string) => Promise<void>
    /** Atualiza os filtros de busca */
    updateFilters: (filters: Partial<BookingLinkFilters>) => void
    /** Incrementa o contador de visualizações de um link */
    incrementLinkViews: (id: string) => Promise<void>
    /** Incrementa o contador de agendamentos de um link */
    incrementLinkAppointments: (id: string) => Promise<void>
  }
}

/**
 * @hook useBookingLinkStore
 * @description Hook Zustand para gerenciamento de estado dos links de agendamento
 * @example
 * const { bookingLinks, loading, actions } = useBookingLinkStore()
 */
export const useBookingLinkStore = create<BookingLinkState>((set, get) => ({
  bookingLinks: [],
  loading: false,
  filters: {
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    onlyActive: true,
    perPage: 10,
  },
  actions: {
    fetchBookingLinks: async () => {
      const { user } = useAuthStore.getState()
      if (!user) {
        console.error('Tentativa de buscar links sem autenticação')
        throw new Error('Usuário não autenticado')
      }

      try {
        console.log('Iniciando busca de links de agendamento, usuário:', user.uid)
        set({ loading: true })
        const { filters } = get()

        // SIMPLIFICAR A QUERY - primeiro vamos buscar todos os links do usuário
        // sem filtros ou ordenação adicional para garantir que encontramos algo
        let q = query(collection(db, 'booking_links'), where('ownerId', '==', user.uid))

        console.log('Executando consulta simplificada ao Firestore')
        const snapshot = await getDocs(q)
        console.log(`Encontrados ${snapshot.docs.length} links de agendamento (total)`)

        // Logar os IDs e nomes para diagnóstico
        if (snapshot.docs.length > 0) {
          snapshot.docs.forEach(doc => {
            const data = doc.data()
            console.log(`ID: ${doc.id}, Nome: ${data.name || 'sem nome'}, Status:`, {
              active: data.active,
              is_active: data.is_active,
            })
          })
        }

        // Mapear os documentos para o tipo BookingLink com tratamento adequado de campos
        let bookingLinks = snapshot.docs.map(doc => {
          const data = doc.data()
          // Interpretar como ativo se QUALQUER UM dos campos indicar isso
          const isActive =
            data.is_active === true ||
            data.active === true ||
            (data.is_active === undefined && data.active === undefined)

          return {
            id: doc.id,
            ...data,
            // Garantir que todos os campos existam com valores padrão
            name: data.name || 'Link sem nome',
            description: data.description || null,
            slug: data.slug || '',
            // Unificar os campos de status
            active: isActive,
            is_active: isActive,
            services: Array.isArray(data.services) ? data.services : [],
            daysInAdvance: data.days_in_advance || 7,
            redirectUrl: data.redirectUrl || null,
            createdAt: data.created_at || data.createdAt || Timestamp.now(),
            updatedAt: data.updated_at || data.updatedAt || Timestamp.now(),
          } as BookingLink
        })

        // Aplicar filtros no lado do cliente em vez de na query
        if (filters.onlyActive) {
          console.log('Filtrando links ativos no lado do cliente')
          bookingLinks = bookingLinks.filter(
            link => link.active === true || link.is_active === true
          )
          console.log(`${bookingLinks.length} links ativos após filtragem`)
        }

        // Ordenar no cliente em vez de na query
        if (filters.sortBy) {
          console.log(`Ordenando por ${filters.sortBy} em ordem ${filters.sortOrder || 'desc'}`)
          bookingLinks.sort((a: any, b: any) => {
            const field = filters.sortBy as keyof typeof a
            const order = filters.sortOrder === 'asc' ? 1 : -1

            if (a[field] < b[field]) return -1 * order
            if (a[field] > b[field]) return 1 * order
            return 0
          })
        } else {
          // Ordenação padrão por data de criação
          bookingLinks.sort((a, b) => {
            const aDate = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0
            const bDate = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0
            return bDate - aDate // descendente
          })
        }

        // Aplicar limite de paginação
        if (filters.perPage && filters.perPage > 0 && bookingLinks.length > filters.perPage) {
          bookingLinks = bookingLinks.slice(0, filters.perPage)
        }

        // Filtrar por termo de busca se especificado
        if (filters.search && filters.search.trim() !== '') {
          const searchTerm = filters.search.toLowerCase().trim()
          console.log(`Aplicando filtro de busca: "${searchTerm}"`)

          bookingLinks = bookingLinks.filter(
            link =>
              link.name.toLowerCase().includes(searchTerm) ||
              (link.description && link.description.toLowerCase().includes(searchTerm))
          )

          console.log(`${bookingLinks.length} links correspondem ao filtro de busca`)
        }

        // Atualizar o estado com os links encontrados
        console.log('Atualizando estado com links encontrados:', bookingLinks.length)
        set({ bookingLinks, loading: false })
      } catch (error) {
        console.error('Erro ao buscar links de agendamento:', error)
        toast.error('Erro ao buscar links de agendamento')

        // Em caso de erro, definir uma lista vazia para evitar exibição de dados desatualizados
        set({ bookingLinks: [], loading: false })
        throw error
      }
    },

    fetchBookingLinkById: async (id: string) => {
      try {
        set({ loading: true })
        const docRef = doc(db, 'booking_links', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const bookingLink = { id: docSnap.id, ...docSnap.data() } as BookingLink
          set({ loading: false })
          return bookingLink
        }

        set({ loading: false })
        return null
      } catch (error) {
        console.error('Erro ao buscar link de agendamento:', error)
        set({ loading: false })
        throw error
      }
    },

    fetchBookingLinkBySlug: async (slug: string) => {
      try {
        set({ loading: true })
        console.log(`Buscando link de agendamento com slug: ${slug}`)
        const q = query(
          collection(db, 'booking_links'),
          where('slug', '==', slug),
          where('active', '==', true),
          where('is_active', '==', true),
          limit(1)
        )

        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          const doc = snapshot.docs[0]
          const bookingLink = { id: doc.id, ...doc.data() } as BookingLink
          console.log(`Link encontrado: ${bookingLink.name}`)
          set({ loading: false })
          return bookingLink
        }

        console.log('Link não encontrado ou inativo')
        set({ loading: false })
        return null
      } catch (error) {
        console.error('Erro ao buscar link de agendamento por slug:', error)
        set({ loading: false })
        throw error
      }
    },

    createBookingLink: async (data: BookingLinkFormValues) => {
      const { user } = useAuthStore.getState()
      if (!user) {
        console.error('Tentativa de criar link sem autenticação')
        throw new Error('Usuário não autenticado')
      }

      console.log('Iniciando criação de novo link de agendamento via store:', data)
      try {
        set({ loading: true })

        // Validar dados mínimos
        if (!data.name || !data.services || data.services.length === 0) {
          throw new Error('Dados incompletos para criação de link')
        }

        // Criar slug único baseado no nome + ID aleatório
        const baseSlug = data.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^\w\s]/gi, '') // Remove caracteres especiais
          .replace(/\s+/g, '-') // Substitui espaços por hífens

        const uniqueId = nanoid(6)
        const slug = `${baseSlug}-${uniqueId}`
        console.log(`Slug gerado: ${slug}`)

        // Preparar dados para salvar no Firestore
        // IMPORTANTE: Usar AMBOS os nomes de campos (active e is_active) para compatibilidade
        const now = Timestamp.now()
        const bookingLinkData = {
          // Campos do formulário
          name: data.name,
          description: data.description || data.name, // Usar nome como descrição se não especificado
          services: data.services,

          // Usando ambos os nomes de campos para os mesmos valores
          days_in_advance: data.daysInAdvance || 7,
          daysInAdvance: data.daysInAdvance || 7, // Campo duplicado para compatibilidade

          // Campos de status duplicados para garantir compatibilidade
          active: data.active !== false,
          is_active: data.active !== false,

          // Campos adicionais
          ownerId: user.uid,
          slug,
          // Campos de data duplicados para compatibilidade
          created_at: now,
          createdAt: now,
          updated_at: now,
          updatedAt: now,
        }

        console.log('Enviando dados para o Firestore:', bookingLinkData)
        const docRef = await addDoc(collection(db, 'booking_links'), bookingLinkData)
        console.log('Link criado com sucesso, ID:', docRef.id)

        // Atualizar a lista imediatamente após criar
        console.log('Atualizando lista de links')

        // Forçar um pequeno atraso para garantir que o Firestore tenha tempo de sincronizar
        await new Promise(resolve => setTimeout(resolve, 500))

        const { actions } = get()
        await actions.fetchBookingLinks()

        set({ loading: false })
        toast.success('Link de agendamento criado com sucesso!')
        return docRef.id
      } catch (error) {
        console.error('Erro ao criar link de agendamento:', error)
        toast.error(
          error instanceof Error ? `Erro: ${error.message}` : 'Erro ao criar link de agendamento'
        )
        set({ loading: false })
        throw error
      }
    },

    updateBookingLink: async (id: string, data: Partial<BookingLinkFormValues>) => {
      try {
        set({ loading: true })

        const updateData = {
          ...data,
          updatedAt: Timestamp.now(),
        }

        await updateDoc(doc(db, 'booking_links', id), updateData)

        // Atualizar a lista
        await get().actions.fetchBookingLinks()

        set({ loading: false })
        toast.success('Link de agendamento atualizado com sucesso!')
      } catch (error) {
        console.error('Erro ao atualizar link de agendamento:', error)
        toast.error('Erro ao atualizar link de agendamento')
        set({ loading: false })
        throw error
      }
    },

    deleteBookingLink: async (id: string) => {
      try {
        set({ loading: true })

        await deleteDoc(doc(db, 'booking_links', id))

        // Atualizar a lista
        await get().actions.fetchBookingLinks()

        set({ loading: false })
        toast.success('Link de agendamento excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir link de agendamento:', error)
        toast.error('Erro ao excluir link de agendamento')
        set({ loading: false })
        throw error
      }
    },

    updateFilters: (filters: Partial<BookingLinkFilters>) => {
      set(state => ({
        filters: {
          ...state.filters,
          ...filters,
        },
      }))
    },

    incrementLinkViews: async (id: string) => {
      const docRef = doc(db, 'booking_links', id)
      try {
        // Primeiro, obter o documento para verificar o contador atual
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          const currentViews = data.views || 0

          // Incrementar o contador de visualizações
          await updateDoc(docRef, {
            views: currentViews + 1,
          })

          console.log(`Visualização registrada para o link ${id}`)
        }
      } catch (error) {
        console.error('Erro ao incrementar visualizações:', error)
      }
    },

    incrementLinkAppointments: async (id: string) => {
      const docRef = doc(db, 'booking_links', id)
      try {
        // Primeiro, obter o documento para verificar o contador atual
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          const currentAppointments = data.appointments || 0

          // Incrementar o contador de agendamentos
          await updateDoc(docRef, {
            appointments: currentAppointments + 1,
          })

          console.log(`Agendamento registrado para o link ${id}`)
        }
      } catch (error) {
        console.error('Erro ao incrementar agendamentos:', error)
      }
    },
  },
}))
