"use client"

import { useState, useEffect } from "react"
import { ProGate } from "@/components/ProGate"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"

// Types for Integration
type IntegrationStatus = "connected" | "disconnected" | "connecting" | "error"

interface Integration {
    id: string
    name: string
    logo: string // URL or component
    description: string
    status: IntegrationStatus
    primaryColor: string
}

export default function EcommercePage() {
    const [integrations, setIntegrations] = useState<Integration[]>([
        {
            id: "mercadolibre",
            name: "Mercado Libre",
            logo: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png",
            description: "Sincroniza tus ventas, inventario y facturación automáticamente.",
            status: "disconnected",
            primaryColor: "bg-[#ffe600] text-black hover:bg-[#ffe600]/90",
        },
        {
            id: "amazon",
            name: "Amazon",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
            description: "Importa pedidos de Amazon Seller Central y genera facturas al instante.",
            status: "disconnected",
            primaryColor: "bg-[#FF9900] text-black hover:bg-[#FF9900]/90",
        },
        {
            id: "ebay",
            name: "eBay",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/2560px-EBay_logo.svg.png",
            description: "Conecta tu tienda eBay para gestionar ventas internacionales.",
            status: "disconnected",
            primaryColor: "bg-[#e53238] text-white hover:bg-[#e53238]/90",
        },
    ])

    const [connectingId, setConnectingId] = useState<string | null>(null)
    const [apiKey, setApiKey] = useState("")
    const [openDialog, setOpenDialog] = useState(false)

    // Load status from localStorage on mount
    useEffect(() => {
        const savedStatus = localStorage.getItem("ecommerce_integrations")
        if (savedStatus) {
            try {
                const parsed = JSON.parse(savedStatus)
                setIntegrations(prev => prev.map(p => ({
                    ...p,
                    status: parsed[p.id] || "disconnected"
                })))
            } catch (e) {
                console.error("Failed to load integration status", e)
            }
        }
    }, [])

    const handleConnect = (id: string) => {
        setConnectingId(id)
        setApiKey("") // Reset form
        setOpenDialog(true)
    }

    const confirmConnection = async () => {
        if (!connectingId) return

        // Simulate API call
        setIntegrations(prev => prev.map(i =>
            i.id === connectingId ? { ...i, status: "connecting" } : i
        ))

        setOpenDialog(false)

        // Mock delay
        setTimeout(() => {
            setIntegrations(prev => {
                const newIntegrations = prev.map(i =>
                    i.id === connectingId ? { ...i, status: "connected" as IntegrationStatus } : i
                )

                // Save to localStorage
                const statusMap = newIntegrations.reduce((acc, curr) => ({
                    ...acc,
                    [curr.id]: curr.status
                }), {})

                localStorage.setItem("ecommerce_integrations", JSON.stringify(statusMap))

                return newIntegrations
            })
            setConnectingId(null)
        }, 2000)
    }

    const handleDisconnect = (id: string) => {
        if (confirm("¿Estás seguro de desconectar esta tienda? Dejarás de recibir actualizaciones.")) {
            setIntegrations(prev => {
                const newIntegrations = prev.map(i =>
                    i.id === id ? { ...i, status: "disconnected" as IntegrationStatus } : i
                )
                // Save to localStorage
                const statusMap = newIntegrations.reduce((acc, curr) => ({
                    ...acc,
                    [curr.id]: curr.status
                }), {})
                localStorage.setItem("ecommerce_integrations", JSON.stringify(statusMap))

                return newIntegrations
            })
        }
    }

    return (
        <ProGate>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Integraciones</h1>
                    <p className="text-gray-400">Conecta tus tiendas online para automatizar tu facturación.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {integrations.map((integration) => (
                        <Card key={integration.id} className="bg-zinc-900 border-zinc-800 flex flex-col">
                            <CardHeader>
                                <div className="h-12 flex items-center mb-2">
                                    {/* Using img for external logos, ideally use Next Image with configured domains or local assets */}
                                    <img
                                        src={integration.logo}
                                        alt={integration.name}
                                        className="h-8 object-contain max-w-[120px]"
                                        style={{ filter: integration.id === 'mercadolibre' ? 'brightness(0) invert(1)' : integration.id === 'amazon' ? 'brightness(0) invert(1)' : 'none' }} // Simple darkening for white logos if needed, though ML and Amazon usually have colored logos. Let's adjust styles.
                                    />
                                    {/* Fixing logo visibility for dark mode approximately */}
                                    {integration.id === 'mercadolibre' && (
                                        <div className="absolute top-6 left-6 h-8 w-32 bg-yellow-400/10 -z-10 rounded-full blur-xl"></div>
                                    )}
                                </div>
                                <CardTitle className="text-white flex items-center gap-2">
                                    {integration.name}
                                    {integration.status === "connected" && (
                                        <Badge variant="default" className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20">
                                            Conectado
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    {integration.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {integration.status === "connected" ? (
                                    <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">Sincronización activa</p>
                                                <p className="text-xs text-green-400/80">Última actualización: hace 5 min</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : integration.status === "connecting" ? (
                                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 flex items-center gap-3">
                                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                        <p className="text-sm text-blue-400">Conectando tienda...</p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                                        <p className="text-sm text-gray-400 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            No conectado
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                {integration.status === "connected" ? (
                                    <Button
                                        variant="outline"
                                        className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                        onClick={() => handleDisconnect(integration.id)}
                                    >
                                        Desconectar
                                    </Button>
                                ) : (
                                    <Button
                                        className={`w-full ${integration.primaryColor} border-none`}
                                        onClick={() => handleConnect(integration.id)}
                                        disabled={integration.status === "connecting"}
                                    >
                                        {integration.status === "connecting" ? "Conectando..." : "Conectar"}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <ValidationDialog
                    open={openDialog}
                    onOpenChange={setOpenDialog}
                    onConfirm={confirmConnection}
                    platformName={integrations.find(i => i.id === connectingId)?.name || ""}
                />
            </div>
        </ProGate>
    )
}

function ValidationDialog({
    open,
    onOpenChange,
    onConfirm,
    platformName
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    platformName: string
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Conectar {platformName}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Ingresa tus credenciales de API para autorizar la conexión.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="client-id" className="text-gray-300">Client ID / App ID</Label>
                        <Input id="client-id" placeholder="Ej: 123456789" className="bg-zinc-900 border-zinc-800 text-white" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="client-secret" className="text-gray-300">Client Secret / API Key</Label>
                        <Input id="client-secret" type="password" placeholder="••••••••••••••••" className="bg-zinc-900 border-zinc-800 text-white" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white">Cancelar</Button>
                    <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">Conectar Tienda</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
