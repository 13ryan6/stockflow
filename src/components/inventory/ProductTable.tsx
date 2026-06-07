"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Search,
  AlertTriangle,
  Trash2,
  ClipboardList,
  Package,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: any;
  stock: number;
  minStock: number;
  sku: string | null;
  category: { name: string } | null;
};

type Filter = "all" | "low" | "medium" | "ok";
type Status = "low" | "medium" | "ok";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "low", label: "Stock bajo" },
  { key: "medium", label: "Stock medio" },
  { key: "ok", label: "OK" },
];

const statusConfig: Record<
  Status,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  low: {
    label: "Stock bajo",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-100",
    dot: "bg-red-500",
  },
  medium: {
    label: "Stock medio",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-400",
  },
  ok: {
    label: "OK",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
  },
};

export function ProductTable({
  products,
}: {
  products: Product[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const getStatus = (p: Product): Status => {
    if (p.stock <= p.minStock) return "low";
    if (p.stock <= p.minStock * 2) return "medium";
    return "ok";
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchFilter =
      filter === "all" || getStatus(p) === filter;

    return matchSearch && matchFilter;
  });

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;

    await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    router.refresh();
  }

  const counts = {
    all: products.length,
    low: products.filter(
      (p) => getStatus(p) === "low"
    ).length,
    medium: products.filter(
      (p) => getStatus(p) === "medium"
    ).length,
    ok: products.filter(
      (p) => getStatus(p) === "ok"
    ).length,
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />

          <Input
            placeholder="Buscar producto..."
            className="pl-8 h-8 text-[13px] border-gray-200 bg-gray-50 focus:bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-1.5 ml-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                filter === f.key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f.label}

              <span
                className={`text-[11px] px-1.5 py-0 rounded-full font-semibold ${
                  filter === f.key
                    ? "bg-white/20 text-white"
                    : "bg-white text-gray-500"
                }`}
              >
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Producto
              </th>

              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Categoría
              </th>

              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Precio
              </th>

              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Stock
              </th>

              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Estado
              </th>

              <th className="px-4 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider text-right">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>

                    <p className="text-[13px] text-gray-400 font-medium">
                      No se encontraron productos
                    </p>

                    <p className="text-[12px] text-gray-300">
                      Intenta con otro término o filtro
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((product) => {
                const status = getStatus(product);
                const cfg = statusConfig[status];

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/70 transition-colors group"
                  >
                    {/* Producto */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>

                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">
                            {product.name}
                          </p>

                          {product.sku && (
                            <p className="text-[11px] text-gray-400 font-mono">
                              {product.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3.5">
                      <span className="text-[12px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {product.category?.name ?? "General"}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="px-4 py-3.5">
                      <p className="text-[13px] font-semibold text-gray-900 tabular-nums">
                        $
                        {Number(product.price).toFixed(2)}
                      </p>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {status !== "ok" && (
                          <AlertTriangle
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              status === "low"
                                ? "text-red-500"
                                : "text-amber-500"
                            }`}
                          />
                        )}

                        <span
                          className={`text-[13px] font-semibold tabular-nums ${
                            status === "low"
                              ? "text-red-600"
                              : status === "medium"
                              ? "text-amber-600"
                              : "text-gray-900"
                          }`}
                        >
                          {product.stock}
                        </span>

                        <span className="text-[11px] text-gray-300">
                          / mín {product.minStock}
                        </span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                        />

                        {cfg.label}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/inventory/${product.id}/edit`}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/inventory/${product.id}/kardex?name=${encodeURIComponent(
                            product.name
                          )}`}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver Kardex"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() =>
                            handleDelete(product.id)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}