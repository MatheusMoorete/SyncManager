import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  getDocs,
  where,
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'

export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  ownerId: string
  active: boolean
}

export function useServices() {
  const { user } = useAuth()

  const addService = async (serviceData: Omit<Service, 'id' | 'ownerId'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    return addDoc(collection(db, 'services'), {
      ...serviceData,
      ownerId: user.uid,
      createdAt: new Date(),
    })
  }

  const updateService = async (id: string, data: Partial<Service>) => {
    return updateDoc(doc(db, 'services', id), data)
  }

  const deleteService = async (id: string) => {
    return deleteDoc(doc(db, 'services', id))
  }

  const getActiveServices = async () => {
    if (!user) throw new Error('Usuário não autenticado')

    const q = query(
      collection(db, 'services'),
      where('ownerId', '==', user.uid),
      where('active', '==', true)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Service)
    )
  }

  return {
    addService,
    updateService,
    deleteService,
    getActiveServices,
  }
}
