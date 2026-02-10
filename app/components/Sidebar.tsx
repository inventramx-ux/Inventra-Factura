"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Plus, 
  FileText, 
  Settings, 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Package,
  TrendingUp,
  Crown,
  ShoppingBasket,
  Store,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/app/components/ui/sidebar"
import { useSubscription } from "@/app/contexts/SubscriptionContext"

export function Sidebar() {
  const pathname = usePathname()
  const { isPro } = useSubscription()

  const mainItems = [
    {
      title: "Inicio",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Crear Factura",
      href: "/dashboard/invoices/new",
      icon: Plus,
    },
    {
      title: "Mis Facturas",
      href: "/dashboard/invoices",
      icon: FileText,
    },
  ]

  const platformItems = [
    {
      title: "Amazon",
      href: "/dashboard/invoices/new?platform=amazon",
      icon: ShoppingBasket,
      badge: "Popular",
    },
    {
      title: "Mercado Libre",
      href: "/dashboard/invoices/new?platform=mercadolibre",
      icon: ShoppingCart,
    },
    {
      title: "eBay",
      href: "/dashboard/invoices/new?platform=ebay",
      icon: Globe,
    },
    {
      title: "Tienda Propia",
      href: "/dashboard/invoices/new?platform=custom",
      icon: Store,
    },
  ]

  const toolsItems = [
    {
      title: "Clientes",
      href: "/dashboard/clients",
      icon: Users,
      pro: false,
    },
    {
      title: "Reportes",
      href: "/dashboard/reports",
      icon: BarChart3,
      pro: true,
    },
    {
      title: "Plantillas",
      href: "/dashboard/templates",
      icon: Package,
      pro: true,
    },
  ]

  const settingsItems = [
    {
      title: "Configuración",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <SidebarRoot>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-3">
          <img
            src="/inventralogo.png"
            alt="Inventra Factura"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <div>
            <h1 className="text-xl font-bold text-white">Inventra Factura</h1>
            <p className="text-xs text-gray-400">Facturación E-commerce</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <div className="space-y-6">
          {/* Main Navigation */}
          <SidebarMenu>
            <SidebarGroup>
              <SidebarGroupLabel>Principal</SidebarGroupLabel>
              {mainItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-white text-black"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarGroup>
          </SidebarMenu>

          {/* Platform Quick Actions */}
          <SidebarMenu>
            <SidebarGroup>
              <SidebarGroupLabel>Crear por Plataforma</SidebarGroupLabel>
              {platformItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors relative",
                        isActive
                          ? "bg-white text-black"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarGroup>
          </SidebarMenu>

          {/* Tools */}
          <SidebarMenu>
            <SidebarGroup>
              <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
              {toolsItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                const isLocked = item.pro && !isPro

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link
                      href={isLocked ? "/checkout" : item.href}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors relative",
                        isActive
                          ? "bg-white text-black"
                          : isLocked
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{item.title}</span>
                      {isLocked && (
                        <Crown className="w-3 h-3 text-yellow-500" />
                      )}
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarGroup>
          </SidebarMenu>

          {/* Settings */}
          <SidebarMenu>
            <SidebarGroup>
              <SidebarGroupLabel>Configuración</SidebarGroupLabel>
              {settingsItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-white text-black"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarGroup>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-2">
          {!isPro && (
            <Link 
              href="/checkout"
              className="flex items-center gap-2 w-full px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-500 hover:bg-yellow-500/30 transition-colors text-sm font-medium"
            >
              <Crown className="w-4 h-4" />
              <span>Actualizar a Pro</span>
            </Link>
          )}
          <p className="text-xs text-gray-500">© 2026 Inventra Factura</p>
        </div>
      </SidebarFooter>
    </SidebarRoot>
  )
}
