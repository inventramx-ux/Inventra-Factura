"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
}

interface ClientContextType {
  clients: Client[]
  loading: boolean
  createClient: (clientData: Omit<Client, "id" | "createdAt">) => Promise<Client>
  updateClient: (id: string, data: Partial<Client>) => Promise<Client>
  deleteClient: (id: string) => Promise<void>
  getClient: (id: string) => Promise<Client | null>
  refreshClients: () => Promise<void>
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

// LocalStorage key
const CLIENTS_STORAGE_KEY = 'inventra_clients'

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  // Load clients from localStorage
  const loadClientsFromStorage = () => {
    try {
      const stored = localStorage.getItem(CLIENTS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setClients(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error("Error loading clients from localStorage:", error)
      setClients([])
    }
  }

  // Save clients to localStorage
  const saveClientsToStorage = (clientsToSave: Client[]) => {
    try {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clientsToSave))
    } catch (error) {
      console.error("Error saving clients to localStorage:", error)
    }
  }

  const refreshClients = async () => {
    setLoading(true)
    try {
      loadClientsFromStorage()
    } catch (error) {
      console.error("Error refreshing clients:", error)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const createClient = async (clientData: Omit<Client, "id" | "createdAt">): Promise<Client> => {
    try {
      const newClient: Client = {
        ...clientData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        email: clientData.email || "",
        phone: clientData.phone || "",
        address: clientData.address || ""
      }

      const updatedClients = [newClient, ...clients]
      setClients(updatedClients)
      saveClientsToStorage(updatedClients)
      
      return newClient
    } catch (error) {
      console.error("Error creating client:", error)
      throw error
    }
  }

  const updateClient = async (id: string, data: Partial<Client>): Promise<Client> => {
    try {
      const clientIndex = clients.findIndex(client => client.id === id)
      if (clientIndex === -1) {
        throw new Error("Client not found")
      }

      const updatedClient = { ...clients[clientIndex], ...data }
      const updatedClients = [...clients]
      updatedClients[clientIndex] = updatedClient
      
      setClients(updatedClients)
      saveClientsToStorage(updatedClients)
      
      return updatedClient
    } catch (error) {
      console.error("Error updating client:", error)
      throw error
    }
  }

  const deleteClient = async (id: string): Promise<void> => {
    try {
      const updatedClients = clients.filter(client => client.id !== id)
      setClients(updatedClients)
      saveClientsToStorage(updatedClients)
    } catch (error) {
      console.error("Error deleting client:", error)
      throw error
    }
  }

  const getClient = async (id: string): Promise<Client | null> => {
    try {
      const client = clients.find(client => client.id === id)
      return client || null
    } catch (error) {
      console.error("Error fetching client:", error)
      return null
    }
  }

  useEffect(() => {
    refreshClients()
  }, [])

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
