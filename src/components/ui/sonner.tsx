'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-charcoal group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-charcoal/60",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:!bg-soft-sage group-[.toaster]:!text-white group-[.toaster]:border-soft-sage",
          error: "group-[.toaster]:!bg-terracotta group-[.toaster]:!text-white group-[.toaster]:border-terracotta",
        },
      }}
      position="top-center"
      expand
      richColors
      {...props}
    />
  )
} 