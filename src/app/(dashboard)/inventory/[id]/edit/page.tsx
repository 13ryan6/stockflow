import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EditProductForm } from "@/components/inventory/EditProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories, providers] = await Promise.all([
    db.product.findUnique({ where: { id: params.id } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.provider.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
        <p className="text-gray-500 text-sm mt-1">{product.name}</p>
      </div>
      <EditProductForm product={product as any} categories={categories} providers={providers} />
    </div>
  );
}