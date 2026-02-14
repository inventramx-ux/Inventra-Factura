"use client"

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
} from "@/components/ui/sidebar"

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

const proItems = [
    {
        title: "E-commerce",
        url: "/dashboard/ecommerce",
        icon: ShoppingBag,
    },
    {
        title: "Reportes Avanzados",
        url: "/dashboard/revenue",
        icon: BarChart3,
    },
    {
        title: "Plantillas",
        url: "/dashboard/templates",
        icon: Palette,
    },
    {
        title: "Recordatorios",
        url: "/dashboard/reminders",
        icon: Bell,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { user } = useUser()
    const { isPro } = useSubscription()

    const isActive = (url: string) => {
        if (url === "/dashboard") return pathname === "/dashboard"
        return pathname.startsWith(url)
    }

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-white/10 bg-zinc-950">
            <SidebarHeader className="border-b border-white/5 pb-4 pt-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-white">
                                    <img src="/inventralogo.png" alt="Inventra" className="size-8 object-contain" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-white">Inventra</span>
                                    <span className="truncate text-xs text-gray-400">
                                        {isPro ? "Pro" : "Gratuito"}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Free Section */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-gray-400">General</SidebarGroupLabel>
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

                {/* Pro Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <div className="flex items-center gap-2">
                            <Crown className="size-3 text-amber-400" />
                            <span className="text-gray-300">Pro</span>
                            {!isPro && (
                                <span className="ml-auto text-[10px] font-medium bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                                    UPGRADE
                                </span>
                            )}
                        </div>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {proItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={isPro ? item.title : `${item.title} (Pro)`}
                                        isActive={isActive(item.url)}
                                        className="text-gray-300 hover:text-white hover:bg-white/10"
                                    >
                                        <Link href={isPro ? item.url : "/dashboard/upgrade"} className="relative">
                                            <item.icon className={!isPro ? "opacity-50" : ""} />
                                            <span className={!isPro ? "opacity-50" : ""}>{item.title}</span>
                                            {!isPro && (
                                                <Lock className="size-3 text-amber-400/70 ml-auto" />
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
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
