"use client"

import React from "react"
import { useSubscription } from "@/app/contexts/SubscriptionContext"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingBag, Sparkles, LayoutDashboard, Crown, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { publicationOperations, Publication } from "@/lib/publications"

export default function DashboardPage() {
    const { user } = useUser()
    const [publications, setPublications] = React.useState<Publication[]>([])
    const [loading, setLoading] = React.useState(true)
    const { isPro, refreshSubscription } = useSubscription()

    const loadData = React.useCallback(async () => {
        if (!user?.id) return
        try {
            setLoading(true)
            const pubs = await publicationOperations.getAll(user.id)
            setPublications(pubs)
        } catch (error) {
            console.error("Error loading dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    React.useEffect(() => {
        if (user) {
            refreshSubscription()
            loadData()
        }
    }, [user, refreshSubscription, loadData])

    const totalOptimized = publications.filter(p => p.optimized_content?.title).length

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
                    Bienvenido, {user?.firstName || "Usuario"}
                </h1>
                <p className="text-gray-400 mt-1">
                    Aquí tienes un resumen de tu actividad de optimización.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Publicaciones</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{publications.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Total creadas</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Optimizaciones</CardTitle>
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {totalOptimized}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Contenido generado con IA</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Eficiencia</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {publications.length > 0 ? Math.round((totalOptimized / publications.length) * 100) : 0}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Tasa de optimización</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Plan</CardTitle>
                        <Crown className={`h-4 w-4 ${isPro ? "text-blue-400" : "text-gray-500"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {isPro ? "Pro" : "Gratuito"}
                        </div>
                        {!isPro && (
                            <Link href="/dashboard/upgrade" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-flex items-center gap-1">
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
                <Link href="/dashboard/publications">
                    <Button className="bg-white text-black hover:bg-gray-200 font-medium gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Publicación
                    </Button>
                </Link>
                <Link href="/dashboard/analytics">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-medium gap-2">
                        <Sparkles className="h-4 w-4" />
                        Ver Analíticas
                    </Button>
                </Link>
            </div>

            {/* Recent Publications */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Publicaciones Recientes</CardTitle>
                            <CardDescription className="text-gray-400">
                                Tus últimas publicaciones creadas
                            </CardDescription>
                        </div>
                        <Link href="/dashboard/publications">
                            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 gap-1 text-sm">
                                Ver todas <ArrowRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {publications.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-2">No tienes publicaciones aún</p>
                            <p className="text-gray-500 text-sm mb-4">Crea tu primera publicación para empezar</p>
                            <Link href="/dashboard/publications">
                                <Button className="bg-white text-black hover:bg-gray-200 font-medium gap-2">
                                    <Plus className="h-4 w-4" />
                                    Crear Publicación
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-gray-400">Nombre</TableHead>
                                    <TableHead className="text-gray-400">Plataforma</TableHead>
                                    <TableHead className="text-gray-400">Estado</TableHead>
                                    <TableHead className="text-gray-400">Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {publications.slice(0, 5).map((pub) => (
                                    <TableRow key={pub.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="text-white font-medium">
                                            {pub.name}
                                        </TableCell>
                                        <TableCell className="text-gray-300 capitalize">{pub.platform || "No especificada"}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={pub.optimized_content?.title ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}
                                            >
                                                {pub.optimized_content?.title ? "Optimizado" : "Borrador"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            {new Date(pub.created_at).toLocaleDateString("es-MX")}
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
