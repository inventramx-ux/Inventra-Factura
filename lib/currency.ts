/**
 * Currency Utility
 * Handles location detection (via IP) and exchange rate fetching.
 */

export interface LocationData {
  country: string;
  country_code: string;
  currency: string;
  currency_name: string;
  ip: string;
}

export interface ExchangeRates {
  base_code: string;
  rates: Record<string, number>;
  time_last_update_utc: string;
}

const IPAPI_URL = "https://ipapi.co/json/";
const EXCHANGE_RATE_URL = "https://open.er-api.com/v6/latest/USD";

/**
 * Fetches the user's location and currency info based on their IP.
 */
export async function detectLocation(): Promise<LocationData> {
  try {
    // Try ipapi.co first
    const response = await fetch(IPAPI_URL);
    if (!response.ok) throw new Error("Failed to fetch from ipapi.co");
    const data = await response.json();
    return {
      country: data.country_name,
      country_code: data.country_code,
      currency: data.currency || "USD",
      currency_name: data.currency_name || "US Dollar",
      ip: data.ip
    };
  } catch (error) {
    console.warn("ipapi.co failed, trying ip-api.com fallback:", error);
    try {
      // Fallback to ip-api.com (no currency, so we'll default to USD or common ones)
      const res = await fetch("http://ip-api.com/json/");
      const data = await res.json();
      return {
        country: data.country,
        country_code: data.countryCode,
        currency: "USD", // ip-api doesn't provide currency in free tier
        currency_name: "US Dollar",
        ip: data.query
      };
    } catch (e) {
      console.error("All location services failed:", e);
      return {
        country: "Unknown",
        country_code: "US",
        currency: "USD",
        currency_name: "US Dollar",
        ip: "0.0.0.0"
      };
    }
  }
}

/**
 * Fetches the latest exchange rates with USD as base.
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch(EXCHANGE_RATE_URL);
    if (!response.ok) throw new Error("Failed to fetch exchange rates");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return {
      base_code: "USD",
      rates: { "USD": 1 },
      time_last_update_utc: new Date().toUTCString()
    };
  }
}

/**
 * Formats a number as a currency string.
 */
export function formatCurrency(amount: number, currencyCode: string = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch (e) {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}
