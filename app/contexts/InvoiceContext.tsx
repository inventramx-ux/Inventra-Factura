"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  platform: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue"
  createdAt: string
  dueDate: string
  paymentMethod: string
  notes: string
}

interface InvoiceContextType {
  invoices: Invoice[]
  loading: boolean
  totalInvoices: number
  totalRevenue: number
  uniqueClients: number
  createInvoice: (invoiceData: Omit<Invoice, "id" | "createdAt" | "status">) => Promise<Invoice>
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<Invoice>
  deleteInvoice: (id: string) => Promise<void>
  getInvoice: (id: string) => Promise<Invoice | null>
  refreshInvoices: () => Promise<void>
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const totalInvoices = invoices.length
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const uniqueClients = new Set(invoices.map((i) => i.clientName)).size

  const refreshInvoices = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/invoices")
      if (response.ok) {
        const data = await response.json()
        setInvoices(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const createInvoice = async (invoiceData: Omit<Invoice, "id" | "createdAt" | "status">): Promise<Invoice> => {
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) {
        throw new Error("Error creating invoice")
      }

      const newInvoice = await response.json()
      setInvoices(prev => [newInvoice, ...prev])
      return newInvoice
    } catch (error) {
      console.error("Error creating invoice:", error)
      throw error
    }
  }

  const updateInvoice = async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Error updating invoice")
      }

      const updatedInvoice = await response.json()
      setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv))
      return updatedInvoice
    } catch (error) {
      console.error("Error updating invoice:", error)
      throw error
    }
  }

  const deleteInvoice = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error deleting invoice")
      }

      setInvoices(prev => prev.filter(inv => inv.id !== id))
    } catch (error) {
      console.error("Error deleting invoice:", error)
      throw error
    }
  }

  const getInvoice = async (id: string): Promise<Invoice | null> => {
    try {
      const response = await fetch(`/api/invoices/${id}`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error("Error fetching invoice:", error)
      return null
    }
  }

  useEffect(() => {
    refreshInvoices()
  }, [])

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        loading,
        totalInvoices,
        totalRevenue,
        uniqueClients,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoice,
        refreshInvoices,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoice() {
  const context = useContext(InvoiceContext)
  if (context === undefined) {
    throw new Error("useInvoice must be used within an InvoiceProvider")
  }
  return context
}
