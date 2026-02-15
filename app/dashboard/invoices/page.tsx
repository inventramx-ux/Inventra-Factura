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
import { Plus, FileText, Trash2, X, Download, AlertCircle, Edit, Palette } from "lucide-react"

export default function InvoicesPage() {
    const { invoices, loading, totalInvoices, createInvoice, deleteInvoice, updateInvoice } = useInvoice()
    const { isPro, invoicesLimit } = useSubscription()
    const [showForm, setShowForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [showCustomizeForm, setShowCustomizeForm] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [customizingInvoice, setCustomizingInvoice] = useState<any>(null)

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

    const [customizationData, setCustomizationData] = useState({
        logo: "",
        primaryColor: "#000000",
        secondaryColor: "#666666",
        accentColor: "#3b82f6",
        fontFamily: "helvetica",
        fontSize: 12,
        companyName: "",
        companyAddress: "",
        companyPhone: "",
        companyEmail: "",
        companyWebsite: "",
        footerText: "Gracias por su compra",
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
        })
        setShowEditForm(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.clientName || !formData.description || !editingInvoice) return

        setSaving(true)
        try {
            const subtotal = formData.quantity * formData.unitPrice
            const tax = subtotal * 0.16
            const total = subtotal + tax

            await updateInvoice(editingInvoice.id, {
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
            })

            setShowEditForm(false)
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
            })
        } catch (error) {
            console.error("Error updating invoice:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleCustomize = (invoice: any) => {
        setCustomizingInvoice(invoice)
        // Cargar configuración guardada si existe
        const saved = localStorage.getItem(`customization_${invoice.id}`)
        if (saved) {
            setCustomizationData(JSON.parse(saved))
        }
        setShowCustomizeForm(true)
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setCustomizationData({ ...customizationData, logo: reader.result as string })
            }
            reader.readAsDataURL(file)
        }
    }

    const saveCustomization = () => {
        if (customizingInvoice) {
            localStorage.setItem(`customization_${customizingInvoice.id}`, JSON.stringify(customizationData))
            setShowCustomizeForm(false)
            setCustomizingInvoice(null)
        }
    }

    const generatePDF = async (invoice: any) => {
        try {
            const { jsPDF } = await import('jspdf')
            const doc = new jsPDF()

            // Cargar configuración de personalización
            const saved = localStorage.getItem(`customization_${invoice.id}`)
            const customization = saved ? JSON.parse(saved) : customizationData

            // Configurar fuentes y colores personalizados
            doc.setFont(customization.fontFamily || 'helvetica')
            
            // Logo si existe
            if (customization.logo) {
                try {
                    doc.addImage(customization.logo, 'PNG', 20, 15, 40, 20)
                } catch (error) {
                    console.log("Error adding logo:", error)
                }
            }

            // Encabezado con color personalizado
            doc.setFontSize(20)
            doc.setTextColor(customization.primaryColor || '#000000')
            const yPos = customization.logo ? 50 : 20
            doc.text('FACTURA', 105, yPos, { align: 'center' })
            
            // Información de la empresa si existe
            if (customization.companyName) {
                doc.setFontSize(14)
                doc.setTextColor(customization.secondaryColor || '#666666')
                doc.text(customization.companyName, 20, yPos + 15)
                if (customization.companyAddress) {
                    doc.setFontSize(10)
                    doc.text(customization.companyAddress, 20, yPos + 25)
                }
                if (customization.companyPhone || customization.companyEmail) {
                    const contactInfo = [customization.companyPhone, customization.companyEmail].filter(Boolean).join(' | ')
                    doc.text(contactInfo, 20, yPos + 35)
                }
            }
            
            // Datos de la factura
            doc.setFontSize(customization.fontSize || 12)
            doc.setTextColor(customization.primaryColor || '#000000')
            const invoiceYPos = customization.companyName ? yPos + 50 : yPos + 20
            doc.text(`Número: ${invoice.invoiceNumber}`, 20, invoiceYPos)
            doc.text(`Fecha: ${new Date(invoice.createdAt).toLocaleDateString('es-MX')}`, 20, invoiceYPos + 10)
            doc.text(`Vencimiento: ${new Date(invoice.dueDate).toLocaleDateString('es-MX')}`, 20, invoiceYPos + 20)
            
            // Información del cliente
            doc.setFontSize(14)
            doc.setTextColor(customization.accentColor || '#3b82f6')
            doc.text('Datos del Cliente:', 20, invoiceYPos + 40)
            doc.setFontSize(customization.fontSize || 11)
            doc.setTextColor(customization.primaryColor || '#000000')
            doc.text(`Nombre: ${invoice.clientName}`, 20, invoiceYPos + 50)
            if (invoice.clientEmail) doc.text(`Email: ${invoice.clientEmail}`, 20, invoiceYPos + 60)
            if (invoice.clientPhone) doc.text(`Teléfono: ${invoice.clientPhone}`, 20, invoiceYPos + 70)
            if (invoice.clientAddress) doc.text(`Dirección: ${invoice.clientAddress}`, 20, invoiceYPos + 80)
            
            // Detalles del producto/servicio
            doc.setFontSize(14)
            doc.setTextColor(customization.accentColor || '#3b82f6')
            doc.text('Detalles:', 20, invoiceYPos + 100)
            doc.setFontSize(customization.fontSize || 11)
            doc.setTextColor(customization.primaryColor || '#000000')
            
            let yPosition = invoiceYPos + 110
            invoice.items.forEach((item: any) => {
                doc.text(`${item.description}`, 20, yPosition)
                doc.text(`Cantidad: ${item.quantity}`, 20, yPosition + 10)
                doc.text(`Precio unitario: $${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 20, yPosition + 20)
                doc.text(`Subtotal: $${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 20, yPosition + 30)
                yPosition += 40
            })
            
            // Totales con color personalizado
            doc.setFontSize(customization.fontSize || 12)
            doc.setTextColor(customization.primaryColor || '#000000')
            doc.text(`Subtotal: $${invoice.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 120, yPosition)
            doc.text(`IVA (16%): $${invoice.tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 120, yPosition + 10)
            doc.setFontSize(14)
            doc.setTextColor(customization.accentColor || '#3b82f6')
            doc.text(`Total: $${invoice.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 120, yPosition + 20)
            
            // Método de pago
            doc.setFontSize(customization.fontSize || 11)
            doc.setTextColor(customization.primaryColor || '#000000')
            doc.text(`Método de pago: ${invoice.paymentMethod}`, 20, yPosition + 40)
            
            // Footer personalizado
            if (customization.footerText || customization.companyWebsite) {
                doc.setFontSize(10)
                doc.setTextColor(customization.secondaryColor || '#666666')
                const footerY = 280
                if (customization.footerText) {
                    doc.text(customization.footerText, 105, footerY, { align: 'center' })
                }
                if (customization.companyWebsite) {
                    doc.text(customization.companyWebsite, 105, footerY + 10, { align: 'center' })
                }
            }
            
            // Guardar el PDF
            doc.save(`factura-${invoice.invoiceNumber}.pdf`)
        } catch (error) {
            console.error("Error generating PDF:", error)
            alert("Error al generar el PDF")
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

            {/* Edit Invoice Form */}
            {showEditForm && (
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white">Editar Factura</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setShowEditForm(false)
                                    setEditingInvoice(null)
                                }}
                                className="text-gray-400 hover:text-white hover:bg-white/10"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
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
                                    {saving ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setShowEditForm(false)
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

            {/* Customize Invoice Form */}
            {showCustomizeForm && (
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white">Personalizar Factura</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setShowCustomizeForm(false)
                                    setCustomizingInvoice(null)
                                }}
                                className="text-gray-400 hover:text-white hover:bg-white/10"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label className="text-gray-300">Logo de la Empresa</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="bg-white/5 border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200"
                                    />
                                    {customizationData.logo && (
                                        <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center">
                                            <img src={customizationData.logo} alt="Logo" className="max-w-full max-h-full rounded" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Company Information */}
                            <div className="space-y-4">
                                <h3 className="text-white font-medium">Información de la Empresa</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Nombre de la Empresa</Label>
                                        <Input
                                            value={customizationData.companyName}
                                            onChange={(e) => setCustomizationData({ ...customizationData, companyName: e.target.value })}
                                            placeholder="Mi Empresa S.A. de C.V."
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Teléfono</Label>
                                        <Input
                                            value={customizationData.companyPhone}
                                            onChange={(e) => setCustomizationData({ ...customizationData, companyPhone: e.target.value })}
                                            placeholder="+52 555 123 4567"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Email</Label>
                                        <Input
                                            type="email"
                                            value={customizationData.companyEmail}
                                            onChange={(e) => setCustomizationData({ ...customizationData, companyEmail: e.target.value })}
                                            placeholder="contacto@empresa.com"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Sitio Web</Label>
                                        <Input
                                            value={customizationData.companyWebsite}
                                            onChange={(e) => setCustomizationData({ ...customizationData, companyWebsite: e.target.value })}
                                            placeholder="www.empresa.com"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Dirección</Label>
                                    <Input
                                        value={customizationData.companyAddress}
                                        onChange={(e) => setCustomizationData({ ...customizationData, companyAddress: e.target.value })}
                                        placeholder="Calle Principal #123, Ciudad, Estado"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                                    />
                                </div>
                            </div>

                            {/* Colors and Typography */}
                            <div className="space-y-4">
                                <h3 className="text-white font-medium">Colores y Tipografía</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Color Principal</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={customizationData.primaryColor}
                                                onChange={(e) => setCustomizationData({ ...customizationData, primaryColor: e.target.value })}
                                                className="bg-white/5 border-white/10 h-10 w-20"
                                            />
                                            <Input
                                                value={customizationData.primaryColor}
                                                onChange={(e) => setCustomizationData({ ...customizationData, primaryColor: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Color Secundario</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={customizationData.secondaryColor}
                                                onChange={(e) => setCustomizationData({ ...customizationData, secondaryColor: e.target.value })}
                                                className="bg-white/5 border-white/10 h-10 w-20"
                                            />
                                            <Input
                                                value={customizationData.secondaryColor}
                                                onChange={(e) => setCustomizationData({ ...customizationData, secondaryColor: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Color de Acento</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={customizationData.accentColor}
                                                onChange={(e) => setCustomizationData({ ...customizationData, accentColor: e.target.value })}
                                                className="bg-white/5 border-white/10 h-10 w-20"
                                            />
                                            <Input
                                                value={customizationData.accentColor}
                                                onChange={(e) => setCustomizationData({ ...customizationData, accentColor: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Tipografía</Label>
                                        <select
                                            value={customizationData.fontFamily}
                                            onChange={(e) => setCustomizationData({ ...customizationData, fontFamily: e.target.value })}
                                            className="w-full bg-white/5 border-white/10 text-white rounded px-3 py-2"
                                        >
                                            <option value="helvetica">Helvetica</option>
                                            <option value="times">Times New Roman</option>
                                            <option value="courier">Courier</option>
                                            <option value="arial">Arial</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Tamaño de Fuente</Label>
                                        <Input
                                            type="number"
                                            min="8"
                                            max="20"
                                            value={customizationData.fontSize}
                                            onChange={(e) => setCustomizationData({ ...customizationData, fontSize: parseInt(e.target.value) || 12 })}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="space-y-2">
                                <Label className="text-gray-300">Texto del Pie de Página</Label>
                                <Input
                                    value={customizationData.footerText}
                                    onChange={(e) => setCustomizationData({ ...customizationData, footerText: e.target.value })}
                                    placeholder="Gracias por su preferencia"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={saveCustomization}
                                    className="bg-white text-black hover:bg-gray-200 font-medium"
                                >
                                    Guardar Personalización
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setShowCustomizeForm(false)
                                        setCustomizingInvoice(null)
                                    }}
                                    className="text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
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
                                                    className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 h-8 w-8"
                                                    onClick={() => handleCustomize(invoice)}
                                                >
                                                    <Palette className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 h-8 w-8"
                                                    onClick={() => handleEdit(invoice)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-green-400 hover:bg-green-500/10 h-8 w-8"
                                                    onClick={() => generatePDF(invoice)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
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
