"use client"

import { useInvoice } from "@/app/contexts/InvoiceContext"
import { useSubscription } from "@/app/contexts/SubscriptionContext"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Users, DollarSign, Crown, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    const { user } = useUser()
    const { invoices, loading, totalInvoices, totalRevenue, uniqueClients } = useInvoice()
    const { isPro, invoicesLimit, clientsLimit } = useSubscription()

    const statusColors: Record<string, string> = {
        paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        overdue: "bg-red-500/20 text-red-400 border-red-500/30",
    }

    const statusLabels: Record<string, string> = {
        paid: "Pagada",
        sent: "Enviada",
        draft: "Borrador",
        overdue: "Vencida",
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 rounded bg-white/5 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
                <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Bienvenido, {user?.firstName || "Usuario"} 👋
                </h1>
                <p className="text-gray-400 mt-1">
                    Aquí tienes un resumen de tu actividad.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Facturas</CardTitle>
                        <FileText className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalInvoices}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {isPro ? "Ilimitadas" : `${totalInvoices}/${invoicesLimit} este mes`}
                        </p>
                        {!isPro && (
                            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                                <div
                                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                                    style={{ width: `${Math.min((totalInvoices / invoicesLimit) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Ingresos</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            ${totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Total facturado</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Clientes</CardTitle>
                        <Users className="h-4 w-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{uniqueClients}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {isPro ? "Ilimitados" : `${uniqueClients}/${clientsLimit} disponibles`}
                        </p>
                        {!isPro && (
                            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                                <div
                                    className="bg-indigo-500 h-1.5 rounded-full transition-all"
                                    style={{ width: `${Math.min((uniqueClients / clientsLimit) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Plan</CardTitle>
                        <Crown className={`h-4 w-4 ${isPro ? "text-amber-400" : "text-gray-500"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {isPro ? "Pro" : "Gratuito"}
                        </div>
                        {!isPro && (
                            <Link href="/dashboard/upgrade" className="text-xs text-amber-400 hover:text-amber-300 mt-1 inline-flex items-center gap-1">
                                Actualizar <ArrowRight className="h-3 w-3" />
                            </Link>
                        )}
                        {isPro && (
                            <p className="text-xs text-gray-500 mt-1">Acceso completo</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
                <Link href="/dashboard/invoices">
                    <Button className="bg-white text-black hover:bg-gray-200 font-medium gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Factura
                    </Button>
                </Link>
                <Link href="/dashboard/clients">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-medium gap-2">
                        <Users className="h-4 w-4" />
                        Ver Clientes
                    </Button>
                </Link>
            </div>

            {/* Recent Invoices */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Facturas Recientes</CardTitle>
                            <CardDescription className="text-gray-400">
                                Tus últimas facturas creadas
                            </CardDescription>
                        </div>
                        <Link href="/dashboard/invoices">
                            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 gap-1 text-sm">
                                Ver todas <ArrowRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {invoices.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-2">No tienes facturas aún</p>
                            <p className="text-gray-500 text-sm mb-4">Crea tu primera factura para empezar</p>
                            <Link href="/dashboard/invoices">
                                <Button className="bg-white text-black hover:bg-gray-200 font-medium gap-2">
                                    <Plus className="h-4 w-4" />
                                    Crear Factura
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-gray-400">Número</TableHead>
                                    <TableHead className="text-gray-400">Cliente</TableHead>
                                    <TableHead className="text-gray-400">Monto</TableHead>
                                    <TableHead className="text-gray-400">Estado</TableHead>
                                    <TableHead className="text-gray-400">Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.slice(0, 5).map((invoice) => (
                                    <TableRow key={invoice.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="text-white font-medium">
                                            {invoice.invoiceNumber}
                                        </TableCell>
                                        <TableCell className="text-gray-300">{invoice.clientName}</TableCell>
                                        <TableCell className="text-white">
                                            ${invoice.total.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={statusColors[invoice.status] || statusColors.draft}
                                            >
                                                {statusLabels[invoice.status] || invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            {new Date(invoice.createdAt).toLocaleDateString("es-MX")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
