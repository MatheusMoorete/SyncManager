'use client'

import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Loader2, Send } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Schema de validação
const phoneSchema = z.object({
  phone: z
    .string()
    .min(11, 'Invalid phone number')
    .max(11, 'Invalid phone number')
    .regex(/^[0-9]+$/, 'Numbers only'),
})

const otpSchema = z.object({
  otp: z.string().length(6, 'Code must be 6 digits'),
})

type PhoneFormData = z.infer<typeof phoneSchema>
type OtpFormData = z.infer<typeof otpSchema>

/**
 * Formulário de autenticação por OTP otimizado para mobile
 * @example
 * <MobileOtpForm />
 */
export const MobileOtpForm: FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const { toast } = useToast()

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
    },
  })

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  })

  const onPhoneSubmit = async (data: PhoneFormData) => {
    try {
      setIsLoading(true)
      // TODO: Integrar com Supabase Phone Auth
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowOtpInput(true)
      toast({
        title: 'Code sent!',
        description: 'Please check your phone for the verification code.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error sending code',
        description: 'Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onOtpSubmit = async (data: OtpFormData) => {
    try {
      setIsLoading(true)
      // TODO: Integrar com Supabase OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: 'Success!',
        description: 'You will be redirected shortly...',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Invalid code',
        description: 'Please check the code and try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!showOtpInput ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        disabled={isLoading}
                        inputMode="numeric"
                        placeholder="Phone number"
                        className="pl-12"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        🇧🇷 +55
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send code
                </>
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isLoading}
                      inputMode="numeric"
                      placeholder="Enter 6-digit code"
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Verify'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={isLoading}
                onClick={() => setShowOtpInput(false)}
                className="w-full h-12"
              >
                Back
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
} 