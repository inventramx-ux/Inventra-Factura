"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

interface SubscriptionContextType {
  isPro: boolean
  isLoading: boolean
  upgradeToPro: () => Promise<void>
  invoicesLimit: number
  clientsLimit: number
  totalInvoices: number
  hasAdvancedReports: boolean
  hasCustomTemplates: boolean
  hasPrioritySupport: boolean
  hasAutomaticReminders: boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: userLoaded } = useUser()
  const [isPro, setIsPro] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      // Don't check subscription until user is loaded
      if (!userLoaded) {
        return
      }

      // If no user, set as not Pro and stop loading
      if (!user) {
        setIsPro(false)
        setIsLoading(false)
        return
      }

      try {
        // Check if user has Pro subscription in metadata
        const subscriptionStatus = user.publicMetadata?.subscriptionStatus
        setIsPro(subscriptionStatus === "pro")
      } catch (error) {
        console.error("Error checking subscription:", error)
        setIsPro(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscription()
  }, [user, userLoaded])

  const upgradeToPro = async () => {
    // This will be called after successful PayPal payment
    window.location.href = "/checkout"
  }

  const value = {
    isPro,
    isLoading,
    upgradeToPro,
    invoicesLimit: isPro ? Infinity : 10,
    clientsLimit: isPro ? Infinity : 5,
    totalInvoices: 0, // This would be calculated from your actual invoices data
    hasAdvancedReports: isPro,
    hasCustomTemplates: isPro,
    hasPrioritySupport: isPro,
    hasAutomaticReminders: isPro,
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
