import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'

export interface Client {
  id: string
  fullName: string
  email: string | null
  phone: string
  birthDate: string | null
  notes: string | null
  ownerId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  points: number
  active: boolean
}

export function useClients() {
  const { user } = useAuth()

  const addClient = async (
    clientData: Omit<Client, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'points' | 'active'>
  ) => {
    if (!user) throw new Error('Usuário não autenticado')

    const now = Timestamp.now()
    return addDoc(collection(db, 'customers'), {
      ...clientData,
      ownerId: user.uid,
      createdAt: now,
      updatedAt: now,
      points: 0,
      active: true,
    })
  }

  const updateClient = async (id: string, data: Partial<Client>) => {
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    }
    return updateDoc(doc(db, 'customers', id), updateData)
  }

  const deleteClient = async (id: string) => {
    return updateDoc(doc(db, 'customers', id), {
      active: false,
      updatedAt: Timestamp.now(),
    })
  }

  const getClientsByOwner = async () => {
    if (!user) throw new Error('Usuário não autenticado')

    const q = query(
      collection(db, 'customers'),
      where('ownerId', '==', user.uid),
      where('active', '==', true)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Client)
    )
  }

  return {
    addClient,
    updateClient,
    deleteClient,
    getClientsByOwner,
  }
}
