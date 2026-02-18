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

import { Plus, FileText, Trash2, X, Download, AlertCircle, Pencil, Share2, Check, Image as ImageIcon } from "lucide-react"



export default function InvoicesPage() {

    const { invoices, loading, totalInvoices, createInvoice, deleteInvoice } = useInvoice()

    const { isPro, invoicesLimit } = useSubscription()

    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState<any>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)



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
        companyLogo: "",
    })



    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault()

        if (!formData.clientName || !formData.description) return



        setSaving(true)

        try {

            const subtotal = formData.quantity * formData.unitPrice

            const tax = subtotal * 0.16

            const total = subtotal + tax



            if (editingInvoice) {
                await useInvoice().updateInvoice(editingInvoice.id, {
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
                    paymentMethod: formData.paymentMethod,
                    notes: formData.notes,
                    companyLogo: formData.companyLogo,
                })
            } else {
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
                    companyLogo: formData.companyLogo,
                })
            }



            setShowForm(false)
            setEditingInvoice(null)

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
                companyLogo: "",
            })

        } catch (error: any) {
            console.error("Error creating invoice (Dashboard):", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                error: error
            })
        } finally {

            setSaving(false)

        }

    }



    const handleEdit = (invoice: any) => {
        setEditingInvoice(invoice)
        setFormData({
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail,
            clientPhone: invoice.clientPhone,
            clientAddress: invoice.clientAddress,
            platform: invoice.platform,
            description: invoice.items[0]?.description || "",
            quantity: invoice.items[0]?.quantity || 1,
            unitPrice: invoice.items[0]?.unitPrice || 0,
            paymentMethod: invoice.paymentMethod,
            notes: invoice.notes,
            companyLogo: invoice.companyLogo || "",
        })
        setShowForm(true)
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, companyLogo: reader.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDownload = async (invoice: any, shouldShare = false) => {
        const html2pdf = (await import("html2pdf.js")).default;

        const element = document.createElement("div");
        element.innerHTML = `
            <div style="font-family: sans-serif; padding: 40px; color: #333;">
                <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; align-items: center;">
                    <div>
                        ${invoice.companyLogo ? `<img src="${invoice.companyLogo}" style="max-height: 60px; max-width: 200px; margin-bottom: 15px; display: block;" />` : ''}
                        <h1 style="margin: 0; color: #000; font-size: 24px;">FACTURA</h1>
                        <p style="margin: 5px 0; color: #666;"># ${invoice.invoiceNumber}</p>
                    </div>
                </div>
                
                <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                    <div>
                        <h3 style="margin-bottom: 10px; color: #666; font-size: 14px; text-transform: uppercase;">De:</h3>
                        <p style="margin: 2px 0;"><strong>Inventra Factura</strong></p>
                    </div>
                    <div style="text-align: right;">
                        <h3 style="margin-bottom: 10px; color: #666; font-size: 14px; text-transform: uppercase;">Para:</h3>
                        <p style="margin: 2px 0;"><strong>${invoice.clientName}</strong></p>
                        ${invoice.clientEmail ? `<p style="margin: 2px 0;">${invoice.clientEmail}</p>` : ''}
                        ${invoice.clientPhone ? `<p style="margin: 2px 0;">${invoice.clientPhone}</p>` : ''}
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-top: 40px;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #000;">Descripción</th>
                            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #000;">Cant.</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #000;">Precio</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #000;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map((item: any) => `
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.description}</td>
                                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">$${item.unitPrice.toLocaleString()}</td>
                                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">$${item.total.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
                    <div style="width: 250px;">
                        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                            <span style="color: #666;">Subtotal:</span>
                            <span>$${invoice.subtotal.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                            <span style="color: #666;">IVA (16%):</span>
                            <span>$${invoice.tax.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #000; font-weight: bold; font-size: 1.2em; margin-top: 10px;">
                            <span>Total:</span>
                            <span>$${invoice.total.toLocaleString()} MXN</span>
                        </div>
                    </div>
                </div>

                ${invoice.notes ? `
                    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                        <h4 style="margin-top: 0; margin-bottom: 10px; color: #666; font-size: 12px; text-transform: uppercase;">Notas:</h4>
                        <p style="margin: 0; color: #333; font-size: 0.9em; line-height: 1.5;">${invoice.notes}</p>
                    </div>
                ` : ''}

                <div style="margin-top: 50px; text-align: center; color: #999; font-size: 0.8em; border-top: 1px solid #eee; padding-top: 20px;">
                    Generado automáticamente por <strong>Inventra Factura</strong>
                </div>
            </div>
        `;

        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
            filename: `Factura-${invoice.invoiceNumber}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
        };

        if (shouldShare && navigator.share) {
            try {
                const worker = html2pdf().from(element).set(opt);
                const pdfBlob = await worker.output('blob');
                const file = new File([pdfBlob], `Factura-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: `Factura ${invoice.invoiceNumber}`,
                        text: `Te comparto la factura ${invoice.invoiceNumber} de Inventra Factura.`
                    });
                    return;
                }
            } catch (error) {
                console.error("Error sharing PDF:", error);
            }
        }

        // Fallback to download if sharing fails or is not requested
        html2pdf().from(element).set(opt).save();
    }

    const handleShare = (invoice: any) => {
        handleDownload(invoice, true);
        setCopiedId(invoice.id);
        setTimeout(() => setCopiedId(null), 2000);
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                        className="bg-white text-black hover:bg-gray-200 font-medium gap-2 w-full sm:w-auto"
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

                            <CardTitle className="text-white">
                                {editingInvoice ? "Editar Factura" : "Nueva Factura"}
                            </CardTitle>

                            <Button

                                variant="ghost"

                                size="icon"

                                onClick={() => {
                                    setShowForm(false)
                                    setEditingInvoice(null)
                                }}

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
                                <Label className="text-gray-300">Logo de la empresa (opcional)</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="bg-white/5 border-white/10 text-white file:bg-white/10 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-2 hover:file:bg-white/20"
                                        />
                                    </div>
                                    {formData.companyLogo && (
                                        <div className="relative w-12 h-12 border border-white/10 rounded overflow-hidden bg-white/5">
                                            <img src={formData.companyLogo} alt="Logo preview" className="w-full h-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, companyLogo: "" }))}
                                                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
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

                                    {saving ? (editingInvoice ? "Guardando..." : "Creando...") : (editingInvoice ? "Guardar Cambios" : "Crear Factura")}

                                </Button>

                                <Button

                                    type="button"

                                    variant="ghost"

                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingInvoice(null)
                                    }}

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

                        <div className="overflow-x-auto -mx-6 px-6">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-gray-400 whitespace-nowrap">Número</TableHead>
                                        <TableHead className="text-gray-400 whitespace-nowrap">Cliente</TableHead>
                                        <TableHead className="text-gray-400 whitespace-nowrap">Plataforma</TableHead>
                                        <TableHead className="text-gray-400 whitespace-nowrap">Monto</TableHead>
                                        <TableHead className="text-gray-400 whitespace-nowrap">Estado</TableHead>
                                        <TableHead className="text-gray-400 whitespace-nowrap">Fecha</TableHead>
                                        <TableHead className="text-gray-400 whitespace-nowrap">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="text-white font-medium whitespace-nowrap">
                                                {invoice.invoiceNumber}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div>
                                                    <div className="text-gray-300">{invoice.clientName}</div>
                                                    <div className="text-gray-500 text-xs">{invoice.clientEmail}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-300 capitalize whitespace-nowrap">
                                                {invoice.platform}
                                            </TableCell>
                                            <TableCell className="text-white font-medium whitespace-nowrap">
                                                ${invoice.total.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge
                                                    variant="outline"
                                                    className={statusColors[invoice.status] || statusColors.draft}
                                                >
                                                    {statusLabels[invoice.status] || invoice.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-400 whitespace-nowrap">
                                                {new Date(invoice.createdAt).toLocaleDateString("es-MX")}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8"
                                                        onClick={() => handleDownload(invoice)}
                                                        title="Descargar PDF"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8"
                                                        onClick={() => handleShare(invoice)}
                                                        title="Copiar link"
                                                    >
                                                        {copiedId === invoice.id ? (
                                                            <Check className="h-4 w-4 text-emerald-400" />
                                                        ) : (
                                                            <Share2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 h-8 w-8"
                                                        onClick={() => handleEdit(invoice)}
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                                                        onClick={() => deleteInvoice(invoice.id)}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                    )}

                </CardContent>

            </Card>

        </div>

    )

}

