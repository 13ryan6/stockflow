import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const role = (session.user as any).role;
  if (role === "SELLER") return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, email, phone, address } = body;

    const provider = await db.provider.update({
      where: { id: params.id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
      },
    });

    return NextResponse.json({ success: true, data: provider });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar proveedor" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const role = (session.user as any).role;
  if (role === "SELLER") return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  await db.provider.update({
    where: { id: params.id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}