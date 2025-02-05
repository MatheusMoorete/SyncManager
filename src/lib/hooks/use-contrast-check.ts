/**
 * @hook useContrastCheck
 * @description Hook para verificar o contraste entre cores conforme WCAG 2.1 AA
 */

import { useEffect, useState } from 'react'

interface ContrastResult {
  isValid: boolean
  ratio: number
  requiredRatio: number
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function useContrastCheck(
  foreground: string,
  background: string,
  size: 'large' | 'small' = 'small'
): ContrastResult {
  const [result, setResult] = useState<ContrastResult>({
    isValid: false,
    ratio: 0,
    requiredRatio: size === 'large' ? 3 : 4.5
  })

  useEffect(() => {
    // Converte cores hex para RGB
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
      hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [0, 0, 0]
    }

    const [fR, fG, fB] = hexToRgb(foreground)
    const [bR, bG, bB] = hexToRgb(background)

    const fLum = getLuminance(fR, fG, fB)
    const bLum = getLuminance(bR, bG, bB)
    const ratio = getContrastRatio(fLum, bLum)
    const requiredRatio = size === 'large' ? 3 : 4.5

    setResult({
      isValid: ratio >= requiredRatio,
      ratio,
      requiredRatio
    })
  }, [foreground, background, size])

  return result
} 