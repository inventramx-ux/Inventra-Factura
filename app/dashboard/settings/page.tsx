"use client"

import { UserProfile } from "@clerk/nextjs"
import { useSubscription } from "@/app/contexts/SubscriptionContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Check, ArrowRight, ExternalLink, XCircle } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
    const { isPro } = useSubscription()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-white">Configuración</h1>
                <p className="text-gray-400 mt-1">Gestiona tu cuenta y plan.</p>
            </div>

            {/* Plan Info */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Crown className={`h-5 w-5 ${isPro ? "text-amber-400" : "text-gray-500"}`} />
                            Tu Plan
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className={
                                isPro
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                    : "bg-white/10 text-gray-300 border-white/20"
                            }
                        >
                            {isPro ? "Pro" : "Gratuito"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {isPro ? (
                        <div className="space-y-3">
                            <p className="text-gray-300">Tienes acceso completo a todas las funciones.</p>
                            <ul className="space-y-2">
                                {[
                                    "Facturas ilimitadas",
                                    "Clientes ilimitados",

                                    'Personalización avanzada',
                                    "Soporte prioritario",
                                    "Sin marca de agua",
                                    "Analíticas de facturación",

                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                                        <Check className="h-4 w-4 text-amber-400 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-6 border-t border-white/10 mt-6">
                                <h4 className="text-white font-medium mb-3">Gestionar Suscripción</h4>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        asChild
                                        className="bg-white/10 text-white hover:bg-white/20 border-white/10 gap-2"
                                    >
                                        <a href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noopener noreferrer">
                                            Gestionar en PayPal
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        asChild
                                        className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 gap-2"
                                    >
                                        <a href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noopener noreferrer">
                                            Cancelar suscripción
                                            <XCircle className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-4 italic">
                                    Nota: Serás redirigido a PayPal para gestionar tus pagos automáticos. Busca &quot;Inventra Factura&quot; en tu lista de pagos activos.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-300">
                                Estás en el plan gratuito. Actualiza para desbloquear todas las funciones.
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-gray-400">
                                    <p className="text-gray-500 mb-1">Incluye:</p>
                                    <ul className="space-y-1">
                                        <li className="flex items-center gap-1">
                                            <Check className="h-3 w-3 text-gray-500" /> 10 facturas/mes
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <Check className="h-3 w-3 text-gray-500" /> 5 clientes
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <Check className="h-3 w-3 text-gray-500" /> Plantillas básicas
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <Check className="h-3 w-3 text-gray-500" /> Soporte por email
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <Link href="/checkout">
                                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold hover:from-amber-400 hover:to-orange-400 gap-2 mt-2">
                                    Actualizar a Pro — $199/mes
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Clerk User Profile */}
            <Card className="bg-white/5 border-white/10 overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-white">Cuenta</CardTitle>
                </CardHeader>
                <CardContent>
                    <UserProfile
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "bg-transparent shadow-none border-none",
                                navbar: "hidden",
                                pageScrollBox: "p-0",
                                profileSection: "border-white/10",
                            },
                        }}
                        routing="hash"
                    />
                </CardContent>
            </Card>
        </div>
    )
}
