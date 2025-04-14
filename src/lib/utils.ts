import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Verifica se a aplicação está rodando em ambiente de desenvolvimento ou se
 * a variável de ambiente permite explicitamente o uso de mocks
 */
export function isDevelopment(): boolean {
  // Verifica o ambiente e a variável que controla o uso de mocks
  return process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
}

/**
 * Retorna dados mockados apenas no ambiente de desenvolvimento,
 * usando importação dinâmica para evitar bundling em produção
 * @param getter Função que retorna os dados mockados (deve ser uma função das exportadas por mock-data.ts)
 * @param prodData Dados que serão retornados no ambiente de produção (opcional)
 */
export async function getMockDataAsync<T, P = null>(
  getter: () => Promise<T[]>,
  prodData: P = null as any
): Promise<T[] | P> {
  if (isDevelopment()) {
    try {
      return await getter()
    } catch (error) {
      console.error('Erro ao carregar dados mockados:', error)
      return [] as any
    }
  }
  return prodData
}

/**
 * Helper para carregar dados mockados de forma segura
 * @param mockType O tipo de dados mockados a serem carregados
 */
export async function loadMockData<T>(
  mockType: 'customers' | 'services' | 'appointments' | 'receipts' | 'expenses'
): Promise<T[]> {
  if (!isDevelopment()) return []

  try {
    const mockModule = await import('./mock-data')

    switch (mockType) {
      case 'customers':
        return mockModule.getMockCustomers() as unknown as T[]
      case 'services':
        return mockModule.getMockServices() as unknown as T[]
      case 'appointments':
        return mockModule.getMockAppointments() as unknown as T[]
      case 'receipts':
        return mockModule.getMockReceipts() as unknown as T[]
      case 'expenses':
        return mockModule.getMockExpenses() as unknown as T[]
      default:
        return []
    }
  } catch (error) {
    console.error(`Erro ao carregar dados mockados para ${mockType}:`, error)
    return []
  }
}
