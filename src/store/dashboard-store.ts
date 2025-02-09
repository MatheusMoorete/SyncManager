import { create } from 'zustand'
import { TimeRange, DashboardData } from '@/types/dashboard'

interface DashboardState {
  data: DashboardData | null
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
}

export const useDashboardStore = create<DashboardState>()(set => ({
  ...initialState,
  actions: {
    fetchDashboardData: async () => {
      set({ loading: true, error: null })
      try {
        // ... rest of the code ...
      } catch (error) {
        set({ error: 'Erro ao carregar dados do dashboard', loading: false })
      }
    },
  },
}))
