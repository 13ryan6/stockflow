import { db } from "@/lib/db";
import { Plus } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-500 text-sm mt-1">
            {providers.length} proveedores registrados
          </p>
        </div>
        <Link href="/providers/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo proveedor
          </Button>
        </Link>
      </div>

      <ProviderTable providers={providers} />
    </div>
  );
}