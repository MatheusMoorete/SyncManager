/**
 * @module useToast
 * @description Hook e utilitários para gerenciamento de notificações toast
 *
 * @features
 * - Sistema de notificações em memória
 * - Limite configurável de toasts simultâneos
 * - Auto-dismiss com delay configurável
 * - Suporte a atualização e remoção de toasts
 * - Gerenciamento de estado com reducer
 *
 * @example
 * // Uso básico do hook
 * const { toast } = useToast()
 * toast({ title: "Sucesso", description: "Operação concluída" })
 *
 * // Toast com ação
 * toast({
 *   title: "Erro",
 *   description: "Falha ao salvar",
 *   variant: "destructive",
 *   action: <ToastAction onClick={retry}>Tentar novamente</ToastAction>
 * })
 */

import * as React from 'react'

import type { ToastActionElement, ToastProps } from '@/components/ui/toast'

/**
 * @const TOAST_LIMIT
 * @description Número máximo de toasts exibidos simultaneamente
 */
const TOAST_LIMIT = 1

/**
 * @const TOAST_REMOVE_DELAY
 * @description Tempo em milissegundos antes de remover o toast após dismiss
 */
const TOAST_REMOVE_DELAY = 1000000

/**
 * @type ToasterToast
 * @description Tipo que define a estrutura de um toast
 * @extends {ToastProps}
 */
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

/**
 * @const actionTypes
 * @description Tipos de ações possíveis no reducer de toasts
 */
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const

let count = 0

/**
 * @function genId
 * @description Gera um ID único para cada toast
 * @returns {string} ID gerado
 */
function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

/**
 * @type Action
 * @description União discriminada dos tipos de ações possíveis
 */
type Action =
  | {
      type: ActionType['ADD_TOAST']
      toast: ToasterToast
    }
  | {
      type: ActionType['UPDATE_TOAST']
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType['DISMISS_TOAST']
      toastId?: ToasterToast['id']
    }
  | {
      type: ActionType['REMOVE_TOAST']
      toastId?: ToasterToast['id']
    }

/**
 * @interface State
 * @description Estado global dos toasts
 */
interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * @function addToRemoveQueue
 * @description Adiciona um toast à fila de remoção
 * @param {string} toastId - ID do toast a ser removido
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * @function reducer
 * @description Reducer para gerenciar o estado dos toasts
 * @param {State} state - Estado atual
 * @param {Action} action - Ação a ser executada
 * @returns {State} Novo estado
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map(t => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach(toast => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

/**
 * @function dispatch
 * @description Dispara uma ação e notifica os listeners
 * @param {Action} action - Ação a ser disparada
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach(listener => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, 'id'>

/**
 * @function toast
 * @description Cria e exibe um novo toast
 * @param {Toast} props - Propriedades do toast
 * @returns {Object} Objeto com métodos para controlar o toast
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: open => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * @hook useToast
 * @description Hook para gerenciar toasts na aplicação
 * @returns {Object} Objeto com estado dos toasts e métodos de controle
 *
 * @example
 * const { toast, dismiss } = useToast()
 *
 * // Criar toast
 * toast({ title: "Sucesso", description: "Operação realizada" })
 *
 * // Dispensar todos os toasts
 * dismiss()
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
}

export { useToast, toast }
