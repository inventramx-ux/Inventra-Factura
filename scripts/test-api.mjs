const IPAPI_URL = "https://ipapi.co/json/";
const EXCHANGE_RATE_URL = "https://open.er-api.com/v6/latest/USD";

async function test() {
  console.log("Testing Location Detection...");
  try {
    const res1 = await fetch(IPAPI_URL);
    const data1 = await res1.json();
    console.log("Location Data:", JSON.stringify({
      country: data1.country_name,
      currency: data1.currency,
      ip: data1.ip
    }, null, 2));
  } catch (e) {
    console.error("IP API Error:", e.message);
  }

  console.log("\nTesting Exchange Rates...");
  try {
    const res2 = await fetch(EXCHANGE_RATE_URL);
    const data2 = await res2.json();
    console.log("Base Currency:", data2.base_code);
    console.log("Sample Rate (MXN):", data2.rates["MXN"]);
    console.log("Sample Rate (EUR):", data2.rates["EUR"]);
  } catch (e) {
    console.error("Exchange Rate API Error:", e.message);
  }
}

test();
