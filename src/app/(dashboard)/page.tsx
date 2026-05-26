import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [totalProducts, totalSales, totalCustomers] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.sale.count(),
    db.customer.count({ where: { active: true } }),
  ]);

  const stats = [
    {
      label: "Productos",
      value: totalProducts,
      icon: Package,
      color: "bg-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Ventas totales",
      value: totalSales,
      icon: ShoppingCart,
      color: "bg-green-500",
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Clientes",
      value: totalCustomers,
      icon: Users,
      color: "bg-purple-500",
      bg: "bg-purple-50",
      text: "text-purple-600",
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje si no hay datos */}
      {totalProducts === 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
          <TrendingUp className="w-10 h-10 text-blue-400 mx-auto mb-3" />
          <h3 className="font-semibold text-blue-900">¡Todo listo!</h3>
          <p className="text-blue-600 text-sm mt-1">
            Empieza agregando productos a tu inventario
          </p>
        </div>
      )}
    </div>
  );
}