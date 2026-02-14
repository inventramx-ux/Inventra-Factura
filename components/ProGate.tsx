"use client"

import { useSubscription } from "@/app/contexts/SubscriptionContext"
import { Lock, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

interface ProGateProps {
    children: React.ReactNode
    featureName: string
    featureDescription: string
}

export function ProGate({ children, featureName, featureDescription }: ProGateProps) {
    const { isPro, isLoading } = useSubscription()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5" />
                    <div className="h-4 w-48 rounded bg-white/5" />
                    <div className="h-3 w-32 rounded bg-white/5" />
                </div>
            </div>
        )
    }

    if (isPro) {
        return <>{children}</>
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md w-full text-center">
                <div className="relative mx-auto mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8 text-amber-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center mx-auto" style={{ left: 'calc(50% + 20px)' }}>
                        <Sparkles className="w-3.5 h-3.5 text-black" />
                    </div>
                </div>

                <h2 className="text-2xl font-semibold text-white mb-3">
                    {featureName}
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    {featureDescription}
                </p>

                <Link
                    href="/checkout"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold py-3 px-8 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
                >
                    Actualizar a Pro
                    <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-xs text-gray-500 mt-4">
                    $199 MXN/mes · Cancela cuando quieras
                </p>
            </div>
        </div>
    )
}
