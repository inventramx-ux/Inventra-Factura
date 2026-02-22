import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials in .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    console.log(`Checking connection to: ${supabaseUrl}`)
    try {
        const response = await supabase.from('invoices').select('id').limit(1)

        if (response.error) {
            console.error("Supabase Error Object:", JSON.stringify(response.error, null, 2))
            console.error("Status:", response.status)
            console.error("Status Text:", response.statusText)
        } else {
            console.log("SUCCESS! Connected to Supabase.")
            console.log("Data count:", response.data?.length)
            console.log("Sample Data:", response.data?.[0])
        }
    } catch (e) {
        console.error("Unexpected Exception:", e)
    }
}

testConnection()
