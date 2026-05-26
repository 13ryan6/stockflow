import { db } from "@/lib/db";
import { ProductForm } from "@/components/inventory/ProductForm";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
        <p className="text-gray-500 text-sm mt-1">
          Completa los datos del producto
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}