'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/firebase'
import { sendEmailVerification } from 'firebase/auth'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail } from 'lucide-react'

export default function ConfirmationPendingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResendEmail = async () => {
    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Usuário não encontrado. Por favor, faça login novamente.',
        })
        router.push('/login')
        return
      }

      await sendEmailVerification(user)
      setCountdown(60) // 60 segundos de cooldown
      toast({
        title: 'Email reenviado!',
        description: 'Verifique sua caixa de entrada e pasta de spam.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao reenviar email',
        description: 'Por favor, tente novamente mais tarde.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Mail className="mx-auto h-12 w-12 text-terracotta" />
          <h1 className="text-2xl font-semibold tracking-tight">Confirme seu email</h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmação para seu email.
            <br />
            Por favor, verifique sua caixa de entrada e spam.
          </p>
        </div>

        <div className="grid gap-4">
          <Button variant="outline" onClick={handleResendEmail} disabled={loading || countdown > 0}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : countdown > 0 ? (
              `Aguarde ${countdown}s para reenviar`
            ) : (
              'Reenviar email de confirmação'
            )}
          </Button>

          <Button variant="ghost" onClick={() => router.push('/login')}>
            Voltar para o login
          </Button>
        </div>
      </div>
    </div>
  )
}
