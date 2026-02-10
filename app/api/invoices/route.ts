import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // En un entorno real, esto vendría de una base de datos
    // Por ahora usamos localStorage simulado con JSON
    const invoices = [
      {
        id: "1",
        invoiceNumber: "INV-202401",
        clientName: "Juan Pérez",
        clientEmail: "juan@example.com",
        clientPhone: "+52 555 123 4567",
        clientAddress: "Calle Principal #123, Ciudad de México",
        platform: "mercadolibre",
        items: [
          {
            id: "1",
            description: "iPhone 15 Pro Max",
            quantity: 1,
            unitPrice: 25000,
            total: 25000
          }
        ],
        subtotal: 25000,
        tax: 4000,
        total: 29000,
        status: "paid",
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: "transferencia",
        notes: "Pago recibido correctamente"
      },
      {
        id: "2", 
        invoiceNumber: "INV-202402",
        clientName: "María González",
        clientEmail: "maria@example.com",
        clientPhone: "+52 555 987 6543",
        clientAddress: "Avenida Siempre Viva #456, Monterrey",
        platform: "amazon",
        items: [
          {
            id: "1",
            description: "MacBook Air M2",
            quantity: 1,
            unitPrice: 35000,
            total: 35000
          }
        ],
        subtotal: 35000,
        tax: 5600,
        total: 40600,
        status: "sent",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: "tarjeta",
        notes: "Pendiente de pago"
      }
    ]

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Error fetching invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const invoiceData = await request.json()

    // Validar datos mínimos
    if (!invoiceData.clientName || !invoiceData.items || invoiceData.items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Crear nueva factura
    const newInvoice = {
      id: Date.now().toString(),
      invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail || "",
      clientPhone: invoiceData.clientPhone || "",
      clientAddress: invoiceData.clientAddress || "",
      platform: invoiceData.platform || "custom",
      items: invoiceData.items,
      subtotal: invoiceData.subtotal || 0,
      tax: invoiceData.tax || 0,
      total: invoiceData.total || 0,
      status: "sent",
      createdAt: new Date().toISOString(),
      dueDate: invoiceData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: invoiceData.paymentMethod || "transferencia",
      notes: invoiceData.notes || ""
    }

    // En un entorno real, guardaríamos en base de datos
    // Por ahora, simulamos el guardado exitoso
    console.log('New invoice created:', newInvoice)

    return NextResponse.json(newInvoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Error creating invoice' }, { status: 500 })
  }
}
