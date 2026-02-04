"use client"

import Link from "next/link"
// removed next/image to use plain <img>
import { usePathname } from "next/navigation"
import { FileText, Home, Plus, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
} from "@/app/components/ui/sidebar"

export function Sidebar() {
  const pathname = usePathname()

  const items = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Nueva Factura",
      href: "/dashboard/invoices/new",
      icon: Plus,
    },
    {
      title: "Mis Facturas",
      href: "/dashboard/invoices",
      icon: FileText,
    },
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
        <SidebarMenu>
          {items.map((item) => {
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
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-xs text-gray-500">© 2026 Inventra Factura</p>
      </SidebarFooter>
    </SidebarRoot>
  )
}
