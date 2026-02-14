"use client"

import { useSubscription } from "@/app/contexts/SubscriptionContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Crown,
    Check,
    ArrowRight,
    FileText,
    Users,
    Palette,
    BarChart3,
    Bell,
    Headphones,
    Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const proFeatures = [
    { icon: FileText, text: "Facturas ilimitadas" },
    { icon: Users, text: "Clientes ilimitados" },
    { icon: Palette, text: "Plantillas personalizables" },
    { icon: BarChart3, text: "Reportes avanzados" },
    { icon: Headphones, text: "Soporte prioritario" },
    { icon: Bell, text: "Recordatorios automáticos" },
]

export default function UpgradePage() {
    const { isPro } = useSubscription()
    const router = useRouter()

    if (isPro) {
        router.push("/dashboard")
        return null
    }

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
                        <Crown className="w-8 h-8 text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">
                        Actualiza a Pro
                    </h1>
                    <p className="text-gray-400 leading-relaxed">
                        Desbloquea todo el potencial de Inventra Factura para hacer crecer tu negocio.
                    </p>
                </div>

                <Card className="bg-white/5 border-white/10 mb-8">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {proFeatures.map((feature) => (
                                <div key={feature.text} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <span className="text-gray-300 text-sm">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center space-y-4">
                    <div className="flex items-baseline justify-center gap-1 mb-6">
                        <span className="text-4xl font-bold text-white">$199</span>
                        <span className="text-gray-400">MXN/mes</span>
                    </div>

                    <Link href="/checkout" className="block">
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold py-6 text-base hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 gap-2">
                            <Sparkles className="h-5 w-5" />
                            Comenzar con Pro
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>

                    <Link
                        href="/dashboard"
                        className="inline-block text-gray-400 hover:text-white transition-colors text-sm mt-4"
                    >
                        ← Volver al dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
