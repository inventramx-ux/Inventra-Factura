"use client"

import { ProGate } from "@/components/ProGate"
import { RevenueChart, ClientGrowthChart } from "@/components/dashboard/RevenueChart"

export default function RevenuePage() {
    return (
        <ProGate
            featureName="Reportes Avanzados"
            featureDescription="Accede a reportes detallados de ingresos, crecimiento de clientes y métricas clave de tu negocio. Toma decisiones informadas con datos en tiempo real."
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Reportes Avanzados</h1>
                    <p className="text-gray-400 mt-1">
                        Métricas detalladas de tu negocio
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RevenueChart className="bg-white/5 border-white/10 [&_*]:text-gray-300" />
                    <ClientGrowthChart className="bg-white/5 border-white/10 [&_*]:text-gray-300" />
                </div>
            </div>
        </ProGate>
    )
}
