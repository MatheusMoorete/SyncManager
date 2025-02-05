import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  // Em vez de lançar um erro, vamos fazer log e usar valores padrão em dev
  if (process.env.NODE_ENV === 'development') {
    console.warn('Missing Supabase credentials')
  }
  // Em produção, ainda lançamos o erro
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing Supabase credentials')
  }
}

// Implementar padrão singleton para o cliente Supabase
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createClient(
    supabaseUrl || '',
    supabaseKey || '',
    {
      auth: {
        persistSession: true,
        storageKey: 'brow-studio-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
    }
  )

  return supabaseInstance
}

// Exportar uma única instância do cliente
export const supabase = getSupabase() 