"use client"

import { ProGate } from "@/components/ProGate"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, Mail, MessageSquare, Plus, Settings } from "lucide-react"

const reminders = [
    {
        title: "Recordatorio de vencimiento",
        description: "Enviar email automático 3 días antes del vencimiento",
        frequency: "Automático",
        channel: "Email",
        icon: Mail,
        active: true,
    },
    {
        title: "Factura vencida",
        description: "Notificar al cliente cuando una factura ha vencido",
        frequency: "Al vencer",
        channel: "Email",
        icon: Clock,
        active: true,
    },
    {
        title: "Seguimiento de pago",
        description: "Recordatorio semanal para facturas pendientes",
        frequency: "Semanal",
        channel: "Email + WhatsApp",
        icon: MessageSquare,
        active: false,
    },
]

export default function RemindersPage() {
    return (
        <ProGate
            featureName="Recordatorios Automáticos"
            featureDescription="Configura recordatorios automáticos de pago por email y WhatsApp. Nunca pierdas un cobro con notificaciones inteligentes."
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Recordatorios</h1>
                        <p className="text-gray-400 mt-1">
                            Automatiza los recordatorios de pago
                        </p>
                    </div>
                    <Button className="bg-white text-black hover:bg-gray-200 font-medium gap-2">
                        <Plus className="h-4 w-4" />
                        Nuevo Recordatorio
                    </Button>
                </div>

                <div className="space-y-4">
                    {reminders.map((reminder) => (
                        <Card key={reminder.title} className="bg-white/5 border-white/10">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                            <reminder.icon className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">{reminder.title}</h3>
                                            <p className="text-gray-400 text-sm mt-1">{reminder.description}</p>
                                            <div className="flex gap-2 mt-3">
                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                                                    {reminder.frequency}
                                                </Badge>
                                                <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/10 text-xs">
                                                    {reminder.channel}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className={
                                                reminder.active
                                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                            }
                                        >
                                            {reminder.active ? "Activo" : "Inactivo"}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8"
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </ProGate>
    )
}
