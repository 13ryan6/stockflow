import { db } from "@/lib/db";
import { ProductForm } from "@/components/inventory/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/inventory" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-2">
          <ArrowLeft className="w-3 h-3" />
          INVENTARIO
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
        <p className="text-gray-500 text-sm mt-1">
          Completa los datos del producto
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}