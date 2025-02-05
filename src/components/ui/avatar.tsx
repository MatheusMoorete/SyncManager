'use client'

/**
 * @component Avatar
 * @description Componente para exibir avatares de usuário com fallback e suporte a gestos
 * 
 * @features
 * - Suporte a imagens e fallback com iniciais
 * - Gestos móveis (long press, swipe)
 * - Verificação de contraste WCAG 2.1 AA
 * - Animações suaves e feedback visual
 * - Totalmente acessível
 * 
 * @example
 * // Avatar básico com fallback
 * <Avatar>
 *   <AvatarImage src="/user.jpg" alt="John Doe" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 * 
 * // Avatar com gestos
 * <Avatar 
 *   onLongPress={() => console.log('Long press')}
 *   onSwipeLeft={() => console.log('Swipe left')}
 *   onSwipeRight={() => console.log('Swipe right')}
 * >
 *   <AvatarImage src="/user.jpg" alt="User" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 */

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { useTouchGestures } from "@/lib/hooks/use-touch-gestures"
import { ContrastProvider } from "@/components/ui/contrast-checker"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  onLongPress?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  size?: 'sm' | 'md' | 'lg'
}

const avatarSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ 
  className, 
  onLongPress, 
  onSwipeLeft,
  onSwipeRight,
  size = 'md',
  ...props 
}, ref) => {
  const { touchHandlers, isLongPressing } = useTouchGestures({
    onLongPress,
    onSwipeLeft,
    onSwipeRight,
    longPressDelay: 500,
    swipeThreshold: 30
  })

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        avatarSizes[size],
        "ring-offset-background transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal focus-visible:ring-offset-2",
        "hover:scale-105",
        isLongPressing && "scale-95",
        "touch-manipulation will-change-transform",
        className
      )}
      {...touchHandlers}
      {...props}
    />
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(
      "aspect-square h-full w-full",
      "object-cover transition-opacity duration-200",
      className
    )}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <ContrastProvider
    foreground="#2F394D" // text-text-primary
    background="#F5F0E6" // bg-neutral-cream
    size="small"
  >
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full",
        "bg-neutral-cream text-text-primary",
        "text-sm font-medium uppercase",
        "animate-in fade-in-50 duration-200",
        className
      )}
      {...props}
    />
  </ContrastProvider>
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
export type { AvatarProps } 