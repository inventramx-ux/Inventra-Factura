import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.client.name,
      clientEmail: inv.client.email,
      platform: inv.platform,
      subtotal: inv.subtotal,
      taxAmount: inv.taxAmount,
      total: inv.total,
      status: inv.status,
      dueDate: inv.dueDate?.toISOString().split("T")[0] ?? null,
      createdAt: inv.createdAt.toISOString().split("T")[0],
    }))
  );
}

export async function POST(request: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  const {
    clientName,
    clientEmail,
    clientPhone,
    platform,
    invoiceNumber,
    invoiceDate,
    items,
    notes,
  } = body as {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    platform: string;
    invoiceNumber: string;
    invoiceDate?: string;
    items: { description: string; quantity: number; unitPrice: number; total: number }[];
    notes?: string;
  };

  if (!clientName || !clientEmail || !platform || !invoiceNumber || !items?.length) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: clientName, clientEmail, platform, invoiceNumber, items" },
      { status: 400 }
    );
  }

  const existingClient = await prisma.client.findUnique({
    where: {
      userId_email: { userId: user.id, email: clientEmail },
    },
  });

  let clientId: string;
  if (existingClient) {
    clientId = existingClient.id;
    await prisma.client.update({
      where: { id: existingClient.id },
      data: { name: clientName, phone: clientPhone ?? existingClient.phone },
    });
  } else {
    const newClient = await prisma.client.create({
      data: {
        userId: user.id,
        name: clientName,
        email: clientEmail,
        phone: clientPhone ?? null,
      },
    });
    clientId = newClient.id;
  }

  const subtotal = items.reduce((sum: number, i: { total: number }) => sum + i.total, 0);
  const taxRate = user.taxRate / 100;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const dueDate = invoiceDate ? new Date(invoiceDate) : null;

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId,
      invoiceNumber,
      platform,
      subtotal,
      taxAmount,
      total,
      status: "draft",
      dueDate,
      notes: notes ?? null,
      lineItems: {
        create: items.map((item: { description: string; quantity: number; unitPrice: number; total: number }) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      },
    },
    include: { client: true, lineItems: true },
  });

  return NextResponse.json({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.client.name,
    total: invoice.total,
    createdAt: invoice.createdAt.toISOString(),
  });
}
