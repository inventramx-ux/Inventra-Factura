"use client"

import React, { useMemo } from "react"
import { useInvoice } from "@/app/contexts/InvoiceContext"
import { useClient } from "@/app/contexts/ClientContext"
import { useSubscription } from "@/app/contexts/SubscriptionContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, TrendingUp, Users, FileText, Lock } from "lucide-react"
import Link from "next/link"

const STATUS_COLORS = {
    paid: "#10b981", // emerald-500
    sent: "#3b82f6", // blue-500
    overdue: "#f43f5e", // rose-500
    draft: "#94a3b8", // slate-400
}

export default function AnalyticsPage() {
    const { invoices, loading: invoicesLoading } = useInvoice()
    const { clients, loading: clientsLoading } = useClient()
    const { isPro, isLoading: subLoading } = useSubscription()

    const loading = invoicesLoading || clientsLoading || subLoading

    // Analytics transformations
    const stats = useMemo(() => {
        if (!invoices.length) return null

        // 1. Revenue by Month (Last 6 months)
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            return {
                month: date.toLocaleString('es-MX', { month: 'short' }),
                monthNum: date.getMonth(),
                year: date.getFullYear(),
                revenue: 0
            }
        }).reverse()

        invoices.forEach(inv => {
            const date = new Date(inv.createdAt)
            const monthIdx = last6Months.findIndex(m => m.monthNum === date.getMonth() && m.year === date.getFullYear())
            if (monthIdx !== -1) {
                last6Months[monthIdx].revenue += inv.total
            }
        })

        // 2. Invoice Status Distribution
        const statusData = [
            { name: "Pagadas", value: invoices.filter(i => i.status === 'paid').length, color: STATUS_COLORS.paid },
            { name: "Enviadas", value: invoices.filter(i => i.status === 'sent').length, color: STATUS_COLORS.sent },
            { name: "Vencidas", value: invoices.filter(i => i.status === 'overdue').length, color: STATUS_COLORS.overdue },
            { name: "Borradores", value: invoices.filter(i => i.status === 'draft').length, color: STATUS_COLORS.draft },
        ].filter(d => d.value > 0)

        // 3. Top Clients by Revenue
        const clientRevenue: Record<string, number> = {}
        invoices.forEach(inv => {
            clientRevenue[inv.clientName] = (clientRevenue[inv.clientName] || 0) + inv.total
        })
        const topClients = Object.entries(clientRevenue)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        // Summary metrics
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
        const paidRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
        const avgInvoiceValue = totalRevenue / Math.max(invoices.length, 1)

        return {
            revenueOverTime: last6Months,
            statusDistribution: statusData,
            topClients,
            metrics: {
                totalRevenue,
                paidRevenue,
                avgInvoiceValue,
                totalInvoices: invoices.length,
                totalClients: clients.length
            }
        }
    }, [invoices, clients])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 rounded bg-white/5 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div className="h-80 rounded-xl bg-white/5 animate-pulse" />
                </div>
            </div>
        )
    }

    if (!isPro) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                    <Lock className="h-10 w-10 text-amber-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Analíticas Pro</h2>
                <p className="text-gray-400 max-w-md mb-8">
                    Obtén información detallada sobre el crecimiento de tu negocio, el rendimiento de tus clientes y tendencias de ingresos con el plan Pro.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full max-w-4xl text-left">
                    <Card className="bg-white/5 border-white/10 opacity-60">
                        <CardHeader className="pb-2">
                            <TrendingUp className="h-5 w-5 text-emerald-400 mb-2" />
                            <CardTitle className="text-sm">Crecimiento Mensual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-gray-500">Visualiza tus ingresos mes a mes.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 opacity-60">
                        <CardHeader className="pb-2">
                            <Users className="h-5 w-5 text-blue-400 mb-2" />
                            <CardTitle className="text-sm">Top Clientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-gray-500">Identifica a tus clientes más valiosos.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 opacity-60">
                        <CardHeader className="pb-2">
                            <FileText className="h-5 w-5 text-indigo-400 mb-2" />
                            <CardTitle className="text-sm">Estatus de Cobro</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-gray-500">Analiza la distribución de tus cobros.</p>
                        </CardContent>
                    </Card>
                </div>
                <Link href="/dashboard/upgrade">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 px-8 text-lg gap-2">
                        <Crown className="h-5 w-5" />
                        Obtener Acceso Pro
                    </Button>
                </Link>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <FileText className="h-12 w-12 text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold text-white">Sin datos suficientes</h2>
                <p className="text-gray-400 mt-2 max-w-sm">
                    Crea algunas facturas para empezar a ver tus analíticas de rendimiento.
                </p>
                <Link href="/dashboard/invoices" className="mt-6">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        Crear mi primera factura
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold text-white">Analíticas</h1>
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10">Pro</Badge>
                </div>
                <p className="text-gray-400 mt-1">
                    Visualiza el rendimiento de tu negocio y tus clientes.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400">Total Facturado</CardDescription>
                        <CardTitle className="text-2xl text-white font-bold">
                            ${stats.metrics.totalRevenue.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-emerald-400 gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Recuperado: ${stats.metrics.paidRevenue.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400">Ticket Promedio</CardDescription>
                        <CardTitle className="text-2xl text-white font-bold">
                            ${stats.metrics.avgInvoiceValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-blue-400 gap-1">
                            <FileText className="h-3 w-3" />
                            <span>Sobre {stats.metrics.totalInvoices} facturas</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400">Clientes Activos</CardDescription>
                        <CardTitle className="text-2xl text-white font-bold">
                            {stats.metrics.totalClients}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-indigo-400 gap-1">
                            <Users className="h-3 w-3" />
                            <span>Impacto en mercado</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card className="bg-white/5 border-white/10 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">Ingresos por Mes</CardTitle>
                        <CardDescription className="text-gray-400">Tus ingresos brutos en los últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenueOverTime}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Clients Chart */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Mejores Clientes</CardTitle>
                        <CardDescription className="text-gray-400">Top 5 clientes por volumen facturado</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topClients} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Distribución de Facturas</CardTitle>
                        <CardDescription className="text-gray-400">Estatus actual de tus cobranzas</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => <span className="text-xs text-gray-400">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
