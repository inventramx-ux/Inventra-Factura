"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

interface InvoiceDetail {
  id: string
  invoiceNumber: string
  platform: string
  status: string
  dueDate: string | null
  notes: string | null
  createdAt: string
  client: { name: string; email: string; phone: string | null }
  subtotal: number
  taxAmount: number
  total: number
  lineItems: { id: string; description: string; quantity: number; unitPrice: number; total: number }[]
}

const platformLabels: Record<string, string> = {
  amazon: "Amazon",
  mercadolibre: "Mercado Libre",
  ebay: "eBay",
  custom: "Tu Tienda Online",
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviada",
  paid: "Pagada",
  overdue: "Vencida",
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/invoices/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No encontrada")
        return res.json()
      })
      .then(setInvoice)
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="p-8 bg-black min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-8 bg-black min-h-screen">
        <p className="text-gray-400 mb-4">Factura no encontrada.</p>
        <Link href="/dashboard/invoices">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Volver a facturas
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white">Factura {invoice.invoiceNumber}</h1>
            <p className="text-gray-400">
              {platformLabels[invoice.platform] ?? invoice.platform} · {statusLabels[invoice.status] ?? invoice.status}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-white font-medium">{invoice.client.name}</p>
            <p className="text-gray-400">{invoice.client.email}</p>
            {invoice.client.phone && <p className="text-gray-400">{invoice.client.phone}</p>}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Datos de factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-gray-400">Fecha: <span className="text-white">{invoice.createdAt}</span></p>
            {invoice.dueDate && (
              <p className="text-gray-400">Vencimiento: <span className="text-white">{invoice.dueDate}</span></p>
            )}
            {invoice.notes && <p className="text-gray-400 mt-2">Notas: {invoice.notes}</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Líneas de factura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="py-2 pr-4 text-gray-400">Descripción</th>
                  <th className="py-2 pr-4 text-gray-400 text-center">Cantidad</th>
                  <th className="py-2 pr-4 text-gray-400 text-right">Precio unit.</th>
                  <th className="py-2 text-gray-400 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-white/10">
                    <td className="py-3 pr-4 text-white">{item.description}</td>
                    <td className="py-3 pr-4 text-gray-300 text-center">{item.quantity}</td>
                    <td className="py-3 pr-4 text-gray-300 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 text-white text-right">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end gap-6 text-sm border-t border-white/10 pt-4">
            <span className="text-gray-400">Subtotal:</span>
            <span className="text-white">${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-end gap-6 text-sm">
            <span className="text-gray-400">Impuestos:</span>
            <span className="text-white">${invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-end gap-6 text-lg font-bold mt-2">
            <span className="text-white">Total:</span>
            <span className="text-white">${invoice.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Link href="/dashboard/invoices">
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
          Volver a facturas
        </Button>
      </Link>
    </div>
  )
}
