import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: { client: true, lineItems: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }
  return NextResponse.json({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    platform: invoice.platform,
    status: invoice.status,
    dueDate: invoice.dueDate?.toISOString().split("T")[0] ?? null,
    notes: invoice.notes,
    createdAt: invoice.createdAt.toISOString().split("T")[0],
    client: {
      name: invoice.client.name,
      email: invoice.client.email,
      phone: invoice.client.phone,
    },
    subtotal: invoice.subtotal,
    taxAmount: invoice.taxAmount,
    total: invoice.total,
    lineItems: invoice.lineItems.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }
  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }
  const body = await request.json();
  const { status } = body as { status?: string };
  if (status && ["draft", "sent", "paid", "overdue"].includes(status)) {
    await prisma.invoice.update({
      where: { id },
      data: {
        status,
        ...(status === "paid" ? { paidAt: new Date() } : {}),
      },
    });
  }
  const updated = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true },
  });
  return NextResponse.json(updated);
}
