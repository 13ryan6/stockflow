"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Sale = {
  id: string;
  number: string;
  total: any;
  subtotal: any;
  tax: any;
  status: string;
  createdAt: Date;
  customer: { name: string } | null;
  seller: { name: string };
  items: any[];
};

export function SalesTable({ sales }: { sales: Sale[] }) {
  const [search, setSearch] = useState("");

  const filtered = sales.filter((s) =>
    s.number.toLowerCase().includes(search.toLowerCase()) ||
    s.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
    s.seller.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar venta..."
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
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Factura</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vendedor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  No se encontraron ventas
                </td>
              </tr>
            ) : (
              filtered.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-blue-600">{sale.number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sale.customer?.name ?? "Consumidor final"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sale.seller.name}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    ${Number(sale.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">
                      Completada
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(sale.createdAt), "dd MMM yyyy", { locale: es })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/sales/${sale.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}