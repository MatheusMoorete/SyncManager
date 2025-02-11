'use client'

interface EmailVerificationAlertProps {
  isNewUser: boolean
}

export function EmailVerificationAlert({ isNewUser }: EmailVerificationAlertProps) {
  return (
    <div className="mt-2 space-y-2">
      <p className="font-medium">
        {isNewUser
          ? 'Enviamos um link de confirmação para seu email.'
          : 'Seu email ainda não foi verificado.'}
      </p>
      <p className="text-sm text-muted-foreground">
        Por favor, verifique sua caixa de entrada e spam. Um novo link de confirmação foi enviado
        para seu email.
      </p>
    </div>
  )
}
