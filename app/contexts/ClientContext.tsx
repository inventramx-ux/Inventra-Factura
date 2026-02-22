"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
  userId: string
}

interface ClientRow {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  user_id: string
}

const mapClient = (data: ClientRow): Client => ({
  id: data.id,
  name: data.name,
  email: data.email || "",
  phone: data.phone || "",
  address: data.address || "",
  createdAt: data.created_at,
  userId: data.user_id
})

interface ClientContextType {
  clients: Client[]
  loading: boolean
  createClient: (clientData: Omit<Client, "id" | "createdAt" | "userId">) => Promise<Client>
  updateClient: (id: string, data: Partial<Client>) => Promise<Client>
  deleteClient: (id: string) => Promise<void>
  getClient: (id: string) => Promise<Client | null>
  refreshClients: () => Promise<void>
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const refreshClients = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) throw error
      setClients((data || []).map(mapClient))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error("Error refreshing clients (full):", message)
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [user])

  const createClient = async (clientData: Omit<Client, "id" | "createdAt" | "userId">): Promise<Client> => {
    if (!user) throw new Error("Debes iniciar sesión para crear un cliente")

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            ...clientData,
            user_id: user.id,
            email: clientData.email || "",
            phone: clientData.phone || "",
            address: clientData.address || ""
          }
        ])
        .select()
        .single()

      if (error) throw error

      const mapped = mapClient(data)
      setClients(prev => [mapped, ...prev])
      return mapped
    } catch (error) {
      console.error("Error creating client:", error)
      throw error
    }
  }

  const updateClient = async (id: string, data: Partial<Client>): Promise<Client> => {
    if (!user) throw new Error("Debes iniciar sesión para actualizar un cliente")

    try {
      const { data: updatedData, error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      const mapped = mapClient(updatedData)
      setClients(prev => prev.map(client => client.id === id ? mapped : client))
      return mapped
    } catch (error) {
      console.error("Error updating client:", error)
      throw error
    }
  }

  const deleteClient = async (id: string): Promise<void> => {
    if (!user) throw new Error("Debes iniciar sesión para eliminar un cliente")

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setClients(prev => prev.filter(client => client.id !== id))
    } catch (error) {
      console.error("Error deleting client:", error)
      throw error
    }
  }

  const getClient = async (id: string): Promise<Client | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }
      return mapClient(data)
    } catch (error) {
      console.error("Error fetching client:", error)
      return null
    }
  }

  useEffect(() => {
    if (user) {
      refreshClients()

      // Set up Realtime subscription
      const channel = supabase
        .channel('public:clients')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newClient = mapClient(payload.new as ClientRow)
              setClients(prev => {
                // Avoid duplicates if the state was already updated manually
                if (prev.some(c => c.id === newClient.id)) return prev
                return [newClient, ...prev]
              })
            } else if (payload.eventType === 'UPDATE') {
              const updatedClient = mapClient(payload.new as ClientRow)
              setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c))
            } else if (payload.eventType === 'DELETE') {
              setClients(prev => prev.filter(c => c.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      setClients([])
      setLoading(false)
    }
  }, [user, refreshClients])

  return (
    <ClientContext.Provider
      value={{
        clients,
        loading,
        createClient,
        updateClient,
        deleteClient,
        getClient,
        refreshClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider")
  }
  return context
}
