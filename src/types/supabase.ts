export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string
          createdAt: string
          updated_at: string
          name: string
          description: string | null
          price: string
          duration: string
          category: string
          is_active: boolean
          points_earned: string
        }
        Insert: {
          id?: string
          createdAt?: string
          updated_at?: string
          name: string
          description?: string | null
          price: string
          duration: string
          category: string
          is_active?: boolean
          points_earned?: string
        }
        Update: {
          id?: string
          createdAt?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: string
          duration?: string
          category?: string
          is_active?: boolean
          points_earned?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
