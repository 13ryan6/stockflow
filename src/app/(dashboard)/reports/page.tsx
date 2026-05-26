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
    lowStock,
  ] = await Promise.all([
    // Ventas de hoy
    db.sale.findMany({
      where: {
        createdAt: { gte: startOfDay(now), lte: endOfDay(now) },
      },
      include: { items: true },
    }),
    // Ventas de la semana
    db.sale.findMany({
      where: {
        createdAt: { gte: startOfWeek(now), lte: endOfWeek(now) },
      },
      include: { items: true },
    }),
    // Ventas del mes
    db.sale.findMany({
      where: {
        createdAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
      },
      include: { items: true },
    }),
    // Todas las ventas
    db.sale.findMany({
      include: { items: true },
    }),
    // Productos más vendidos
    db.saleItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    // Clientes que más compran
    db.sale.groupBy({
      by: ["customerId"],
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
      where: { customerId: { not: null } },
    }),
    // Productos con stock bajo
    db.product.findMany({
      where: {
        active: true,
        stock: { lte: db.product.fields.minStock },
      },
      take: 5,
      orderBy: { stock: "asc" },
    }),
  ]);

  // Obtener nombres de productos más vendidos
  const topProductIds = topProducts.map((p) => p.productId);
  const topProductsData = await db.product.findMany({
    where: { id: { in: topProductIds } },
  });

  // Obtener nombres de clientes
  const topCustomerIds = topCustomers.map((c) => c.customerId).filter(Boolean) as string[];
  const topCustomersData = await db.customer.findMany({
    where: { id: { in: topCustomerIds } },
  });

  // Productos stock bajo
  const lowStockProducts = await db.product.findMany({
    where: { active: true, stock: { lte: 5 } },
    orderBy: { stock: "asc" },
    take: 10,
  });

  const totalToday = salesToday.reduce((acc, s) => acc + Number(s.total), 0);
  const totalWeek = salesWeek.reduce((acc, s) => acc + Number(s.total), 0);
  const totalMonth = salesMonth.reduce((acc, s) => acc + Number(s.total), 0);
  const totalAll = allSales.reduce((acc, s) => acc + Number(s.total), 0);

  const ivaMonth = salesMonth.reduce((acc, s) => acc + Number(s.tax), 0);
  const subtotalMonth = salesMonth.reduce((acc, s) => acc + Number(s.subtotal), 0);
  const impuestoRenta = totalAll * 0.02;

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
    />
  );
}