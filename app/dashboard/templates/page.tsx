"use client"

import { ProGate } from "@/components/ProGate"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, Plus, FileText, Sparkles } from "lucide-react"

const templates = [
    {
        name: "Profesional",
        description: "Diseño limpio y moderno para cualquier negocio",
        color: "from-blue-500/20 to-indigo-500/20",
        border: "border-blue-500/30",
    },
    {
        name: "Minimalista",
        description: "Simple y elegante, sin distracciones",
        color: "from-gray-500/20 to-slate-500/20",
        border: "border-gray-500/30",
    },
    {
        name: "Corporativo",
        description: "Formal y detallado para empresas grandes",
        color: "from-emerald-500/20 to-teal-500/20",
        border: "border-emerald-500/30",
    },
    {
        name: "Creativo",
        description: "Colorido y único para freelancers",
        color: "from-purple-500/20 to-pink-500/20",
        border: "border-purple-500/30",
    },
]

export default function TemplatesPage() {
    return (
        <ProGate
            featureName="Plantillas Personalizables"
            featureDescription="Personaliza tus facturas con tu logo, colores corporativos y términos de pago específicos. Elige entre múltiples plantillas profesionales."
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Plantillas</h1>
                        <p className="text-gray-400 mt-1">
                            Personaliza el diseño de tus facturas
                        </p>
                    </div>
                    <Button className="bg-white text-black hover:bg-gray-200 font-medium gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Plantilla
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                        <Card
                            key={template.name}
                            className={`bg-gradient-to-br ${template.color} ${template.border} hover:scale-[1.02] transition-transform cursor-pointer`}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        {template.name}
                                    </CardTitle>
                                    <Sparkles className="h-4 w-4 text-amber-400" />
                                </div>
                                <CardDescription className="text-gray-300">
                                    {template.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Palette className="h-8 w-8 text-gray-500" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </ProGate>
    )
}
