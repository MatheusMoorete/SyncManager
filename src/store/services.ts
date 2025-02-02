import { create } from "zustand"
import { Service, ServiceFormValues } from "@/types/service"
import { supabase } from "@/lib/supabase"

interface ServicesStore {
  services: Service[]
  createService: (data: ServiceFormValues) => Promise<void>
  updateService: (id: string, data: ServiceFormValues) => Promise<void>
  deleteService: (id: string) => Promise<void>
}

export const useServices = create<ServicesStore>((set) => ({
  services: [],
  createService: async (data) => {
    const userResponse = await supabase.auth.getUser()
    if (!userResponse.data.user?.id) {
      throw new Error('Usuário não autenticado')
    }

    const { data: newService, error } = await supabase
      .from("services")
      .insert([{
        name: data.name,
        description: data.description || null,
        base_price: data.base_price,
        duration: data.duration,
        is_active: data.is_active,
        owner_id: userResponse.data.user.id
      }])
      .select()
      .single()

    if (error) throw error

    set((state) => ({
      services: [...state.services, newService]
    }))
  },
  updateService: async (id, data) => {
    const { error } = await supabase
      .from("services")
      .update({
        name: data.name,
        description: data.description || null,
        base_price: data.base_price,
        duration: data.duration,
        is_active: data.is_active,
      })
      .eq("id", id)

    if (error) throw error

    set((state) => ({
      services: state.services.map((service) =>
        service.id === id ? {
          ...service,
          name: data.name,
          description: data.description || null,
          base_price: data.base_price,
          duration: data.duration,
          is_active: data.is_active,
          updated_at: new Date().toISOString(),
        } : service
      ),
    }))
  },
  deleteService: async (id) => {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id)

    if (error) throw error

    set((state) => ({
      services: state.services.filter((service) => service.id !== id),
    }))
  },
})) 