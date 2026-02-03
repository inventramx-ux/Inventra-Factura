import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    businessName: user.businessName,
    rfc: user.rfc,
    taxId: user.taxId,
    address: user.address,
    phone: user.phone,
    website: user.website,
    taxRate: user.taxRate,
  });
}

export async function PATCH(request: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  const allowed = [
    "businessName", "rfc", "taxId", "address", "phone", "website", "taxRate", "name",
  ] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === "taxRate") data[key] = Number(body[key]);
      else data[key] = body[key];
    }
  }
  const { prisma } = await import("@/lib/db");
  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });
  return NextResponse.json(updated);
}
