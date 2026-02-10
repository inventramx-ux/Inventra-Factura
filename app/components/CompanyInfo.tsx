"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Button } from "@/app/components/ui/button"
import { Building2, Mail, Phone, MapPin, FileText, Save } from "lucide-react"

interface CompanyData {
  name: string
  rfc: string
  email: string
  phone: string
  address: string
  zipCode: string
  city: string
  state: string
  country: string
  taxRegime: string
}

export default function CompanyInfo() {
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    rfc: "",
    email: "",
    phone: "",
    address: "",
    zipCode: "",
    city: "",
    state: "",
    country: "México",
    taxRegime: "601 - General de Ley Personas Morales"
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Cargar datos guardados del localStorage
    const saved = localStorage.getItem("companyData")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setCompanyData(data)
      } catch (error) {
        console.error("Error loading company data:", error)
      }
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Guardar en localStorage (en producción sería en base de datos)
      localStorage.setItem("companyData", JSON.stringify(companyData))
      
      // Simular guardado en API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert("Datos de la empresa guardados correctamente")
    } catch (error) {
      console.error("Error saving company data:", error)
      alert("Error al guardar los datos")
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-6 md:p-8 bg-black min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Datos de la Empresa</h1>
          <p className="text-gray-400">
            Configura la información de tu negocio para aparecer en las facturas
          </p>
        </div>

        {/* Company Information */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName" className="text-gray-300">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  value={companyData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Mi Empresa S.A. de C.V."
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="rfc" className="text-gray-300">RFC</Label>
                <Input
                  id="rfc"
                  value={companyData.rfc}
                  onChange={(e) => updateField("rfc", e.target.value.toUpperCase())}
                  placeholder="ABC123456XYZ"
                  maxLength={13}
                  className="bg-white/10 border-white/20 text-white uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyEmail" className="text-gray-300">Email de la Empresa</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={companyData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="contacto@miempresa.com"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="companyPhone" className="text-gray-300">Teléfono</Label>
                <Input
                  id="companyPhone"
                  value={companyData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+52 555 123 4567"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dirección Fiscal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address" className="text-gray-300">Calle y Número</Label>
              <Input
                id="address"
                value={companyData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Calle Principal #123, Colonia Centro"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="zipCode" className="text-gray-300">Código Postal</Label>
                <Input
                  id="zipCode"
                  value={companyData.zipCode}
                  onChange={(e) => updateField("zipCode", e.target.value)}
                  placeholder="06000"
                  maxLength={5}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-gray-300">Ciudad</Label>
                <Input
                  id="city"
                  value={companyData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Ciudad de México"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-gray-300">Estado</Label>
                <Input
                  id="state"
                  value={companyData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  placeholder="Ciudad de México"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country" className="text-gray-300">País</Label>
              <select
                id="country"
                value={companyData.country}
                onChange={(e) => updateField("country", e.target.value)}
                className="w-full p-3 rounded-lg bg-white/10 border-white/20 text-white"
              >
                <option value="México">México</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="Canadá">Canadá</option>
                <option value="España">España</option>
                <option value="Argentina">Argentina</option>
                <option value="Colombia">Colombia</option>
                <option value="Perú">Perú</option>
                <option value="Chile">Chile</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información Fiscal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="taxRegime" className="text-gray-300">Régimen Fiscal</Label>
              <select
                id="taxRegime"
                value={companyData.taxRegime}
                onChange={(e) => updateField("taxRegime", e.target.value)}
                className="w-full p-3 rounded-lg bg-white/10 border-white/20 text-white"
              >
                <option value="601 - General de Ley Personas Morales">601 - General de Ley Personas Morales</option>
                <option value="603 - Personas Morales con Fines no Lucrativos">603 - Personas Morales con Fines no Lucrativos</option>
                <option value="605 - Sueldos y Salarios e Ingresos Asimilados a Salarios">605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                <option value="606 - Arrendamiento">606 - Arrendamiento</option>
                <option value="607 - Régimen de Enajenación o Adquisición de Bienes">607 - Régimen de Enajenación o Adquisición de Bienes</option>
                <option value="608 - Demás ingresos">608 - Demás ingresos</option>
                <option value="610 - Residentes en el Extranjero sin Establecimiento Permanente en México">610 - Residentes en el Extranjero sin Establecimiento Permanente en México</option>
                <option value="611 - Ingresos por Dividendos (socios y accionistas)">611 - Ingresos por Dividendos (socios y accionistas)</option>
                <option value="612 - Personas Físicas con Actividades Empresariales y Profesionales">612 - Personas Físicas con Actividades Empresariales y Profesionales</option>
                <option value="614 - Ingresos por intereses">614 - Ingresos por intereses</option>
                <option value="615 - Régimen de los ingresos por obtención de premios">615 - Régimen de los ingresos por obtención de premios</option>
                <option value="616 - Sin obligaciones fiscales">616 - Sin obligaciones fiscales</option>
                <option value="620 - Sociedades Cooperativas de Producción">620 - Sociedades Cooperativas de Producción</option>
                <option value="621 - Incorporación Fiscal">621 - Incorporación Fiscal</option>
                <option value="622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras">622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras</option>
                <option value="623 - Opcional para Grupos de Sociedades">623 - Opcional para Grupos de Sociedades</option>
                <option value="624 - Coordinados">624 - Coordinados</option>
                <option value="625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas">625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</option>
                <option value="626 - Régimen Simplificado de Confianza">626 - Régimen Simplificado de Confianza</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-white text-black hover:bg-gray-200 min-w-[150px]"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-black border-t-transparent animate-spin rounded-full" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Datos
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
