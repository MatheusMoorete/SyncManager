'use client'

import { FC } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Título da página de autenticação */
  title?: string
  /** Subtítulo ou descrição */
  subtitle?: string
}

/**
 * Layout de autenticação com card centralizado
 * @example
 * <AuthLayout title="Login" subtitle="Entre com seu e-mail e senha para acessar sua conta">
 *   {children}
 * </AuthLayout>
 */
export const AuthLayout: FC<AuthLayoutProps> = ({
  title = 'Login',
  subtitle = 'Entre com seu e-mail e senha para acessar sua conta',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative min-h-screen w-full flex flex-col items-center justify-center p-4',
        'bg-neutral-cream',
        className
      )}
      {...props}
    >
      {/* Gradiente de fundo */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-neutral-cream to-neutral-cream/90" 
        style={{
          maskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)'
        }}
      />

      {/* Logo e nome do app */}
      <div className="relative mb-8 flex flex-col items-center">
        <div className="h-12 w-12 rounded-xl bg-soft-sage/10 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-soft-sage" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-charcoal">Brow Studio</h1>
        <p className="text-sm text-charcoal/60">Seu assistente de beleza</p>
      </div>

      {/* Card do formulário */}
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-xl bg-white/80 p-8 shadow-sm backdrop-blur-sm ring-1 ring-charcoal/10">
        {/* Linha decorativa */}
        <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-terracotta/0 via-terracotta/50 to-terracotta/0" />
        
        {/* Cabeçalho do card */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-terracotta" />
            <h2 className="text-xl font-semibold tracking-tight text-charcoal">
              {title}
            </h2>
          </div>
          <p className="text-sm text-charcoal/60">
            {subtitle}
          </p>
        </div>

        {/* Formulário */}
        <div className="mt-8 space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
} 