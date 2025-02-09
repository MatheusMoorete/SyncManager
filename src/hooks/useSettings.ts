'use client'

import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'

export interface UserSettings {
  id: string
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  accessibility: {
    reducedMotion: boolean
    highContrast: boolean
    fontSize: 'small' | 'medium' | 'large'
  }
  calendar: {
    defaultView: 'day' | 'week' | 'month'
    startOfWeek: 0 | 1 // 0 = Sunday, 1 = Monday
    workingHours: {
      start: string
      end: string
    }
  }
}

export function useSettings() {
  const { user } = useAuth()

  const getSettings = async () => {
    if (!user) throw new Error('Usuário não autenticado')

    const docRef = doc(db, 'settings', user.uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserSettings
    }

    // Configurações padrão
    const defaultSettings: Omit<UserSettings, 'id'> = {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium',
      },
      calendar: {
        defaultView: 'week',
        startOfWeek: 0,
        workingHours: {
          start: '09:00',
          end: '18:00',
        },
      },
    }

    await setDoc(docRef, defaultSettings)
    return { id: user.uid, ...defaultSettings }
  }

  const updateSettings = async (data: Partial<Omit<UserSettings, 'id'>>) => {
    if (!user) throw new Error('Usuário não autenticado')

    return updateDoc(doc(db, 'settings', user.uid), data)
  }

  return {
    getSettings,
    updateSettings,
  }
}
