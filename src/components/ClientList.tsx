import { useEffect, useState } from 'react'
import { useClients, Client } from '@/hooks/useClients'

export function ClientList() {
  const { getClientsByOwner } = useClients()
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    const loadClients = async () => {
      const data = await getClientsByOwner()
      setClients(data)
    }

    loadClients()
  }, [])

  return (
    <div>
      {clients.map(client => (
        <div key={client.id}>
          <h3>{client.fullName}</h3>
          <p>{client.email}</p>
        </div>
      ))}
    </div>
  )
}
