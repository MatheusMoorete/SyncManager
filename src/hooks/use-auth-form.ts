'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { auth } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth'
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
      // Tratamento de erros específicos do Firebase
      switch ((error as any).code) {
        case 'auth/email-already-in-use':
          message = 'Este email já está cadastrado'
          break
        case 'auth/invalid-email':
          message = 'Email inválido'
          break
        case 'auth/operation-not-allowed':
          message = 'Operação não permitida'
          break
        case 'auth/weak-password':
          message = 'Senha muito fraca'
          break
        case 'auth/user-disabled':
          message = 'Usuário desabilitado'
          break
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          message = 'Email ou senha incorretos'
          break
        case 'auth/too-many-requests':
          message = 'Muitas tentativas. Tente novamente mais tarde'
          break
        default:
          message = `${context}: ${error.message}`
      }
    } else {
      message = `${context}: Erro desconhecido`
    }

    toast({
      variant: 'destructive',
      title: 'Erro',
      description: message,
      duration: 5000,
    })

    if (process.env.NODE_ENV === 'development') {
      console.error(`[DEV ERROR] ${message}`, error)
    }
  }

  const signUp = async ({ name, email, password }: SignUpData) => {
    try {
      setLoading(true)

      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      // Atualizar o perfil com o nome
      await updateProfile(user, {
        displayName: name,
      })

      // Enviar email de verificação
      await sendEmailVerification(user)

      setUser(user)
      toast({
        title: 'Quase lá!',
        description:
          'Enviamos um link de confirmação para seu email. Por favor, verifique sua caixa de entrada e spam.',
        duration: 8000,
      })
      router.push('/login?confirmation=pending')
    } catch (error) {
      handleError(error, 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async ({ email, password }: SignInData) => {
    try {
      setLoading(true)
      const { user } = await signInWithEmailAndPassword(auth, email, password)

      if (!user.emailVerified) {
        // Reenviar email de verificação
        await sendEmailVerification(user)
        throw new Error('Email não verificado. Reenviamos o link de confirmação.')
      }

      setUser(user)
      router.push('/dashboard')
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta.',
      })
    } catch (error) {
      handleError(error, 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(auth, provider)

      setUser(user)
      router.push('/dashboard')
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta.',
      })
    } catch (error) {
      handleError(error, 'Erro ao fazer login com Google')
    } finally {
      setLoading(false)
    }
  }

  return {
    signUp,
    signIn,
    signInWithGoogle,
  }
}
