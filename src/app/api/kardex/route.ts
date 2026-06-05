import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  }

  const movements = await db.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { name: true } },
      sale: { select: { number: true } },
    },
  });

  return NextResponse.json({ data: movements });
}