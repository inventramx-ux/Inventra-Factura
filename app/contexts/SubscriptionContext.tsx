"use client"



import { createContext, useContext, useEffect, useState } from "react"

import { useUser } from "@clerk/nextjs"

import { supabase } from "@/lib/supabase"



interface SubscriptionContextType {

  isPro: boolean

  isLoading: boolean

  upgradeToPro: () => Promise<void>

  refreshSubscription: () => Promise<void>

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

        // 1. First check Supabase (Source of Truth)

        const { data: subData, error: subError } = await supabase

          .from('subscriptions')

          .select('status')

          .eq('user_id', user.id)

          .single()



        if (!subError && subData) {

          setIsPro(subData.status === "pro")

        } else {

          // 2. Fallback to Clerk metadata if Supabase fails or record doesn't exist

          const subscriptionStatus = user.publicMetadata?.subscriptionStatus

          setIsPro(subscriptionStatus === "pro")

        }

      } catch (error) {

        console.error("Error checking subscription:", error)

        setIsPro(false)

      } finally {

        setIsLoading(false)

      }

    }



    checkSubscription()

  }, [user, userLoaded])



  // Function to refresh user data from Clerk

  const refreshSubscription = async () => {

    if (!user) return



    try {

      // Force Clerk to reload user data

      await user.reload()



      // Re-check Supabase

      const { data: subData } = await supabase

        .from('subscriptions')

        .select('status')

        .eq('user_id', user.id)

        .single()



      if (subData) {

        setIsPro(subData.status === "pro")

      } else {

        const subscriptionStatus = user.publicMetadata?.subscriptionStatus

        setIsPro(subscriptionStatus === "pro")

      }

    } catch (error) {

      console.error("Error refreshing subscription:", error)

    }

  }



  const upgradeToPro = async () => {

    // This will be called after successful PayPal payment

    window.location.href = "/checkout"

  }



  const value = {

    isPro,

    isLoading,

    upgradeToPro,

    refreshSubscription,

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

