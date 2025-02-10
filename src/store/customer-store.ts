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
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })
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

    createCustomer: async (data: CustomerFormValues) => {
      try {
        const { user } = useAuthStore.getState()
        if (!user) throw new Error('Usuário não autenticado')

        const now = Timestamp.now()
        const customerData = {
          full_name: data.fullName.trim(),
          phone: data.phone,
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
        const newCustomer = { id: docRef.id, ...customerData } as Customer

        set(state => ({
          customers: [...state.customers, newCustomer],
        }))

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
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })
        const customerRef = doc(db, 'customers', id)
        const customerDoc = await getDoc(customerRef)

        if (!customerDoc.exists()) {
          throw new Error('Cliente não encontrado')
        }

        const customerData = customerDoc.data() as Customer
        set({ selectedCustomer: { id: customerDoc.id, ...customerData } })
      } catch (error) {
        console.error('Error fetching customer:', error)
        toast.error('Erro ao buscar cliente')
        throw error
      } finally {
        set({ loading: false })
      }
    },
  },
  selectedCustomer: undefined,
}))
