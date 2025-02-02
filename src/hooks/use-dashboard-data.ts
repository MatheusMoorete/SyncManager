import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/index'
import { DashboardData, TimeRange } from '@/types/dashboard'
import { useToast } from '@/components/ui/use-toast'

export function useDashboardData(timeRange: TimeRange) {
  const { toast } = useToast()

  return useQuery<DashboardData>({
    queryKey: ['dashboard', timeRange],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_dashboard_data', { time_range: timeRange })

        if (error) throw error

        return data as DashboardData
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os dados do dashboard.'
        })
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false
  })
} 