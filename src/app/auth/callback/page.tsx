'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { supabase } from '@/lib/supabase/index'
import { useToast } from '@/components/ui/use-toast'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuthStore()
  const { toast } = useToast()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Verificar se é um callback de confirmação de email
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        
        if (token_hash && type === 'email_confirmation') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email',
          })
          
          if (error) throw error

          // Email confirmado com sucesso
          toast({
            title: 'Email confirmado!',
            description: 'Você já pode fazer login.',
          })
          
          router.push('/login')
          return
        }

        // Se não for confirmação de email, tenta pegar o usuário atual
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error

        if (user) {
          setUser(user)
          router.push('/dashboard')
          toast({
            title: 'Login realizado com sucesso!',
            description: 'Bem-vindo ao Brow Studio.',
          })
        } else {
          throw new Error('Usuário não encontrado')
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        toast({
          variant: 'destructive',
          title: 'Erro na autenticação',
          description: 'Houve um problema ao processar sua autenticação. Por favor, tente novamente.',
        })
        router.push('/login')
      }
    }

    handleCallback()
  }, [router, setUser, searchParams, toast])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <h1 className="text-2xl font-semibold mb-2">Autenticando...</h1>
        <p className="text-muted-foreground">Por favor, aguarde.</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <h1 className="text-2xl font-semibold mb-2">Carregando...</h1>
          <p className="text-muted-foreground">Por favor, aguarde.</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
} 