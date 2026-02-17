import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        // 1. Verificar tablas
        const { error: clientsError } = await supabase.from('clients').select('id').limit(1)
        const { error: invoicesError } = await supabase.from('invoices').select('id').limit(1)

        // 2. Intentar una inserción de prueba (esto fallará si RLS está activo y no hay sesión)
        const { data: insertData, error: insertError } = await supabase
            .from('clients')
            .insert([{ name: 'Test Diagnostic', user_id: 'test_system' }])
            .select()

        return NextResponse.json({
            status: "Diagnostic Report",
            tables: {
                clients: clientsError ? "Error: " + clientsError.message : "OK / RLS Restricted",
                invoices: invoicesError ? "Error: " + invoicesError.message : "OK / RLS Restricted"
            },
            insertion_test: {
                success: !insertError,
                error: insertError ? insertError.message : null,
                hint: insertError?.message?.includes("row-level security")
                    ? "RLS está bloqueando la inserción. Necesitas configurar el JWT de Clerk en Supabase o desactivar RLS temporalmente para pruebas."
                    : "No hay errores claros de RLS."
            },
            config: {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "Missing",
                anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "OK" : "Missing"
            }
        })
    } catch (err: any) {
        return NextResponse.json({ status: "Exception", error: err.message }, { status: 500 })
    }
}
