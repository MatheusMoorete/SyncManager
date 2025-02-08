'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuthForm } from '@/hooks/use-auth-form'

const adjectives = ['inteligente', 'ágil', 'eficiente', 'profissional', 'organizada', 'produtiva']

const signUpSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const { signUp, signInWithGoogle } = useAuthForm()
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

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: SignUpForm) {
    const { confirmPassword, ...signUpData } = data
    await signUp(signUpData)
  }

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

      {/* Lado direito - Formulário de cadastro */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-neutral-cream/20">
        <div className="w-full max-w-[400px] space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-charcoal">Criar conta</h2>
            <p className="mt-2 text-base text-charcoal/60">
              Preencha os dados abaixo para criar sua conta
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-charcoal">Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu nome"
                        type="text"
                        autoComplete="name"
                        className="h-12 bg-white border-charcoal/10 focus:border-soft-sage focus:ring-soft-sage"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

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
                        className="h-12 bg-white border-charcoal/10 focus:border-soft-sage focus:ring-soft-sage"
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
                        autoComplete="new-password"
                        className="h-12 bg-white border-charcoal/10 focus:border-soft-sage focus:ring-soft-sage"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-charcoal">Confirmar senha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirme sua senha"
                        type="password"
                        autoComplete="new-password"
                        className="h-12 bg-white border-charcoal/10 focus:border-soft-sage focus:ring-soft-sage"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 bg-terracotta hover:bg-terracotta/90 text-white font-medium rounded-lg"
              >
                Criar conta
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-charcoal/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-neutral-cream/20 px-4 text-charcoal/60">OU CONTINUE COM</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white hover:bg-neutral-cream/50 border-charcoal/10 text-charcoal font-medium rounded-lg"
                onClick={signInWithGoogle}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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

              <div className="text-center text-sm">
                <p className="text-charcoal/60">
                  Já tem uma conta?{' '}
                  <Link
                    href="/login"
                    className="text-terracotta hover:text-terracotta/80 transition-colors font-medium"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
