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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: "Completada", className: "bg-green-100 text-green-700 border-green-200" },
  PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  CANCELLED: { label: "Cancelada", className: "bg-red-100 text-red-700 border-red-200" },
};

const FILTERS = [
  { key: "ALL", label: "Todos" },
  { key: "COMPLETED", label: "Completadas" },
  { key: "PENDING", label: "Pendientes" },
  { key: "CANCELLED", label: "Canceladas" },
];

export function SalesTable({ sales }: { sales: Sale[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = sales.filter((s) => {
    const matchesSearch =
      s.number.toLowerCase().includes(search.toLowerCase()) ||
      s.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      s.seller.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b border-gray-100 space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar venta..."
            className="pl-9 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.key === "ALL"
                ? sales.length
                : sales.filter((s) => s.status === f.key).length;
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
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
              filtered.map((sale) => {
                const statusInfo = STATUS_CONFIG[sale.status] ?? STATUS_CONFIG.PENDING;
                return (
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
                      <Badge className={statusInfo.className} variant="outline">
                        {statusInfo.label}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}