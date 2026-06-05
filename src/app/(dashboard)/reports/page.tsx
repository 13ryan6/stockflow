import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportsDashboard } from "@/components/reports/ReportsDashboard";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role === "SELLER") redirect("/");

  const now = new Date();

  const [
    salesToday,
    salesWeek,
    salesMonth,
    allSales,
    topProducts,
    topCustomers,
    lowStockProducts,
    inventoryProducts,
  ] = await Promise.all([
    db.sale.findMany({
      where: { createdAt: { gte: startOfDay(now), lte: endOfDay(now) } },
      include: { items: true },
    }),
    db.sale.findMany({
      where: { createdAt: { gte: startOfWeek(now), lte: endOfWeek(now) } },
      include: { items: true },
    }),
    db.sale.findMany({
      where: { createdAt: { gte: startOfMonth(now), lte: endOfMonth(now) } },
      include: { items: true },
    }),
    db.sale.findMany({ include: { items: true } }),
    db.saleItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    db.sale.groupBy({
      by: ["customerId"],
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
      where: { customerId: { not: null } },
    }),
    db.product.findMany({
      where: { active: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    // Inventario con categoría para agrupar por categoría
    db.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        category: { select: { name: true } },
      },
      orderBy: { stock: "asc" },
    }),
  ]);

  const topProductIds = topProducts.map((p) => p.productId);
  const topProductsData = await db.product.findMany({
    where: { id: { in: topProductIds } },
  });

  const topCustomerIds = topCustomers.map((c) => c.customerId).filter(Boolean) as string[];
  const topCustomersData = await db.customer.findMany({
    where: { id: { in: topCustomerIds } },
  });

  const totalToday = salesToday.reduce((acc, s) => acc + Number(s.total), 0);
  const totalWeek = salesWeek.reduce((acc, s) => acc + Number(s.total), 0);
  const totalMonth = salesMonth.reduce((acc, s) => acc + Number(s.total), 0);
  const totalAll = allSales.reduce((acc, s) => acc + Number(s.total), 0);
  const ivaMonth = salesMonth.reduce((acc, s) => acc + Number(s.tax), 0);
  const subtotalMonth = salesMonth.reduce((acc, s) => acc + Number(s.subtotal), 0);
  const impuestoRenta = totalAll * 0.02;

  // Calcular valor total del inventario
  const inventoryValue = inventoryProducts.reduce(
    (acc, p) => acc + p.stock * Number(p.price),
    0
  );

  // Agrupar por categoría
  const categoryMap: Record<string, number> = {};
  for (const p of inventoryProducts) {
    const cat = p.category?.name ?? "Sin categoría";
    categoryMap[cat] = (categoryMap[cat] ?? 0) + p.stock * Number(p.price);
  }
  const inventoryByCategory = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Top 3 productos con mayor valor inmovilizado
  const topValueProducts = [...inventoryProducts]
    .map((p) => ({ name: p.name, value: p.stock * Number(p.price), stock: p.stock }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  // Productos agotados
  const outOfStockProducts = inventoryProducts.filter((p) => p.stock === 0);

  return (
    <ReportsDashboard
      stats={{
        totalToday,
        totalWeek,
        totalMonth,
        totalAll,
        salesToday: salesToday.length,
        salesWeek: salesWeek.length,
        salesMonth: salesMonth.length,
        ivaMonth,
        subtotalMonth,
        impuestoRenta,
      }}
      topProducts={topProducts.map((p) => ({
        ...p,
        name: topProductsData.find((pd) => pd.id === p.productId)?.name ?? "Desconocido",
        quantity: p._sum.quantity ?? 0,
      }))}
      topCustomers={topCustomers.map((c) => ({
        ...c,
        name: topCustomersData.find((cd) => cd.id === c.customerId)?.name ?? "Consumidor final",
        total: Number(c._sum.total ?? 0),
        count: c._count.id,
      }))}
      lowStockProducts={lowStockProducts}
      inventoryValue={inventoryValue}
      inventoryByCategory={inventoryByCategory}
      topValueProducts={topValueProducts}
      outOfStockProducts={outOfStockProducts.map((p) => ({ id: p.id, name: p.name }))}
    />
  );
}