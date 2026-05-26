import { db } from "@/lib/db";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/inventory/ProductTable";

export default async function InventoryPage() {
  const products = await db.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} productos registrados
          </p>
        </div>
        <Link href="/inventory/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo producto
          </Button>
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  );
}