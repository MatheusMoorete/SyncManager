'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        // Usuário está autenticado, redirecionar para o dashboard
        router.push('/dashboard')
      } else {
        // Usuário não está autenticado, redirecionar para o login
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Autenticando...</h1>
        <p className="text-muted-foreground">Por favor, aguarde.</p>
      </div>
    </div>
  )
}
