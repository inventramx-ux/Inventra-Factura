import fs from 'fs';
import path from 'path';

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
const planId = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID;
const baseUrl = 'https://api-m.sandbox.paypal.com';

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
    return data.access_token;
}

async function checkPlan() {
    try {
        const token = await getAccessToken();
        const url = `${baseUrl}/v1/billing/plans?page_size=20&page=1&total_required=true`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log("---START_PLAN_IDS---");
        data.plans?.forEach(p => {
            console.log(`PLAN_ID_FOUND: [${p.id}]`);
        });
        console.log("---END_PLAN_IDS---");
    } catch (e) {
        console.error("Check failed:", e.message);
    }
}

checkPlan();
