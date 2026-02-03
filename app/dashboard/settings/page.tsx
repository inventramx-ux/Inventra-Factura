"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Building2, Smartphone, Mail, Globe } from "lucide-react"

export default function SettingsPage() {
  const [businessData, setBusinessData] = useState({
    businessName: "Tu Negocio E-commerce",
    email: "contacto@tunegocio.com",
    phone: "+1 234 567 8900",
    website: "https://tunegocio.com",
    rfc: "ABC123456XYZ",
    taxId: "12345678",
    address: "Calle Principal 123, Ciudad, País",
  })

  const [taxSettings, setTaxSettings] = useState({
    defaultTaxRate: 16,
    useTaxes: true,
  })

  const [platforms, setPlatforms] = useState({
    amazon: { enabled: true, apiKey: "" },
    mercadolibre: { enabled: true, apiKey: "" },
    ebay: { enabled: false, apiKey: "" },
    custom: { enabled: true, apiKey: "" },
  })

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBusinessData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setTaxSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handlePlatformChange = (platform: string, field: string, value: string | boolean) => {
    setPlatforms((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleSave = () => {
    console.log({ businessData, taxSettings, platforms })
    alert("Configuración guardada exitosamente")
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-gray-400">Administra tu información empresarial y preferencias</p>
      </div>

      <div className="space-y-6">
        {/* Información del Negocio */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Building2 className="w-5 h-5" />
              Información del Negocio
            </CardTitle>
            <CardDescription className="text-gray-400">Datos principales de tu empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Nombre del Negocio</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={businessData.businessName}
                  onChange={handleBusinessChange}
                />
              </div>
              <div>
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  name="rfc"
                  value={businessData.rfc}
                  onChange={handleBusinessChange}
                  placeholder="ABC123456XYZ"
                />
              </div>
              <div>
                <Label htmlFor="taxId">ID Fiscal</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={businessData.taxId}
                  onChange={handleBusinessChange}
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={businessData.address}
                  onChange={handleBusinessChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Mail className="w-5 h-5" />
              Información de Contacto
            </CardTitle>
            <CardDescription className="text-gray-400">Datos para que te contacten tus clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={businessData.email}
                  onChange={handleBusinessChange}
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={businessData.phone}
                  onChange={handleBusinessChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  name="website"
                  value={businessData.website}
                  onChange={handleBusinessChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Impuestos */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Configuración de Impuestos</CardTitle>
            <CardDescription className="text-gray-400">Tasa de impuesto predeterminada para tus facturas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="defaultTaxRate">Tasa de Impuesto Predeterminada (%)</Label>
                <Input
                  id="defaultTaxRate"
                  name="defaultTaxRate"
                  type="number"
                  value={taxSettings.defaultTaxRate}
                  onChange={handleTaxChange}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  id="useTaxes"
                  name="useTaxes"
                  type="checkbox"
                  checked={taxSettings.useTaxes}
                  onChange={handleTaxChange}
                  className="rounded"
                />
                <Label htmlFor="useTaxes" className="cursor-pointer">
                  Aplicar impuestos automáticamente
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integración de Plataformas */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="w-5 h-5" />
              Plataformas de Venta
            </CardTitle>
            <CardDescription className="text-gray-400">Integra tus plataformas de e-commerce</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(platforms).map(([platform, config]) => (
                <div key={platform} className="border-b border-white/10 pb-4 last:border-0">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-white capitalize">
                        {platform === "mercadolibre" ? "Mercado Libre" : 
                         platform === "custom" ? "Tu Tienda Online" :
                         platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </h3>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) =>
                        handlePlatformChange(platform, "enabled", e.target.checked)
                      }
                      className="rounded"
                    />
                    <Label className="cursor-pointer text-white">Habilitado</Label>
                  </div>
                  {config.enabled && (
                    <div>
                      <Label htmlFor={`${platform}-api`} className="text-sm text-gray-300">
                        Clave API
                      </Label>
                      <Input
                        id={`${platform}-api`}
                        type="password"
                        value={config.apiKey}
                        onChange={(e) =>
                          handlePlatformChange(platform, "apiKey", e.target.value)
                        }
                        placeholder="Ingresa tu clave API"
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex gap-4">
          <Button onClick={handleSave} className="w-full md:w-auto bg-white text-black hover:bg-gray-200">
            Guardar Cambios
          </Button>
          <Button variant="outline" className="w-full md:w-auto border-white/20 text-white hover:bg-white/10">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
