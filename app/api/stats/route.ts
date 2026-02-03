import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [invoiceCount, clientCount, paidInvoices, totalRevenue] = await Promise.all([
    prisma.invoice.count({ where: { userId: user.id } }),
    prisma.client.count({ where: { userId: user.id } }),
    prisma.invoice.findMany({
      where: { userId: user.id, status: "paid" },
      select: { total: true, createdAt: true },
    }),
    prisma.invoice.aggregate({
      where: { userId: user.id, status: "paid" },
      _sum: { total: true },
    }),
  ]);

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const invoicesThisWeek = paidInvoices.filter((i) => i.createdAt >= thisWeek).length;
  const revenue = totalRevenue._sum.total ?? 0;

  return NextResponse.json({
    invoiceCount,
    clientCount,
    paidCount: paidInvoices.length,
    totalRevenue: revenue,
    invoicesThisWeek,
    platformCount: 4,
  });
}
