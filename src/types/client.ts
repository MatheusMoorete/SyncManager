export type Client = {
  id: string
  name: string
  email: string
  phone: string
  birthDate: Date
  createdAt: Date
  updatedAt: Date
  // Histórico
  visits: number
  averageTicket: number
  lastVisit?: Date
  // Preferências
  preferences: {
    notes: string
    allergies: string[]
    favoriteServices: string[]
  }
  // Pontos
  points: number
}

export type PointsEvent = {
  id: string
  clientId: string
  type: 'EARNED' | 'REDEEMED'
  value: number
  date: Date
  description: string
}

export type ClientFormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'visits' | 'averageTicket' | 'points'> 