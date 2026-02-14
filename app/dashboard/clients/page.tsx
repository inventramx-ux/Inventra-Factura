"use client"

import { useInvoice } from "@/app/contexts/InvoiceContext"
import { useSubscription } from "@/app/contexts/SubscriptionContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Mail, Phone, MapPin } from "lucide-react"

export default function ClientsPage() {
    const { invoices, loading, uniqueClients } = useInvoice()
    const { isPro, clientsLimit } = useSubscription()

    // Extract unique clients from invoices
    const clientMap = new Map<string, {
        name: string
        email: string
        phone: string
        address: string
        totalInvoices: number
        totalSpent: number
        lastInvoice: string
    }>()

    invoices.forEach((invoice) => {
        const existing = clientMap.get(invoice.clientName)
        if (existing) {
            existing.totalInvoices++
            existing.totalSpent += invoice.total
            if (new Date(invoice.createdAt) > new Date(existing.lastInvoice)) {
                existing.lastInvoice = invoice.createdAt
            }
        } else {
            clientMap.set(invoice.clientName, {
                name: invoice.clientName,
                email: invoice.clientEmail,
                phone: invoice.clientPhone,
                address: invoice.clientAddress,
                totalInvoices: 1,
                totalSpent: invoice.total,
                lastInvoice: invoice.createdAt,
            })
        }
    })

    const clients = Array.from(clientMap.values())

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
            <div>
                <h1 className="text-2xl font-semibold text-white">Clientes</h1>
                <p className="text-gray-400 mt-1">
                    {isPro
                        ? `${uniqueClients} clientes registrados`
                        : `${uniqueClients}/${clientsLimit} clientes`}
                </p>
            </div>

            {/* Usage bar for free users */}
            {!isPro && (
                <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${uniqueClients >= clientsLimit ? "bg-red-500" : "bg-indigo-500"
                            }`}
                        style={{ width: `${Math.min((uniqueClients / clientsLimit) * 100, 100)}%` }}
                    />
                </div>
            )}

            {/* Clients Table */}
            <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                    {clients.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-2">No tienes clientes</p>
                            <p className="text-gray-500 text-sm">
                                Los clientes se agregan automáticamente cuando creas facturas
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-gray-400">Cliente</TableHead>
                                    <TableHead className="text-gray-400">Contacto</TableHead>
                                    <TableHead className="text-gray-400">Facturas</TableHead>
                                    <TableHead className="text-gray-400">Total Gastado</TableHead>
                                    <TableHead className="text-gray-400">Última Factura</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map((client) => (
                                    <TableRow key={client.name} className="border-white/10 hover:bg-white/5">
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
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                                {client.totalInvoices}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-white font-medium">
                                            ${client.totalSpent.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            {new Date(client.lastInvoice).toLocaleDateString("es-MX")}
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
