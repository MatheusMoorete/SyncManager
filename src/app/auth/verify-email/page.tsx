'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { applyActionCode } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const oobCode = searchParams.get('oobCode')

    if (!oobCode) {
      setStatus('error')
      setError('Código de verificação inválido ou expirado.')
      return
    }

    const verifyEmail = async () => {
      try {
        await applyActionCode(auth, oobCode)
        setStatus('success')
      } catch (error) {
        setStatus('error')
        setError(
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao verificar seu email. Tente novamente.'
        )
      }
    }

    verifyEmail()
  }, [searchParams])

  const handleContinue = () => {
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-cream/20">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
            <p className="text-center text-lg font-medium">Verificando seu email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <h1 className="text-center text-2xl font-semibold text-charcoal">
              Email verificado com sucesso!
            </h1>
            <p className="text-center text-muted-foreground">
              Seu email foi verificado com sucesso. Agora você pode fazer login na sua conta.
            </p>
            <div className="flex justify-center">
              <Button onClick={handleContinue} className="bg-terracotta hover:bg-terracotta/90">
                Continuar para o login
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <h1 className="text-center text-2xl font-semibold text-charcoal">
              Erro na verificação
            </h1>
            <p className="text-center text-muted-foreground">{error}</p>
            <div className="flex justify-center">
              <Button onClick={handleContinue} variant="outline">
                Voltar para o login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
