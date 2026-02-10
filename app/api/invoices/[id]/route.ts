import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // En un entorno real, buscaríamos en la base de datos
    // Por ahora, simulamos datos de ejemplo
    const mockInvoice = {
      id: id,
      invoiceNumber: `INV-${id}`,
      clientName: "Juan Pérez",
      clientEmail: "juan@example.com", 
      clientPhone: "+52 555 123 4567",
      clientAddress: "Calle Principal #123, Ciudad de México",
      platform: "mercadolibre",
      items: [
        {
          id: "1",
          description: "iPhone 15 Pro Max 256GB",
          quantity: 1,
          unitPrice: 25000,
          total: 25000
        },
        {
          id: "2", 
          description: "Funda de Silicon",
          quantity: 2,
          unitPrice: 500,
          total: 1000
        }
      ],
      subtotal: 26000,
      tax: 4160,
      total: 30160,
      status: "paid",
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: "transferencia",
      notes: "Pago recibido correctamente. Producto enviado."
    }

    return NextResponse.json(mockInvoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const updateData = await request.json()

    // En un entorno real, actualizaríamos en la base de datos
    console.log('Updating invoice:', id, updateData)

    const updatedInvoice = {
      id: id,
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Error updating invoice' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // En un entorno real, eliminaríamos de la base de datos
    console.log('Deleting invoice:', id)

    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Error deleting invoice' }, { status: 500 })
  }
}
