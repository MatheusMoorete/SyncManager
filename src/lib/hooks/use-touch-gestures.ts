/**
 * @hook useTouchGestures
 * @description Hook para gerenciar gestos móveis (swipe, long press, etc)
 */

import { useEffect, useRef, useState } from 'react'

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onLongPress?: () => void
  swipeThreshold?: number
  longPressDelay?: number
}

interface TouchState {
  startX: number
  startY: number
  startTime: number
}

export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500
}: TouchGestureOptions) {
  const touchRef = useRef<TouchState | null>(null)
  const timerRef = useRef<NodeJS.Timeout>()
  const [isLongPressing, setIsLongPressing] = useState(false)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now()
    }

    // Inicia timer para long press
    if (onLongPress) {
      setIsLongPressing(true)
      timerRef.current = setTimeout(() => {
        if (isLongPressing) {
          onLongPress()
        }
      }, longPressDelay)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchRef.current.startX
    const deltaY = touch.clientY - touchRef.current.startY

    // Cancela long press se houver movimento significativo
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setIsLongPressing(false)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return

    // Limpa timer de long press
    setIsLongPressing(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchRef.current.startX
    const deltaY = touch.clientY - touchRef.current.startY
    const deltaTime = Date.now() - touchRef.current.startTime

    // Verifica se é um swipe válido (rápido e mais horizontal que vertical)
    if (deltaTime < 250 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }
    }

    touchRef.current = null
  }

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    isLongPressing
  }
} 