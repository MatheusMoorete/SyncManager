import { zodResolver } from '@hookform/resolvers/zod'
import { useForm as useReactHookForm } from 'react-hook-form'
import { z } from 'zod'

export const useForm = <T extends z.ZodType>(schema: T) => {
  const form = useReactHookForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  })

  return form
} 