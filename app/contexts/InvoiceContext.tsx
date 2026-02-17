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
  companyLogo?: string
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

// LocalStorage key
const INVOICES_STORAGE_KEY = 'inventra_invoices'

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const totalInvoices = invoices.length
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const uniqueClients = new Set(invoices.map((i) => i.clientName)).size

  // Load invoices from localStorage
  const loadInvoicesFromStorage = () => {
    try {
      const stored = localStorage.getItem(INVOICES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setInvoices(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error("Error loading invoices from localStorage:", error)
      setInvoices([])
    }
  }

  // Save invoices to localStorage
  const saveInvoicesToStorage = (invoicesToSave: Invoice[]) => {
    try {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoicesToSave))
    } catch (error) {
      console.error("Error saving invoices to localStorage:", error)
    }
  }

  const refreshInvoices = async () => {
    setLoading(true)
    try {
      loadInvoicesFromStorage()
    } catch (error) {
      console.error("Error refreshing invoices:", error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const createInvoice = async (invoiceData: Omit<Invoice, "id" | "createdAt" | "status">): Promise<Invoice> => {
    try {
      const newInvoice: Invoice = {
        ...invoiceData,
        id: Date.now().toString(),
        invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
        status: "draft",
        createdAt: new Date().toISOString(),
        dueDate: invoiceData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: invoiceData.paymentMethod || "transferencia",
        notes: invoiceData.notes || "",
        clientEmail: invoiceData.clientEmail || "",
        clientPhone: invoiceData.clientPhone || "",
        clientAddress: invoiceData.clientAddress || "",
        platform: invoiceData.platform || "custom"
      }

      const updatedInvoices = [newInvoice, ...invoices]
      setInvoices(updatedInvoices)
      saveInvoicesToStorage(updatedInvoices)

      return newInvoice
    } catch (error) {
      console.error("Error creating invoice:", error)
      throw error
    }
  }

  const updateInvoice = async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
    try {
      const invoiceIndex = invoices.findIndex(inv => inv.id === id)
      if (invoiceIndex === -1) {
        throw new Error("Invoice not found")
      }

      const updatedInvoice = { ...invoices[invoiceIndex], ...data }
      const updatedInvoices = [...invoices]
      updatedInvoices[invoiceIndex] = updatedInvoice

      setInvoices(updatedInvoices)
      saveInvoicesToStorage(updatedInvoices)

      return updatedInvoice
    } catch (error) {
      console.error("Error updating invoice:", error)
      throw error
    }
  }

  const deleteInvoice = async (id: string): Promise<void> => {
    try {
      const updatedInvoices = invoices.filter(inv => inv.id !== id)
      setInvoices(updatedInvoices)
      saveInvoicesToStorage(updatedInvoices)
    } catch (error) {
      console.error("Error deleting invoice:", error)
      throw error
    }
  }

  const getInvoice = async (id: string): Promise<Invoice | null> => {
    try {
      const invoice = invoices.find(inv => inv.id === id)
      return invoice || null
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
