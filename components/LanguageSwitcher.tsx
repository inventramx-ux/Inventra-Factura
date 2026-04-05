"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useLocale } from "next-intl"
import { setUserLocale } from "@/i18n/services/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function LanguageSwitcher() {
  const locale = useLocale()
  const [isPending, startTransition] = React.useTransition()

  function handleLocaleChange(newLocale: string) {
    if (newLocale === locale) return;
    
    startTransition(async () => {
      await setUserLocale(newLocale)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 h-9 w-9 rounded-md transition-colors outline-none group"
          disabled={isPending}
        >
          <Languages className={cn(
            "h-5 w-5 transition-transform group-hover:scale-110", 
            isPending && "animate-pulse"
          )} />
          <span className="sr-only">Cambiar idioma / Change language</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-zinc-950/95 backdrop-blur-md border-white/10 text-white min-w-[140px] shadow-2xl"
      >
        <DropdownMenuItem
          onClick={() => handleLocaleChange('es')}
          className="flex items-center justify-between cursor-pointer focus:bg-white/10 focus:text-white py-2.5 px-3 transition-colors"
        >
          <span className="text-sm font-medium">Español</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange('en')}
          className="flex items-center justify-between cursor-pointer focus:bg-white/10 focus:text-white py-2.5 px-3 transition-colors"
        >
          <span className="text-sm font-medium">English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
