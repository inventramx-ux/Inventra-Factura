import fs from 'fs'
import path from 'path'

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testFetch() {
    console.log(`Testing raw fetch to: ${url}/rest/v1/invoices?select=count`)
    try {
        const res = await fetch(`${url}/rest/v1/invoices?select=count`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        })
        const data = await res.json()
        console.log("Response:", JSON.stringify(data, null, 2))
    } catch (e) {
        console.error("Fetch failed:", e)
    }
}

testFetch()
