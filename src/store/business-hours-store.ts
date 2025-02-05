import { create } from 'zustand'
import { toast } from 'sonner'
import { type BusinessHoursConfig } from '@/types/schedule'
import { supabase } from '@/lib/supabase'
import { PostgrestError } from '@supabase/supabase-js'

interface BusinessHoursState {
  config: BusinessHoursConfig | null
  isLoading: boolean
  actions: {
    fetchConfig: () => Promise<void>
    updateConfig: (config: Partial<BusinessHoursConfig>) => Promise<void>
  }
}

export const useBusinessHoursStore = create<BusinessHoursState>((set, get) => ({
  config: null,
  isLoading: false,
  actions: {
    fetchConfig: async () => {
      try {
        set({ isLoading: true })
        
        // 1. Verificar autenticação
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        
        if (authError) {
          console.error('Erro ao verificar sessão:', authError)
          throw new Error('Erro ao verificar autenticação')
        }
        
        if (!session) {
          console.error('Sessão não encontrada')
          throw new Error('Usuário não autenticado')
        }

        const userId = session.user.id
        console.log('Usuário autenticado:', userId)

        // 2. Buscar configurações existentes
        const { data, error } = await supabase
          .from('business_hours')
          .select('*')
          .eq('owner_id', userId)
          .single()

        // Se houver erro na busca
        if (error) {
          if (error.code === 'PGRST116') {
            console.log('Nenhuma configuração encontrada, criando padrão...')
          } else {
            console.error('Erro ao buscar configurações:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            })
            throw new Error(`Erro ao buscar configurações: ${error.message}`)
          }
        }

        // 3. Se encontrou configurações existentes
        if (data) {
          console.log('Configurações encontradas:', data)
          set({ config: data })
          return
        }

        // 4. Se não encontrou, criar configuração padrão
        console.log('Criando configuração padrão...')
        const defaultConfig: BusinessHoursConfig = {
          starttime: '09:00',
          endtime: '18:00',
          daysoff: [0],
          owner_id: userId
        }

        console.log('Configuração padrão a ser criada:', defaultConfig)

        try {
          const { data: newConfig, error: createError } = await supabase
            .from('business_hours')
            .insert(defaultConfig)
            .select()
            .single()

          if (createError) {
            console.error('Erro ao criar configuração:', {
              code: createError.code,
              message: createError.message,
              details: createError.details,
              hint: createError.hint
            })

            if (createError.code === '23505') {
              console.log('Configuração já existe, buscando novamente...')
              const { data: existingConfig, error: fetchError } = await supabase
                .from('business_hours')
                .select('*')
                .eq('owner_id', userId)
                .single()

              if (fetchError) {
                console.error('Erro ao buscar configuração existente:', fetchError)
                throw new Error('Erro ao buscar configuração existente')
              }

              if (existingConfig) {
                console.log('Configuração existente encontrada:', existingConfig)
                set({ config: existingConfig })
                return
              }
            }

            throw new Error(`Erro ao criar configuração: ${createError.message}`)
          }

          if (!newConfig) {
            throw new Error('Configuração criada mas não retornada')
          }

          console.log('Configuração criada com sucesso:', newConfig)
          set({ config: newConfig })
        } catch (insertError: any) {
          console.error('Erro durante inserção:', {
            error: insertError,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          })
          throw insertError
        }
      } catch (error: any) {
        console.error('Erro completo:', {
          error,
          message: error.message,
          name: error.name,
          stack: error.stack
        })
        toast.error(error.message || 'Erro ao carregar configurações')
      } finally {
        set({ isLoading: false })
      }
    },

    updateConfig: async (newConfig: Partial<BusinessHoursConfig>) => {
      try {
        set({ isLoading: true })
        
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        
        if (authError || !session) {
          throw new Error('Usuário não autenticado')
        }

        const { data, error } = await supabase
          .from('business_hours')
          .update(newConfig)
          .eq('owner_id', session.user.id)
          .select()
          .single()

        if (error) {
          console.error('Erro ao atualizar configurações:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            config: newConfig
          })
          throw new Error(`Erro ao atualizar configurações: ${error.message}`)
        }

        if (!data) {
          throw new Error('Configuração atualizada mas não retornada')
        }

        console.log('Configurações atualizadas com sucesso:', data)
        set({ config: data })
        toast.success('Configurações atualizadas com sucesso!')
      } catch (error: any) {
        console.error('Erro completo:', {
          error,
          message: error.message,
          name: error.name,
          stack: error.stack
        })
        toast.error(error.message || 'Erro ao atualizar configurações')
      } finally {
        set({ isLoading: false })
      }
    }
  }
})) 