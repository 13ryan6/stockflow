import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const customers = await db.customer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ success: true, data: customers });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, email, phone, address, ruc } = body;

    if (!name) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });

    const customer = await db.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        ruc: ruc || null,
      },
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "El email ya existe" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}