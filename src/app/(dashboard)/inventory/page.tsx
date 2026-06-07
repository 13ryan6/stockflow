import { db } from "@/lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ProductTable } from "@/components/inventory/ProductTable";

export default async function InventoryPage() {
  const products = await db.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const lowStock = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-widest uppercase text-gray-400 mb-0.5">
            Gestión
          </p>
          <h1 className="text-[22px] font-semibold text-gray-900 leading-tight">
            Inventario
          </h1>
        </div>
        <Link
          href="/inventory/new"
          className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo producto
        </Link>
      </div>

      {/* ── Mini stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-lg font-semibold tabular-nums">{products.length}</span>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Total</p>
            <p className="text-[13px] text-gray-700 font-medium">productos activos</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 text-lg font-semibold tabular-nums">{lowStock}</span>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Alertas</p>
            <p className="text-[13px] text-gray-700 font-medium">con stock bajo</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-600 text-lg font-semibold tabular-nums">
              {products.length - lowStock}
            </span>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">OK</p>
            <p className="text-[13px] text-gray-700 font-medium">en buen estado</p>
          </div>
        </div>
      </div>

      {/* ── Tabla ── */}
      <ProductTable products={products} />
    </div>
  );
}
