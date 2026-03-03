import { NextResponse } from "next/server";
import { facturapi } from "@/lib/facturapi";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; format: string }> }
) {
    const { id, format } = await params;

    try {
        let file;
        if (format === 'pdf') {
            file = await facturapi.invoices.downloadPdf(id);
        } else if (format === 'xml') {
            file = await facturapi.invoices.downloadXml(id);
        } else {
            return NextResponse.json({ error: "Invalid format" }, { status: 400 });
        }

        const response = new Response(file as any);
        response.headers.set('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/xml');
        response.headers.set('Content-Disposition', `attachment; filename=invoice-${id}.${format}`);

        return response;
    } catch (error: any) {
        console.error(`Download error (${format}):`, error);
        return NextResponse.json(
            { error: "Failed to download file", details: error.message },
            { status: 500 }
        );
    }
}
