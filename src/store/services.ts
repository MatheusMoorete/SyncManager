import { create } from 'zustand'
import { Service, ServiceFormValues } from '@/types/service'
import { db } from '@/lib/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { useAuthStore } from './auth-store'
import { toast } from 'sonner'

interface ServicesStore {
  services: Service[]
  createService: (data: ServiceFormValues) => Promise<void>
  updateService: (id: string, data: ServiceFormValues) => Promise<void>
  deleteService: (id: string) => Promise<void>
}

export const useServices = create<ServicesStore>(set => ({
  services: [],
  createService: async data => {
    const { user } = useAuthStore.getState()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const now = Timestamp.now()
      const newService = {
        name: data.name,
        description: data.description || null,
        price: data.price,
        duration: data.duration,
        active: data.active ?? true,
        ownerId: user.uid,
        createdAt: now,
        updatedAt: now,
      }

      const docRef = await addDoc(collection(db, 'services'), newService)

      set(state => ({
        services: [...state.services, { id: docRef.id, ...newService }],
      }))

      toast.success('Serviço criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
      toast.error('Erro ao criar serviço')
      throw error
    }
  },
  updateService: async (id, data) => {
    const { user } = useAuthStore.getState()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const updateData = {
        name: data.name,
        description: data.description || null,
        price: data.price,
        duration: data.duration,
        active: data.active,
        updatedAt: Timestamp.now(),
      }

      await updateDoc(doc(db, 'services', id), updateData)

      set(state => ({
        services: state.services.map(service =>
          service.id === id
            ? {
                ...service,
                ...updateData,
              }
            : service
        ),
      }))

      toast.success('Serviço atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error)
      toast.error('Erro ao atualizar serviço')
      throw error
    }
  },
  deleteService: async id => {
    const { user } = useAuthStore.getState()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    try {
      await deleteDoc(doc(db, 'services', id))

      set(state => ({
        services: state.services.filter(service => service.id !== id),
      }))

      toast.success('Serviço excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
      toast.error('Erro ao excluir serviço')
      throw error
    }
  },
}))
