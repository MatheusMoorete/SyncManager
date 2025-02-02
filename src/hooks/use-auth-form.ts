import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/index'
import { useAuthStore } from '@/store/auth-store'

interface SignUpData {
  name: string
  email: string
  password: string
}

interface SignInData {
  email: string
  password: string
}

export function useAuthForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { setUser, setLoading } = useAuthStore()

  const handleError = (error: unknown, context: string) => {
    let message = ''

    if (error instanceof Error) {
      // Tratamento de erros específicos do Supabase
      if (error.message.includes('Email not confirmed')) {
        message = 'Email não confirmado. Verifique sua caixa de entrada ou spam para confirmar seu email.'
        // Opcionalmente, podemos reenviar o email de confirmação
        supabase.auth.resend({
          type: 'signup',
          email: (error as any).email || '',
        })
        .then(() => {
          toast({
            title: 'Email de confirmação reenviado',
            description: 'Por favor, verifique sua caixa de entrada.',
          })
        })
      } else if (error.message.includes('Invalid login credentials')) {
        message = 'Email ou senha incorretos'
      } else if (error.message.includes('Email already registered')) {
        message = 'Este email já está cadastrado'
      } else {
        message = `${context}: ${error.message}`
      }
    } else {
      message = `${context}: Erro desconhecido`
    }

    toast({
      variant: 'destructive',
      title: 'Erro',
      description: message,
      duration: 5000
    })

    if (process.env.NODE_ENV === 'development') {
      console.error(`[DEV ERROR] ${message}`, error)
    }
  }

  const signUp = async ({ name, email, password }: SignUpData) => {
    try {
      setLoading(true)
      
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Verificar se o email precisa de confirmação
        if (!authData.user.confirmed_at) {
          toast({
            title: 'Quase lá!',
            description: 'Enviamos um link de confirmação para seu email. Por favor, verifique sua caixa de entrada e spam.',
            duration: 8000,
          })
          router.push('/login?confirmation=pending')
        } else {
          setUser(authData.user)
          router.push('/dashboard')
          toast({
            title: 'Conta criada com sucesso!',
            description: 'Bem-vindo ao Brow Studio.',
          })
        }
      }
    } catch (error) {
      handleError(error, 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async ({ email, password }: SignInData) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Se o erro for de email não confirmado, vamos tratar especialmente
        if (error.message.includes('Email not confirmed')) {
          await supabase.auth.resend({
            type: 'signup',
            email,
          })
          throw new Error('Email not confirmed')
        }
        throw error
      }

      if (data.user) {
        setUser(data.user)
        router.push('/dashboard')
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo de volta.',
        })
      }
    } catch (error) {
      handleError(error, 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) throw error
    } catch (error) {
      handleError(error, 'Erro ao fazer login com Google')
      setLoading(false)
    }
  }

  return {
    signUp,
    signIn,
    signInWithGoogle
  }
} 