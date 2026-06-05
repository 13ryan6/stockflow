"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Search, AlertTriangle, Trash2, ClipboardList } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: any;
  stock: number;
  minStock: number;
  sku: string | null;
  category: { name: string } | null;
};

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar producto..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              filtered.map((product) => {
                const lowStock = product.stock <= product.minStock;
                const mediumStock = !lowStock && product.stock <= product.minStock * 2;

                return (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.sku && <p className="text-xs text-gray-400">{product.sku}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.category?.name ?? "Sin categoría"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {lowStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {mediumStock && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        <span className={`text-sm font-medium ${
                          lowStock ? "text-red-600" : mediumStock ? "text-amber-600" : "text-gray-900"
                        }`}>
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          lowStock
                            ? "bg-red-100 text-red-700 border-red-200"
                            : mediumStock
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-green-100 text-green-700 border-green-200"
                        }
                      >
                        {lowStock ? "Stock bajo" : mediumStock ? "Stock medio" : "OK"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/inventory/${product.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/inventory/${product.id}/kardex?name=${encodeURIComponent(product.name)}`}>
                          <Button variant="ghost" size="sm" title="Ver Kardex">
                            <ClipboardList className="w-4 h-4 text-blue-500" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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