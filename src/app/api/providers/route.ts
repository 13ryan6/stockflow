import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const providers = await db.provider.findMany({
    where: { active: true },
    include: {
      products: {
        where: { active: true },
        select: { id: true, name: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ success: true, data: providers });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const role = (session.user as any).role;
  if (role === "SELLER") return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, email, phone, address } = body;

    if (!name) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });

    const provider = await db.provider.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
      },
    });

    return NextResponse.json({ success: true, data: provider }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear proveedor" }, { status: 500 });
  }
}