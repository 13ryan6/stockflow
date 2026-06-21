"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Search, Trash2, Package } from "lucide-react";

type Provider = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  products: { id: string; name: string }[];
};

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const index = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function ProviderTable({ providers }: { providers: Provider[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este proveedor?")) return;
    await fetch(`/api/providers/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar proveedor..."
            className="pl-9 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Proveedor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contacto</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Productos</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  No se encontraron proveedores
                </td>
              </tr>
            ) : (
              filtered.map((provider) => (
                <tr key={provider.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${getAvatarColor(
                          provider.name
                        )} flex items-center justify-center text-white text-xs font-semibold shrink-0`}
                      >
                        {getInitials(provider.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{provider.name}</p>
                        {provider.address && (
                          <p className="text-xs text-gray-400">{provider.address}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">{provider.email ?? "-"}</p>
                    <p className="text-xs text-gray-400">{provider.phone ?? "-"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {provider.products.length} productos
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/providers/${provider.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(provider.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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