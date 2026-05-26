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
    const { name, price, stock, minStock, sku, categoryId, providerId, description } = body;

    const product = await db.product.update({
      where: { id: params.id },
      data: {
        name,
        price,
        stock,
        minStock,
        sku: sku || null,
        categoryId: categoryId || null,
        providerId: providerId || null,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "El SKU ya existe" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
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

  await db.product.update({
    where: { id: params.id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}