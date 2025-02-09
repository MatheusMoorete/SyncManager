import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'

export interface Profile {
  id: string
  name: string
  email: string
  phone: string
  businessHours: {
    start: string
    end: string
  }
  workDays: number[] // 0-6 representing Sunday-Saturday
}

export function useProfile() {
  const { user } = useAuth()

  const getProfile = async () => {
    if (!user) throw new Error('Usuário não autenticado')

    const docRef = doc(db, 'profiles', user.uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Profile
    }
    return null
  }

  const createProfile = async (profileData: Omit<Profile, 'id' | 'email'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    return setDoc(doc(db, 'profiles', user.uid), {
      ...profileData,
      email: user.email,
      createdAt: new Date(),
    })
  }

  const updateProfile = async (data: Partial<Omit<Profile, 'id' | 'email'>>) => {
    if (!user) throw new Error('Usuário não autenticado')

    return updateDoc(doc(db, 'profiles', user.uid), data)
  }

  return {
    getProfile,
    createProfile,
    updateProfile,
  }
}
