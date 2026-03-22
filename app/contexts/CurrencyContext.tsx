'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { detectLocation, fetchExchangeRates, LocationData, ExchangeRates, formatCurrency } from '@/lib/currency';

interface CurrencyContextType {
  location: LocationData | null;
  rates: ExchangeRates | null;
  currency: string;
  currencySymbol: string;
  isLoading: boolean;
  convert: (amount: number, from?: string, to?: string) => number;
  format: (amount: number, currencyCode?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const init = async () => {
    try {
      setIsLoading(true);
      const [loc, exchange] = await Promise.all([
        detectLocation(),
        fetchExchangeRates()
      ]);
      setLocation(loc);
      setRates(exchange);
    } catch (error) {
      console.error("Error initializing currency context:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const currency = location?.currency || 'USD';

  const convert = useCallback((amount: number, from: string = 'USD', to: string = currency) => {
    if (!rates || !rates.rates) return amount;
    
    // Convert from 'from' to USD first
    const inUSD = from === 'USD' ? amount : amount / (rates.rates[from] || 1);
    
    // Convert from USD to 'to'
    const result = to === 'USD' ? inUSD : inUSD * (rates.rates[to] || 1);
    
    return result;
  }, [rates, currency]);

  const format = useCallback((amount: number, currencyCode: string = currency) => {
    return formatCurrency(amount, currencyCode);
  }, [currency]);

  // Derived symbol (basic implementation)
  const currencySymbol = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
  }).format(0).replace(/\d| |\.|,/g, '');

  return (
    <CurrencyContext.Provider value={{
      location,
      rates,
      currency,
      currencySymbol,
      isLoading,
      convert,
      format
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
