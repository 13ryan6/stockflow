"use client";
import { AlertTriangle, TrendingUp, ShoppingCart, Users, Package, DollarSign, FileText, Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExportButtons } from "@/components/reports/ExportButtons";

type Props = {
  stats: {
    totalToday: number;
    totalWeek: number;
    totalMonth: number;
    totalAll: number;
    salesToday: number;
    salesWeek: number;
    salesMonth: number;
    ivaMonth: number;
    subtotalMonth: number;
    impuestoRenta: number;
  };
  topProducts: { productId: string; name: string; quantity: number }[];
  topCustomers: { customerId: string | null; name: string; total: number; count: number }[];
  lowStockProducts: { id: string; name: string; stock: number; minStock: number }[];
  inventoryValue: number;
  inventoryByCategory: { name: string; value: number }[];
  topValueProducts: { name: string; value: number; stock: number }[];
  outOfStockProducts: { id: string; name: string }[];
};

export function ReportsDashboard({
  stats,
  topProducts,
  topCustomers,
  lowStockProducts,
  inventoryValue,
  inventoryByCategory,
  topValueProducts,
  outOfStockProducts,
}: Props) {
  const safeInventoryValue = inventoryValue ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen general del negocio</p>
        </div>
        <ExportButtons
          stats={stats}
          topProducts={topProducts}
          topCustomers={topCustomers}
          inventoryValue={safeInventoryValue}
          inventoryByCategory={inventoryByCategory ?? []}
          topValueProducts={topValueProducts ?? []}
          outOfStockProducts={outOfStockProducts ?? []}
        />
      </div>

      {/* Stats de ventas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ventas hoy", value: `$${stats.totalToday.toFixed(2)}`, sub: `${stats.salesToday} ventas`, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Ventas semana", value: `$${stats.totalWeek.toFixed(2)}`, sub: `${stats.salesWeek} ventas`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Ventas mes", value: `$${stats.totalMonth.toFixed(2)}`, sub: `${stats.salesMonth} ventas`, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Ventas totales", value: `$${stats.totalAll.toFixed(2)}`, sub: "Histórico", icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Impuestos SRI */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Obligaciones SRI — Este mes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase mb-1">Ingresos brutos del mes</p>
            <p className="text-2xl font-bold text-gray-900">${stats.subtotalMonth.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Base para cálculo de impuestos</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-xs text-amber-700 uppercase mb-1">IVA cobrado este mes</p>
            <p className="text-2xl font-bold text-amber-700">${stats.ivaMonth.toFixed(2)}</p>
            <p className="text-xs text-amber-600 mt-1">Declarar y pagar al SRI mensualmente</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <p className="text-xs text-red-700 uppercase mb-1">Impuesto a la Renta estimado</p>
            <p className="text-2xl font-bold text-red-700">${stats.impuestoRenta.toFixed(2)}</p>
            <p className="text-xs text-red-600 mt-1">2% ingresos totales — RIMPE Emprendedor</p>
          </div>
        </div>
        <div className="mt-4 bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
          ⚠️ <strong>Nota:</strong> El IVA se declara mensualmente. El Impuesto a la Renta es anual bajo régimen RIMPE Emprendedor (2% sobre ingresos brutos). Consulta con tu contador para casos específicos.
        </div>
      </div>

      {/* Sección Inventario */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Boxes className="w-5 h-5 text-teal-600" />
          <h2 className="font-semibold text-gray-900">Inventario</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Valor total */}
          <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
            <p className="text-xs text-teal-700 uppercase mb-1">Valor total del inventario</p>
            <p className="text-3xl font-bold text-teal-700">
              ${safeInventoryValue.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-teal-600 mt-1">Capital inmovilizado en productos activos</p>
          </div>

          {/* Top 3 mayor valor */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase font-medium">Mayor valor inmovilizado</p>
            {(topValueProducts ?? []).length === 0 ? (
              <p className="text-gray-400 text-sm">Sin datos</p>
            ) : (
              (topValueProducts ?? []).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.stock} unidades</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                    ${(p.value ?? 0).toFixed(2)}
                  </Badge>
                </div>
              ))
            )}
          </div>

          {/* Productos agotados */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Productos agotados ({(outOfStockProducts ?? []).length})
            </p>
            {(outOfStockProducts ?? []).length === 0 ? (
              <p className="text-green-600 text-sm">✅ Ningún producto agotado</p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {(outOfStockProducts ?? []).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">{p.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Valor por categoría */}
        {(inventoryByCategory ?? []).length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-medium mb-3">Valor por categoría</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(inventoryByCategory ?? []).map((cat) => (
                <div key={cat.name} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 truncate">{cat.name}</p>
                  <p className="text-base font-bold text-gray-900 mt-1">
                    ${(cat.value ?? 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {safeInventoryValue > 0 ? ((cat.value / safeInventoryValue) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos más vendidos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Productos más vendidos</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {product.quantity} unidades
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clientes que más compran */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Mejores clientes</h2>
          </div>
          {topCustomers.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-400">{customer.count} compras</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    ${customer.total.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productos con stock bajo */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Productos con stock bajo</h2>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-green-600 text-sm text-center py-4">✅ Todos los productos tienen stock suficiente</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Mín: {product.minStock}</span>
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                      {product.stock} unidades
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}