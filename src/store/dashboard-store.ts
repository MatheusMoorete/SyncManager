import { create } from 'zustand'
import { TimeRange } from '@/types/dashboard'

interface DashboardState {
  timeRange: TimeRange
  isLoading: boolean
  setTimeRange: (range: TimeRange) => void
  setLoading: (loading: boolean) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  timeRange: '30d',
  isLoading: false,
  setTimeRange: (range) => set({ timeRange: range }),
  setLoading: (loading) => set({ isLoading: loading })
})) 