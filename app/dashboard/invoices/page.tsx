"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import Link from "next/link"
import { Eye, Download, Trash2, Edit2, Loader2 } from "lucide-react"

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  platform: string
  total: number
  createdAt: string
  status: "draft" | "sent" | "paid" | "overdue"
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchInvoices = () => {
    setLoading(true)
    fetch("/api/invoices")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400 border border-green-500/30"
      case "sent":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      case "draft":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30"
      case "overdue":
        return "bg-red-500/20 text-red-400 border border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      paid: "Pagada",
      sent: "Enviada",
      draft: "Borrador",
      overdue: "Vencida",
    }
    return labels[status] || status
  }

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0)

  const handleDelete = (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta factura?")) return
    fetch(`/api/invoices/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) setInvoices((prev) => prev.filter((inv) => inv.id !== id))
      })
      .catch(() => {})
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Mis Facturas</h1>
        <p className="text-gray-400">Gestiona todas tus facturas en un solo lugar</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Facturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{invoices.length}</div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Pagadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {invoices.filter((i) => i.status === "paid").length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">
                  {invoices.filter((i) => i.status === "sent").length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Vencidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400">
                  {invoices.filter((i) => i.status === "overdue").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">Buscar y Filtrar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Buscar por número de factura o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Link href="/dashboard/invoices/new">
                  <Button className="bg-white text-black hover:bg-gray-200">Nueva Factura</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">Listado de Facturas</CardTitle>
              <CardDescription className="text-gray-400">Mostrando {filteredInvoices.length} factura(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10">
                      <TableHead className="text-white">Número</TableHead>
                      <TableHead className="text-white">Cliente</TableHead>
                      <TableHead className="text-white">Plataforma</TableHead>
                      <TableHead className="text-right text-white">Total</TableHead>
                      <TableHead className="text-white">Fecha</TableHead>
                      <TableHead className="text-white">Estado</TableHead>
                      <TableHead className="text-center text-white">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="border-b border-white/10">
                          <TableCell className="font-medium text-white">
                            <Link href={`/dashboard/invoices/${invoice.id}`} className="hover:underline">
                              {invoice.invoiceNumber}
                            </Link>
                          </TableCell>
                          <TableCell className="text-gray-300">{invoice.clientName}</TableCell>
                          <TableCell className="text-gray-300">{invoice.platform}</TableCell>
                          <TableCell className="text-right font-medium text-white">
                            ${invoice.total.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-gray-300">{invoice.createdAt}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                                invoice.status
                              )}`}
                            >
                              {getStatusLabel(invoice.status)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Link href={`/dashboard/invoices/${invoice.id}`} className="text-blue-400 hover:text-blue-300" title="Ver">
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button className="text-gray-400 hover:text-gray-300 cursor-not-allowed" title="Descargar (próximamente)">
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDelete(invoice.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-400">
                          No se encontraron facturas
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredInvoices.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Total en pantalla: <strong className="text-white">${totalAmount.toFixed(2)}</strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
