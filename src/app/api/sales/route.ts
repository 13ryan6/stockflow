import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma";
import { IVA_RATE } from "@/lib/tax";

// Solo se aceptan producto y cantidad. Precios, IVA, total y vendedor los decide el servidor.
const saleSchema = z.object({
  customerId: z.string().min(1).nullish(),
  notes: z.string().trim().max(500, "Las notas son demasiado largas").nullish(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Producto inválido"),
        quantity: z
          .number("Cantidad inválida")
          .int("La cantidad debe ser un número entero")
          .min(1, "La cantidad debe ser mayor a 0")
          .max(10_000, "Cantidad demasiado grande"),
      })
    )
    .min(1, "La venta debe tener productos")
    .max(200, "Demasiados productos en una sola venta"),
});

class SaleError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // El vendedor es SIEMPRE el usuario autenticado, nunca un valor del body
  const userId = session.user.id;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = saleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos de venta inválidos" },
      { status: 400 }
    );
  }
  const { customerId, notes, items } = parsed.data;

  // Une productos repetidos y los ordena por id: mismo orden de bloqueo en toda venta => sin deadlocks
  const quantities = new Map<string, number>();
  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }
  const lines = [...quantities.entries()].sort(([a], [b]) => a.localeCompare(b));

  try {
    const sale = await db.$transaction(
      async (tx) => {
        const seller = await tx.user.findUnique({
          where: { id: userId },
          select: { active: true },
        });
        if (!seller?.active) throw new SaleError("Usuario inactivo", 403);

        if (customerId) {
          const customer = await tx.customer.findFirst({
            where: { id: customerId, active: true },
            select: { id: true },
          });
          if (!customer) throw new SaleError("Cliente no válido", 400);
        }

        // Precios reales desde la BD
        const products = await tx.product.findMany({
          where: { id: { in: lines.map(([id]) => id) }, active: true },
          select: { id: true, name: true, price: true },
        });
        const productById = new Map(products.map((p) => [p.id, p]));

        let subtotal = new Prisma.Decimal(0);
        const saleItems: {
          productId: string;
          quantity: number;
          price: Prisma.Decimal;
          subtotal: Prisma.Decimal;
        }[] = [];
        const movements: {
          type: string;
          quantity: number;
          stockBefore: number;
          stockAfter: number;
          productId: string;
          userId: string;
        }[] = [];

        for (const [productId, quantity] of lines) {
          const product = productById.get(productId);
          if (!product) throw new SaleError("Uno de los productos ya no está disponible", 400);

          // Descuento atómico: solo actualiza si todavía hay stock suficiente.
          // Si otra venta se llevó el stock entre medias, no hay fila que coincida => P2025.
          let updated: { stock: number };
          try {
            updated = await tx.product.update({
              where: { id: productId, stock: { gte: quantity } },
              data: { stock: { decrement: quantity } },
              select: { stock: true },
            });
          } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
              throw new SaleError(`Stock insuficiente para ${product.name}`, 409);
            }
            throw error;
          }

          const lineSubtotal = product.price.mul(quantity);
          subtotal = subtotal.add(lineSubtotal);

          saleItems.push({ productId, quantity, price: product.price, subtotal: lineSubtotal });
          movements.push({
            type: "SALE",
            quantity,
            stockBefore: updated.stock + quantity,
            stockAfter: updated.stock,
            productId,
            userId,
          });
        }

        const tax = subtotal.mul(IVA_RATE).toDecimalPlaces(2);
        const total = subtotal.add(tax);

        // Número correlativo atómico (la fila queda bloqueada hasta el commit => sin duplicados)
        const counter = await tx.saleCounter.upsert({
          where: { id: 1 },
          create: { id: 1, last: 1 },
          update: { last: { increment: 1 } },
        });
        const number = `SF-${String(counter.last).padStart(4, "0")}`;

        return tx.sale.create({
          data: {
            number,
            status: "COMPLETED",
            subtotal,
            tax,
            total,
            notes: notes || null,
            customerId: customerId || null,
            sellerId: userId,
            items: { create: saleItems },
            movements: { create: movements },
          },
        });
      },
      { timeout: 10_000 }
    );

    return NextResponse.json({ success: true, data: sale }, { status: 201 });
  } catch (error) {
    if (error instanceof SaleError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/sales", error);
    return NextResponse.json({ error: "Error al crear la venta" }, { status: 500 });
  }
}
