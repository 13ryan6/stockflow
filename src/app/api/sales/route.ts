import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function generateSaleNumber() {
  const count = await db.sale.count();
  const number = String(count + 1).padStart(4, "0");
  return `SF-${number}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { customerId, sellerId, notes, items, subtotal, tax, total } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "La venta debe tener productos" }, { status: 400 });
    }

    const number = await generateSaleNumber();

    // Crear venta y descontar stock en una transacción
    const sale = await db.$transaction(async (tx) => {
      // Verificar stock disponible
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product?.name ?? "producto"}`);
        }
      }

      // Crear la venta
      const newSale = await tx.sale.create({
        data: {
          number,
          customerId: customerId || null,
          sellerId,
          notes: notes || null,
          subtotal,
          tax,
          total,
          status: "COMPLETED",
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
            })),
          },
        },
      });

      // Descontar stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newSale;
    });

    return NextResponse.json({ success: true, data: sale }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Error al crear venta" }, { status: 500 });
  }
}