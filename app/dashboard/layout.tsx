import { Sidebar } from "@/app/components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-black">
        {children}
      </main>
    </div>
  )
}
