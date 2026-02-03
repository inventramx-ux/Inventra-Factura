"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import Link from "next/link"
import { Plus, Trash2, Loader2 } from "lucide-react"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    platform: "amazon",
    invoiceNumber: "INV-" + Date.now().toString().slice(-6),
    invoiceDate: new Date().toISOString().split("T")[0],
  })

  const [items, setItems] = useState<LineItem[]>([
    {
      id: "1",
      description: "Producto de ejemplo",
      quantity: 1,
      unitPrice: 100,
      total: 100,
    },
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleItemChange = (id: string, field: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      })
    )
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setItems((prev) => [...prev, newItem])
  }

  const removeLineItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.16
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone || undefined,
          platform: formData.platform,
          invoiceNumber: formData.invoiceNumber,
          invoiceDate: formData.invoiceDate || undefined,
          items: items.map(({ description, quantity, unitPrice, total }) => ({
            description,
            quantity,
            unitPrice,
            total,
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Error al crear la factura")
      }
      router.push("/dashboard/invoices")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la factura")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Crear Nueva Factura</h1>
        <p className="text-gray-400">Completa los datos de tu factura</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Cliente */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Información del Cliente</CardTitle>
            <CardDescription className="text-gray-400">Datos del comprador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Nombre del Cliente</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Juan García"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="cliente@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Teléfono</Label>
                <Input
                  id="clientPhone"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <Label htmlFor="platform">Plataforma de Venta</Label>
                <select
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="amazon">Amazon</option>
                  <option value="mercadolibre">Mercado Libre</option>
                  <option value="ebay">eBay</option>
                  <option value="custom">Tu Tienda Online</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos de la Factura */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Datos de la Factura</CardTitle>
            <CardDescription className="text-gray-400">Número y fecha de facturación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Número de Factura</Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="invoiceDate">Fecha de Factura</Label>
                <Input
                  id="invoiceDate"
                  name="invoiceDate"
                  type="date"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Líneas de la Factura */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Artículos</CardTitle>
            <CardDescription className="text-gray-400">Detalles de los productos o servicios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border-b border-white/10">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-2 text-white">Descripción</th>
                      <th className="text-center py-2 px-2 text-white">Cantidad</th>
                      <th className="text-right py-2 px-2 text-white">Precio Unit.</th>
                      <th className="text-right py-2 px-2 text-white">Total</th>
                      <th className="text-center py-2 px-2 text-white">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-white/10">
                        <td className="py-3 px-2">
                          <Input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                            placeholder="Descripción del producto"
                            className="text-sm"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, "quantity", parseFloat(e.target.value))}
                            className="text-sm text-center"
                            min="1"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, "unitPrice", parseFloat(e.target.value))}
                            className="text-sm text-right"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-white">
                          ${item.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                type="button"
                onClick={addLineItem}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Artículo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Totales */}
        <Card className="border-white/10 bg-white/5">
          <CardContent className="pt-6">
            <div className="space-y-3 flex justify-end max-w-sm">
              <div className="w-full flex justify-between text-white">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="w-full flex justify-between text-white">
                <span>Impuestos (16%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="w-full flex justify-between border-t border-white/10 pt-3 font-bold text-lg text-white">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="w-full md:w-auto bg-white text-black hover:bg-gray-200"
            disabled={saving}
          >
            {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            "Crear Factura"
          )}
          </Button>
          <Link href="/dashboard/invoices">
            <Button type="button" variant="outline" className="w-full md:w-auto border-white/20 text-white hover:bg-white/10">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
