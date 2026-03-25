import { detectLocation, fetchExchangeRates } from '../lib/currency';

async function test() {
  console.log("Testing Location Detection...");
  const loc = await detectLocation();
  console.log("Location Data:", JSON.stringify(loc, null, 2));

  console.log("\nTesting Exchange Rates...");
  const rates = await fetchExchangeRates();
  console.log("Base Currency:", rates.base_code);
  console.log("Sample Rate (MXN):", rates.rates["MXN"]);
  console.log("Sample Rate (EUR):", rates.rates["EUR"]);
}

test().catch(console.error);
