import paypal from '@paypal/checkout-server-sdk';
import 'dotenv/config';

// Initialize environment
const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    console.error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in .env.local");
    process.exit(1);
}

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

async function createProduct() {
    const request = new paypal.core.PayPalHttpRequest('/v1/catalogs/products', 'POST');
    request.setHeader("Content-Type", "application/json");
    request.requestBody({
        "name": "Suscripción Mensual",
        "description": "Acceso premium mensual a la plataforma",
        "type": "SERVICE",
        "category": "SOFTWARE",
        "image_url": "https://example.com/logo.png",
        "home_url": "https://example.com"
    });

    try {
        const response = await client.execute(request);
        console.log(`Product Created: ${response.result.id}`);
        return response.result.id;
    } catch (err) {
        console.error("Error creating product:", err);
        throw err;
    }
}

async function createPlan(productId) {
    const request = new paypal.core.PayPalHttpRequest('/v1/billing/plans', 'POST');
    request.setHeader("Content-Type", "application/json");
    request.requestBody({
        "product_id": productId,
        "name": "Plan Mensual $9.99",
        "description": "Suscripción mensual de $9.99 USD",
        "billing_cycles": [
            {
                "frequency": {
                    "interval_unit": "MONTH",
                    "interval_count": 1
                },
                "tenure_type": "REGULAR",
                "sequence": 1,
                "total_cycles": 0, // 0 means infinite
                "pricing_scheme": {
                    "fixed_price": {
                        "value": "9.99",
                        "currency_code": "USD"
                    }
                }
            }
        ],
        "payment_preferences": {
            "auto_bill_outstanding": true,
            "setup_fee": {
                "value": "0",
                "currency_code": "USD"
            },
            "setup_fee_failure_action": "CONTINUE",
            "payment_failure_threshold": 3
        }
    });

    try {
        const response = await client.execute(request);
        console.log(`Plan Created: ${response.result.id}`);
        return response.result.id;
    } catch (err) {
        console.error("Error creating plan:", err);
        throw err;
    }
}

(async () => {
    try {
        console.log("Creating Product...");
        const productId = await createProduct();
        console.log("Creating Plan...");
        const planId = await createPlan(productId);
        console.log("\nSUCCESS! Use this Plan ID in your frontend:");
        console.log(`PLAN_ID: ${planId}`);
    } catch (e) {
        console.error("Script failed:", e);
    }
})();
