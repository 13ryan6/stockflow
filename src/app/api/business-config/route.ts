import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const config = await db.businessConfig.findFirst();
  return NextResponse.json({ success: true, data: config });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || (role !== "ADMIN" && role !== "OWNER")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, ruc, phone, address, email } = body;

    if (!name) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });

    const existing = await db.businessConfig.findFirst();

    let config;
    if (existing) {
      config = await db.businessConfig.update({
        where: { id: existing.id },
        data: { name, ruc: ruc || null, phone: phone || null, address: address || null, email: email || null },
      });
    } else {
      config = await db.businessConfig.create({
        data: { name, ruc: ruc || null, phone: phone || null, address: address || null, email: email || null },
      });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}