import { db } from "@/lib/db";
import { Plus, Truck, Package, Boxes } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProviderTable } from "@/components/providers/ProviderTable";

export default async function ProvidersPage() {
  const providers = await db.provider.findMany({
    where: { active: true },
    include: {
      products: {
        where: { active: true },
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalProviders = providers.length;
  const totalProducts = providers.reduce(
    (sum, p) => sum + p.products.length,
    0
  );
  const providersWithoutProducts = providers.filter(
    (p) => p.products.length === 0
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wide mb-1">
          GESTIÓN
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
            <p className="text-gray-500 text-sm mt-1">
              {totalProviders} proveedores registrados
            </p>
          </div>
          <Link href="/providers/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo proveedor
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalProviders}</p>
            <p className="text-xs text-gray-500">Total proveedores</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            <p className="text-xs text-gray-500">Productos asociados</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {providersWithoutProducts}
            </p>
            <p className="text-xs text-gray-500">Sin productos asignados</p>
          </div>
        </div>
      </div>

      <ProviderTable providers={providers} />
    </div>
  );
}