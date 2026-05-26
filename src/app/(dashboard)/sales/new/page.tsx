import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NewSaleForm } from "@/components/sales/NewSaleForm";

export default async function NewSalePage() {
  const session = await getServerSession(authOptions);

  const [products, customers] = await Promise.all([
    db.product.findMany({
      where: { active: true, stock: { gt: 0 } },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    db.customer.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva venta</h1>
        <p className="text-gray-500 text-sm mt-1">
          Agrega productos y confirma la venta
        </p>
      </div>

      <NewSaleForm
        products={products}
        customers={customers}
        sellerId={(session?.user as any)?.id}
      />
    </div>
  );
}