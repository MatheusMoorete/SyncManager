'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { AuthLayout } from '@/components/layout/auth-layout'
import { useAuthForm } from '@/hooks/use-auth-form'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuthForm()

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  async function onSubmit(data: LoginForm) {
    await signIn(data)
  }

  return (
    <AuthLayout 
      title="Login" 
      subtitle="Entre com seu e-mail e senha para acessar sua conta"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-charcoal">E-mail</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite seu e-mail" 
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="bg-neutral-cream/50 border-charcoal/10 focus:border-soft-sage focus:ring-soft-sage"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-charcoal">Senha</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite sua senha" 
                    type="password"
                    autoComplete="current-password"
                    className="bg-neutral-cream/50 border-charcoal/10 focus:border-soft-sage focus:ring-soft-sage"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-error" />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
          >
            Entrar
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-2 text-charcoal/60 backdrop-blur-sm">
                ou continue com
              </span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full bg-neutral-cream/50 hover:bg-blush-pink/10 border-charcoal/10 text-charcoal"
            onClick={signInWithGoogle}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Entrar com Google
          </Button>

          <div className="mt-6 text-center text-sm">
            <p className="text-charcoal/60">
              Não tem uma conta?{' '}
              <Link 
                href="/signup" 
                className="text-terracotta hover:text-terracotta/80 transition-colors font-medium"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
} 