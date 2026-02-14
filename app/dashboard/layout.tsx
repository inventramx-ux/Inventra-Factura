"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SubscriptionProvider } from "@/app/contexts/SubscriptionContext"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SubscriptionProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-4 bg-[#0a0a0a]">
                        <SidebarTrigger className="text-gray-400 hover:text-white -ml-1" />
                    </header>
                    <main className="flex-1 overflow-auto bg-[#0a0a0a] p-6">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </SubscriptionProvider >
    )
}