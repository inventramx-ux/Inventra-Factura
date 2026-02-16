"use client"



import { useState } from "react"

import { useInvoice } from "@/app/contexts/InvoiceContext"

import { useSubscription } from "@/app/contexts/SubscriptionContext"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Plus, FileText, Trash2, X, Download, AlertCircle } from "lucide-react"



export default function InvoicesPage() {

    const { invoices, loading, totalInvoices, createInvoice, deleteInvoice } = useInvoice()

    const { isPro, invoicesLimit } = useSubscription()

    const [showForm, setShowForm] = useState(false)

    const [saving, setSaving] = useState(false)



    const canCreateInvoice = isPro || totalInvoices < invoicesLimit



    const [formData, setFormData] = useState({

        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,

        clientName: "",

        clientEmail: "",

        clientPhone: "",

        clientAddress: "",

        platform: "custom",

        description: "",

        quantity: 1,

        unitPrice: 0,

        paymentMethod: "transferencia",

        notes: "",

    })



    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault()

        if (!formData.clientName || !formData.description) return



        setSaving(true)

        try {

            const subtotal = formData.quantity * formData.unitPrice

            const tax = subtotal * 0.16

            const total = subtotal + tax



            await createInvoice({

                invoiceNumber: formData.invoiceNumber,

                clientName: formData.clientName,

                clientEmail: formData.clientEmail,

                clientPhone: formData.clientPhone,

                clientAddress: formData.clientAddress,

                platform: formData.platform,

                items: [

                    {

                        id: "1",

                        description: formData.description,

                        quantity: formData.quantity,

                        unitPrice: formData.unitPrice,

                        total: subtotal,

                    },

                ],

                subtotal,

                tax,

                total,

                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],

                paymentMethod: formData.paymentMethod,

                notes: formData.notes,

            })



            setShowForm(false)

            setFormData({

                invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,

                clientName: "",

                clientEmail: "",

                clientPhone: "",

                clientAddress: "",

                platform: "custom",

                description: "",

                quantity: 1,

                unitPrice: 0,

                paymentMethod: "transferencia",

                notes: "",

            })

        } catch (error) {

            console.error("Error creating invoice:", error)

        } finally {

            setSaving(false)

        }

    }



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

                <div className="h-8 w-48 rounded bg-white/5 animate-pulse" />

                <div className="h-64 rounded-xl bg-white/5 animate-pulse" />

            </div>

        )

    }



    return (

        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-2xl font-semibold text-white">Facturas</h1>

                    <p className="text-gray-400 mt-1">

                        {isPro

                            ? `${totalInvoices} facturas creadas`

                            : `${totalInvoices}/${invoicesLimit} facturas este mes`}

                    </p>

                </div>

                {canCreateInvoice ? (

                    <Button

                        onClick={() => setShowForm(true)}

                        className="bg-white text-black hover:bg-gray-200 font-medium gap-2"

                    >

                        <Plus className="h-4 w-4" />

                        Nueva Factura

                    </Button>

                ) : (

                    <div className="flex items-center gap-2 text-amber-400 text-sm">

                        <AlertCircle className="h-4 w-4" />

                        Límite alcanzado — Actualiza a Pro

                    </div>

                )}

            </div>



            {/* Usage bar for free users */}

            {!isPro && (

                <div className="w-full bg-white/10 rounded-full h-2">

                    <div

                        className={`h-2 rounded-full transition-all ${totalInvoices >= invoicesLimit ? "bg-red-500" : "bg-blue-500"

                            }`}

                        style={{ width: `${Math.min((totalInvoices / invoicesLimit) * 100, 100)}%` }}

                    />

                </div>

            )}



            {/* Create Invoice Form */}

            {showForm && (

                <Card className="bg-white/5 border-white/10">

                    <CardHeader>

                        <div className="flex items-center justify-between">

                            <CardTitle className="text-white">Nueva Factura</CardTitle>

                            <Button

                                variant="ghost"

                                size="icon"

                                onClick={() => setShowForm(false)}

                                className="text-gray-400 hover:text-white hover:bg-white/10"

                            >

                                <X className="h-4 w-4" />

                            </Button>

                        </div>

                    </CardHeader>

                    <CardContent>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div className="space-y-2">

                                    <Label className="text-gray-300">Número de factura</Label>

                                    <Input

                                        value={formData.invoiceNumber}

                                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}

                                        className="bg-white/5 border-white/10 text-white"

                                    />

                                </div>

                                <div className="space-y-2">

                                    <Label className="text-gray-300">Nombre del cliente *</Label>

                                    <Input

                                        value={formData.clientName}

                                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}

                                        placeholder="Juan Pérez"

                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"

                                        required

                                    />

                                </div>

                                <div className="space-y-2">

                                    <Label className="text-gray-300">Email</Label>

                                    <Input

                                        type="email"

                                        value={formData.clientEmail}

                                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}

                                        placeholder="cliente@email.com"

                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"

                                    />

                                </div>

                                <div className="space-y-2">

                                    <Label className="text-gray-300">Teléfono</Label>

                                    <Input

                                        value={formData.clientPhone}

                                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}

                                        placeholder="+52 555 123 4567"

                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"

                                    />

                                </div>

                            </div>



                            <div className="space-y-2">

                                <Label className="text-gray-300">Descripción del producto/servicio *</Label>

                                <Input

                                    value={formData.description}

                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}

                                    placeholder="Descripción del servicio o producto"

                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"

                                    required

                                />

                            </div>



                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                <div className="space-y-2">

                                    <Label className="text-gray-300">Cantidad</Label>

                                    <Input

                                        type="number"

                                        min="1"

                                        value={formData.quantity}

                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}

                                        className="bg-white/5 border-white/10 text-white"

                                    />

                                </div>

                                <div className="space-y-2">

                                    <Label className="text-gray-300">Precio unitario (MXN)</Label>

                                    <Input

                                        type="number"

                                        min="0"

                                        step="0.01"

                                        value={formData.unitPrice}

                                        onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}

                                        className="bg-white/5 border-white/10 text-white"

                                    />

                                </div>

                                <div className="space-y-2">

                                    <Label className="text-gray-300">Total (con IVA 16%)</Label>

                                    <div className="text-xl font-bold text-white pt-2">

                                        ${((formData.quantity * formData.unitPrice) * 1.16).toLocaleString("es-MX", { minimumFractionDigits: 2 })}

                                    </div>

                                </div>

                            </div>



                            <div className="space-y-2">

                                <Label className="text-gray-300">Notas</Label>

                                <Input

                                    value={formData.notes}

                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}

                                    placeholder="Notas adicionales..."

                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"

                                />

                            </div>



                            <div className="flex gap-3 pt-2">

                                <Button

                                    type="submit"

                                    disabled={saving}

                                    className="bg-white text-black hover:bg-gray-200 font-medium"

                                >

                                    {saving ? "Creando..." : "Crear Factura"}

                                </Button>

                                <Button

                                    type="button"

                                    variant="ghost"

                                    onClick={() => setShowForm(false)}

                                    className="text-gray-400 hover:text-white hover:bg-white/10"

                                >

                                    Cancelar

                                </Button>

                            </div>

                        </form>

                    </CardContent>

                </Card>

            )}



            {/* Invoices Table */}

            <Card className="bg-white/5 border-white/10">

                <CardContent className="pt-6">

                    {invoices.length === 0 ? (

                        <div className="text-center py-16">

                            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />

                            <p className="text-gray-400 text-lg mb-2">No tienes facturas</p>

                            <p className="text-gray-500 text-sm mb-6">

                                Crea tu primera factura para empezar a gestionar tus ventas

                            </p>

                            {canCreateInvoice && (

                                <Button

                                    onClick={() => setShowForm(true)}

                                    className="bg-white text-black hover:bg-gray-200 font-medium gap-2"

                                >

                                    <Plus className="h-4 w-4" />

                                    Crear Factura

                                </Button>

                            )}

                        </div>

                    ) : (

                        <Table>

                            <TableHeader>

                                <TableRow className="border-white/10 hover:bg-transparent">

                                    <TableHead className="text-gray-400">Número</TableHead>

                                    <TableHead className="text-gray-400">Cliente</TableHead>

                                    <TableHead className="text-gray-400">Plataforma</TableHead>

                                    <TableHead className="text-gray-400">Monto</TableHead>

                                    <TableHead className="text-gray-400">Estado</TableHead>

                                    <TableHead className="text-gray-400">Fecha</TableHead>

                                    <TableHead className="text-gray-400">Acciones</TableHead>

                                </TableRow>

                            </TableHeader>

                            <TableBody>

                                {invoices.map((invoice) => (

                                    <TableRow key={invoice.id} className="border-white/10 hover:bg-white/5">

                                        <TableCell className="text-white font-medium">

                                            {invoice.invoiceNumber}

                                        </TableCell>

                                        <TableCell>

                                            <div>

                                                <div className="text-gray-300">{invoice.clientName}</div>

                                                <div className="text-gray-500 text-xs">{invoice.clientEmail}</div>

                                            </div>

                                        </TableCell>

                                        <TableCell className="text-gray-300 capitalize">

                                            {invoice.platform}

                                        </TableCell>

                                        <TableCell className="text-white font-medium">

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

                                        <TableCell>

                                            <div className="flex gap-1">

                                                <Button

                                                    variant="ghost"

                                                    size="icon"

                                                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"

                                                    onClick={() => deleteInvoice(invoice.id)}

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

