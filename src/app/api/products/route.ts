import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const products = await db.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const role = (session.user as any).role;
  if (role === "SELLER") return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, price, stock, minStock, sku, categoryId, description } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Nombre y precio son requeridos" }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name,
        price,
        stock: stock ?? 0,
        minStock: minStock ?? 5,
        sku: sku || null,
        categoryId: categoryId || null,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "El SKU ya existe" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}