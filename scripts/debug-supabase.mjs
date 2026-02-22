import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const lines = envConfig.split('\n');
const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
const supabaseAnonKey = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY='))?.split('=')[1]?.trim();

console.log('URL:', supabaseUrl);
console.log('Key Length:', supabaseAnonKey?.length);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    const { data, error, status, statusText } = await supabase.from('subscriptions').select('count', { count: 'exact', head: true });
    if (error) {
        console.log('--- ERROR ---');
        console.log('Message:', error.message);
        console.log('Details:', error.details);
        console.log('Hint:', error.hint);
        console.log('Code:', error.code);
        console.log('Status:', status);
        console.log('StatusText:', statusText);
    } else {
        console.log('SUCCESS! Connection established.');
    }
}

test();
