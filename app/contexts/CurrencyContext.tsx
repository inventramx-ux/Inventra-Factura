"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { detectLocation, fetchExchangeRates, LocationData } from "@/lib/currency";

interface CurrencyContextType {
  currency: string;
  countryCode: string;
  isMX: boolean;
  isLoading: boolean;
  proPrice: string;
  location: LocationData | null;
  rates: Record<string, number>;
  formatPrice: (mxnAmount: number, usdAmountOverride?: number) => string;
  convert: (amount: number, from: string, to: string) => number;
  format: (amount: number, currencyCode: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({ "USD": 1, "MXN": 17.5 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initCurrency() {
      try {
        const [locData, rateData] = await Promise.all([
          detectLocation(),
          fetchExchangeRates()
        ]);
        setLocation(locData);
        if (rateData && rateData.rates) {
          setRates(rateData.rates);
        }
      } catch (error) {
        console.error("Error initializing currency data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    initCurrency();
  }, []);

  // Default to MX logic unless detected otherwise
  const countryCode = location?.country_code || "MX";
  const isMX = countryCode === "MX";
  const currency = isMX ? "MXN" : "USD";

  // Fixed prices with currency suffix as requested
  const proPrice = isMX ? "$199 MXN" : "$9.99 USD";

  /**
   * Helper to format a number to its currency string.
   */
  const format = (amount: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
      }).format(amount);
    } catch (e) {
      return `${currencyCode} ${amount.toFixed(2)}`;
    }
  };

  /**
   * Converts an amount from one currency to another using USD as base.
   */
  const convert = (amount: number, from: string, to: string) => {
    if (!rates[from] || !rates[to]) return amount;
    // (amount / fromRate) -> converts to USD base
    // then * toRate -> converts to target currency
    return (amount / rates[from]) * rates[to];
  };

  /**
   * Special helper for hardcoded prices (Landing/Upgrade).
   * If usdAmountOverride is provided and user is not in MX, it uses that.
   */
  const formatPrice = (mxnAmount: number, usdAmountOverride?: number) => {
    if (isMX) {
      return format(mxnAmount, "MXN").replace(",00", ""); // Clean decimals as requested previously
    } else {
      const amount = usdAmountOverride !== undefined ? usdAmountOverride : convert(mxnAmount, "MXN", "USD");
      return format(amount, "USD");
    }
  };

  const value = {
    currency,
    countryCode,
    isMX,
    isLoading,
    proPrice,
    location,
    rates,
    formatPrice,
    convert,
    format,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
