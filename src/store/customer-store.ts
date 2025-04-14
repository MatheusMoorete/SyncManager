/**
 * @store CustomerStore
 * @description Gerenciamento centralizado de clientes com suporte a CRUD, filtros e pontos de fidelidade
 */

import { create } from 'zustand'
import { toast } from 'sonner'
import { db } from '@/lib/firebase'
import { Customer, CustomerFormValues, CustomerFilters } from '@/types/customer'
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
  startAfter,
  limit,
  Timestamp,
  getDoc,
} from 'firebase/firestore'
import { useAuthStore } from '@/store/auth-store'
import { getMockCustomers, mockCustomers } from '@/lib/mock-data'
import { isDevelopment } from '@/lib/utils'

/**
 * @interface DatabaseCustomer
 * @description Estrutura dos dados do cliente como armazenados no banco
 */
interface DatabaseCustomer {
  full_name: string
  phone: string
  id: string
  email: string | null
  birth_date: string | null
  notes: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
  points: number
  active: boolean
  ownerId: string
  deletedAt?: Timestamp | null
}

/**
 * @interface CustomerError
 * @description Estrutura de erro customizada para operações com clientes
 */
interface CustomerError extends Error {
  code?: string
  details?: string
  hint?: string
}

/**
 * @interface CustomerState
 * @description Estado global do gerenciamento de clientes
 */
interface CustomerState {
  customers: Customer[]
  loading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  lastVisible: any
  filters: CustomerFilters
  actions: {
    /** Busca todos os clientes aplicando os filtros atuais */
    fetchCustomers: () => Promise<void>
    /** Cria um novo cliente */
    createCustomer: (data: CustomerFormValues) => Promise<Customer>
    /** Atualiza os dados de um cliente existente */
    updateCustomer: (id: string, data: CustomerFormValues) => Promise<void>
    /** Realiza a exclusão lógica de um cliente */
    deleteCustomer: (id: string) => Promise<void>
    /** Restaura um cliente previamente excluído */
    restoreCustomer: (id: string) => Promise<void>
    /** Atualiza os filtros de busca */
    updateFilters: (filters: Partial<CustomerFilters>) => void
    /** Busca um cliente específico com seus detalhes */
    fetchCustomer: (id: string) => Promise<void>
    /** Verifica se um cliente já existe pelo telefone */
    checkIfCustomerExists: (phone: string) => Promise<Customer | null>
    /** Obtém um cliente pelo ID a partir do estado atual */
    getCustomerById: (id: string) => Customer | undefined
  }
  selectedCustomer?: Customer
}

/**
 * @function mapFormToDb
 * @description Converte os dados do formulário para o formato do banco
 * @param data Dados do formulário do cliente
 */
const mapFormToDb = (data: CustomerFormValues) => {
  return {
    full_name: data.fullName,
    phone: data.phone,
    email: data.email || null,
    birth_date: data.birthDate || null,
    notes: data.notes || null,
  }
}

/**
 * @function mapDbToForm
 * @description Converte os dados do banco para o formato do formulário
 * @param data Dados do cliente do banco
 */
const mapDbToForm = (data: DatabaseCustomer): CustomerFormValues => {
  return {
    fullName: data.full_name,
    phone: formatPhoneNumber(data.phone),
    email: data.email,
    birthDate: data.birth_date,
    notes: data.notes,
  }
}

const formatPhoneNumber = (value: string) => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')

  // Retorna vazio se não tiver números suficientes
  if (numbers.length !== 11) return value

  // Formata como (XX) XXXXX-XXXX
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
}

// Função auxiliar para normalizar telefone (remove formatação)
const normalizePhone = (phone: string) => {
  return phone.replace(/\D/g, '')
}

/**
 * @hook useCustomerStore
 * @description Hook Zustand para gerenciamento de estado dos clientes
 * @example
 * const { customers, loading, actions } = useCustomerStore()
 *
 * // Buscar clientes
 * useEffect(() => {
 *   actions.fetchCustomers()
 * }, [])
 *
 * // Criar novo cliente
 * const handleSubmit = async (data: CustomerFormValues) => {
 *   await actions.createCustomer(data)
 * }
 */
