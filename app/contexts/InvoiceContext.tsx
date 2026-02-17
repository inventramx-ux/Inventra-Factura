"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"

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
  userId: string
}

const mapInvoice = (data: any): Invoice => ({
  id: data.id,
  invoiceNumber: data.invoice_number || data.invoiceNumber,
  clientName: data.client_name || data.clientName,
  clientEmail: data.client_email || data.clientEmail || "",
  clientPhone: data.client_phone || data.clientPhone || "",
  clientAddress: data.client_address || data.clientAddress || "",
  platform: data.platform || "custom",
  items: data.items || [],
  subtotal: Number(data.subtotal || 0),
  tax: Number(data.tax || 0),
  total: Number(data.total || 0),
  status: data.status || "draft",
  createdAt: data.created_at || data.createdAt,
  dueDate: data.due_date || data.dueDate,
  paymentMethod: data.payment_method || data.paymentMethod || "transferencia",
  notes: data.notes || "",
  companyLogo: data.company_logo || data.companyLogo,
  userId: data.user_id || data.userId
})

interface InvoiceContextType {
  invoices: Invoice[]
  loading: boolean
  totalInvoices: number
  totalRevenue: number
  uniqueClients: number
  createInvoice: (invoiceData: Omit<Invoice, "id" | "createdAt" | "status" | "userId">) => Promise<Invoice>
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<Invoice>
  deleteInvoice: (id: string) => Promise<void>
  getInvoice: (id: string) => Promise<Invoice | null>
  refreshInvoices: () => Promise<void>
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const totalInvoices = invoices.length
  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total), 0)
  const uniqueClients = new Set(invoices.map((i) => i.clientName)).size

  const refreshInvoices = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices((data || []).map(mapInvoice))
    } catch (error) {
      console.error("Error refreshing invoices:", error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }, [user])

  const createInvoice = async (invoiceData: Omit<Invoice, "id" | "createdAt" | "status" | "userId">): Promise<Invoice> => {
    if (!user) throw new Error("Debes iniciar sesión para crear una factura")

    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([
          {
            client_name: invoiceData.clientName,
            client_email: invoiceData.clientEmail,
            client_phone: invoiceData.clientPhone,
            client_address: invoiceData.clientAddress,
            platform: invoiceData.platform,
            items: invoiceData.items,
            subtotal: invoiceData.subtotal,
            tax: invoiceData.tax,
            total: invoiceData.total,
            notes: invoiceData.notes,
            company_logo: invoiceData.companyLogo,
            user_id: user.id,
            status: "draft",
            invoice_number: invoiceData.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
            payment_method: invoiceData.paymentMethod || "transferencia",
            due_date: invoiceData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }
        ])
        .select()
        .single()

      if (error) throw error

      const mapped = mapInvoice(data)
      setInvoices(prev => [mapped, ...prev])
      return mapped
    } catch (error) {
      console.error("Error creating invoice:", error)
      throw error
    }
  }

  const updateInvoice = async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
    if (!user) throw new Error("Debes iniciar sesión para actualizar una factura")

    const mappedData: any = {}
    if (data.invoiceNumber) mappedData.invoice_number = data.invoiceNumber
    if (data.paymentMethod) mappedData.payment_method = data.paymentMethod
    if (data.dueDate) mappedData.due_date = data.dueDate
    if (data.clientName) mappedData.client_name = data.clientName
    if (data.clientEmail) mappedData.client_email = data.clientEmail
    if (data.clientPhone) mappedData.client_phone = data.clientPhone
    if (data.clientAddress) mappedData.client_address = data.clientAddress
    if (data.companyLogo) mappedData.company_logo = data.companyLogo

    // Copy other fields that don't need mapping
    const directFields = ['subtotal', 'tax', 'total', 'status', 'notes', 'platform', 'items']
    directFields.forEach(field => {
      if ((data as any)[field] !== undefined) {
        mappedData[field] = (data as any)[field]
      }
    })

    try {
      const { data: updatedData, error } = await supabase
        .from('invoices')
        .update(mappedData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      const mapped = mapInvoice(updatedData)
      setInvoices(prev => prev.map(inv => inv.id === id ? mapped : inv))
      return mapped
    } catch (error) {
      console.error("Error updating invoice:", error)
      throw error
    }
  }

  const deleteInvoice = async (id: string): Promise<void> => {
    if (!user) throw new Error("Debes iniciar sesión para eliminar una factura")

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setInvoices(prev => prev.filter(inv => inv.id !== id))
    } catch (error) {
      console.error("Error deleting invoice:", error)
      throw error
    }
  }

  const getInvoice = async (id: string): Promise<Invoice | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }
      return mapInvoice(data)
    } catch (error) {
      console.error("Error fetching invoice:", error)
      return null
    }
  }

  useEffect(() => {
    if (user) {
      refreshInvoices()
    } else {
      setInvoices([])
      setLoading(false)
    }
  }, [user, refreshInvoices])

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
