'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { auth, db } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth'
import { useAuthStore } from '@/store/auth-store'
import { SignUpFormValues, SignInFormValues } from '@/schemas/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { EmailVerificationAlert } from '@/components/auth/email-verification-alert'

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
          message = 'Método de autenticação não habilitado'
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

  const showEmailVerificationAlert = (isNewUser = false) => {
    toast({
      title: isNewUser ? 'Conta criada com sucesso!' : 'Verificação necessária',
      description: isNewUser
        ? 'Enviamos um link de confirmação para seu email.'
        : 'Seu email ainda não foi verificado. Por favor, verifique sua caixa de entrada e spam.',
      duration: 10000,
    })
  }

  const signUp = async ({ name, email, password }: SignUpFormValues) => {
    try {
      setLoading(true)

      // 1. Criar usuário no Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      // 2. Atualizar o perfil com o nome
      await updateProfile(user, {
        displayName: name,
      })

      // 3. Criar documento do usuário no Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: 'user',
        status: 'pending_verification',
      })

      // 4. Enviar email de verificação
      await sendEmailVerification(user, {
        url: window.location.origin + '/login?verification=success',
      })

      showEmailVerificationAlert(true)
      router.push('/login?verification=pending')
    } catch (error) {
      handleError(error, 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async ({ email, password }: SignInFormValues) => {
    try {
      setLoading(true)
      const { user } = await signInWithEmailAndPassword(auth, email, password)

      if (!user.emailVerified) {
        // Reenviar email de verificação
        await sendEmailVerification(user, {
          url: window.location.origin + '/login?verification=success',
        })
        showEmailVerificationAlert(false)
        return
      }

      // Atualizar status do usuário no Firestore
      if (user.emailVerified) {
        await setDoc(
          doc(db, 'profiles', user.uid),
          {
            status: 'active',
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
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

      // Verificar se é o primeiro login do usuário
      const userDoc = doc(db, 'profiles', user.uid)
      await setDoc(
        userDoc,
        {
          name: user.displayName,
          email: user.email,
          updatedAt: serverTimestamp(),
          role: 'user',
          status: 'active',
        },
        { merge: true }
      )

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
