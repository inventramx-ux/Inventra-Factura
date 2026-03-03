import { NextResponse } from "next/server";
import { facturapi } from "@/lib/facturapi";
import { supabase } from "@/lib/supabase";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = await params;

    try {
        // 1. Fetch invoice data from Supabase
        const { data: invoice, error: invoiceError } = await supabase
            .from("invoices")
            .select("*")
            .eq("id", id)
            .single();

        if (invoiceError || !invoice) {
            throw new Error(`Invoice not found: ${invoiceError?.message || "unknown"}`);
        }

        // 2. Prepare Facturapi Invoice Data
        const tax_id = invoice.rfc || "XAXX010101000";
        const isGenericRfc = tax_id === "XAXX010101000" || tax_id === "XEXX010101000";

        console.log("DEBUG: Processing stamping for invoice:", id);
        console.log("DEBUG: Invoice data from Supabase:", JSON.stringify(invoice, null, 2));

        const firstItem = (invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0)
            ? invoice.items[0]
            : {};

        const facturapiInvoiceData = {
            customer: {
                legal_name: invoice.client_name,
                tax_id: tax_id,
                tax_system: isGenericRfc ? "616" : (invoice.tax_system || "601"),
                address: {
                    zip: invoice.zip_code || "00000",
                },
            },
            items: [
                {
                    product: {
                        description: firstItem.description || invoice.description || "Servicio comercial",
                        product_key: invoice.sat_product_code || "01010101",
                        price: firstItem.unitPrice || invoice.unit_price || 0,
                    },
                    quantity: firstItem.quantity || invoice.quantity || 1,
                },
            ],
            payment_form: "03", // Transferencia electrónica de fondos
            use: isGenericRfc ? "S01" : (invoice.usage || "G03"),
        };

        // 3. Create and Stamp invoice in Facturapi
        // Note: Creating an invoice in Facturapi automatically stamps it (generates CFDI)
        const facturapiInvoice = await facturapi.invoices.create(facturapiInvoiceData);

        // 4. Update invoice in Supabase with the Facturapi ID and new status
        const { error: updateError } = await supabase
            .from("invoices")
            .update({
                facturapi_id: facturapiInvoice.id,
                status: "stamped",
            })
            .eq("id", id);

        if (updateError) {
            console.error("Error updating invoice in Supabase after stamping:", updateError);
            // We don't throw here because the stamping was successful in Facturapi
        }

        return NextResponse.json({
            success: true,
            facturapiId: facturapiInvoice.id,
            invoice: facturapiInvoice
        });
    } catch (error: any) {
        console.error("Stamping error:", error);
        return NextResponse.json(
            {
                error: error.message || "Failed to stamp invoice",
                details: error.description || error.details || null
            },
            { status: 500 }
        );
    }
}
