'use client'

import { LoginForm } from '@/components/auth/login-form'
import { useEffect, useState } from 'react'

const adjectives = ['inteligente', 'ágil', 'eficiente', 'profissional', 'organizada', 'produtiva']

export default function LoginPage() {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const animateText = () => {
      const currentWord = adjectives[currentIndex]

      if (!isDeleting) {
        // Digitando
        if (displayText !== currentWord) {
          setShowCursor(true)
          timeout = setTimeout(() => {
            setDisplayText(currentWord.substring(0, displayText.length + 1))
          }, 100) // Velocidade de digitação
        } else {
          // Palavra completa, aguarda antes de começar a apagar
          setShowCursor(false)
          timeout = setTimeout(() => {
            setIsDeleting(true)
          }, 2000) // Tempo que a palavra fica completa
        }
      } else {
        // Apagando
        setShowCursor(true)
        if (displayText === '') {
          setIsDeleting(false)
          setCurrentIndex(prev => (prev + 1) % adjectives.length)
        } else {
          timeout = setTimeout(() => {
            setDisplayText(displayText.slice(0, -1))
          }, 50) // Velocidade de apagar
        }
      }
    }

    timeout = setTimeout(animateText, 100)
    return () => clearTimeout(timeout)
  }, [displayText, currentIndex, isDeleting])

  return (
    <div className="min-h-screen w-full flex">
      {/* Lado esquerdo - Background e mensagem */}
      <div className="hidden lg:flex lg:w-[60%] bg-charcoal relative flex-col items-start justify-center p-16">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/90 to-charcoal z-10" />

        <div className="relative z-20 text-white max-w-lg">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center">
              <div className="h-6 w-6 rounded bg-white/90" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">SyncManager</h2>
              <p className="text-white/60">Sistema de Gestão</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-6">
            Gerencie seu negócio de forma{' '}
            <span className="inline-block min-w-[140px]">
              {displayText}
              {showCursor && <span className="animate-pulse">|</span>}
            </span>
          </h1>
          <p className="text-xl text-white/80">
            Organize seus atendimentos, acompanhe suas finanças e fidelize seus clientes em uma
            única plataforma.
          </p>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-neutral-cream/20">
        <div className="w-full max-w-[400px] space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-charcoal">Bem-vindo de volta!</h2>
            <p className="mt-2 text-base text-charcoal/60">
              Entre com suas credenciais para acessar sua conta
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
