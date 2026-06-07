import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Package, ShoppingCart, Users, Truck,
  Plus, BarChart3, AlertTriangle, ArrowRight, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";

  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfYesterday = new Date(yesterday);
  startOfYesterday.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    totalCustomers,
    totalProviders,
    salesToday,
    salesYesterday,
    recentSales,
    allLowStock,
    inventoryProducts,
    lastSale,
  ] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.customer.count({ where: { active: true } }),
    db.provider.count({ where: { active: true } }),
    db.sale.findMany({ where: { createdAt: { gte: startOfDay } } }),
    db.sale.findMany({
      where: { createdAt: { gte: startOfYesterday, lt: startOfDay } },
    }),
    db.sale.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        seller: { select: { name: true } },
      },
    }),
    db.product.findMany({
      where: { active: true },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    db.product.findMany({
      where: { active: true },
      select: { stock: true, price: true },
    }),
    db.sale.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const lowStockProducts = allLowStock
    .filter((p) => p.stock <= p.minStock)
    .slice(0, 5);

  const totalHoy = salesToday.reduce((acc, s) => acc + Number(s.total), 0);
  const totalAyer = salesYesterday.reduce((acc, s) => acc + Number(s.total), 0);
  const diffVentas = totalHoy - totalAyer;

  const inventoryValue = inventoryProducts.reduce(
    (acc, p) => acc + p.stock * Number(p.price),
    0
  );

  const initials = (name: string) =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  const miniStats = [
    {
      label: "Productos",
      value: totalProducts,
      sub: "activos",
      icon: Package,
      // Fondo degradado sutil azul
      cardBg: "bg-gradient-to-br from-blue-600 to-blue-700",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      labelColor: "text-blue-200",
      valueColor: "text-white",
      subColor: "text-blue-300",
    },
    {
      label: "Clientes",
      value: totalCustomers,
      sub: "registrados",
      icon: Users,
      // Violeta
      cardBg: "bg-gradient-to-br from-violet-600 to-violet-700",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      labelColor: "text-violet-200",
      valueColor: "text-white",
      subColor: "text-violet-300",
    },
    {
      label: "Proveedores",
      value: totalProviders,
      sub: "activos",
      icon: Truck,
      // Ámbar oscuro
      cardBg: "bg-gradient-to-br from-amber-500 to-amber-600",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      labelColor: "text-amber-100",
      valueColor: "text-white",
      subColor: "text-amber-200",
    },
  ];

  return (
    <div className="space-y-4">

      {/* ── Topbar — solo fecha, sin botón ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-widest uppercase text-gray-400 mb-0.5">
            Panel principal
          </p>
          <h1 className="text-[22px] font-semibold text-gray-900 leading-tight">
            Buenos días, {firstName}
          </h1>
        </div>
        {/* Solo la fecha, sin botón de nueva venta */}
        <span className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hidden sm:block self-center">
          {format(today, "EEEE d 'de' MMMM", { locale: es })}
        </span>
      </div>

      {/* ── Hero row: ventas hoy + 3 mini stats con color ── */}
      <div className="grid grid-cols-4 gap-3">

        {/* Card hero oscura — ventas hoy */}
        <div className="col-span-1 bg-slate-900 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full border-[16px] border-white/[0.04]" />
          <p className="text-[11px] tracking-widest uppercase text-slate-500 mb-3 font-medium">
            Ventas hoy
          </p>
          <p className="text-[38px] font-semibold text-white leading-none tracking-tight tabular-nums">
            ${totalHoy.toFixed(2)}
          </p>
          <p className="text-[12px] text-slate-500 mt-2">
            {salesToday.length} transacción{salesToday.length !== 1 ? "es" : ""}
          </p>
          {salesToday.length === 0 && lastSale && (
            <p className="text-[11px] text-slate-600 mt-1">
              Última: {format(new Date(lastSale.createdAt), "d MMM", { locale: es })}
            </p>
          )}
          {diffVentas !== 0 && totalAyer > 0 && (
            <span
              className={`mt-3 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                diffVentas >= 0
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {diffVentas >= 0 ? "↑" : "↓"} vs ayer
            </span>
          )}
        </div>

        {/* 3 mini stats con color propio */}
        {miniStats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`${s.cardBg} rounded-xl p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-150 relative overflow-hidden`}
            >
              {/* Círculo decorativo igual que la hero */}
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full border-[12px] border-white/[0.08]" />
              <div className={`w-8 h-8 ${s.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <div>
                <p className={`text-[11px] tracking-wider uppercase mb-1 font-medium ${s.labelColor}`}>
                  {s.label}
                </p>
                <p className={`text-[30px] font-semibold leading-none tabular-nums ${s.valueColor}`}>
                  {s.value}
                </p>
                <p className={`text-[11px] mt-1 ${s.subColor}`}>{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Mid row: acciones rápidas + valor inventario ── */}
      <div className="grid grid-cols-3 gap-3">

        {/* Acciones rápidas — 2 columnas */}
        <div className="col-span-2 bg-white border border-gray-100 shadow-sm rounded-xl p-5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-gray-400 mb-3">
            Acciones rápidas
          </p>
          <div className="flex gap-2.5">
            <Link
              href="/sales/new"
              className="flex-1 flex items-center gap-2.5 bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-7 h-7 bg-white/15 rounded-md flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[12px] font-semibold">Nueva venta</p>
                <p className="text-[11px] opacity-60">Crear una venta</p>
              </div>
            </Link>
            <Link
              href="/inventory/new"
              className="flex-1 flex items-center gap-2.5 bg-slate-700 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 bg-white/15 rounded-md flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-semibold">Nuevo producto</p>
                <p className="text-[11px] opacity-60">Al inventario</p>
              </div>
            </Link>
            <Link
              href="/reports"
              className="flex-1 flex items-center gap-2.5 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div className="w-7 h-7 bg-white/15 rounded-md flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[12px] font-semibold">Reportes</p>
                <p className="text-[11px] opacity-60">Estadísticas</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Valor inventario — solo OWNER/ADMIN */}
        {(role === "OWNER" || role === "ADMIN") ? (
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full border-[12px] border-white/[0.08]" />
            <div>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <p className="text-[11px] tracking-wider uppercase text-emerald-200 mb-1 font-medium">
                Valor inventario
              </p>
              <p className="text-[26px] font-semibold text-white leading-none tabular-nums">
                ${inventoryValue.toLocaleString("es-EC", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <Link
              href="/inventory"
              className="flex items-center gap-1 text-[11px] text-emerald-200 hover:text-white font-medium mt-3 transition-colors"
            >
              Ver inventario <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* ── Bottom row: últimas ventas + alertas stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Últimas ventas */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">Últimas ventas</h2>
            <Link
              href="/sales"
              className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {recentSales.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[13px] text-gray-400">Sin ventas registradas aún</p>
                <Link
                  href="/sales/new"
                  className="text-[12px] text-blue-600 hover:underline mt-1 inline-block"
                >
                  Crear primera venta →
                </Link>
              </div>
            ) : (
              recentSales.map((sale) => (
                <Link
                  key={sale.id}
                  href={`/sales/${sale.id}`}
                  className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                    {initials(sale.customer?.name ?? "CF")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-blue-600">{sale.number}</p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {sale.customer?.name ?? "Consumidor final"} · {sale.seller.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-semibold text-gray-900 tabular-nums">
                      ${Number(sale.total).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {format(new Date(sale.createdAt), "d MMM · HH:mm", { locale: es })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Alertas de stock */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alertas de stock
            </h2>
            <Link
              href="/inventory"
              className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              Ver inventario <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {lowStockProducts.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[13px] text-emerald-600 font-medium">✓ Todo el stock está bien</p>
              </div>
            ) : (
              lowStockProducts.map((product) => {
                const isCritical =
                  product.stock === 0 ||
                  product.stock <= Math.floor(product.minStock / 2);
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0"
                  >
                    <div
                      className={`w-1 h-8 rounded-full flex-shrink-0 ${
                        product.stock === 0
                          ? "bg-red-500"
                          : isCritical
                          ? "bg-red-400"
                          : "bg-amber-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-900">{product.name}</p>
                      <p className="text-[11px] text-gray-400">
                        Mín: {product.minStock} · quedan {product.stock}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md flex-shrink-0 ${
                        product.stock === 0
                          ? "bg-red-50 text-red-700"
                          : isCritical
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {product.stock === 0
                        ? "Agotado"
                        : isCritical
                        ? "Crítico"
                        : `${product.stock} uds`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