export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  loading: false,
  error: null,
  totalCount: 0,
  hasMore: true,
  lastVisible: null,
  filters: {
    sortBy: 'full_name',
    sortOrder: 'desc',
    perPage: 10,
  },
  actions: {
    fetchCustomers: async () => {
      const { user } = useAuthStore.getState()
      if (!user && !isDevelopment()) {
        throw new Error('Usuário não autenticado')
      }

      try {
        set({ loading: true })
        
        // Em desenvolvimento, podemos usar dados mockados
        if (isDevelopment()) {
          console.log('🧪 Usando dados mockados para clientes')
          
          // Simula um atraso de rede para testar loading states
          await new Promise(resolve => setTimeout(resolve, 500))
          
          set({
            customers: getMockCustomers(),
            loading: false,
            totalCount: mockCustomers.length,
            hasMore: false,
          })
          return
        }
        
        // Em produção, continua com a lógica normal de busca no Firestore
        const { filters } = get()

        let q = query(
          collection(db, 'customers'),
          where('ownerId', '==', user.uid),
          where('active', '==', true)
        )

        // Aplicar ordenação
        if (filters.sortBy === 'full_name') {
          q = query(q, orderBy('full_name', filters.sortOrder || 'asc'))
        } else if (filters.sortBy === 'recent') {
          q = query(q, orderBy('createdAt', filters.sortOrder || 'desc'))
        } else if (filters.sortBy === 'points') {
          q = query(q, orderBy('points', filters.sortOrder || 'desc'))
        }

        // Aplicar filtros
        if (filters.hasEmail) {
          q = query(q, where('email', '!=', null))
        }

        if (filters.hasNotes) {
          q = query(q, where('notes', '!=', null))
        }

        const snapshot = await getDocs(q)
        const customersData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          phone: formatPhoneNumber(doc.data().phone),
        }))

        // Buscar pontos de fidelidade para cada cliente
        const customersWithPoints = await Promise.all(
          customersData.map(async customer => {
            const pointsRef = doc(db, 'loyalty_points', customer.id)
            const pointsSnap = await getDoc(pointsRef)
            const points = pointsSnap.exists()
              ? pointsSnap.data().points_earned - pointsSnap.data().points_spent
              : 0

            return {
              ...customer,
              points,
            }
          })
        )

        set({ customers: customersWithPoints as Customer[] })
      } catch (error) {
        console.error('Error fetching customers:', error)
        toast.error('Erro ao carregar clientes')
      } finally {
        set({ loading: false })
      }
    },

    checkIfCustomerExists: async (phone: string) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        console.log(`Verificando se cliente com telefone ${phone} já existe`)
        const normalizedPhone = normalizePhone(phone)

        // Buscar todos os clientes ativos
        const q = query(
          collection(db, 'customers'),
          where('ownerId', '==', user.uid),
          where('active', '==', true)
        )

        const snapshot = await getDocs(q)

        // Verificar se algum dos documentos tem o mesmo telefone normalizado
        const matchingCustomer = snapshot.docs.find(doc => {
          const customerPhone = normalizePhone(doc.data().phone || '')
          return customerPhone === normalizedPhone
        })

        if (matchingCustomer) {
          console.log(`Cliente encontrado: ${matchingCustomer.id}`)
          return {
            id: matchingCustomer.id,
            ...matchingCustomer.data(),
            phone: formatPhoneNumber(matchingCustomer.data().phone),
          } as Customer
        }

        console.log('Cliente não encontrado')
        return null
      } catch (error) {
        console.error('Erro ao verificar cliente existente:', error)
        return null
      }
    },

    createCustomer: async (data: CustomerFormValues) => {
      try {
        const { user } = useAuthStore.getState()
        if (!user) throw new Error('Usuário não autenticado')

        // Verificar se o cliente já existe antes de criar
        const existingCustomer = await get().actions.checkIfCustomerExists(data.phone)
        if (existingCustomer) {
          console.log(`Cliente já existe com ID ${existingCustomer.id}, retornando o existente`)
          toast.info('Cliente já cadastrado, usando cadastro existente')
          return existingCustomer
        }

        console.log('Criando novo cliente...')
        const now = Timestamp.now()
        const normalizedPhone = normalizePhone(data.phone)

        const customerData = {
          full_name: data.fullName.trim(),
          phone: normalizedPhone,
          email: data.email || null,
          birth_date: data.birthDate || null,
          notes: data.notes || null,
          ownerId: user.uid,
          createdAt: now,
          updatedAt: now,
          points: 0,
          active: true,
        }

        const docRef = await addDoc(collection(db, 'customers'), customerData)
        const newCustomer = {
          id: docRef.id,
          ...customerData,
          phone: formatPhoneNumber(normalizedPhone),
        } as Customer

        set(state => ({
          customers: [...state.customers, newCustomer],
        }))

        console.log(`Cliente criado com sucesso: ${newCustomer.id}`)
        return newCustomer
      } catch (error) {
        console.error('Erro ao criar cliente:', error)
        throw error
      }
    },

    updateCustomer: async (id: string, data: CustomerFormValues) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })
        const customerRef = doc(db, 'customers', id)

        await updateDoc(customerRef, {
          ...mapFormToDb(data),
          updatedAt: Timestamp.now(),
        })

        await get().actions.fetchCustomers()
        toast.success('Cliente atualizado com sucesso!')
      } catch (error) {
        console.error('Error updating customer:', error)
        toast.error('Erro ao atualizar cliente')
        throw error
      } finally {
        set({ loading: false })
      }
    },

    deleteCustomer: async (id: string) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })
        const customerRef = doc(db, 'customers', id)

        // Soft delete
        await updateDoc(customerRef, {
          active: false,
          deletedAt: Timestamp.now(),
        })

        await get().actions.fetchCustomers()
        toast.success('Cliente excluído com sucesso')
      } catch (error) {
        console.error('Error deleting customer:', error)
        toast.error('Erro ao excluir cliente')
        throw error
      } finally {
        set({ loading: false })
      }
    },

    restoreCustomer: async (id: string) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })
        const customerRef = doc(db, 'customers', id)

        await updateDoc(customerRef, {
          active: true,
          deletedAt: null,
        })

        await get().actions.fetchCustomers()
        toast.success('Cliente restaurado com sucesso')
      } catch (error) {
        console.error('Error restoring customer:', error)
        toast.error('Erro ao restaurar cliente')
        throw error
      } finally {
        set({ loading: false })
      }
    },

    updateFilters: (filters: Partial<CustomerFilters>) => {
      set(state => ({
        filters: {
          ...state.filters,
          ...filters,
        },
        lastVisible: null, // Reset pagination when filters change
      }))
    },

    fetchCustomer: async (id: string) => {
      const { user } = useAuthStore.getState()
      if (!user && !isDevelopment()) {
        throw new Error('Usuário não autenticado')
      }

      try {
        set({ loading: true })

        // Em desenvolvimento, podemos usar dados mockados
        if (isDevelopment()) {
          console.log(`🧪 Buscando cliente mockado com ID: ${id}`)
          
          // Simula um atraso de rede para testar loading states
          await new Promise(resolve => setTimeout(resolve, 300))
          
          const foundCustomer = mockCustomers.find(c => c.id === id)
          if (foundCustomer) {
            set({ selectedCustomer: foundCustomer })
            return
          } else {
            console.warn(`Cliente mockado com ID ${id} não encontrado`)
          }
        }
        
        // Em produção, busca no Firestore
        const customerDoc = await getDoc(doc(db, 'customers', id))
        
        if (customerDoc.exists()) {
          const customerData = customerDoc.data() as DatabaseCustomer
          
          // Se o cliente foi excluído logicamente, tratar como não encontrado
          if (customerData.active === false) {
            toast.error('Cliente não encontrado ou foi removido')
            set({ loading: false })
            return
          }
          
          const customer: Customer = {
            id: customerDoc.id,
            ...customerData,
          }
          
          set({ selectedCustomer: customer })
        } else {
          toast.error('Cliente não encontrado')
        }
      } catch (error) {
        console.error('Error fetching customer:', error)
        toast.error('Erro ao buscar detalhes do cliente')
      } finally {
        set({ loading: false })
      }
    },

    // Método para obter cliente pelo ID do estado atual
    getCustomerById: (id: string) => {
      const { customers, selectedCustomer } = get()

      // Verificar primeiro se o ID corresponde ao cliente selecionado
      if (selectedCustomer && selectedCustomer.id === id) {
        return selectedCustomer
      }

      // Caso contrário, buscar na lista de clientes
      return customers.find(customer => customer.id === id)
    },
  },
  selectedCustomer: undefined,
}))
