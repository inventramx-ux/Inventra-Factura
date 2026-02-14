"use client"

import { useState } from "react"
import { useClient } from "@/app/contexts/ClientContext"
import { useSubscription } from "@/app/contexts/SubscriptionContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Mail, Phone, MapPin, Plus, Edit, Trash2 } from "lucide-react"

export default function ClientsPage() {
    const { clients, loading, createClient, deleteClient } = useClient()
    const { isPro, clientsLimit } = useSubscription()
    const [showAddForm, setShowAddForm] = useState(false)

    const handleAddClient = async (clientData: { name: string; email: string; phone: string; address: string }) => {
        try {
            await createClient(clientData)
            setShowAddForm(false)
        } catch (error) {
            console.error("Error adding client:", error)
        }
    }

    const handleDeleteClient = async (id: string) => {
        if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
            try {
                await deleteClient(id)
            } catch (error) {
                console.error("Error deleting client:", error)
            }
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 rounded bg-white/5 animate-pulse" />
                <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Clientes</h1>
                    <p className="text-gray-400 mt-1">
                        {isPro
                            ? `${clients.length} clientes registrados`
                            : `${clients.length}/${clientsLimit} clientes`}
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-white text-black hover:bg-gray-200 font-medium gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Agregar Cliente
                </Button>
            </div>

            {/* Usage bar for free users */}
            {!isPro && (
                <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${clients.length >= clientsLimit ? "bg-red-500" : "bg-indigo-500"
                            }`}
                        style={{ width: `${Math.min((clients.length / clientsLimit) * 100, 100)}%` }}
                    />
                </div>
            )}

            {/* Add Client Form */}
            {showAddForm && (
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Agregar Nuevo Cliente</CardTitle>
                        <CardDescription className="text-gray-400">
                            Ingresa los datos del nuevo cliente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const formData = new FormData(e.currentTarget)
                            handleAddClient({
                                name: formData.get('name') as string,
                                email: formData.get('email') as string,
                                phone: formData.get('phone') as string,
                                address: formData.get('address') as string,
                            })
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
                                    placeholder="Nombre del cliente"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
                                    placeholder="email@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
                                    placeholder="+52 555 123 4567"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
                                <textarea
                                    name="address"
                                    rows={2}
                                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
                                    placeholder="Calle Principal #123, Ciudad"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    className="bg-white text-black hover:bg-gray-200 font-medium"
                                >
                                    Agregar Cliente
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddForm(false)}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Clients Table */}
            <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                    {clients.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-2">No tienes clientes</p>
                            <p className="text-gray-500 text-sm mb-4">
                                Agrega tu primer cliente para empezar a gestionar tu negocio
                            </p>
                            <Button
                                onClick={() => setShowAddForm(true)}
                                className="bg-white text-black hover:bg-gray-200 font-medium gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Agregar Primer Cliente
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-gray-400">Cliente</TableHead>
                                    <TableHead className="text-gray-400">Contacto</TableHead>
                                    <TableHead className="text-gray-400">Registrado</TableHead>
                                    <TableHead className="text-gray-400">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map((client) => (
                                    <TableRow key={client.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{client.name}</div>
                                                    {client.address && (
                                                        <div className="text-gray-500 text-xs flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {client.address}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {client.email && (
                                                    <div className="text-gray-300 text-sm flex items-center gap-1">
                                                        <Mail className="h-3 w-3 text-gray-500" />
                                                        {client.email}
                                                    </div>
                                                )}
                                                {client.phone && (
                                                    <div className="text-gray-300 text-sm flex items-center gap-1">
                                                        <Phone className="h-3 w-3 text-gray-500" />
                                                        {client.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            {new Date(client.createdAt).toLocaleDateString("es-MX")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-gray-400 hover:text-white hover:bg-white/10"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClient(client.id)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
