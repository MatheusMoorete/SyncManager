'use client'

/**
 * @module Input
 * @description Componente de input reutilizável com suporte a mobile e diversos tipos de entrada
 *
 * @features
 * - Design mobile-first com suporte a touch
 * - Múltiplos tipos de entrada (text, number, email, etc)
 * - Suporte a inputMode para teclados mobile otimizados
 * - Estados visuais para focus, disabled e hover
 * - Estilização consistente com o design system
 * - Suporte a upload de arquivos
 *
 * @example
 * // Input básico
 * <Input placeholder="Digite seu nome" />
 *
 * // Input numérico
 * <Input type="number" inputMode="numeric" placeholder="Idade" />
 *
 * // Input de email
 * <Input
 *   type="email"
 *   inputMode="email"
 *   placeholder="seu@email.com"
 *   required
 * />
 *
 * // Input customizado
 * <Input
 *   className="h-14 text-lg"
 *   placeholder="Input grande"
 * />
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * @interface InputProps
 * @description Props do componente Input
 * @extends {React.InputHTMLAttributes<HTMLInputElement>} - Herda todas as props nativas do input
 *
 * @property {string} [type] - Tipo do input (text, number, email, etc)
 * @property {string} [inputMode] - Modo de entrada otimizado para mobile
 * @property {string} [className] - Classes CSS adicionais
 * @property {boolean} [disabled] - Estado desabilitado do input
 * @property {string} [placeholder] - Texto placeholder
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
}

/**
 * @function Input
 * @description Componente base de input com suporte a mobile e diversos tipos de entrada
 * @param {InputProps} props - Props do componente
 * @returns {JSX.Element} Input estilizado com as props fornecidas
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputMode, ...props }, ref) => {
    return (
      <input
        type={type}
        inputMode={inputMode}
        className={cn(
          // Base
          'flex h-12 w-full rounded-md border text-base shadow-sm transition-colors',
          // Cores e Bordas
          'border-charcoal/20 bg-white text-text-primary',
          // Placeholder
          'placeholder:text-text-muted',
          // Padding
          'px-3 py-2',
          // Focus
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-sage/20 focus-visible:ring-offset-2 focus-visible:border-charcoal/30',
          // Estados
          'hover:border-charcoal/30',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-cream/50',
          // File input
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          // Touch
          'touch-manipulation',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
