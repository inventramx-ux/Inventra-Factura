"use client"

export const dynamic = "force-dynamic"

import React, { useMemo, useState, useEffect } from "react"
import { useSubscription } from "@/app/contexts/SubscriptionContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, ShoppingBag, Sparkles, Lock } from "lucide-react"
import Link from "next/link"
import { publicationOperations, Publication } from "@/lib/publications"
import { useUser } from "@clerk/nextjs"

const STATUS_COLORS = {
    optimized: "#10b981", // emerald-500
    draft: "#94a3b8", // slate-400
}

export default function AnalyticsPage() {
    const { user } = useUser()
    const [publications, setPublications] = useState<Publication[]>([])
    const [loading, setLoading] = useState(true)
    const { isPro, isLoading: subLoading } = useSubscription()
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month')

    const loadData = React.useCallback(async () => {
        if (!user?.id) return
        try {
            setLoading(true)
            const pubs = await publicationOperations.getAll(user.id)
            setPublications(pubs)
        } catch (error) {
            console.error("Error loading analytics data:", error)
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        if (user) {
            loadData()
        }
    }, [user, loadData])

    // Analytics transformations
    const stats = useMemo(() => {
        if (!publications.length) return null

        // Activity Over Time based on timeRange
        let activityOverTime: any[] = []
        const now = new Date()

        if (timeRange === 'day') {
            activityOverTime = Array.from({ length: 24 }, (_, i) => {
                const date = new Date(now)
                date.setHours(date.getHours() - i)
                return { label: date.getHours() + ':00', timestamp: date.getTime(), count: 0 }
            }).reverse()

            publications.forEach(p => {
                const date = new Date(p.created_at)
                const hourIdx = activityOverTime.findIndex(h => {
                    const hDate = new Date(h.timestamp)
                    return hDate.getHours() === date.getHours() && hDate.getDate() === date.getDate()
                })
                if (hourIdx !== -1) activityOverTime[hourIdx].count++
            })
        } else if (timeRange === 'week') {
            activityOverTime = Array.from({ length: 7 }, (_, i) => {
                const date = new Date(now)
                date.setDate(date.getDate() - i)
                return { label: date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }), timestamp: date.getTime(), count: 0 }
            }).reverse()

            publications.forEach(p => {
                const date = new Date(p.created_at)
                const dayIdx = activityOverTime.findIndex(d => {
                    const dDate = new Date(d.timestamp)
                    return dDate.getDate() === date.getDate() && dDate.getMonth() === date.getMonth()
                })
                if (dayIdx !== -1) activityOverTime[dayIdx].count++
            })
        } else if (timeRange === 'month') {
            activityOverTime = Array.from({ length: 6 }, (_, i) => {
                const date = new Date(now)
                date.setMonth(date.getMonth() - i)
                return { label: date.toLocaleString('es-MX', { month: 'short' }), month: date.getMonth(), year: date.getFullYear(), count: 0 }
            }).reverse()

            publications.forEach(p => {
                const date = new Date(p.created_at)
                const monthIdx = activityOverTime.findIndex(m => m.month === date.getMonth() && m.year === date.getFullYear())
                if (monthIdx !== -1) activityOverTime[monthIdx].count++
            })
        } else {
            activityOverTime = Array.from({ length: 3 }, (_, i) => {
                const date = new Date(now)
                date.setFullYear(date.getFullYear() - i)
                return { label: date.getFullYear().toString(), year: date.getFullYear(), count: 0 }
            }).reverse()

            publications.forEach(p => {
                const date = new Date(p.created_at)
                const yearIdx = activityOverTime.findIndex(y => y.year === date.getFullYear())
                if (yearIdx !== -1) activityOverTime[yearIdx].count++
            })
        }

        // 2. Status Distribution
        const statusDistribution = [
            { name: "Optimizado", value: publications.filter(p => p.optimized_content?.title).length, color: STATUS_COLORS.optimized },
            { name: "Borrador", value: publications.filter(p => !p.optimized_content?.title).length, color: STATUS_COLORS.draft },
        ].filter(d => d.value > 0)

        // 3. Platform Distribution
        const platformCounts: Record<string, number> = {}
        publications.forEach(p => {
            const platform = p.platform || 'Sin especificar'
            platformCounts[platform] = (platformCounts[platform] || 0) + 1
        })
        const platformDistribution = Object.entries(platformCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        const totalPublications = publications.length
        const totalOptimized = publications.filter(p => p.optimized_content?.title).length
        const optimizationRate = totalPublications > 0 ? (totalOptimized / totalPublications) * 100 : 0

        return {
            activityOverTime,
            statusDistribution,
            platformDistribution,
            metrics: {
                totalPublications,
                totalOptimized,
                optimizationRate
            }
        }
    }, [publications, timeRange])

    if (loading || subLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 rounded bg-white/5 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
                <div className="h-80 rounded-xl bg-white/5 animate-pulse" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <ShoppingBag className="h-12 w-12 text-gray-600 mb-4" />
                <h2 className="text-xl font-semibold text-white">Sin datos suficientes</h2>
                <p className="text-gray-400 mt-2 max-w-sm">
                    Crea y optimiza publicaciones para ver tus analíticas de rendimiento.
                </p>
                <Link href="/dashboard/publications" className="mt-6">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        Crear publicación
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold text-white">Analíticas</h1>
                        {isPro ? (
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Pro</Badge>
                        ) : (
                            <Badge variant="outline" className="text-gray-400 border-white/10">Gratis</Badge>
                        )}
                    </div>
                    <p className="text-gray-400 mt-1">
                        Monitorea tu actividad de creación y optimización.
                    </p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    {(['day', 'week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === range
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {range === 'day' ? 'Día' : range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400">Publicaciones Totales</CardDescription>
                        <CardTitle className="text-2xl text-white font-bold">
                            {stats.metrics.totalPublications}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-gray-400 gap-1">
                            <ShoppingBag className="h-3 w-3" />
                            <span>Contenido creado</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400">Optimizaciones IA</CardDescription>
                        <CardTitle className="text-2xl text-white font-bold">
                            {stats.metrics.totalOptimized}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-gray-400 gap-1">
                            <Sparkles className="h-3 w-3 text-emerald-400" />
                            <span>Asistido por IA</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-gray-400">Tasa de Éxito</CardDescription>
                        <CardTitle className="text-2xl text-white font-bold">
                            {Math.round(stats.metrics.optimizationRate)}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-blue-400 gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Eficiencia de flujo</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <Card className="bg-white/5 border-white/10 lg:col-span-2 min-w-0 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-white text-lg font-medium">Actividad de Publicación</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.activityOverTime}>
                                <defs>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="count" name="Publicaciones" stroke="#60a5fa" fillOpacity={1} fill="url(#colorActivity)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Platform Distribution */}
                <Card className="bg-white/5 border-white/10 relative overflow-hidden min-w-0">
                    <CardHeader>
                        <CardTitle className="text-white">Canales de Venta</CardTitle>
                        <CardDescription className="text-gray-400">Distribución por Marketplace</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full mt-4">
                        {!isPro && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
                                <Lock className="h-8 w-8 text-blue-400 mb-3" />
                                <h3 className="text-blue-400 font-semibold mb-2">Sección Pro</h3>
                                <p className="text-blue-400 text-sm mb-4">Identifica tus canales más populares con el plan Pro.</p>
                                <Link href="/dashboard/upgrade">
                                    <Button size="sm" className="bg-blue-400 hover:bg-blue-500 text-black text-xs font-bold">Mejorar ahora</Button>
                                </Link>
                            </div>
                        )}
                        <div className={!isPro ? "blur-[2px]" : ""}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.platformDistribution} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                    <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#fff' }} />
                                    <Bar dataKey="count" name="Publicaciones" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="bg-white/5 border-white/10 relative overflow-hidden min-w-0">
                    <CardHeader>
                        <CardTitle className="text-white">Estado de Optimización</CardTitle>
                        <CardDescription className="text-gray-400">Borradores vs Finalizados</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full flex items-center justify-center">
                            {!isPro && (
                     <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
                                <Lock className="h-8 w-8 text-blue-400 mb-3" />
                                <h3 className="text-blue-400 font-semibold mb-2">Sección Pro</h3>
                                <p className="text-blue-400 text-sm mb-4">Obtén métricas sobre tus borradores y publicaciones finalizadas.</p>
                                <Link href="/dashboard/upgrade">
                                    <Button size="sm" className="bg-blue-400 hover:bg-blue-500 text-black text-xs font-bold">Mejorar ahora</Button>
                                </Link>
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {stats.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#fff' }} />
                                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-gray-400">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
