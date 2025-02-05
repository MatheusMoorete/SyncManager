'use client'

/**
 * @component ContrastChecker
 * @description Componente para testar contraste de cores conforme WCAG 2.1 AA
 * 
 * @example
 * // Teste de contraste básico
 * <ContrastChecker
 *   foreground="#000000"
 *   background="#FFFFFF"
 *   size="large"
 * />
 */

import { useContrastCheck } from '@/lib/hooks/use-contrast-check'
import { cn } from '@/lib/utils'

interface ContrastCheckerProps {
  foreground: string
  background: string
  size?: 'large' | 'small'
  children?: React.ReactNode
}

export function ContrastChecker({
  foreground,
  background,
  size = 'small',
  children
}: ContrastCheckerProps) {
  const { isValid, ratio, requiredRatio } = useContrastCheck(foreground, background, size)

  if (process.env.NODE_ENV === 'production') {
    return <>{children}</>
  }

  return (
    <div className="relative group">
      {children}
      
      {/* Indicador de Contraste */}
      <div className={cn(
        "hidden group-hover:block absolute top-full left-0 z-50 mt-2 p-4 rounded-md shadow-lg",
        "bg-white border border-charcoal/10",
        "text-sm"
      )}>
        <div className="space-y-2">
          <div className="font-medium">
            Verificação de Contraste WCAG 2.1 AA
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-4 w-4 rounded-full",
              isValid ? "bg-success" : "bg-error"
            )} />
            <span>
              {isValid ? "Aprovado" : "Reprovado"}
            </span>
          </div>
          <div className="text-text-secondary">
            <div>Razão: {ratio.toFixed(2)}:1</div>
            <div>Mínimo requerido: {requiredRatio}:1</div>
            <div>Tamanho do texto: {size === 'large' ? 'Grande (18pt+)' : 'Normal'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * @component ContrastProvider
 * @description Wrapper para testar contraste em desenvolvimento
 */
export function ContrastProvider({
  children,
  ...props
}: ContrastCheckerProps) {
  if (process.env.NODE_ENV === 'production') {
    return <>{children}</>
  }

  return (
    <ContrastChecker {...props}>
      {children}
    </ContrastChecker>
  )
} 