import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Package, ShoppingCart, Users, Truck, Plus, BarChart3, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  const [
    totalProducts,
    totalCustomers,
    totalProviders,
    salesToday,
    recentSales,
    lowStockProducts,
  ] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.customer.count({ where: { active: true } }),
    db.provider.count({ where: { active: true } }),
    db.sale.findMany({
      where: { createdAt: { gte: startOfDay } },
    }),
    db.sale.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        seller: { select: { name: true } },
      },
    }),
    db.product.findMany({
      where: { active: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
  ]);

  const totalHoy = salesToday.reduce((acc, s) => acc + Number(s.total), 0);

  const stats = [
    {
      label: "Ventas hoy",
      value: `$${totalHoy.toFixed(2)}`,
      sub: `${salesToday.length} ventas`,
      icon: ShoppingCart,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Productos",
      value: totalProducts,
      sub: "activos",
      icon: Package,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Clientes",
      value: totalCustomers,
      sub: "registrados",
      icon: Users,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      label: "Proveedores",
      value: totalProviders,
      sub: "activos",
      icon: Truck,
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Aquí tienes un resumen de tu negocio
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.bg} p-2.5 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${stat.text}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label} — {stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/sales/new" className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
            <div className="bg-white/20 p-2 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Nueva venta</p>
              <p className="text-xs text-blue-100">Crear una venta</p>
            </div>
          </Link>
          <Link href="/inventory/new" className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors">
            <div className="bg-white/20 p-2 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Nuevo producto</p>
              <p className="text-xs text-slate-300">Agregar al inventario</p>
            </div>
          </Link>
          <Link href="/reports" className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors">
            <div className="bg-white/20 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Ver reportes</p>
              <p className="text-xs text-purple-100">Estadísticas completas</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Últimas ventas y Stock bajo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Últimas ventas */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Últimas ventas</h2>
            <Link href="/sales" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSales.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Sin ventas aún</p>
            ) : (
              recentSales.map((sale) => (
                <Link key={sale.id} href={`/sales/${sale.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-blue-600">{sale.number}</p>
                    <p className="text-xs text-gray-500">
                      {sale.customer?.name ?? "Consumidor final"} • {sale.seller.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(sale.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">${Number(sale.total).toFixed(2)}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Stock bajo */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">Stock bajo</h2>
            </div>
            <Link href="/inventory" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Ver inventario <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStockProducts.length === 0 ? (
              <p className="text-center text-green-600 text-sm py-8">✅ Todo el stock está bien</p>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">Mínimo: {product.minStock} unidades</p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    product.stock === 0
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {product.stock === 0 ? "Agotado" : `${product.stock} uds`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}