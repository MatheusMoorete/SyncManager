import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Função utilitária para combinar classes CSS condicionalmente
 * Usa clsx para condicionais e tailwind-merge para resolver conflitos
 * 
 * @example
 * cn('base-class', {
 *   'conditional-class': condition,
 *   'another-class': true
 * })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 