import fs from 'fs';
import path from 'path';

// Manual env parsing
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const mode = process.env.PAYPAL_MODE || "sandbox";
const baseUrl = mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

console.log(`Using PayPal in ${mode} mode`);

if (!clientId || !clientSecret) {
    console.error("Missing credentials in .env.local");
    process.exit(1);
}

async function getAccessToken() {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    return data.access_token;
}

async function createProduct(token) {
    const response = await fetch(`${baseUrl}/v1/catalogs/products`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: "Inventra Pro",
            description: "Suscripción Premium de Inventra Factura",
            type: "SERVICE",
            category: "SOFTWARE",
        }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    return data.id;
}

async function createPlan(token, productId) {
    const response = await fetch(`${baseUrl}/v1/billing/plans`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId,
            name: "Plan Mensual Pro - MXN",
            status: "ACTIVE",
            description: "Acceso total - $199.00 MXN mensuales",
            billing_cycles: [{
                frequency: { interval_unit: "MONTH", interval_count: 1 },
                tenure_type: "REGULAR",
                sequence: 1,
                total_cycles: 0,
                pricing_scheme: {
                    fixed_price: { value: "199.00", currency_code: "MXN" }
                }
            }],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: { value: "0", currency_code: "MXN" },
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3
            }
        }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    return data.id;
}

(async () => {
    try {
        console.log("Getting Access Token...");
        const token = await getAccessToken();
        console.log("Creating Product...");
        const productId = await createProduct(token);
        console.log("Creating Plan...");
        const planId = await createPlan(token, productId);
        console.log("\nSUCCESS!");
        console.log(`PLAN_ID: ${planId}`);
        console.log("\nUpdate your .env.local with this ID:");
        console.log(`NEXT_PUBLIC_PAYPAL_PLAN_ID=${planId}`);
    } catch (e) {
        console.error("Script failed:", e.message);
    }
})();
