"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { TrendingUp, FileText, BarChart3, ShoppingCart } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="p-8 bg-black min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Bienvenido a tu gestor de facturas de e-commerce</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Facturas Creadas</CardTitle>
            <FileText className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">24</div>
            <p className="text-xs text-gray-500">+3 esta semana</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$12,450</div>
            <p className="text-xs text-gray-500">+12% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Clientes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">18</div>
            <p className="text-xs text-gray-500">+2 nuevos clientes</p>
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

      {/* Quick Actions */}
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

      {/* Recent Invoices */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Facturas Recientes</CardTitle>
          <CardDescription className="text-gray-400">Tus últimas 5 facturas generadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: "INV-001", client: "Juan García", amount: "$450", date: "2026-02-03", platform: "Amazon" },
              { id: "INV-002", client: "María López", amount: "$320", date: "2026-02-02", platform: "Mercado Libre" },
              { id: "INV-003", client: "Carlos Rodríguez", amount: "$580", amount2: "$2,180", date: "2026-02-01", platform: "Tu Tienda" },
            ].map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-white">{invoice.id}</p>
                  <p className="text-xs text-gray-500">{invoice.client}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm text-white">{invoice.amount}</p>
                  <p className="text-xs text-gray-500">{invoice.platform}</p>
                </div>
                <p className="text-xs text-gray-600">{invoice.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
