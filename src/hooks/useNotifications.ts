import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'appointment' | 'reminder' | 'system'
  status: 'unread' | 'read'
  createdAt: Timestamp
  ownerId: string
  metadata?: {
    appointmentId?: string
    clientId?: string
  }
}

export function useNotifications() {
  const { user } = useAuth()

  const getRecentNotifications = async (limitCount = 10) => {
    if (!user) throw new Error('Usuário não autenticado')

    const q = query(
      collection(db, 'notifications'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Notification)
    )
  }

  const markAsRead = async (notificationId: string) => {
    if (!user) throw new Error('Usuário não autenticado')

    return updateDoc(doc(db, 'notifications', notificationId), {
      status: 'read',
      readAt: Timestamp.now(),
    })
  }

  const addNotification = async (
    data: Omit<Notification, 'id' | 'ownerId' | 'createdAt' | 'status'>
  ) => {
    if (!user) throw new Error('Usuário não autenticado')

    return addDoc(collection(db, 'notifications'), {
      ...data,
      ownerId: user.uid,
      status: 'unread',
      createdAt: Timestamp.now(),
    })
  }

  return {
    getRecentNotifications,
    markAsRead,
    addNotification,
  }
}
