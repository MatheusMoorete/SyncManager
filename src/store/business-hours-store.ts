import { create } from 'zustand'
import { toast } from 'sonner'
import { type BusinessHoursConfig } from '@/types/schedule'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useAuthStore } from './auth-store'

interface BusinessHoursState {
  config: BusinessHoursConfig | null
  loading: boolean
  actions: {
    fetchConfig: () => Promise<void>
    updateConfig: (config: Partial<BusinessHoursConfig>) => Promise<void>
  }
}

export const useBusinessHoursStore = create<BusinessHoursState>((set, get) => ({
  config: null,
  loading: false,
  actions: {
    fetchConfig: async () => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })

        const docRef = doc(db, 'business_hours', user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          console.log('Configurações encontradas:', docSnap.data())
          set({ config: docSnap.data() as BusinessHoursConfig })
          return
        }

        // Criar configuração padrão se não existir
        const defaultConfig: BusinessHoursConfig = {
          starttime: '09:00',
          endtime: '18:00',
          daysoff: [0],
          ownerId: user.uid,
        }

        await setDoc(docRef, defaultConfig)
        console.log('Configuração padrão criada:', defaultConfig)
        set({ config: defaultConfig })
      } catch (error) {
        console.error('Erro completo:', error)
        toast.error(error instanceof Error ? error.message : 'Erro ao carregar configurações')
      } finally {
        set({ loading: false })
      }
    },

    updateConfig: async (newConfig: Partial<BusinessHoursConfig>) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })

        const docRef = doc(db, 'business_hours', user.uid)
        // Remover o campo lunchbreak se for undefined
        const updateData = { ...newConfig }
        if (updateData.lunchbreak === undefined) {
          delete updateData.lunchbreak
        }
        await updateDoc(docRef, updateData)

        // Atualizar o estado local
        set(state => ({
          config: state.config ? { ...state.config, ...newConfig } : null,
        }))

        console.log('Configurações atualizadas com sucesso:', newConfig)
        toast.success('Configurações atualizadas com sucesso!')
      } catch (error) {
        console.error('Erro completo:', error)
        toast.error(error instanceof Error ? error.message : 'Erro ao atualizar configurações')
      } finally {
        set({ loading: false })
      }
    },
  },
}))
