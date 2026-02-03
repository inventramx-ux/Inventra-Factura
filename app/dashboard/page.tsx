"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { TrendingUp, FileText, BarChart3, ShoppingCart, Loader2 } from "lucide-react"

interface InvoiceSummary {
  id: string
  invoiceNumber: string
  clientName: string
  total: number
  createdAt: string
  platform: string
  status?: string
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : [])
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false))
  }, [])

  const totalInvoices = invoices.length
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const uniqueClients = new Set(invoices.map((i) => i.clientName)).size
  const recentInvoices = invoices.slice(0, 5)

  const platformLabels: Record<string, string> = {
    amazon: "Amazon",
    mercadolibre: "Mercado Libre",
    ebay: "eBay",
    custom: "Tu Tienda",
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Bienvenido a tu gestor de facturas de e-commerce</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Facturas Creadas</CardTitle>
                <FileText className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalInvoices}</div>
                <p className="text-xs text-gray-500">Total de facturas</p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Ingresos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${totalRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-500">Suma de todas las facturas</p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Clientes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{uniqueClients}</div>
                <p className="text-xs text-gray-500">Clientes únicos en facturas</p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Plataformas</CardTitle>
                <BarChart3 className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">4</div>
                <p className="text-xs text-gray-500">Amazon, Mercado Libre...</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white">Acciones Rápidas</CardTitle>
                <CardDescription className="text-gray-400">Comienza a crear tu primera factura</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/dashboard/invoices/new" className="block">
                    <Button className="w-full bg-white text-black hover:bg-gray-200">Crear Nueva Factura</Button>
                  </Link>
                  <Link href="/dashboard/invoices" className="block">
                    <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">Ver Todas las Facturas</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white">Plataformas Soportadas</CardTitle>
                <CardDescription className="text-gray-400">Vende en múltiples canales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm text-gray-300"><span className="w-2 h-2 bg-white rounded-full"></span>Amazon</p>
                  <p className="flex items-center gap-2 text-sm text-gray-300"><span className="w-2 h-2 bg-white rounded-full"></span>Mercado Libre</p>
                  <p className="flex items-center gap-2 text-sm text-gray-300"><span className="w-2 h-2 bg-white rounded-full"></span>eBay</p>
                  <p className="flex items-center gap-2 text-sm text-gray-300"><span className="w-2 h-2 bg-white rounded-full"></span>Tu Tienda Online</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">Facturas Recientes</CardTitle>
              <CardDescription className="text-gray-400">Tus últimas 5 facturas generadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aún no tienes facturas. Crea tu primera factura.</p>
                ) : (
                  recentInvoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm text-white">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">{invoice.clientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-white">
                          ${invoice.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {platformLabels[invoice.platform] ?? invoice.platform}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">{invoice.createdAt}</p>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
