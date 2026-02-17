"use client"
import { useState } from "react"

import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    BarChart3,
    Palette,
    Bell,
    Lock,
    Sparkles,
    ShoppingBag,
    Crown,
    Mail,
    Copy,
    Check,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"
import { useSubscription } from "@/app/contexts/SubscriptionContext"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    SidebarRail,
    SidebarSeparator,
    SidebarMenuAction,
} from "@/components/ui/sidebar"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const freeItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Facturas",
        url: "/dashboard/invoices",
        icon: FileText,
    },
    {
        title: "Clientes",
        url: "/dashboard/clients",
        icon: Users,
    },
    {
        title: "Configuración",
        url: "/dashboard/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { user } = useUser()
    const { isPro } = useSubscription()
    const [copied, setCopied] = useState(false)

    const copyEmail = () => {
        navigator.clipboard.writeText("inventramx@gmail.com")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const isActive = (url: string) => {
        if (url === "/dashboard") return pathname === "/dashboard"
        return pathname.startsWith(url)
    }

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-white/10 bg-zinc-950">
            <SidebarHeader className="border-b border-white/5 pr-4 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent w-full justify-center">
                            <Link href="/">
                                <div className="flex items-center justify-center">
                                    <img src="/inventralogo.png" alt="Inventra" className="h-8 w-auto object-contain" />
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Free Section */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-gray-400">
                        <div className="flex items-center gap-2">
                            {isPro && <Crown className="size-3 text-amber-400" />}
                            <span>{isPro ? "Pro" : "General"}</span>
                        </div>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {freeItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={isActive(item.url)}
                                        className="text-gray-300 hover:text-white hover:bg-white/10"
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="bg-white/10" />

                {/* Support Section */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-gray-400">Soporte</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip="Soporte"
                                    className="text-gray-300 hover:text-white hover:bg-white/10 h-auto py-2"
                                >
                                    <a href="mailto:inventramx@gmail.com" className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <Mail className="size-4" />
                                        </div>
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-sm font-medium truncate">Contacto</span>
                                            <span className="text-[10px] text-blue-400 truncate font-mono">
                                                inventramx@gmail.com
                                            </span>
                                            <span className="text-[9px] text-gray-500 leading-tight">
                                                Respuesta en menos de 12 horas
                                            </span>
                                        </div>
                                    </a>
                                </SidebarMenuButton>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <SidebarMenuAction
                                            onClick={copyEmail}
                                            className="hover:bg-white/10 text-gray-400 hover:text-white"
                                        >
                                            {copied ? (
                                                <Check className="size-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="size-3.5" />
                                            )}
                                        </SidebarMenuAction>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">Copiar correo</TooltipContent>
                                </Tooltip>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="bg-white/10" />
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-white/5 text-gray-200">
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8",
                                    },
                                }}
                            />
                            <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                                <span className="truncate font-semibold text-white">
                                    {user?.firstName || user?.username || "Usuario"}
                                </span>
                                <span className="truncate text-xs text-gray-400">
                                    {user?.primaryEmailAddress?.emailAddress || ""}
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
