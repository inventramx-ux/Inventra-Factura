"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, Plus, Settings } from "lucide-react"
import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
        <div>
          <h1 className="text-xl font-bold text-white">Inventra</h1>
          <p className="text-xs text-gray-400">Facturación E-commerce</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} className="w-full">
                  <SidebarMenuButton isActive={isActive}>
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
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
